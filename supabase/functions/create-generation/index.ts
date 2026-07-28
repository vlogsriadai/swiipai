import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";
import { cors, idempotencyKey, json, requireUser } from "../_shared/core.ts";

const Input = z.object({
  tool: z.string().min(2).max(80),
  model: z.string().min(2).max(100),
  prompt: z.string().min(2).max(4000),
  settings: z.record(z.unknown()).default({}),
  visibility: z.enum(["private", "public", "unlisted"]).default("private"),
});

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  try {
    const { client, user } = await requireUser(request);
    const key = idempotencyKey(request);
    const input = Input.parse(await request.json());
    const { data: model, error: modelError } = await client
      .from("ai_models").select("id,credit_cost,active,maintenance")
      .eq("slug", input.model).single();
    if (modelError || !model?.active || model.maintenance) return json({ error: "model_unavailable" }, 409);
    const { data: tool } = await client.from("tools").select("id").eq("slug", input.tool).eq("active", true).single();
    if (!tool) return json({ error: "tool_unavailable" }, 409);
    const { data: entitled, error: entitlementError } = await client.rpc("can_use_generation", {
      p_user: user.id, p_tool: input.tool, p_model: input.model,
    });
    if (entitlementError) throw entitlementError;
    if (!entitled) return json({ error: "plan_upgrade_required" }, 403);

    const { data: job, error: jobError } = await client.from("generation_jobs").insert({
      user_id: user.id, tool_id: tool.id, model_id: model.id, status: "queued",
      prompt: input.prompt, settings: input.settings, visibility: input.visibility,
      reserved_credits: model.credit_cost,
    }).select("id,status").single();
    if (jobError) throw jobError;
    const { error: creditError } = await client.rpc("reserve_credits", {
      p_user: user.id, p_amount: model.credit_cost, p_job: job.id, p_key: `generation:${key}`,
    });
    if (creditError) {
      await client.from("generation_jobs").update({ status: "cancelled", error_code: "credit_reservation_failed" }).eq("id", job.id);
      return json({ error: "insufficient_credits" }, 402);
    }

    // Provider dispatch belongs here. Mock mode never charges or fulfils a real job.
    if (Deno.env.get("SWIIPAI_MOCK_GENERATION") === "true") {
      return json({ job_id: job.id, status: "queued", mode: "mock", notice: "No provider was called." }, 202);
    }
    return json({ job_id: job.id, status: "queued" }, 202);
  } catch (error) {
    const message = error instanceof Error ? error.message : "request_failed";
    return json({ error: message }, message === "unauthorized" ? 401 : 400);
  }
});
