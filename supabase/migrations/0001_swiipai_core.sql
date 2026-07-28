create extension if not exists pgcrypto;

create type public.account_status as enum ('active','suspended','banned','pending_verification','deleted','under_review');
create type public.job_status as enum ('draft','queued','processing','completed','failed','cancelled','moderation_blocked','refunded');
create type public.payment_status as enum ('created','pending','paid','failed','cancelled','refunded','disputed');

create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text, username text unique, avatar_url text, bio text, country text,
  preferred_language text not null default 'en' check (preferred_language in ('en','fr','ar')),
  timezone text not null default 'UTC', creator_category text,
  is_public boolean not null default false, marketing_consent boolean not null default false,
  status public.account_status not null default 'pending_verification',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.roles (
  id uuid primary key default gen_random_uuid(), slug text not null unique, name text not null,
  created_at timestamptz not null default now()
);
create table public.permissions (
  id uuid primary key default gen_random_uuid(), slug text not null unique, description text,
  created_at timestamptz not null default now()
);
create table public.role_permissions (
  role_id uuid references public.roles(id) on delete cascade,
  permission_id uuid references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);
create table public.user_roles (
  user_id uuid references auth.users(id) on delete cascade,
  role_id uuid references public.roles(id) on delete cascade,
  assigned_by uuid references auth.users(id), created_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

create table public.wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  available bigint not null default 0 check (available >= 0),
  reserved bigint not null default 0 check (reserved >= 0),
  lifetime_purchased bigint not null default 0, lifetime_bonus bigint not null default 0,
  lifetime_used bigint not null default 0, frozen boolean not null default false,
  updated_at timestamptz not null default now()
);
create table public.credit_transactions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id),
  amount bigint not null check (amount <> 0), direction text not null check (direction in ('credit','debit')),
  transaction_type text not null, previous_balance bigint not null, new_balance bigint not null check (new_balance >= 0),
  generation_id uuid, order_id uuid, admin_id uuid references auth.users(id), description text,
  idempotency_key text not null unique, expires_at timestamptz, created_at timestamptz not null default now()
);

create table public.plans (
  id uuid primary key default gen_random_uuid(), slug text not null unique, name text not null,
  monthly_price numeric(12,2) not null default 0, annual_price numeric(12,2) not null default 0,
  currency char(3) not null default 'USD', included_credits bigint not null default 0,
  storage_gb integer not null default 1, queue_priority integer not null default 0,
  api_limit integer not null default 0, team_seats integer not null default 1,
  active boolean not null default true, featured boolean not null default false,
  stripe_price_id text, paypal_plan_id text, sort_order integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.plan_features (
  id uuid primary key default gen_random_uuid(), plan_id uuid not null references public.plans(id) on delete cascade,
  feature_key text not null, value jsonb not null default 'true'::jsonb, unique(plan_id, feature_key)
);
create table public.credit_packs (
  id uuid primary key default gen_random_uuid(), slug text not null unique, name text not null,
  credits bigint not null check (credits > 0), bonus_credits bigint not null default 0,
  price numeric(12,2) not null, original_price numeric(12,2), currency char(3) not null default 'USD',
  active boolean not null default true, featured boolean not null default false, provider_ids jsonb not null default '{}',
  sort_order integer not null default 0, created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id),
  plan_id uuid not null references public.plans(id), provider text not null,
  provider_customer_id text, provider_subscription_id text,
  status text not null, current_period_start timestamptz, current_period_end timestamptz,
  cancel_at_period_end boolean not null default false, cancelled_at timestamptz,
  trial_start timestamptz, trial_end timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(provider, provider_subscription_id)
);
create table public.orders (
  id uuid primary key default gen_random_uuid(), order_number text not null unique,
  user_id uuid not null references auth.users(id), order_type text not null,
  plan_id uuid references public.plans(id), credit_pack_id uuid references public.credit_packs(id),
  subtotal numeric(12,2) not null, discount numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0, total numeric(12,2) not null, currency char(3) not null,
  payment_provider text not null, payment_status public.payment_status not null default 'created',
  fulfilment_status text not null default 'unfulfilled', billing_details jsonb not null default '{}',
  metadata jsonb not null default '{}', created_at timestamptz not null default now(),
  paid_at timestamptz, cancelled_at timestamptz, refunded_at timestamptz
);
alter table public.credit_transactions
  add constraint credit_transactions_order_fk foreign key (order_id) references public.orders(id);
create table public.payments (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id),
  user_id uuid not null references auth.users(id), provider text not null, provider_payment_id text not null,
  provider_customer_id text, amount numeric(12,2) not null, currency char(3) not null,
  status public.payment_status not null, payment_method text, provider_fee numeric(12,2),
  raw_status text, failure_code text, failure_message text, refunded_amount numeric(12,2) not null default 0,
  created_at timestamptz not null default now(), confirmed_at timestamptz,
  unique(provider, provider_payment_id)
);
create table public.payment_events (
  id uuid primary key default gen_random_uuid(), provider text not null, external_event_id text not null,
  event_type text not null, payload jsonb not null, signature_verified boolean not null default false,
  processing_status text not null default 'received', processing_error text,
  received_at timestamptz not null default now(), processed_at timestamptz,
  unique(provider, external_event_id)
);

create table public.providers (
  id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique,
  type text not null, api_base_url text, secret_reference text, active boolean not null default false,
  health_status text not null default 'unknown', priority integer not null default 0,
  timeout_ms integer not null default 60000, retry_limit integer not null default 2,
  rate_limit integer, webhook_support boolean not null default false, cost_settings jsonb not null default '{}',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.ai_models (
  id uuid primary key default gen_random_uuid(), provider_id uuid not null references public.providers(id),
  name text not null, slug text not null unique, tool_category text not null, description text, version text,
  input_types text[] not null default '{}', output_types text[] not null default '{}',
  supported_ratios text[] not null default '{}', supported_resolutions text[] not null default '{}',
  credit_cost integer not null check (credit_cost >= 0), provider_cost numeric(12,5),
  active boolean not null default false, beta boolean not null default false,
  featured boolean not null default false, maintenance boolean not null default false,
  config_schema jsonb not null default '{}', validation_schema jsonb not null default '{}',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.tools (
  id uuid primary key default gen_random_uuid(), slug text not null unique, name text not null,
  category text not null, active boolean not null default true, config jsonb not null default '{}'
);
create table public.generation_jobs (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id),
  tool_id uuid references public.tools(id), model_id uuid references public.ai_models(id),
  status public.job_status not null default 'draft', prompt text, settings jsonb not null default '{}',
  provider_job_id text, reserved_credits bigint not null default 0, charged_credits bigint not null default 0,
  visibility text not null default 'private' check (visibility in ('private','public','unlisted')),
  error_code text, error_message text, processing_started_at timestamptz, completed_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.credit_transactions
  add constraint credit_transactions_generation_fk foreign key (generation_id) references public.generation_jobs(id);
create table public.generation_inputs (
  id uuid primary key default gen_random_uuid(), job_id uuid not null references public.generation_jobs(id) on delete cascade,
  type text not null, asset_id uuid, metadata jsonb not null default '{}'
);
create table public.generation_outputs (
  id uuid primary key default gen_random_uuid(), job_id uuid not null references public.generation_jobs(id) on delete cascade,
  type text not null, storage_path text not null, mime_type text, width integer, height integer,
  duration_ms integer, metadata jsonb not null default '{}', created_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id),
  name text not null, description text, visibility text not null default 'private',
  archived_at timestamptz, deleted_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.folders (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id),
  parent_id uuid references public.folders(id), name text not null, created_at timestamptz not null default now()
);
create table public.assets (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id),
  project_id uuid references public.projects(id), folder_id uuid references public.folders(id),
  kind text not null, storage_bucket text not null, storage_path text not null,
  filename text not null, mime_type text, size_bytes bigint, metadata jsonb not null default '{}',
  deleted_at timestamptz, created_at timestamptz not null default now()
);
create table public.project_assets (
  project_id uuid references public.projects(id) on delete cascade,
  asset_id uuid references public.assets(id) on delete cascade,
  primary key(project_id, asset_id)
);
create table public.collections (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id),
  name text not null, created_at timestamptz not null default now()
);
create table public.collection_items (
  collection_id uuid references public.collections(id) on delete cascade,
  asset_id uuid references public.assets(id) on delete cascade,
  created_at timestamptz not null default now(), primary key(collection_id, asset_id)
);

create table public.community_posts (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id),
  asset_id uuid not null references public.assets(id), title text not null, description text,
  prompt text, prompt_visible boolean not null default false, model_id uuid references public.ai_models(id),
  tags text[] not null default '{}', visibility text not null default 'public',
  moderation_status text not null default 'pending', featured boolean not null default false,
  views bigint not null default 0, published_at timestamptz, created_at timestamptz not null default now()
);
create table public.likes (
  user_id uuid references auth.users(id) on delete cascade,
  post_id uuid references public.community_posts(id) on delete cascade,
  created_at timestamptz not null default now(), primary key(user_id, post_id)
);
create table public.comments (
  id uuid primary key default gen_random_uuid(), post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id), body text not null,
  moderation_status text not null default 'pending', created_at timestamptz not null default now()
);
create table public.follows (
  follower_id uuid references auth.users(id) on delete cascade,
  following_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(), primary key(follower_id, following_id),
  check (follower_id <> following_id)
);
create table public.bookmarks (
  user_id uuid references auth.users(id) on delete cascade,
  post_id uuid references public.community_posts(id) on delete cascade,
  created_at timestamptz not null default now(), primary key(user_id, post_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id),
  type text not null, title text not null, body text, data jsonb not null default '{}',
  read_at timestamptz, created_at timestamptz not null default now()
);
create table public.support_tickets (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id),
  category text not null, subject text not null, status text not null default 'open',
  priority text not null default 'normal', assigned_to uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.support_messages (
  id uuid primary key default gen_random_uuid(), ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  sender_id uuid not null references auth.users(id), body text not null, internal boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.reports (
  id uuid primary key default gen_random_uuid(), reporter_id uuid not null references auth.users(id),
  target_type text not null, target_id uuid not null, reason text not null, details text,
  status text not null default 'pending', created_at timestamptz not null default now()
);
create table public.moderation_actions (
  id uuid primary key default gen_random_uuid(), report_id uuid references public.reports(id),
  admin_id uuid not null references auth.users(id), action text not null, reason text not null,
  created_at timestamptz not null default now()
);

create table public.site_pages (
  id uuid primary key default gen_random_uuid(), slug text not null unique, title text not null,
  content jsonb not null default '{}', status text not null default 'draft',
  published_at timestamptz, updated_at timestamptz not null default now()
);
create table public.site_settings (
  key text primary key, value jsonb not null, public boolean not null default false,
  updated_at timestamptz not null default now()
);
create table public.faqs (
  id uuid primary key default gen_random_uuid(), question text not null, answer text not null,
  active boolean not null default true, sort_order integer not null default 0
);
create table public.blog_categories (
  id uuid primary key default gen_random_uuid(), slug text not null unique, name text not null
);
create table public.blog_posts (
  id uuid primary key default gen_random_uuid(), author_id uuid references auth.users(id),
  category_id uuid references public.blog_categories(id), slug text not null unique, title text not null,
  excerpt text, content text not null, status text not null default 'draft',
  published_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.announcements (
  id uuid primary key default gen_random_uuid(), title text not null, body text not null,
  active boolean not null default false, starts_at timestamptz, ends_at timestamptz
);
create table public.api_keys (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id),
  name text not null, key_prefix text not null, key_hash text not null unique, scopes text[] not null default '{}',
  usage_limit bigint, expires_at timestamptz, revoked_at timestamptz,
  created_at timestamptz not null default now(), last_used_at timestamptz
);
create table public.api_usage (
  id bigint generated always as identity primary key, api_key_id uuid not null references public.api_keys(id),
  endpoint text not null, units bigint not null default 1, status_code integer not null,
  created_at timestamptz not null default now()
);
create table public.audit_logs (
  id bigint generated always as identity primary key, actor_id uuid references auth.users(id),
  action text not null, target_type text, target_id uuid, reason text,
  ip_hash text, metadata jsonb not null default '{}', created_at timestamptz not null default now()
);
create table public.login_activity (
  id bigint generated always as identity primary key, user_id uuid not null references auth.users(id),
  user_agent text, ip_hash text, successful boolean not null, created_at timestamptz not null default now()
);

create index generation_jobs_user_status_idx on public.generation_jobs(user_id,status,created_at desc);
create index credit_transactions_user_created_idx on public.credit_transactions(user_id,created_at desc);
create index orders_user_created_idx on public.orders(user_id,created_at desc);
create index assets_user_kind_idx on public.assets(user_id,kind,created_at desc);
create index community_posts_feed_idx on public.community_posts(moderation_status,published_at desc);

create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger plans_updated before update on public.plans for each row execute function public.set_updated_at();
create trigger subscriptions_updated before update on public.subscriptions for each row execute function public.set_updated_at();
create trigger providers_updated before update on public.providers for each row execute function public.set_updated_at();
create trigger ai_models_updated before update on public.ai_models for each row execute function public.set_updated_at();
create trigger generation_jobs_updated before update on public.generation_jobs for each row execute function public.set_updated_at();
create trigger projects_updated before update on public.projects for each row execute function public.set_updated_at();
create trigger support_tickets_updated before update on public.support_tickets for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id, full_name, username, status)
  values(new.id, new.raw_user_meta_data->>'full_name', null, 'active');
  insert into public.wallets(user_id, available, lifetime_bonus) values(new.id, 80, 80);
  insert into public.credit_transactions(user_id,amount,direction,transaction_type,previous_balance,new_balance,description,idempotency_key)
  values(new.id,80,'credit','welcome_bonus',0,80,'Welcome credits','welcome:'||new.id::text);
  insert into public.audit_logs(actor_id,action,target_type,target_id) values(new.id,'user.created','profile',new.id);
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.reserve_credits(p_user uuid, p_amount bigint, p_job uuid, p_key text)
returns bigint language plpgsql security definer set search_path = '' as $$
declare old_balance bigint;
begin
  if p_amount <= 0 then raise exception 'invalid_amount'; end if;
  select available into old_balance from public.wallets where user_id=p_user and not frozen for update;
  if old_balance is null or old_balance < p_amount then raise exception 'insufficient_credits'; end if;
  update public.wallets set available=available-p_amount,reserved=reserved+p_amount,updated_at=now() where user_id=p_user;
  insert into public.credit_transactions(user_id,amount,direction,transaction_type,previous_balance,new_balance,generation_id,idempotency_key)
  values(p_user,-p_amount,'debit','generation_reservation',old_balance,old_balance-p_amount,p_job,p_key);
  return old_balance-p_amount;
end;
$$;

alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.subscriptions enable row level security;
alter table public.orders enable row level security;
alter table public.payments enable row level security;
alter table public.generation_jobs enable row level security;
alter table public.generation_inputs enable row level security;
alter table public.generation_outputs enable row level security;
alter table public.projects enable row level security;
alter table public.folders enable row level security;
alter table public.assets enable row level security;
alter table public.collections enable row level security;
alter table public.notifications enable row level security;
alter table public.support_tickets enable row level security;
alter table public.support_messages enable row level security;
alter table public.api_keys enable row level security;
alter table public.audit_logs enable row level security;

create policy profiles_self_read on public.profiles for select using (id = auth.uid() or is_public);
create policy profiles_self_update on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy wallets_self_read on public.wallets for select using (user_id = auth.uid());
create policy credit_transactions_self_read on public.credit_transactions for select using (user_id = auth.uid());
create policy subscriptions_self_read on public.subscriptions for select using (user_id = auth.uid());
create policy orders_self_read on public.orders for select using (user_id = auth.uid());
create policy payments_self_read on public.payments for select using (user_id = auth.uid());
create policy generation_jobs_self_read on public.generation_jobs for select using (user_id = auth.uid() or visibility='public');
create policy projects_self_all on public.projects for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy folders_self_all on public.folders for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy assets_self_all on public.assets for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy collections_self_all on public.collections for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notifications_self_read on public.notifications for select using (user_id = auth.uid());
create policy tickets_self_read on public.support_tickets for select using (user_id = auth.uid());
create policy tickets_self_insert on public.support_tickets for insert with check (user_id = auth.uid());
create policy api_keys_self_read on public.api_keys for select using (user_id = auth.uid());

grant execute on function public.reserve_credits(uuid,bigint,uuid,text) to service_role;
revoke all on function public.reserve_credits(uuid,bigint,uuid,text) from anon, authenticated;
