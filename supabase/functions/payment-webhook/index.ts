import { adminClient, json, preflight } from "../_shared/core.ts";

const encoder = new TextEncoder();
const hex = (bytes: ArrayBuffer) => [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
const safeEqual = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
};

async function verifyStripe(request: Request, body: string) {
  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) throw new Error("stripe_not_configured");
  const parts = signature.split(",").map((part) => part.split("=", 2));
  const timestamp = Number(parts.find(([key]) => key === "t")?.[1]);
  const signatures = parts.filter(([key]) => key === "v1").map(([, value]) => value);
  if (!timestamp || Math.abs(Date.now() / 1000 - timestamp) > 300) throw new Error("expired_signature");
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const expected = hex(await crypto.subtle.sign("HMAC", key, encoder.encode(`${timestamp}.${body}`)));
  if (!signatures.some((candidate) => safeEqual(expected, candidate))) throw new Error("invalid_signature");
  return JSON.parse(body);
}

async function paypalToken() {
  const id = Deno.env.get("PAYPAL_CLIENT_ID");
  const secret = Deno.env.get("PAYPAL_CLIENT_SECRET");
  const base = Deno.env.get("PAYPAL_ENVIRONMENT") === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
  if (!id || !secret) throw new Error("paypal_not_configured");
  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST", headers: { authorization: `Basic ${btoa(`${id}:${secret}`)}`, "content-type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  const data = await response.json();
  if (!response.ok) throw new Error("paypal_auth_failed");
  return { base, token: data.access_token as string };
}

async function verifyPayPal(request: Request, event: Record<string, unknown>) {
  const webhookId = Deno.env.get("PAYPAL_WEBHOOK_ID");
  if (!webhookId) throw new Error("paypal_not_configured");
  const { base, token } = await paypalToken();
  const response = await fetch(`${base}/v1/notifications/verify-webhook-signature`, {
    method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({
      auth_algo: request.headers.get("paypal-auth-algo"),
      cert_url: request.headers.get("paypal-cert-url"),
      transmission_id: request.headers.get("paypal-transmission-id"),
      transmission_sig: request.headers.get("paypal-transmission-sig"),
      transmission_time: request.headers.get("paypal-transmission-time"),
      webhook_id: webhookId, webhook_event: event,
    }),
  });
  const result = await response.json();
  if (!response.ok || result.verification_status !== "SUCCESS") throw new Error("invalid_signature");
  return { base, token };
}

// Provider webhook payloads are externally-versioned JSON and narrowed at runtime.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fulfilStripe(event: any) {
  if (event.type !== "invoice.paid") return;
  const invoice = event.data.object;
  const subscriptionId = invoice.subscription ?? invoice.parent?.subscription_details?.subscription;
  if (!subscriptionId) throw new Error("missing_subscription");
  const secret = Deno.env.get("STRIPE_SECRET_KEY");
  if (!secret) throw new Error("stripe_not_configured");
  const response = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, { headers: { authorization: `Bearer ${secret}` } });
  const subscription = await response.json();
  if (!response.ok) throw new Error("stripe_subscription_lookup_failed");
  const metadata = subscription.metadata ?? {};
  if (!metadata.user_id || !metadata.plan_slug || !metadata.order_id || !metadata.billing_period) {
    throw new Error("missing_subscription_metadata");
  }
  const client = adminClient();
  const { data: order, error: orderError } = await client.from("orders")
    .select("id,user_id,plan_id,total,currency,payment_status,plans!inner(slug,stripe_monthly_price_id,stripe_annual_price_id)")
    .eq("id", metadata.order_id)
    .eq("user_id", metadata.user_id)
    .single();
  if (orderError || !order) throw new Error("order_not_found");
  const plan = Array.isArray(order.plans) ? order.plans[0] : order.plans;
  const expectedPriceId = metadata.billing_period === "annual"
    ? plan.stripe_annual_price_id
    : plan.stripe_monthly_price_id;
  const paidPriceId = subscription.items?.data?.[0]?.price?.id;
  if (plan.slug !== metadata.plan_slug || !expectedPriceId || paidPriceId !== expectedPriceId) {
    throw new Error("stripe_price_mismatch");
  }
  if ((invoice.currency ?? "").toUpperCase() !== String(order.currency).toUpperCase()) {
    throw new Error("stripe_currency_mismatch");
  }
  const period = invoice.lines?.data?.[0]?.period;
  const { error } = await client.rpc("fulfil_subscription_invoice", {
    p_user: metadata.user_id, p_plan_slug: metadata.plan_slug, p_provider: "stripe",
    p_provider_invoice_id: invoice.id, p_provider_subscription_id: subscriptionId,
    p_period_start: new Date((period?.start ?? subscription.current_period_start) * 1000).toISOString(),
    p_period_end: new Date((period?.end ?? subscription.current_period_end) * 1000).toISOString(),
  });
  if (error) throw error;
  if (metadata.order_id) await client.from("orders").update({ payment_status: "paid", fulfilment_status: "fulfilled", paid_at: new Date().toISOString() }).eq("id", metadata.order_id);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fulfilPayPal(event: any, auth: { base: string; token: string }) {
  if (event.event_type !== "PAYMENT.SALE.COMPLETED") return;
  const subscriptionId = event.resource?.billing_agreement_id;
  if (!subscriptionId) throw new Error("missing_subscription");
  const response = await fetch(`${auth.base}/v1/billing/subscriptions/${subscriptionId}`, { headers: { authorization: `Bearer ${auth.token}` } });
  const subscription = await response.json();
  if (!response.ok || !subscription.custom_id) throw new Error("paypal_subscription_lookup_failed");
  const client = adminClient();
  const { data: order, error: orderError } = await client.from("orders").select("id,user_id,plans(slug)").eq("id", subscription.custom_id).single();
  if (orderError || !order) throw new Error("order_not_found");
  const plan = Array.isArray(order.plans) ? order.plans[0] : order.plans;
  const { error } = await client.rpc("fulfil_subscription_invoice", {
    p_user: order.user_id, p_plan_slug: plan.slug, p_provider: "paypal",
    p_provider_invoice_id: event.resource.id ?? event.id, p_provider_subscription_id: subscriptionId,
    p_period_start: subscription.billing_info?.last_payment?.time ?? new Date().toISOString(),
    p_period_end: subscription.billing_info?.next_billing_time ?? new Date(Date.now() + 31 * 86400000).toISOString(),
  });
  if (error) throw error;
  await client.from("orders").update({ payment_status: "paid", fulfilment_status: "fulfilled", paid_at: new Date().toISOString() }).eq("id", order.id);
}

Deno.serve(async (request) => {
  const options = preflight(request);
  if (options) return options;
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const provider = new URL(request.url).searchParams.get("provider");
  if (provider !== "stripe" && provider !== "paypal") return json({ error: "invalid_provider" }, 400);
  try {
    const body = await request.text();
    const event = JSON.parse(body);
    let paypalAuth: { base: string; token: string } | null = null;
    if (provider === "stripe") await verifyStripe(request, body);
    else paypalAuth = await verifyPayPal(request, event);
    const client = adminClient();
    const externalId = event.id;
    const eventType = event.type ?? event.event_type;
    const { error: eventError } = await client.from("payment_events").insert({
      provider, external_event_id: externalId, event_type: eventType, payload: event,
      signature_verified: true, processing_status: "processing",
    });
    if (eventError?.code === "23505") return json({ received: true, duplicate: true });
    if (eventError) throw eventError;
    if (provider === "stripe") await fulfilStripe(event);
    else await fulfilPayPal(event, paypalAuth!);
    await client.from("payment_events").update({ processing_status: "processed", processed_at: new Date().toISOString() })
      .eq("provider", provider).eq("external_event_id", externalId);
    return json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "invalid_event";
    return json({ error: message }, 400);
  }
});
