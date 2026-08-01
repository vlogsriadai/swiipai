-- Phase 2: operational admin data, safe credit accounting, and finance indexes.

alter table public.profiles
  add column if not exists internal_note text,
  add column if not exists suspended_until timestamptz,
  add column if not exists suspension_reason text,
  add column if not exists last_active_at timestamptz;

create index if not exists profiles_status_created_idx on public.profiles(status,created_at desc);
create index if not exists profiles_last_active_idx on public.profiles(last_active_at desc);
create index if not exists subscriptions_status_created_idx on public.subscriptions(status,created_at desc);
create index if not exists subscriptions_user_status_idx on public.subscriptions(user_id,status,created_at desc);
create index if not exists payments_status_created_idx on public.payments(status,created_at desc);
create index if not exists payments_provider_created_idx on public.payments(provider,created_at desc);
create index if not exists orders_payment_created_idx on public.orders(payment_status,created_at desc);

create or replace function public.admin_adjust_credits(
  p_admin uuid, p_user uuid, p_amount bigint, p_reason text, p_key text
) returns table(transaction_id uuid, balance bigint)
language plpgsql security definer set search_path='' as $$
declare old_balance bigint; tx_id uuid;
begin
  if p_admin is null or p_user is null or p_amount = 0 then raise exception 'invalid_credit_adjustment'; end if;
  if length(trim(coalesce(p_reason,''))) < 3 then raise exception 'reason_required'; end if;
  if exists(select 1 from public.credit_transactions where idempotency_key=p_key) then
    return query select id,new_balance from public.credit_transactions where idempotency_key=p_key;
    return;
  end if;
  select available into old_balance from public.wallets where user_id=p_user for update;
  if old_balance is null then raise exception 'wallet_not_found'; end if;
  if old_balance+p_amount < 0 then raise exception 'insufficient_credits'; end if;
  update public.wallets set available=available+p_amount,
    lifetime_bonus=lifetime_bonus+case when p_amount>0 then p_amount else 0 end,
    updated_at=now() where user_id=p_user;
  insert into public.credit_transactions(user_id,amount,direction,transaction_type,
    previous_balance,new_balance,admin_id,description,idempotency_key)
  values(p_user,p_amount,case when p_amount>0 then 'credit' else 'debit' end,
    case when p_amount>0 then 'admin_grant' else 'admin_deduction' end,
    old_balance,old_balance+p_amount,p_admin,trim(p_reason),p_key)
  returning id into tx_id;
  return query select tx_id,old_balance+p_amount;
end;
$$;

revoke all on function public.admin_adjust_credits(uuid,uuid,bigint,text,text) from public,anon,authenticated;
grant execute on function public.admin_adjust_credits(uuid,uuid,bigint,text,text) to service_role;

grant select,update on public.profiles,public.wallets,public.subscriptions,public.plans,public.orders,public.payments to service_role;
grant select on public.credit_transactions,public.generation_jobs to service_role;
