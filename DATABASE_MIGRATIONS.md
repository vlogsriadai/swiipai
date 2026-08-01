# Database migrations

Apply migrations in filename order. The Phase 1 security migration is:

`supabase/migrations/20260801190000_admin_security_foundation.sql`

It adds the built-in RBAC vocabulary, explicit grants, locked RBAC tables, append-only audit fields, protected admin sessions, indexes, and last-Super-Admin protection.

After applying it, run Supabase security and performance advisors and test with one normal user and each admin role.
