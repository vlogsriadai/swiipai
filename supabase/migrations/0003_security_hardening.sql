-- SECURITY DEFINER functions must never inherit PostgreSQL's default PUBLIC
-- execute grant. Edge Functions call these only with the service role.
revoke all on function public.reserve_credits(uuid,bigint,uuid,text)
  from public, anon, authenticated;
grant execute on function public.reserve_credits(uuid,bigint,uuid,text)
  to service_role;

revoke all on function public.rls_auto_enable()
  from public, anon, authenticated;
