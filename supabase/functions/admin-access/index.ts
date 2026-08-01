import { json, preflight, publicError, requirePermission } from "../_shared/core.ts";

Deno.serve(async (request) => {
  const options = preflight(request);
  if (options) return options;
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const { client, user, roles, permissions, isSuperAdmin } =
      await requirePermission(request, "admin.access");

    await client.from("audit_logs").insert({
      actor_id: user.id,
      actor_email: user.email,
      actor_role: roles[0]?.slug ?? "admin",
      action: "admin.session.authorized",
      target_type: "admin_console",
      result: "success",
      request_id: crypto.randomUUID(),
      metadata: { role_count: roles.length },
    });

    return json({
      user: { id: user.id, email: user.email },
      roles,
      permissions,
      is_super_admin: isSuperAdmin,
    });
  } catch (error) {
    const failure = publicError(error, "admin_access_denied");
    return json({ error: failure.message }, failure.status);
  }
});
