/* eslint-disable @typescript-eslint/no-explicit-any */
import { json, preflight, publicError, requirePermission } from "../_shared/core.ts";

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
  };
  const c = config[resource]; if (!c) throw new Error("resource_not_supported");
  let query = client.from(c.table).select(c.select, { count: "exact" });
  if (body.status && resource !== "credits") query = query.eq(resource === "plans" ? "active" : "status", body.status);
  const result = await query.order(resource === "plans" ? "sort_order" : "created_at", { ascending: resource === "plans" }).range(from, to);
  if (result.error) throw result.error;
  return { rows: result.data ?? [], count: result.count ?? 0, page, limit };
}

Deno.serve(async (request) => {
  const options = preflight(request); if (options) return options;
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  try {
    const body = await request.json().catch(() => ({}));
    const action = String(body.action ?? "overview");
    const permission = action === "adjust_credits" ? "credits.manage" : action.startsWith("user_") ? "users.edit" : action.startsWith("subscription_") || action.startsWith("plan_") ? "subscriptions.manage" : action === "overview" ? "admin.access" : body.resource === "payments" ? "payments.view" : "admin.access";
    const { client, user, roles } = await requirePermission(request, permission);
    if (action === "overview") return json(await overview(client, Number(body.days) || 30));
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
    throw new Error("action_not_supported");
  } catch (error) {
    const failure = publicError(error, "admin_request_failed"); return json({ error: failure.message }, failure.status);
  }
});
