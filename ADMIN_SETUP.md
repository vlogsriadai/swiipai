# SwiipAI Admin setup

The Admin console is protected by Supabase authentication and server-side RBAC.

1. Apply all SQL files in `supabase/migrations` in order.
2. Deploy the `admin-access` Edge Function with JWT verification enabled.
3. Assign the first Super Admin directly from a trusted server or SQL console.
4. Confirm the user has a verified email and an `active` profile.
5. Sign in normally, then open `/admin`.

```sql
insert into public.user_roles(user_id, role_id, assigned_by)
select '<AUTH_USER_UUID>'::uuid, id, '<AUTH_USER_UUID>'::uuid
from public.roles where slug = 'super_admin'
on conflict do nothing;
```

The final Super Admin assignment cannot be deleted. Browser clients cannot read or mutate RBAC tables.
