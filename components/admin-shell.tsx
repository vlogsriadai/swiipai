"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  Bell,
  CircleDollarSign,
  Coins,
  Download,
  Ellipsis,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { Logo, StatusPill } from "./brand";
import { adminNav } from "./data";
import { getSupabaseBrowserClient } from "../lib/supabase-browser";

type AdminContext = {
  user: { id: string; email?: string };
  roles: Array<{ slug: string; name: string }>;
  permissions: string[];
  is_super_admin: boolean;
};
type OverviewData = {
  total_users: number;
  new_today: number;
  new_period: number;
  active_users: number;
  active_subscriptions: number;
  mrr: number;
  revenue: number;
  gateway_revenue: Record<string, number>;
  provider_fees: number;
  net_revenue: number;
  credits_sold: number;
  credits_used: number;
  generations: number;
  successful: number;
  failed: number;
  success_rate: number;
  avg_latency_ms: number;
  recent_users: any[];
  recent_payments: any[];
};
type AnalyticsData = {
  days: number;
  points: Array<{
    date: string;
    users: number;
    revenue: number;
    generations: number;
    credits: number;
  }>;
};
type ListData = { rows: any[]; count: number; page: number; limit: number };

const fmt = (n: number, kind: "number" | "money" = "number") =>
  new Intl.NumberFormat(
    "en-US",
    kind === "money"
      ? { style: "currency", currency: "USD", maximumFractionDigits: 0 }
      : {
          notation: n > 9999 ? "compact" : "standard",
          maximumFractionDigits: 1,
        },
  ).format(n || 0);
const date = (value?: string) =>
  value
    ? new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(value))
    : "—";

async function invoke(body: Record<string, unknown>) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Admin connection unavailable");
  const { data, error } = await supabase.functions.invoke("admin-data", {
    body,
  });
  if (error) throw new Error((data as any)?.error || error.message);
  if ((data as any)?.error) throw new Error((data as any).error);
  return data;
}
function allowed(ctx: AdminContext, p: string) {
  return ctx.is_super_admin || ctx.permissions.includes(p);
}

function AdminSidebar({
  path,
  context,
}: {
  path: string;
  context: AdminContext;
}) {
  const email = context.user.email ?? "Administrator";
  return (
    <aside className="admin-sidebar">
      <div className="admin-logo">
        <Logo />
        <span>ADMIN</span>
      </div>
      <nav>
        {adminNav.map(({ label, href, icon: Icon }) => (
          <Link
            className={
              path === href || (path === "/admin" && href.endsWith("dashboard"))
                ? "active"
                : ""
            }
            href={href}
            key={href}
          >
            <Icon size={17} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
      <div className="admin-user">
        <span>{email.slice(0, 2).toUpperCase()}</span>
        <div>
          <b>{email}</b>
          <small>{context.roles[0]?.name ?? "Administrator"}</small>
        </div>
        <Ellipsis size={16} />
      </div>
    </aside>
  );
}
function AdminTop({
  open,
  onSearch,
}: {
  open: () => void;
  onSearch: (v: string) => void;
}) {
  return (
    <header className="admin-top">
      <button
        className="mobile-only"
        onClick={open}
        aria-label="Open navigation"
      >
        <Menu />
      </button>
      <div className="admin-search">
        <Search size={15} />
        <input
          placeholder="Search anything…"
          onChange={(e) => onSearch(e.target.value)}
        />
        <kbd>⌘K</kbd>
      </div>
      <div>
        <button className="admin-command" title="Command palette">
          ⌘
        </button>
        <button className="icon-button" aria-label="Notifications">
          <Bell size={17} />
        </button>
        <span className="avatar">AD</span>
      </div>
    </header>
  );
}

function Loading() {
  return (
    <div className="admin-skeletons">
      {Array.from({ length: 8 }).map((_, i) => (
        <i key={i} />
      ))}
    </div>
  );
}
function ErrorBox({ message, retry }: { message: string; retry: () => void }) {
  return (
    <div className="admin-empty">
      <ShieldCheck />
      <h3>Couldn&apos;t load this data</h3>
      <p>{message}</p>
      <button onClick={retry}>Try again</button>
    </div>
  );
}

function Overview({
  days,
  setDays,
}: {
  days: number;
  setDays: (n: number) => void;
}) {
  const [data, setData] = useState<OverviewData | null>(null);
  const [error, setError] = useState("");
  const load = useCallback(() => {
    setError("");
    invoke({ action: "overview", days })
      .then((x) => setData(x as OverviewData))
      .catch((e) => setError(e.message));
  }, [days]);
  useEffect(load, [load]);
  if (error) return <ErrorBox message={error} retry={load} />;
  if (!data) return <Loading />;
  const stats = [
    ["Total Users", data.total_users, Users],
    ["Active Users", data.active_users, Activity],
    ["MRR", data.mrr, CircleDollarSign],
    ["Total Revenue", data.revenue, CircleDollarSign],
    ["Credits Sold", data.credits_sold, Coins],
    ["Success Rate", data.success_rate, Sparkles],
  ] as const;
  return (
    <div className="admin-page">
      <div className="admin-title">
        <div>
          <p>LIVE SUPABASE DATA</p>
          <h1>Overview</h1>
          <span>Business, usage and financial health in one place.</span>
        </div>
        <div>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            <option value="1">Today</option>
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
          </select>
          <button
            className="admin-secondary"
            onClick={() =>
              downloadCsv(
                "overview",
                stats.map(([label, value]) => ({ metric: label, value })),
              )
            }
          >
            <Download size={15} />
            Export
          </button>
        </div>
      </div>
      <div className="admin-stat-grid six">
        {stats.map(([label, value, Icon]) => (
          <article key={label}>
            <div>
              <span>
                <Icon />
              </span>
              <small>Live</small>
            </div>
            <p>{label}</p>
            <h2>
              {label.includes("Revenue") || label === "MRR"
                ? fmt(Number(value), "money")
                : label.includes("Rate")
                  ? `${Number(value).toFixed(1)}%`
                  : fmt(Number(value))}
            </h2>
            <b className="positive">Current range</b>
          </article>
        ))}
      </div>
      <div className="admin-grid">
        <section className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <h3>Revenue by gateway</h3>
              <p>Confirmed payments only</p>
            </div>
            <b>{fmt(data.net_revenue, "money")} net</b>
          </div>
          <div className="gateway-bars">
            {Object.entries(data.gateway_revenue).length ? (
              Object.entries(data.gateway_revenue).map(([name, value]) => (
                <div key={name}>
                  <span>{name}</span>
                  <i>
                    <b
                      style={{
                        width: `${Math.max(8, (value / Math.max(data.revenue, 1)) * 100)}%`,
                      }}
                    />
                  </i>
                  <strong>{fmt(value, "money")}</strong>
                </div>
              ))
            ) : (
              <p className="muted">No paid transactions in this range.</p>
            )}
          </div>
        </section>
        <section className="admin-panel health">
          <div className="admin-panel-head">
            <div>
              <h3>Generation health</h3>
              <p>Real job outcomes</p>
            </div>
            <StatusPill>{data.success_rate.toFixed(1)}%</StatusPill>
          </div>
          {[
            ["Total jobs", data.generations],
            ["Successful", data.successful],
            ["Failed", data.failed],
            ["Average latency", `${(data.avg_latency_ms / 1000).toFixed(1)}s`],
            ["Credits used", data.credits_used],
            ["Provider fees", fmt(data.provider_fees, "money")],
          ].map(([k, v]) => (
            <div className="health-row" key={k}>
              <i />
              <b>{k}</b>
              <span>{v}</span>
              <small />
            </div>
          ))}
        </section>
      </div>
      <div className="admin-grid lower">
        <Recent
          title="Recent users"
          rows={data.recent_users.map((u) => [
            u.full_name || "Unnamed user",
            u.status,
            date(u.created_at),
          ])}
        />
        <Recent
          title="Recent payments"
          rows={data.recent_payments.map((p) => [
            (Array.isArray(p.profiles)
              ? p.profiles[0]?.full_name
              : p.profiles?.full_name) || "Customer",
            p.provider,
            `${fmt(Number(p.amount), "money")} · ${p.status}`,
          ])}
        />
      </div>
    </div>
  );
}

function Recent({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <h3>{title}</h3>
      </div>
      {rows.length ? (
        rows.map((r, i) => (
          <div className="admin-recent" key={i}>
            <span>{r[0]?.slice(0, 2).toUpperCase()}</span>
            <div>
              <b>{r[0]}</b>
              <small>{r[1]}</small>
            </div>
            <em>{r[2]}</em>
          </div>
        ))
      ) : (
        <p className="muted">No records yet.</p>
      )}
    </section>
  );
}

function Analytics({
  days,
  setDays,
}: {
  days: number;
  setDays: (n: number) => void;
}) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState("");
  const load = useCallback(() => {
    setError("");
    invoke({ action: "analytics", days })
      .then((x) => setData(x as AnalyticsData))
      .catch((e) => setError(e.message));
  }, [days]);
  useEffect(load, [load]);
  if (error) return <ErrorBox message={error} retry={load} />;
  if (!data) return <Loading />;
  const max = (key: keyof AnalyticsData["points"]) =>
    Math.max(1, ...data.points.map((p) => Number(p[key])));
  const total = (key: keyof AnalyticsData["points"]) =>
    data.points.reduce((n, p) => n + Number(p[key]), 0);
  const cards = [
    { label: "New users", value: total("users"), tone: "green" },
    { label: "Revenue", value: fmt(total("revenue"), "money"), tone: "lime" },
    { label: "Generations", value: fmt(total("generations")), tone: "violet" },
    { label: "Credits used", value: fmt(total("credits")), tone: "cyan" },
  ];
  return (
    <div className="admin-page">
      <div className="admin-title">
        <div>
          <p>LIVE SUPABASE DATA</p>
          <h1>Analytics</h1>
          <span>Daily growth, revenue and product usage.</span>
        </div>
        <div>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
          </select>
          <button
            className="admin-secondary"
            onClick={() => downloadCsv("analytics", data.points)}
          >
            <Download size={15} />
            Export
          </button>
        </div>
      </div>
      <div className="admin-stat-grid analytics-cards">
        {cards.map((c) => (
          <article key={c.label}>
            <div>
              <span className={`analytics-icon ${c.tone}`}>
                <Activity />
              </span>
              <small>Live</small>
            </div>
            <p>{c.label}</p>
            <h2>{c.value}</h2>
            <b className="positive">Selected range</b>
          </article>
        ))}
      </div>
      <section className="admin-panel analytics-panel">
        <div className="admin-panel-head">
          <div>
            <h3>Business performance</h3>
            <p>One point per day from production records</p>
          </div>
          <div className="analytics-legend">
            <span>
              <i className="users" />
              Users
            </span>
            <span>
              <i className="revenue" />
              Revenue
            </span>
            <span>
              <i className="generations" />
              Generations
            </span>
          </div>
        </div>
        <div
          className="analytics-chart"
          aria-label="Daily business performance chart"
        >
          {data.points.map((point) => (
            <div className="analytics-day" key={point.date}>
              <div className="analytics-bars">
                <i
                  className="users"
                  style={{
                    height: `${Math.max(4, (point.users / max("users")) * 100)}%`,
                  }}
                />
                <i
                  className="revenue"
                  style={{
                    height: `${Math.max(4, (point.revenue / max("revenue")) * 100)}%`,
                  }}
                />
                <i
                  className="generations"
                  style={{
                    height: `${Math.max(4, (point.generations / max("generations")) * 100)}%`,
                  }}
                />
              </div>
              <small>{point.date.slice(5)}</small>
            </div>
          ))}
        </div>
      </section>
      <div className="admin-grid analytics-lower">
        <section className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <h3>Revenue trend</h3>
              <p>Paid transactions only</p>
            </div>
            <b>{fmt(total("revenue"), "money")}</b>
          </div>
          <div className="analytics-spark">
            {data.points.map((point) => (
              <i
                key={point.date}
                style={{
                  height: `${Math.max(5, (point.revenue / max("revenue")) * 100)}%`,
                }}
              />
            ))}
          </div>
        </section>
        <section className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <h3>Usage trend</h3>
              <p>Credits consumed by real jobs</p>
            </div>
            <b>{fmt(total("credits"))}</b>
          </div>
          <div className="analytics-spark cyan">
            {data.points.map((point) => (
              <i
                key={point.date}
                style={{
                  height: `${Math.max(5, (point.credits / max("credits")) * 100)}%`,
                }}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function downloadCsv(name: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const csv = [
    keys.join(","),
    ...rows.map((r) => keys.map((k) => JSON.stringify(r[k] ?? "")).join(",")),
  ].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = `swiipai-${name}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

const configs: Record<
  string,
  {
    title: string;
    copy: string;
    permission: string;
    columns: string[];
    row: (r: any) => unknown[];
  }
> = {
  users: {
    title: "Users",
    copy: "Search, review and manage every account.",
    permission: "users.view",
    columns: ["User", "Plan", "Credits", "Status", "Joined", "Actions"],
    row: (r) => [
      <>
        <b>{r.full_name || "Unnamed"}</b>
        <small>{r.email}</small>
      </>,
      r.subscriptions?.[0]?.plans?.name || "Free",
      r.wallets?.available ?? 0,
      r.status,
      date(r.created_at),
      r,
    ],
  },
  credits: {
    title: "Credit ledger",
    copy: "Immutable balance history and admin adjustments.",
    permission: "credits.manage",
    columns: ["User", "Type", "Amount", "Before", "After", "Date"],
    row: (r) => [
      (Array.isArray(r.profiles)
        ? r.profiles[0]?.full_name
        : r.profiles?.full_name) || r.user_id,
      r.transaction_type,
      r.amount,
      r.previous_balance,
      r.new_balance,
      date(r.created_at),
    ],
  },
  subscriptions: {
    title: "Subscriptions",
    copy: "Current plans, renewals and cancellation status.",
    permission: "subscriptions.manage",
    columns: ["User", "Plan", "Gateway", "Status", "Renews", "Actions"],
    row: (r) => [
      (Array.isArray(r.profiles)
        ? r.profiles[0]?.full_name
        : r.profiles?.full_name) || r.user_id,
      (Array.isArray(r.plans) ? r.plans[0]?.name : r.plans?.name) || "—",
      r.provider,
      r.status,
      date(r.current_period_end),
      r,
    ],
  },
  payments: {
    title: "Payments",
    copy: "Verified transactions across every gateway.",
    permission: "payments.view",
    columns: ["Customer", "Gateway", "Payment ID", "Amount", "Status", "Date"],
    row: (r) => [
      (Array.isArray(r.profiles)
        ? r.profiles[0]?.full_name
        : r.profiles?.full_name) || r.user_id,
      r.provider,
      r.provider_payment_id,
      `${r.currency} ${r.amount}`,
      r.status,
      date(r.created_at),
    ],
  },
  plans: {
    title: "Plans",
    copy: "Pricing and entitlements managed without code changes.",
    permission: "subscriptions.manage",
    columns: ["Plan", "Monthly", "Annual", "Credits", "Status", "Actions"],
    row: (r) => [
      r.name,
      `${r.currency} ${r.monthly_price}`,
      `${r.currency} ${r.annual_price}`,
      r.included_credits,
      r.active ? "Active" : "Disabled",
      r,
    ],
  },
  models: {
    title: "Models",
    copy: "Manage the real model catalog, pricing and availability.",
    permission: "models.view",
    columns: ["Model", "Category", "Provider", "Credits", "Status", "Actions"],
    row: (r) => [
      r.name,
      r.tool_category,
      r.providers?.name || "—",
      r.credit_cost,
      r.active ? "Active" : "Disabled",
      r,
    ],
  },
  providers: {
    title: "Providers",
    copy: "Manage API providers, routing priority and health state.",
    permission: "providers.manage",
    columns: ["Provider", "Type", "Priority", "Health", "Status", "Actions"],
    row: (r) => [
      r.name,
      r.type,
      r.priority,
      r.health_status,
      r.active ? "Active" : "Disabled",
      r,
    ],
  },
  generations: {
    title: "Generation Jobs",
    copy: "Monitor real jobs, failures, credits and provider output.",
    permission: "admin.access",
    columns: ["Job", "User", "Status", "Credits", "Created", "Actions"],
    row: (r) => [
      r.id.slice(0, 12),
      r.profiles?.full_name || r.user_id,
      r.status,
      r.charged_credits || r.reserved_credits,
      date(r.created_at),
      r,
    ],
  },
  support: {
    title: "Support Tickets",
    copy: "Resolve real customer issues and track ticket status.",
    permission: "admin.access",
    columns: [
      "Ticket",
      "Customer",
      "Category",
      "Priority",
      "Status",
      "Actions",
    ],
    row: (r) => [
      r.id.slice(0, 12),
      r.profiles?.full_name || r.user_id,
      r.category,
      r.priority,
      r.status,
      r,
    ],
  },
  pages: {
    title: "Content Manager",
    copy: "Manage real public pages and publishing state.",
    permission: "admin.access",
    columns: ["Page", "Title", "Status", "Updated", "Actions"],
    row: (r) => [r.slug, r.title, r.status, date(r.updated_at), r],
  },
  moderation: {
    title: "Moderation",
    copy: "Review real reports and close resolved cases.",
    permission: "admin.access",
    columns: ["Report", "Target", "Reason", "Status", "Created", "Actions"],
    row: (r) => [
      r.id.slice(0, 12),
      `${r.target_type}:${r.target_id.slice(0, 8)}`,
      r.reason,
      r.status,
      date(r.created_at),
      r,
    ],
  },
  "api-keys": {
    title: "API Keys",
    copy: "Review issued keys without exposing secret material.",
    permission: "admin.access",
    columns: ["Key", "User", "Scopes", "Status", "Created", "Actions"],
    row: (r) => [
      r.name,
      r.user_id,
      (r.scopes || []).join(", "),
      r.revoked_at ? "Revoked" : "Active",
      date(r.created_at),
      r,
    ],
  },
  settings: {
    title: "Settings",
    copy: "Manage persisted site configuration in Supabase.",
    permission: "admin.access",
    columns: ["Key", "Value", "Public", "Updated", "Actions"],
    row: (r) => [
      r.key,
      JSON.stringify(r.value),
      r.public ? "Public" : "Private",
      date(r.updated_at),
      r,
    ],
  },
};

function DataPage({
  section,
  context,
  globalSearch,
}: {
  section: string;
  context: AdminContext;
  globalSearch: string;
}) {
  const config = configs[section];
  const [data, setData] = useState<ListData | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(globalSearch);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const load = useCallback(() => {
    if (!config) return;
    setError("");
    invoke({
      action: "list",
      resource: section,
      page,
      limit: 25,
      search,
      status,
    })
      .then((x) => setData(x as ListData))
      .catch((e) => setError(e.message));
  }, [config, page, search, section, status]);
  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [load]);
  useEffect(() => setSearch(globalSearch), [globalSearch]);
  if (!config)
    return (
      <ErrorBox
        message="This module is scheduled for the next implementation phase."
        retry={() => {}}
      />
    );
  if (!allowed(context, config.permission))
    return (
      <div className="admin-empty">
        <ShieldCheck />
        <h3>Permission required</h3>
        <p>Your role does not include {config.permission}.</p>
      </div>
    );
  const save = async (resource: string, row?: any) => {
    const ask = (label: string, value: any) =>
      prompt(label, value == null ? "" : String(value));
    const base: any = { action: "resource_upsert", resource, id: row?.id };
    if (resource === "plans") {
      base.slug = ask("Slug", row?.slug || "");
      base.name = ask("Name", row?.name || "");
      base.monthly_price = Number(
        ask("Monthly price", row?.monthly_price || 0),
      );
      base.annual_price = Number(ask("Annual price", row?.annual_price || 0));
      base.currency = ask("Currency", row?.currency || "USD");
      base.included_credits = Number(
        ask("Included credits", row?.included_credits || 0),
      );
      base.active = confirm("Keep this plan active?");
    }
    if (resource === "models") {
      base.name = ask("Model name", row?.name || "");
      base.slug = ask("Slug", row?.slug || "");
      base.tool_category = ask("Category", row?.tool_category || "image");
      base.version = ask("Version", row?.version || "");
      base.credit_cost = Number(ask("Credits cost", row?.credit_cost || 0));
      base.provider_id = ask("Provider ID", row?.provider_id || "");
      base.active = confirm("Keep this model active?");
    }
    if (resource === "providers") {
      base.name = ask("Provider name", row?.name || "");
      base.slug = ask("Slug", row?.slug || "");
      base.type = ask("Type", row?.type || "llm");
      base.api_base_url = ask("API base URL", row?.api_base_url || "");
      base.priority = Number(ask("Priority", row?.priority || 0));
      base.timeout_ms = Number(ask("Timeout ms", row?.timeout_ms || 60000));
      base.active = confirm("Enable this provider?");
    }
    if (resource === "support") {
      base.user_id = ask("Customer user ID", row?.user_id || "");
      base.category = ask("Category", row?.category || "general");
      base.subject = ask("Subject", row?.subject || "");
      base.status = ask(
        "Status: open, pending, waiting, resolved, closed",
        row?.status || "open",
      );
      base.priority = ask(
        "Priority: low, normal, high, urgent",
        row?.priority || "normal",
      );
    }
    if (resource === "pages") {
      base.slug = ask("Slug", row?.slug || "");
      base.title = ask("Title", row?.title || "");
      base.content = JSON.parse(
        ask("Content JSON", JSON.stringify(row?.content || {})) || "{}",
      );
      base.status = ask("Status: draft or published", row?.status || "draft");
    }
    if (resource === "moderation")
      base.status = ask(
        "Status: pending, approved, rejected",
        row?.status || "pending",
      );
    if (resource === "settings") {
      base.key = ask("Setting key", row?.key || "");
      base.value = JSON.parse(
        ask("Value JSON", JSON.stringify(row?.value || {})) || "{}",
      );
      base.public = confirm("Make this setting public?");
    }
    if (
      (!base.name && resource !== "support") ||
      (resource === "support" && (!base.user_id || !base.subject))
    )
      return;
    await invoke(base);
    await load();
  };
  const canEdit = [
    "plans",
    "models",
    "providers",
    "support",
    "pages",
    "moderation",
    "settings",
  ].includes(section);
  return (
    <div className="admin-page">
      <div className="admin-title">
        <div>
          <p>ADMIN CONTROL</p>
          <h1>{config.title}</h1>
          <span>{config.copy}</span>
        </div>
        <div>
          <button
            className="admin-secondary"
            onClick={() =>
              downloadCsv(
                section,
                (data?.rows ?? []).map(
                  ({ profiles, wallets, subscriptions, ...r }) => r,
                ),
              )
            }
          >
            <Download size={15} />
            Export CSV
          </button>
          {canEdit && (
            <button className="admin-primary" onClick={() => save(section)}>
              {section === "support" ? "New ticket" : "Add new"}
            </button>
          )}
        </div>
      </div>
      <div className="admin-filterbar">
        <div className="admin-search">
          <Search size={15} />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={`Search ${section}`}
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          <option>active</option>
          <option>suspended</option>
          <option>banned</option>
          <option>paid</option>
          <option>failed</option>
          <option>open</option>
          <option>resolved</option>
        </select>
        <span>{data?.count ?? 0} results</span>
      </div>
      {error ? (
        <ErrorBox message={error} retry={load} />
      ) : !data ? (
        <Loading />
      ) : (
        <section className="admin-panel table-panel">
          <div className="admin-data-table header">
            {config.columns.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
          {data.rows.length ? (
            data.rows.map((row) => (
              <div className="admin-data-table" key={row.id}>
                {config.row(row).map((cell, i) => (
                  <span key={i}>
                    {i === config.columns.length - 1 &&
                    typeof cell === "object" ? (
                      <>
                        {section === "users" && (
                          <>
                            <button
                              disabled={busy === row.id}
                              onClick={() => act("credits", row)}
                            >
                              Credits
                            </button>
                            <button
                              disabled={busy === row.id}
                              onClick={() => act("status", row)}
                            >
                              Status
                            </button>
                          </>
                        )}
                        {section === "subscriptions" && (
                          <button
                            disabled={
                              busy === row.id || row.cancel_at_period_end
                            }
                            onClick={() => act("cancel", row)}
                          >
                            {row.cancel_at_period_end ? "Cancelling" : "Cancel"}
                          </button>
                        )}
                        {section === "plans" && (
                          <button
                            disabled={busy === row.id}
                            onClick={() => act("toggle", row)}
                          >
                            Toggle
                          </button>
                        )}
                        {canEdit && (
                          <>
                            <button
                              disabled={busy === row.id}
                              onClick={() => act("edit", row)}
                            >
                              Edit
                            </button>
                            <button
                              disabled={busy === row.id}
                              onClick={() => act("archive", row)}
                            >
                              Archive
                            </button>
                          </>
                        )}
                      </>
                    ) : i === 3 || i === 4 ? (
                      <StatusPill
                        tone={
                          ["active", "paid", "Active"].includes(String(cell))
                            ? "live"
                            : "draft"
                        }
                      >
                        {String(cell)}
                      </StatusPill>
                    ) : (
                      (cell as any)
                    )}
                  </span>
                ))}
              </div>
            ))
          ) : (
            <div className="admin-empty compact">
              <p>No real records match these filters.</p>
            </div>
          )}
          <div className="admin-pagination">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </button>
            <span>
              Page {page} of {Math.max(1, Math.ceil(data.count / data.limit))}
            </span>
            <button
              disabled={page * data.limit >= data.count}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

function ProtectedAdminApp({
  path,
  context,
}: {
  path: string;
  context: AdminContext;
}) {
  const [mobile, setMobile] = useState(false);
  const [days, setDays] = useState(30);
  const [search, setSearch] = useState("");
  const section = path.split("/").pop() || "dashboard";
  return (
    <main className="admin-shell">
      <div className={mobile ? "admin-mobile open" : "admin-mobile"}>
        <button onClick={() => setMobile(false)}>
          <X />
        </button>
        <AdminSidebar path={path} context={context} />
      </div>
      <AdminSidebar path={path} context={context} />
      <div className="admin-main">
        <AdminTop open={() => setMobile(true)} onSearch={setSearch} />
        {section === "dashboard" || path === "/admin" ? (
          <Overview days={days} setDays={setDays} />
        ) : section === "analytics" ? (
          <Analytics days={days} setDays={setDays} />
        ) : (
          <DataPage section={section} context={context} globalSearch={search} />
        )}
      </div>
    </main>
  );
}

export function AdminApp({ path }: { path: string }) {
  const [context, setContext] = useState<AdminContext | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) throw new Error("Admin authentication is unavailable.");
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        location.replace(`/login?return_to=${encodeURIComponent(path)}`);
        return;
      }
      const { data, error } = await supabase.functions.invoke("admin-access", {
        body: {},
      });
      if (!active) return;
      if (error || !data?.user) {
        location.replace("/app/home");
        return;
      }
      setContext(data as AdminContext);
    })().catch((e) => active && setError(e.message));
    return () => {
      active = false;
    };
  }, [path]);
  if (error)
    return (
      <main className="admin-access-state">
        <ShieldCheck />
        <h1>Access unavailable</h1>
        <p>{error}</p>
        <Link href="/login">Sign in</Link>
      </main>
    );
  if (!context)
    return (
      <main className="admin-access-state" aria-live="polite">
        <span className="admin-loader" />
        <h1>Securing admin session</h1>
        <p>Verifying your permissions…</p>
      </main>
    );
  return <ProtectedAdminApp path={path} context={context} />;
}
