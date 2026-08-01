-- Phase 1: server-enforced RBAC, immutable audit trail, and admin session controls.

create schema if not exists private;

insert into public.roles(slug,name) values
  ('super_admin','Super Admin'), ('admin','Admin'),
  ('finance_manager','Finance Manager'), ('support_agent','Support Agent'),
  ('content_manager','Content Manager'), ('model_manager','Model Manager'),
  ('moderator','Moderator'), ('analyst','Analyst'), ('user','User')
on conflict (slug) do update set name=excluded.name;

insert into public.permissions(slug,description) values
  ('admin.access','Access the administration console'),
  ('users.view','View users'), ('users.edit','Edit users'),
  ('users.ban','Ban users'), ('users.delete','Delete users'),
  ('credits.manage','Manage credits'),
  ('subscriptions.manage','Manage subscriptions'),
  ('payments.view','View payments'), ('payments.refund','Refund payments'),
  ('models.view','View models'), ('models.manage','Manage models'),
  ('providers.manage','Manage providers'), ('api_keys.manage','Manage API keys'),
  ('content.manage','Manage content'), ('moderation.manage','Manage moderation'),
  ('settings.manage','Manage settings'), ('security.manage','Manage security'),
  ('audit_logs.view','View audit logs'), ('admins.manage','Manage administrators')
on conflict (slug) do update set description=excluded.description;

-- Built-in role grants are explicit. Custom roles can be managed later without changing code.
insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r cross join public.permissions p
where r.slug='super_admin'
on conflict do nothing;

insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r join public.permissions p on p.slug in
  ('admin.access','users.view','users.edit','credits.manage','subscriptions.manage',
   'payments.view','models.view','models.manage','content.manage','moderation.manage',
   'audit_logs.view')
where r.slug='admin' on conflict do nothing;

insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r join public.permissions p on
  (r.slug='finance_manager' and p.slug in ('admin.access','payments.view','payments.refund','subscriptions.manage','credits.manage')) or
  (r.slug='support_agent' and p.slug in ('admin.access','users.view','credits.manage')) or
  (r.slug='content_manager' and p.slug in ('admin.access','content.manage')) or
  (r.slug='model_manager' and p.slug in ('admin.access','models.view','models.manage','providers.manage','api_keys.manage')) or
  (r.slug='moderator' and p.slug in ('admin.access','users.view','users.ban','moderation.manage')) or
  (r.slug='analyst' and p.slug in ('admin.access','users.view','payments.view','models.view','audit_logs.view'))
on conflict do nothing;

alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_roles enable row level security;

-- RBAC tables have no browser policies by design. Only server-side service-role code may read them.
revoke all on public.roles, public.permissions, public.role_permissions, public.user_roles
  from anon, authenticated;

alter table public.audit_logs
  add column if not exists actor_email text,
  add column if not exists actor_role text,
  add column if not exists previous_value jsonb,
  add column if not exists new_value jsonb,
  add column if not exists user_agent text,
  add column if not exists request_id uuid,
  add column if not exists result text not null default 'success',
  add column if not exists failure_reason text;

create index if not exists audit_logs_actor_created_idx
  on public.audit_logs(actor_id,created_at desc);
create index if not exists audit_logs_action_created_idx
  on public.audit_logs(action,created_at desc);

create table if not exists public.admin_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid,
  two_factor_verified_at timestamptz,
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists admin_sessions_user_active_idx
  on public.admin_sessions(user_id,expires_at desc) where revoked_at is null;
alter table public.admin_sessions enable row level security;
revoke all on public.admin_sessions from anon, authenticated;

-- Audit records are append-only, including for service-role callers.
create or replace function public.prevent_audit_mutation()
returns trigger language plpgsql security invoker set search_path='' as $$
begin raise exception 'audit_logs_are_immutable'; end;
$$;
drop trigger if exists audit_logs_immutable on public.audit_logs;
create trigger audit_logs_immutable before update or delete on public.audit_logs
for each row execute function public.prevent_audit_mutation();

-- Never allow deletion of the final Super Admin assignment.
create or replace function private.protect_last_super_admin()
returns trigger language plpgsql security definer set search_path='' as $$
declare super_role uuid; remaining bigint;
begin
  select id into super_role from public.roles where slug='super_admin';
  if old.role_id=super_role then
    select count(*) into remaining from public.user_roles
      where role_id=super_role and user_id<>old.user_id;
    if remaining=0 then raise exception 'cannot_remove_last_super_admin'; end if;
  end if;
  return old;
end;
$$;
revoke all on function private.protect_last_super_admin() from public,anon,authenticated;
drop trigger if exists protect_last_super_admin_assignment on public.user_roles;
create trigger protect_last_super_admin_assignment before delete on public.user_roles
for each row execute function private.protect_last_super_admin();

grant select,insert on public.audit_logs to service_role;
grant select,insert,update on public.admin_sessions to service_role;
grant select,insert,update,delete on public.roles,public.permissions,public.role_permissions,public.user_roles to service_role;
