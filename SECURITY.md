# Security foundation

- `/admin` requires a valid Supabase session, verified email, active profile, and `admin.access` permission.
- Authorization is evaluated inside the `admin-access` Edge Function using the service role; client-provided roles are ignored.
- RBAC and admin-session tables have RLS enabled and no browser policies.
- Audit logs are append-only and cannot be updated or deleted.
- The final Super Admin role assignment is protected by a database trigger.
- Service-role, payment, provider, and webhook secrets must only exist in server-side secret storage.

Before production, enforce MFA for administrators, set a short JWT lifetime, configure CSP/security headers, and test every role against every privileged endpoint.
