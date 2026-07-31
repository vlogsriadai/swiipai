const messages: Record<string, string> = {
  unauthorized: "Your session has expired. Please sign in again.",
  model_unavailable: "This SwiipAI model is not active yet.",
  tool_unavailable: "This creation tool is not active yet.",
  plan_upgrade_required: "This model is not included in your current plan.",
  insufficient_credits: "You do not have enough credits for this generation.",
  stripe_not_configured: "Stripe checkout is not configured yet.",
  stripe_price_not_configured: "This Stripe price has not been configured yet.",
  paypal_not_configured: "PayPal checkout is not configured yet.",
  paypal_price_not_configured: "This PayPal plan has not been configured yet.",
  plan_unavailable: "This subscription plan is currently unavailable.",
  server_configuration_missing: "The server connection is not configured.",
};

export async function functionErrorMessage(error: unknown, fallback: string) {
  let code = error instanceof Error ? error.message : "";
  const context = typeof error === "object" && error !== null && "context" in error
    ? (error as { context?: unknown }).context
    : null;

  if (context instanceof Response) {
    try {
      const payload = await context.clone().json() as { error?: string; message?: string };
      code = payload.error ?? payload.message ?? code;
    } catch {
      try { code = (await context.clone().text()) || code; } catch {}
    }
  }

  return messages[code] ?? (code && !code.includes("non-2xx") ? code : fallback);
}
