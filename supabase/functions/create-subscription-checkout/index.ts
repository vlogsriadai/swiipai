import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";
import { idempotencyKey, json, requireUser } from "../_shared/core.ts";

const Input = z.object({
  plan_slug: z.enum(["basic", "pro", "max"]),
  provider: z.enum(["stripe", "paypal"]),
  billing_period: z.enum(["monthly", "annual"]),
});

async function stripeCheckout(priceId: string, orderId: string, userId: string, plan: string, period: string) {
  const secret = Deno.env.get("STRIPE_SECRET_KEY");
  const appUrl = Deno.env.get("APP_URL");
  if (!secret || !appUrl || !priceId) throw new Error("stripe_not_configured");
  const body = new URLSearchParams({
    mode: "subscription",
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": "1",
    success_url: `${appUrl}/app/billing?checkout=success`,
    cancel_url: `${appUrl}/pricing?checkout=cancelled`,
    client_reference_id: orderId,
    "metadata[user_id]": userId,
    "metadata[order_id]": orderId,
    "metadata[plan_slug]": plan,
    "metadata[billing_period]": period,
    "subscription_data[metadata][user_id]": userId,
    "subscription_data[metadata][order_id]": orderId,
    "subscription_data[metadata][plan_slug]": plan,
  });
  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST", headers: { authorization: `Bearer ${secret}`, "content-type": "application/x-www-form-urlencoded" }, body,
  });
  const result = await response.json();
  if (!response.ok || !result.url) throw new Error(result.error?.message ?? "stripe_checkout_failed");
  return result.url as string;
}

async function paypalCheckout(planId: string, orderId: string) {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
  const secret = Deno.env.get("PAYPAL_CLIENT_SECRET");
  const appUrl = Deno.env.get("APP_URL");
  const base = Deno.env.get("PAYPAL_ENVIRONMENT") === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
  if (!clientId || !secret || !appUrl || !planId) throw new Error("paypal_not_configured");
  const tokenResponse = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: { authorization: `Basic ${btoa(`${clientId}:${secret}`)}`, "content-type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  const token = await tokenResponse.json();
  if (!tokenResponse.ok || !token.access_token) throw new Error("paypal_auth_failed");
  const response = await fetch(`${base}/v1/billing/subscriptions`, {
    method: "POST",
    headers: { authorization: `Bearer ${token.access_token}`, "content-type": "application/json", "paypal-request-id": orderId },
    body: JSON.stringify({
      plan_id: planId, custom_id: orderId,
      application_context: {
        brand_name: "SwiipAI", user_action: "SUBSCRIBE_NOW",
        return_url: `${appUrl}/app/billing?checkout=success`,
        cancel_url: `${appUrl}/pricing?checkout=cancelled`,
      },
    }),
  });
  const result = await response.json();
  const approval = result.links?.find((link: { rel: string }) => link.rel === "approve")?.href;
  if (!response.ok || !approval) throw new Error(result.message ?? "paypal_checkout_failed");
  return approval as string;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok");
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  try {
    const { client, user } = await requireUser(request);
    const input = Input.parse(await request.json());
    const key = request.headers.get("idempotency-key") ?? crypto.randomUUID();
    if (request.headers.has("idempotency-key")) idempotencyKey(request);
    const { data: plan, error } = await client.from("plans").select("*").eq("slug", input.plan_slug).eq("active", true).single();
    if (error || !plan) throw new Error("plan_unavailable");
    const total = input.billing_period === "annual" ? Number(plan.annual_price) * 12 : Number(plan.monthly_price);
    const { data: order, error: orderError } = await client.from("orders").insert({
      order_number: `SUB-${Date.now()}-${key.slice(0, 8)}`, user_id: user.id, order_type: "subscription",
      plan_id: plan.id, subtotal: total, total, currency: plan.currency,
      payment_provider: input.provider, metadata: { billing_period: input.billing_period },
    }).select("id").single();
    if (orderError) throw orderError;
    const suffix = input.billing_period === "annual" ? "annual" : "monthly";
    const providerId = input.provider === "stripe" ? plan[`stripe_${suffix}_price_id`] : plan[`paypal_${suffix}_plan_id`];
    const url = input.provider === "stripe"
      ? await stripeCheckout(providerId, order.id, user.id, input.plan_slug, input.billing_period)
      : await paypalCheckout(providerId, order.id);
    return json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "checkout_failed";
    return json({ error: message }, message === "unauthorized" ? 401 : 400);
  }
});
