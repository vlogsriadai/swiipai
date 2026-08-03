/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = { "Access-Control-Allow-Origin": Deno.env.get("APP_URL") ?? "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, idempotency-key", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, "content-type": "application/json" } });
const preflight = (request: Request) => request.method === "OPTIONS" ? new Response(null, { status: 204, headers: cors }) : null;
const publicError = (error: unknown, fallback: string) => { const message = error instanceof Error ? error.message : fallback; if (message === "unauthorized") return { message, status: 401 }; if (["forbidden", "account_inactive", "email_not_verified"].includes(message)) return { message, status: 403 }; if (message.includes("not_configured") || message === "server_configuration_missing") return { message, status: 503 }; return { message, status: 400 }; };
async function requirePermission(request: Request, permission: string) {
  const authorization = request.headers.get("authorization"); if (!authorization) throw new Error("unauthorized");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"), url = Deno.env.get("SUPABASE_URL"); if (!key || !url) throw new Error("server_configuration_missing");
  const client = createClient(url, key, { auth: { persistSession: false } }); const token = authorization.replace(/^Bearer\s+/i, ""); const auth = await client.auth.getUser(token); if (auth.error || !auth.data.user) throw new Error("unauthorized"); const user = auth.data.user;
  if (!user.email_confirmed_at) throw new Error("email_not_verified"); const profile = await client.from("profiles").select("status").eq("id", user.id).maybeSingle(); if (profile.error || profile.data?.status !== "active") throw new Error("account_inactive");
  const assignments = await client.from("user_roles").select("roles!inner(slug,name,role_permissions(permissions!inner(slug)))").eq("user_id", user.id); if (assignments.error) throw new Error("authorization_lookup_failed");
  const roles = (assignments.data ?? []).flatMap((a: any) => { const r = Array.isArray(a.roles) ? a.roles[0] : a.roles; return r ? [{ slug: r.slug, name: r.name }] : []; }); const permissions = new Set<string>();
  for (const a of assignments.data ?? []) { const r = Array.isArray((a as any).roles) ? (a as any).roles[0] : (a as any).roles; for (const p of r?.role_permissions ?? []) if (p.permissions?.slug) permissions.add(p.permissions.slug); }
  const isSuperAdmin = roles.some((r: any) => r.slug === "super_admin"); if (!isSuperAdmin && !permissions.has(permission)) throw new Error("forbidden"); return { client, user, roles, permissions: [...permissions], isSuperAdmin };
}

const pageSize = (value: unknown) => Math.min(100, Math.max(1, Number(value) || 25));
const pageNumber = (value: unknown) => Math.max(1, Number(value) || 1);
const money = (value: unknown) => Number(value ?? 0);

async function audit(client: any, actor: any, roles: any[], action: string, targetType: string, targetId?: string, previous?: unknown, next?: unknown, reason?: string) {
  await client.from("audit_logs").insert({
    actor_id: actor.id, actor_email: actor.email, actor_role: roles[0]?.slug ?? "admin",
    action, target_type: targetType, target_id: targetId ?? null,
    previous_value: previous ?? null, new_value: next ?? null, reason: reason ?? null,
    request_id: crypto.randomUUID(), result: "success",
  });
}

async function overview(client: any, days: number) {
  const since = new Date(Date.now() - Math.min(365, Math.max(1, days)) * 86400000).toISOString();
  const today = new Date(); today.setUTCHours(0, 0, 0, 0);
  const [profiles, activeUsers, subs, payments, credits, jobs, recentUsers, recentPayments] = await Promise.all([
    client.from("profiles").select("id,created_at", { count: "exact" }),
    client.from("profiles").select("id", { count: "exact", head: true }).gte("last_active_at", since),
    client.from("subscriptions").select("id,status,plan:plans(name,monthly_price,annual_price)").in("status", ["active", "trialing"]),
    client.from("payments").select("amount,provider,status,provider_fee,created_at").gte("created_at", since),
    client.from("credit_transactions").select("amount,direction,transaction_type,created_at").gte("created_at", since),
    client.from("generation_jobs").select("id,status,created_at,processing_started_at,completed_at").gte("created_at", since),
    client.from("profiles").select("id,full_name,avatar_url,status,created_at,wallets(available)").order("created_at", { ascending: false }).limit(5),
    client.from("payments").select("id,amount,currency,provider,status,created_at,profiles(full_name)").order("created_at", { ascending: false }).limit(5),
  ]);
  for (const result of [profiles, activeUsers, subs, payments, credits, jobs, recentUsers, recentPayments]) if (result.error) throw result.error;
  const paid = (payments.data ?? []).filter((p: any) => p.status === "paid");
  const revenue = paid.reduce((n: number, p: any) => n + money(p.amount), 0);
  const fees = paid.reduce((n: number, p: any) => n + money(p.provider_fee), 0);
  const byGateway = paid.reduce((acc: Record<string, number>, p: any) => ({ ...acc, [p.provider]: (acc[p.provider] ?? 0) + money(p.amount) }), {});
  const successful = (jobs.data ?? []).filter((j: any) => j.status === "completed").length;
  const failed = (jobs.data ?? []).filter((j: any) => j.status === "failed").length;
  const latencies = (jobs.data ?? []).flatMap((j: any) => j.processing_started_at && j.completed_at ? [new Date(j.completed_at).getTime() - new Date(j.processing_started_at).getTime()] : []);
  const mrr = (subs.data ?? []).reduce((n: number, s: any) => n + money(Array.isArray(s.plan) ? s.plan[0]?.monthly_price : s.plan?.monthly_price), 0);
  return {
    range_days: days, total_users: profiles.count ?? 0,
    new_today: (profiles.data ?? []).filter((p: any) => p.created_at >= today.toISOString()).length,
    new_period: (profiles.data ?? []).filter((p: any) => p.created_at >= since).length,
    active_users: activeUsers.count ?? 0, active_subscriptions: (subs.data ?? []).length, mrr, revenue,
    gateway_revenue: byGateway, provider_fees: fees, net_revenue: revenue - fees,
    credits_sold: (credits.data ?? []).filter((x: any) => x.direction === "credit").reduce((n: number, x: any) => n + money(x.amount), 0),
    credits_used: Math.abs((credits.data ?? []).filter((x: any) => x.direction === "debit").reduce((n: number, x: any) => n + money(x.amount), 0)),
    generations: (jobs.data ?? []).length, successful, failed,
    success_rate: successful + failed ? successful / (successful + failed) * 100 : 0,
    avg_latency_ms: latencies.length ? latencies.reduce((a: number, b: number) => a + b, 0) / latencies.length : 0,
    recent_users: recentUsers.data ?? [], recent_payments: recentPayments.data ?? [],
  };
}

async function analytics(client: any, days: number) {
  const count = Math.min(90, Math.max(1, days));
  const since = new Date(Date.now() - (count - 1) * 86400000);
  const [profiles, payments, jobs, credits] = await Promise.all([
    client.from("profiles").select("created_at").gte("created_at", since.toISOString()),
    client.from("payments").select("amount,status,created_at").eq("status", "paid").gte("created_at", since.toISOString()),
    client.from("generation_jobs").select("created_at,status").gte("created_at", since.toISOString()),
    client.from("credit_transactions").select("amount,direction,created_at").eq("direction", "debit").gte("created_at", since.toISOString()),
  ]);
  for (const result of [profiles, payments, jobs, credits]) if (result.error) throw result.error;
  const key = (value: string) => value.slice(0, 10);
  const dates = Array.from({length: count}, (_, index) => {
    const date = new Date(since.getTime() + index * 86400000);
    return date.toISOString().slice(0, 10);
  });
  return {days: count, points: dates.map(date => ({
    date,
    users: (profiles.data ?? []).filter((row: any) => key(row.created_at) === date).length,
    revenue: (payments.data ?? []).filter((row: any) => key(row.created_at) === date).reduce((sum: number, row: any) => sum + money(row.amount), 0),
    generations: (jobs.data ?? []).filter((row: any) => key(row.created_at) === date).length,
    credits: Math.abs((credits.data ?? []).filter((row: any) => key(row.created_at) === date).reduce((sum: number, row: any) => sum + money(row.amount), 0)),
  }))};
}

async function list(client: any, resource: string, body: any) {
  const page = pageNumber(body.page), limit = pageSize(body.limit), from = (page - 1) * limit, to = from + limit - 1;
  const search = String(body.search ?? "").trim();
  if (resource === "users") {
    let query = client.from("profiles").select("id,full_name,avatar_url,country,status,created_at,last_active_at,internal_note,wallets(available,reserved),subscriptions(status,current_period_end,plans(name))", { count: "exact" });
    if (search) query = query.or(`full_name.ilike.%${search}%,username.ilike.%${search}%,id.eq.${search}`);
    if (body.status) query = query.eq("status", body.status);
    const result = await query.order("created_at", { ascending: false }).range(from, to);
    if (result.error) throw result.error;
    const auth = await client.auth.admin.listUsers({ page, perPage: limit });
    const emails = new Map((auth.data?.users ?? []).map((u: any) => [u.id, u.email]));
    return { rows: (result.data ?? []).map((u: any) => ({ ...u, email: emails.get(u.id) ?? "Protected email" })), count: result.count ?? 0, page, limit };
  }
  const config: Record<string, { table: string; select: string }> = {
    credits: { table: "credit_transactions", select: "id,user_id,amount,direction,transaction_type,previous_balance,new_balance,description,created_at,profiles(full_name)" },
    subscriptions: { table: "subscriptions", select: "id,user_id,provider,status,current_period_end,cancel_at_period_end,created_at,plans(name,monthly_price,annual_price,currency),profiles(full_name)" },
    payments: { table: "payments", select: "id,user_id,provider,provider_payment_id,amount,currency,status,provider_fee,refunded_amount,created_at,profiles(full_name),orders(order_number)" },
    plans: { table: "plans", select: "id,slug,name,monthly_price,annual_price,currency,included_credits,team_seats,active,featured,sort_order,updated_at" },
    models: { table: "ai_models", select: "id,name,slug,tool_category,version,credit_cost,provider_cost,active,beta,featured,maintenance,provider_id,providers(name,slug),updated_at" },
    providers: { table: "providers", select: "id,name,slug,type,api_base_url,active,health_status,priority,timeout_ms,retry_limit,rate_limit,webhook_support,cost_settings,updated_at" },
    generations: { table: "generation_jobs", select: "id,user_id,status,prompt,reserved_credits,charged_credits,provider_job_id,created_at,processing_started_at,completed_at,error_code,error_message,profiles(full_name),ai_models(name,providers(name))" },
    support: { table: "support_tickets", select: "id,user_id,category,subject,status,priority,assigned_to,created_at,updated_at,profiles(full_name)" },
    pages: { table: "site_pages", select: "id,slug,title,status,content,published_at,updated_at" },
    moderation: { table: "reports", select: "id,reporter_id,target_type,target_id,reason,details,status,created_at" },
    "api-keys": { table: "api_keys", select: "id,user_id,name,key_prefix,scopes,usage_limit,expires_at,revoked_at,created_at,last_used_at" },
    settings: { table: "site_settings", select: "key,value,public,updated_at" },
  };
  const c = config[resource]; if (!c) throw new Error("resource_not_supported");
  let query = client.from(c.table).select(c.select, { count: "exact" });
  if (body.status && resource !== "credits") query = query.eq(resource === "plans" || resource === "models" || resource === "providers" ? "active" : "status", body.status);
  if (search) {
    const searchable: Record<string,string> = {
      plans: "name.ilike.%${search}%,slug.ilike.%${search}%",
      models: "name.ilike.%${search}%,slug.ilike.%${search}%",
      providers: "name.ilike.%${search}%,slug.ilike.%${search}%",
      generations: "prompt.ilike.%${search}%,provider_job_id.ilike.%${search}%",
      support: "subject.ilike.%${search}%,category.ilike.%${search}%",
      subscriptions: "provider.ilike.%${search}%",
      payments: "provider.ilike.%${search}%,provider_payment_id.ilike.%${search}%",
    };
    const filter = searchable[resource]?.replaceAll("${search}", search);
    if (filter) query = query.or(filter);
  }
  const result = await query.order(resource === "plans" ? "sort_order" : "created_at", { ascending: resource === "plans" }).range(from, to);
  if (result.error) throw result.error;
  return { rows: result.data ?? [], count: result.count ?? 0, page, limit };
}

async function updateResource(client: any, resource: string, body: any) {
  const id = String(body.id || "");
  const specs: Record<string, { table: string; fields: string[] }> = {
    plans: { table: "plans", fields: ["slug","name","monthly_price","annual_price","currency","included_credits","storage_gb","queue_priority","api_limit","team_seats","active","featured","sort_order"] },
    models: { table: "ai_models", fields: ["name","slug","tool_category","description","version","credit_cost","provider_cost","active","beta","featured","maintenance","provider_id"] },
    providers: { table: "providers", fields: ["name","slug","type","api_base_url","active","health_status","priority","timeout_ms","retry_limit","rate_limit","webhook_support","cost_settings"] },
    support: { table: "support_tickets", fields: ["user_id","category","subject","status","priority","assigned_to"] },
    pages: { table: "site_pages", fields: ["slug","title","content","status","published_at"] },
    moderation: { table: "reports", fields: ["status"] },
    settings: { table: "site_settings", fields: ["key","value","public"] },
  };
  const spec = specs[resource]; if (!spec) throw new Error("resource_not_supported");
  const values: Record<string,unknown> = {};
  for (const field of spec.fields) if (Object.prototype.hasOwnProperty.call(body, field)) values[field] = body[field];
  if (!Object.keys(values).length) throw new Error("no_changes");
  const query = id ? client.from(spec.table).update(values).eq("id", id) : client.from(spec.table).insert(values);
  const result = await query.select("*").single(); if (result.error) throw result.error;
  return result.data;
}

Deno.serve(async (request) => {
  const options = preflight(request); if (options) return options;
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  try {
    const body = await request.json().catch(() => ({}));
    const action = String(body.action ?? "overview");
    const permission = action === "adjust_credits" ? "credits.manage" : action.startsWith("user_") ? "users.edit" : action.startsWith("subscription_") || action.startsWith("plan_") || action.startsWith("resource_") ? "subscriptions.manage" : action === "overview" ? "admin.access" : body.resource === "payments" ? "payments.view" : "admin.access";
    const { client, user, roles } = await requirePermission(request, permission);
    if (action === "overview") return json(await overview(client, Number(body.days) || 30));
    if (action === "analytics") return json(await analytics(client, Number(body.days) || 30));
    if (action === "list") return json(await list(client, String(body.resource), body));
    if (action === "user_status") {
      if (body.user_id === user.id && body.status !== "active") throw new Error("cannot_suspend_self");
      const before = await client.from("profiles").select("status,suspension_reason,suspended_until").eq("id", body.user_id).single();
      const next = { status: body.status, suspension_reason: body.reason || null, suspended_until: body.suspended_until || null };
      const result = await client.from("profiles").update(next).eq("id", body.user_id).select("id,status").single(); if (result.error) throw result.error;
      await audit(client, user, roles, "user.status.changed", "profile", body.user_id, before.data, next, body.reason); return json(result.data);
    }
    if (action === "user_note") {
      const result = await client.from("profiles").update({ internal_note: body.note || null }).eq("id", body.user_id).select("id,internal_note").single(); if (result.error) throw result.error;
      await audit(client, user, roles, "user.note.changed", "profile", body.user_id, null, { internal_note: body.note ? "[redacted]" : null }); return json(result.data);
    }
    if (action === "adjust_credits") {
      const key = String(body.idempotency_key || crypto.randomUUID());
      const result = await client.rpc("admin_adjust_credits", { p_admin: user.id, p_user: body.user_id, p_amount: Number(body.amount), p_reason: body.reason, p_key: key }); if (result.error) throw result.error;
      await audit(client, user, roles, "credits.adjusted", "wallet", body.user_id, null, { amount: Number(body.amount), transaction: result.data?.[0]?.transaction_id }, body.reason); return json(result.data?.[0]);
    }
    if (action === "subscription_cancel") {
      const before = await client.from("subscriptions").select("status,cancel_at_period_end").eq("id", body.subscription_id).single();
      const result = await client.from("subscriptions").update({ cancel_at_period_end: true }).eq("id", body.subscription_id).select("id,status,cancel_at_period_end").single(); if (result.error) throw result.error;
      await audit(client, user, roles, "subscription.cancel_scheduled", "subscription", body.subscription_id, before.data, result.data, body.reason); return json(result.data);
    }
    if (action === "plan_toggle") {
      const result = await client.from("plans").update({ active: Boolean(body.active) }).eq("id", body.plan_id).select("id,active").single(); if (result.error) throw result.error;
      await audit(client, user, roles, "plan.status.changed", "plan", body.plan_id, null, { active: Boolean(body.active) }); return json(result.data);
    }
    if (action === "resource_upsert") {
      const data = await updateResource(client, String(body.resource), body);
      await audit(client, user, roles, `${body.resource}.saved`, String(body.resource), body.id, null, { id: data.id });
      return json(data);
    }
    if (action === "resource_archive") {
      const resource = String(body.resource), id = String(body.id);
      const table = resource === "plans" ? "plans" : resource === "models" ? "ai_models" : resource === "providers" ? "providers" : resource === "support" ? "support_tickets" : resource === "pages" ? "site_pages" : resource === "moderation" ? "reports" : resource === "settings" ? "site_settings" : "";
      if (!table) throw new Error("resource_not_supported");
      const values = resource === "support" ? { status: "closed" } : resource === "pages" ? { status: "draft" } : resource === "moderation" ? { status: "rejected" } : resource === "settings" ? { public: false } : { active: false };
      const keyColumn = resource === "settings" ? "key" : "id";
      const result = await client.from(table).update(values).eq(keyColumn, id).select("*").single(); if (result.error) throw result.error;
      await audit(client, user, roles, `${resource}.archived`, resource, id, null, values, body.reason);
      return json(result.data);
    }
    throw new Error("action_not_supported");
  } catch (error) {
    const failure = publicError(error, "admin_request_failed"); return json({ error: failure.message }, failure.status);
  }
});
