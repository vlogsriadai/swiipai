import { adminClient, json } from "../_shared/core.ts";

type Provider = "stripe" | "paypal" | "youcan";

async function verifyProviderEvent(provider: Provider, request: Request) {
  // Implement against the current official SDK/API before enabling a provider.
  // This deliberately fails closed: unverified events can never fulfil an order.
  const configured = Deno.env.get(`${provider.toUpperCase()}_WEBHOOK_SECRET`);
  if (!configured) throw new Error("provider_not_configured");
  void request;
  throw new Error("verification_adapter_not_enabled");
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const provider = new URL(request.url).searchParams.get("provider") as Provider;
  if (!["stripe", "paypal", "youcan"].includes(provider)) return json({ error: "invalid_provider" }, 400);
  try {
    const event = await verifyProviderEvent(provider, request);
    const client = adminClient();
    await client.from("payment_events").insert(event);
    return json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "invalid_event";
    return json({ error: message }, 400);
  }
});
