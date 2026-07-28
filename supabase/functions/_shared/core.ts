import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const cors = {
  "Access-Control-Allow-Origin": Deno.env.get("NEXT_PUBLIC_APP_URL") ?? "",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, idempotency-key",
};

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "content-type": "application/json" },
  });
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

export function idempotencyKey(request: Request) {
  const key = request.headers.get("idempotency-key");
  if (!key || key.length < 16 || key.length > 160) throw new Error("invalid_idempotency_key");
  return key;
}
