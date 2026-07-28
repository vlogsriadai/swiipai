"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Activity, AlertTriangle, ArrowUpRight, Bell, ChevronDown,
  CircleDollarSign, Download, Ellipsis, Menu, Plus, Search, ShieldCheck,
  Sparkles, Users, X,
} from "lucide-react";
import { Logo, StatusPill } from "./brand";
import { adminNav, adminStats } from "./data";

function AdminSidebar({ path }: { path: string }) {
  return <aside className="admin-sidebar"><div className="admin-logo"><Logo /><span>ADMIN</span></div><nav>{adminNav.map(({ label, href, icon: Icon }) => <Link className={path === href || (path.startsWith("/admin/") && href.endsWith(path.split("/").pop() || "x")) ? "active" : ""} href={href} key={href}><Icon size={17} /><span>{label}</span></Link>)}</nav><div className="admin-user"><span>RT</span><div><b>Rayad Temo</b><small>Super Admin</small></div><Ellipsis size={16} /></div></aside>;
}

function AdminTop({ open }: { open: () => void }) {
  return <header className="admin-top"><button className="mobile-only" onClick={open}><Menu /></button><div className="admin-search"><Search size={15} /><input placeholder="Search users, payments, jobs..." /><kbd>⌘ K</kbd></div><div><button className="admin-env"><i /> Production <ChevronDown size={13} /></button><button className="icon-button"><Bell size={17} /><i /></button><span className="avatar">RT</span></div></header>;
}

function Overview() {
  return <div className="admin-page"><div className="admin-title"><div><p>MONDAY, 27 JULY</p><h1>Business overview</h1><span>Here&apos;s what is happening across SwiipAI today.</span></div><div><button className="admin-secondary"><Download size={15} /> Export report</button><button className="admin-primary"><Plus size={15} /> Quick action</button></div></div>
    <div className="admin-stat-grid">{adminStats.map(([label, value, delta], i) => <article key={label}><div><span>{i === 0 ? <CircleDollarSign /> : i === 1 ? <Users /> : i === 2 ? <Sparkles /> : <Activity />}</span><small>•••</small></div><p>{label}</p><h2>{value}</h2><b className="positive"><ArrowUpRight size={13} />{delta}</b><small>vs previous period</small></article>)}</div>
    <div className="admin-grid"><section className="admin-panel revenue"><div className="admin-panel-head"><div><h3>Revenue</h3><p>Net revenue across all providers</p></div><button>Last 30 days <ChevronDown size={13} /></button></div><div className="revenue-value">$42,680 <span><ArrowUpRight size={13} /> 14.2%</span></div><div className="admin-chart"><span className="area-fill" /><i /><i /><i /><i /><i /><i /><i /></div><div className="chart-dates"><span>Jul 1</span><span>Jul 7</span><span>Jul 14</span><span>Jul 21</span><span>Jul 27</span></div></section>
      <section className="admin-panel health"><div className="admin-panel-head"><div><h3>Platform health</h3><p>Live provider status</p></div><StatusPill>All systems operational</StatusPill></div>{[["Generation API", "99.98%", "126 ms"], ["Payments", "99.99%", "84 ms"], ["Storage", "99.96%", "210 ms"], ["Email delivery", "99.92%", "430 ms"]].map((r) => <div className="health-row" key={r[0]}><i /><b>{r[0]}</b><span>{r[1]}</span><small>{r[2]}</small></div>)}<button className="view-link">View system details →</button></section>
    </div>
    <div className="admin-grid lower"><section className="admin-panel"><div className="admin-panel-head"><div><h3>Generation volume</h3><p>Jobs by media type</p></div><button>This month <ChevronDown size={13} /></button></div><div className="bar-chart">{[46, 72, 64, 88, 55, 94, 78, 68, 86, 73, 96, 80].map((h, i) => <i style={{ height: `${h}%` }} key={i}><b /></i>)}</div><div className="legend"><span><i className="blue" />Video 48%</span><span><i className="violet" />Image 37%</span><span><i className="cyan" />Audio 15%</span></div></section>
      <section className="admin-panel"><div className="admin-panel-head"><div><h3>Attention needed</h3><p>Items that may need action</p></div><button><Ellipsis /></button></div>{[["Failed webhook events", "12", "Stripe · 8m ago"], ["Generations under review", "28", "Moderation queue"], ["Open support tickets", "46", "8 high priority"]].map((r, i) => <div className="attention-row" key={r[0]}><span className={i === 0 ? "warn" : ""}>{i === 0 ? <AlertTriangle /> : <ShieldCheck />}</span><div><b>{r[0]}</b><small>{r[2]}</small></div><strong>{r[1]}</strong><button>Review</button></div>)}</section>
    </div>
    <section className="admin-panel transactions"><div className="admin-panel-head"><div><h3>Recent transactions</h3><p>Latest payment activity across all providers</p></div><button>View all payments →</button></div><div className="admin-table header"><span>Customer</span><span>Product</span><span>Provider</span><span>Amount</span><span>Status</span><span>Time</span></div>{[["Nora Chen", "Pro monthly", "Stripe", "$29.00", "Paid", "2m"], ["Samir Alaoui", "5K credits", "PayPal", "$42.00", "Paid", "8m"], ["Maya Stone", "Creator annual", "YouCan Pay", "$108.00", "Pending", "12m"], ["Leon Brooks", "Business monthly", "Stripe", "$79.00", "Paid", "19m"]].map((row) => <div className="admin-table" key={row[0]}>{row.map((x, i) => <span key={x}>{i === 0 && <i className="customer-avatar">{x.split(" ").map(y => y[0]).join("")}</i>}{i === 4 ? <StatusPill tone={x === "Paid" ? "live" : "queued"}>{x}</StatusPill> : x}</span>)}</div>)}</section>
  </div>;
}

const tableConfig: Record<string, { title: string; copy: string; columns: string[]; rows: string[][] }> = {
  users: { title: "User management", copy: "Search, review and manage every SwiipAI account.", columns: ["User", "Plan", "Credits", "Status", "Joined"], rows: [["Nora Chen", "Pro", "4,820", "Active", "Jul 27"], ["Samir Alaoui", "Creator", "1,090", "Active", "Jul 26"], ["Maya Stone", "Business", "12,440", "Review", "Jul 24"], ["Leon Brooks", "Free", "46", "Suspended", "Jul 23"]] },
  generations: { title: "Generation jobs", copy: "Monitor queue health, cost, output and moderation.", columns: ["Job", "User", "Model", "Cost", "Status"], rows: [["GEN-82941", "Nora Chen", "Motion 2.1", "40", "Completed"], ["GEN-82940", "Samir Alaoui", "Vision 3", "8", "Processing"], ["GEN-82939", "Maya Stone", "Voice 2", "12", "Review"], ["GEN-82938", "Leon Brooks", "Motion 2.1", "40", "Failed"]] },
  models: { title: "Models & pricing", copy: "Control availability, cost, fallbacks and plan access.", columns: ["Model", "Provider", "Category", "Credits", "Status"], rows: [["Swiip Motion 2.1", "Vertex Flow", "Video", "40", "Active"], ["Swiip Vision 3", "Image Lab", "Image", "8", "Active"], ["Swiip Voice 2", "Sonic Cloud", "Audio", "12", "Active"], ["Avatar Sync", "Motionworks", "Avatar", "22", "Maintenance"]] },
  providers: { title: "AI providers", copy: "Review connections, latency, limits and failover.", columns: ["Provider", "Type", "Success rate", "Latency", "Health"], rows: [["Vertex Flow", "Video", "99.2%", "1.8s", "Healthy"], ["Image Lab", "Image", "99.8%", "740ms", "Healthy"], ["Sonic Cloud", "Audio", "98.9%", "920ms", "Degraded"], ["Motionworks", "Avatar", "97.7%", "2.1s", "Review"]] },
  payments: { title: "Payments & orders", copy: "Reconcile verified events, refunds and fulfilment.", columns: ["Order", "Customer", "Provider", "Amount", "Status"], rows: [["SW-20481", "Nora Chen", "Stripe", "$29.00", "Paid"], ["SW-20480", "Samir Alaoui", "PayPal", "$42.00", "Paid"], ["SW-20479", "Maya Stone", "YouCan Pay", "$108.00", "Pending"], ["SW-20478", "Leon Brooks", "Stripe", "$12.00", "Refunded"]] },
};

function AdminTablePage({ section }: { section: string }) {
  const config = tableConfig[section] ?? { title: section.replace("-", " "), copy: "Manage this part of the SwiipAI platform.", columns: ["Item", "Owner", "Updated", "Status", "Action"], rows: [["Primary configuration", "Admin", "Today", "Active", "Review"], ["Growth campaign", "Content team", "Yesterday", "Draft", "Edit"], ["Global policy", "Operations", "Jul 24", "Active", "Review"]] };
  return <div className="admin-page"><div className="admin-title"><div><p>ADMIN CONTROL</p><h1>{config.title}</h1><span>{config.copy}</span></div><button className="admin-primary"><Plus size={15} /> Add new</button></div><div className="admin-filterbar"><div className="admin-search"><Search size={15} /><input placeholder={`Search ${config.title.toLowerCase()}`} /></div><button>Status <ChevronDown size={13} /></button><button>Last 30 days <ChevronDown size={13} /></button><span>{config.rows.length} results</span></div><section className="admin-panel table-panel"><div className="admin-table header">{config.columns.map(c => <span key={c}>{c}</span>)}</div>{config.rows.map((row) => <div className="admin-table" key={row[0]}>{row.map((x, i) => <span key={x}>{i === row.length - 1 && ["Active", "Paid", "Healthy", "Completed", "Processing", "Pending", "Review", "Maintenance", "Failed", "Refunded", "Suspended", "Degraded", "Draft"].includes(x) ? <StatusPill tone={["Active", "Paid", "Healthy", "Completed"].includes(x) ? "live" : x === "Processing" || x === "Pending" ? "queued" : "draft"}>{x}</StatusPill> : x}</span>)}</div>)}</section></div>;
}

export function AdminApp({ path }: { path: string }) {
  const [mobile, setMobile] = useState(false);
  const section = path.split("/").pop() || "dashboard";
  return <main className="admin-shell"><div className={mobile ? "admin-mobile open" : "admin-mobile"}><button onClick={() => setMobile(false)}><X /></button><AdminSidebar path={path} /></div><AdminSidebar path={path} /><div className="admin-main"><AdminTop open={() => setMobile(true)} />{section === "dashboard" || path === "/admin" ? <Overview /> : <AdminTablePage section={section} />}</div></main>;
}
