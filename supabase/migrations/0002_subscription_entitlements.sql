-- Paid plan catalogue and server-enforced dashboard entitlements.
alter table public.plans
  add column if not exists stripe_monthly_price_id text,
  add column if not exists stripe_annual_price_id text,
  add column if not exists paypal_monthly_plan_id text,
  add column if not exists paypal_annual_plan_id text,
  add column if not exists parallel_videos integer not null default 0,
  add column if not exists parallel_images integer not null default 0;

alter table public.tools add column if not exists required_plan text not null default 'basic'
  check (required_plan in ('basic','pro','max'));
alter table public.ai_models add column if not exists required_plan text not null default 'basic'
  check (required_plan in ('basic','pro','max'));

insert into public.plans
  (slug,name,monthly_price,annual_price,currency,included_credits,active,featured,sort_order,parallel_videos,parallel_images)
values
  ('basic','Basic',9,9,'USD',120,true,false,10,2,2),
  ('pro','Pro',29,23,'USD',600,true,true,20,3,4),
  ('max','Max',79,59,'USD',1800,true,false,30,8,8)
on conflict (slug) do update set
  name=excluded.name, monthly_price=excluded.monthly_price, annual_price=excluded.annual_price,
  included_credits=excluded.included_credits, active=true, featured=excluded.featured,
  sort_order=excluded.sort_order, parallel_videos=excluded.parallel_videos,
  parallel_images=excluded.parallel_images, updated_at=now();

update public.plans set active=false where slug not in ('basic','pro','max');
update public.tools set required_plan='pro' where slug in ('lip-sync','effects','ai-effects');

create or replace function public.get_my_entitlements()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((
    select jsonb_build_object(
      'plan_slug', p.slug,
      'credits', coalesce(w.available,0),
      'parallel_videos', p.parallel_videos,
      'parallel_images', p.parallel_images,
      'period_end', s.current_period_end
    )
    from public.subscriptions s
    join public.plans p on p.id=s.plan_id and p.active
    left join public.wallets w on w.user_id=s.user_id
    where s.user_id=auth.uid()
      and s.status in ('active','trialing')
      and (s.current_period_end is null or s.current_period_end > now())
    order by case p.slug when 'max' then 3 when 'pro' then 2 else 1 end desc
    limit 1
  ), jsonb_build_object(
    'plan_slug','none','credits',coalesce((select w.available from public.wallets w where w.user_id=auth.uid()),0),
    'parallel_videos',0,'parallel_images',0,'period_end',null
  ));
$$;
revoke all on function public.get_my_entitlements() from public, anon;
grant execute on function public.get_my_entitlements() to authenticated;

create or replace function public.can_use_generation(p_user uuid, p_tool text, p_model text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  with entitlement as (
    select case p.slug when 'max' then 3 when 'pro' then 2 when 'basic' then 1 else 0 end rank
    from public.subscriptions s join public.plans p on p.id=s.plan_id
    where s.user_id=p_user and p.active and s.status in ('active','trialing')
      and (s.current_period_end is null or s.current_period_end > now())
    order by rank desc limit 1
  ), requirement as (
    select greatest(
      coalesce((select case t.required_plan when 'max' then 3 when 'pro' then 2 else 1 end from public.tools t where t.slug=p_tool and t.active),99),
      coalesce((select case m.required_plan when 'max' then 3 when 'pro' then 2 else 1 end from public.ai_models m where m.slug=p_model and m.active and not m.maintenance),99)
    ) rank
  )
  select coalesce((select e.rank >= r.rank from entitlement e cross join requirement r),false);
$$;
revoke all on function public.can_use_generation(uuid,text,text) from public, anon, authenticated;
grant execute on function public.can_use_generation(uuid,text,text) to service_role;

create or replace function public.fulfil_subscription_invoice(
  p_user uuid, p_plan_slug text, p_provider text, p_provider_invoice_id text,
  p_provider_subscription_id text, p_period_start timestamptz, p_period_end timestamptz
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_plan public.plans%rowtype;
  v_wallet public.wallets%rowtype;
  v_key text := 'subscription-credit:' || p_provider || ':' || p_provider_invoice_id;
begin
  select * into v_plan from public.plans where slug=p_plan_slug and active for share;
  if not found then raise exception 'invalid_plan'; end if;
  if exists(select 1 from public.credit_transactions where idempotency_key=v_key) then return; end if;

  insert into public.subscriptions(user_id,plan_id,provider,provider_subscription_id,status,current_period_start,current_period_end)
  values(p_user,v_plan.id,p_provider,p_provider_subscription_id,'active',p_period_start,p_period_end)
  on conflict(provider,provider_subscription_id) do update set
    plan_id=excluded.plan_id,status='active',current_period_start=excluded.current_period_start,
    current_period_end=excluded.current_period_end,updated_at=now();

  insert into public.wallets(user_id) values(p_user) on conflict(user_id) do nothing;
  select * into v_wallet from public.wallets where user_id=p_user for update;
  update public.wallets set
    available=available+v_plan.included_credits,
    lifetime_purchased=lifetime_purchased+v_plan.included_credits,updated_at=now()
  where user_id=p_user;
  insert into public.credit_transactions(
    user_id,amount,direction,transaction_type,previous_balance,new_balance,description,idempotency_key
  ) values(
    p_user,v_plan.included_credits,'credit','subscription_renewal',v_wallet.available,
    v_wallet.available+v_plan.included_credits,v_plan.name || ' monthly credits',v_key
  );
end;
$$;
revoke all on function public.fulfil_subscription_invoice(uuid,text,text,text,text,timestamptz,timestamptz)
  from public, anon, authenticated;
grant execute on function public.fulfil_subscription_invoice(uuid,text,text,text,text,timestamptz,timestamptz)
  to service_role;

-- Lock down every table in the exposed public schema. Catalogue rows are the
-- only anonymous reads needed by the website; user-owned rows keep the
-- ownership policies defined in the core migration.
do $$
declare r record;
begin
  for r in select schemaname, tablename from pg_tables where schemaname='public'
  loop
    execute format('alter table %I.%I enable row level security', r.schemaname, r.tablename);
  end loop;
end $$;

create policy plans_public_read on public.plans for select to anon, authenticated using (active);
create policy plan_features_public_read on public.plan_features for select to anon, authenticated
  using (exists(select 1 from public.plans p where p.id=plan_id and p.active));
create policy tools_public_read on public.tools for select to anon, authenticated using (active);
create policy models_public_read on public.ai_models for select to anon, authenticated using (active);

grant select on public.plans, public.plan_features, public.tools, public.ai_models to anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
