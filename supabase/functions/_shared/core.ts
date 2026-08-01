import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const cors = {
  // Edge Function secrets use APP_URL. Falling back to * is safe here because
  // authentication is carried by an explicit Bearer token, not cookies.
  "Access-Control-Allow-Origin": Deno.env.get("APP_URL") ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, idempotency-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function preflight(request: Request) {
  if (request.method !== "OPTIONS") return null;
  return new Response(null, { status: 204, headers: cors });
}

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "content-type": "application/json" },
  });
}

export function publicError(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  if (message === "unauthorized") return { message, status: 401 };
  if (message === "forbidden" || message === "account_inactive" || message === "email_not_verified") {
    return { message, status: 403 };
  }
  if (message.includes("not_configured") || message === "server_configuration_missing") {
    return { message, status: 503 };
  }
  if (message.includes("unavailable")) return { message, status: 409 };
  return { message, status: 400 };
}

export function adminClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("server_configuration_missing");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function requireUser(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization) throw new Error("unauthorized");
  const client = adminClient();
  const token = authorization.replace(/^Bearer\s+/i, "");
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) throw new Error("unauthorized");
  return { client, user: data.user };
}

export async function requirePermission(request: Request, permission: string) {
  const { client, user } = await requireUser(request);
  if (!user.email_confirmed_at) throw new Error("email_not_verified");

  const { data: profile, error: profileError } = await client
    .from("profiles")
    .select("status")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError || profile?.status !== "active") throw new Error("account_inactive");

  const { data: assignments, error } = await client
    .from("user_roles")
    .select("roles!inner(slug,name,role_permissions(permissions!inner(slug)))")
    .eq("user_id", user.id);
  if (error) throw new Error("authorization_lookup_failed");

  type PermissionLink = { permissions: { slug: string } | null };
  type RoleRecord = { slug: string; name: string; role_permissions?: PermissionLink[] };
  type Assignment = { roles: RoleRecord | RoleRecord[] | null };
  const roleFor = (assignment: Assignment): RoleRecord | null =>
    Array.isArray(assignment.roles) ? assignment.roles[0] ?? null : assignment.roles;

  const typedAssignments = (assignments ?? []) as unknown as Assignment[];
  const roles = typedAssignments.flatMap((assignment) => {
    const role = roleFor(assignment);
    return role ? [{ slug: role.slug, name: role.name }] : [];
  });
  const permissions = new Set<string>();
  for (const assignment of typedAssignments) {
    const role = roleFor(assignment);
    for (const link of role?.role_permissions ?? []) {
      if (link.permissions?.slug) permissions.add(link.permissions.slug);
    }
  }
  const isSuperAdmin = roles.some((role) => role.slug === "super_admin");
  if (!isSuperAdmin && !permissions.has(permission)) throw new Error("forbidden");

  return { client, user, roles, permissions: [...permissions], isSuperAdmin };
}

export function idempotencyKey(request: Request) {
  const key = request.headers.get("idempotency-key");
  if (!key || key.length < 16 || key.length > 160) throw new Error("invalid_idempotency_key");
  return key;
}
