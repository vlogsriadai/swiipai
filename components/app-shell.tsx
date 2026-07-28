"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlignJustify, ArrowRight, Bell, ChevronDown,
  CloudUpload, Download, Ellipsis, Grid2X2, Heart, ImageIcon, Layers3,
  Menu, Mic2, MoreHorizontal, PanelLeftClose, Play, Plus, Search, Settings2,
  SlidersHorizontal, Sparkles, Trash2, Upload, WandSparkles, X, Zap,
} from "lucide-react";
import { Logo, StatusPill } from "./brand";
import { appNav, community, dashboardStats, tools } from "./data";

function Sidebar({ path, collapsed, setCollapsed }: { path: string; collapsed: boolean; setCollapsed: (v: boolean) => void }) {
  return (
    <aside className={collapsed ? "app-sidebar collapsed" : "app-sidebar"}>
      <div className="sidebar-brand"><Logo compact={collapsed} /><button onClick={() => setCollapsed(!collapsed)}><PanelLeftClose size={17} /></button></div>
      <Link className="sidebar-create" href="/app/create"><Plus size={18} /><span>Create</span></Link>
      <nav>
        {appNav.map(({ label, href, icon: Icon }) => <Link className={path === href ? "active" : ""} href={href} key={href}><Icon size={18} /><span>{label}</span></Link>)}
      </nav>
      <div className="sidebar-bottom">
        <Link href="/app/billing"><Sparkles size={16} /><div><b>2,480 credits</b><span>Pro plan</span></div></Link>
        <Link href="/app/settings"><Settings2 size={18} /><span>Settings</span></Link>
        <div className="user-mini"><span>RT</span><div><b>Rayad Temo</b><small>rayad@studio.ai</small></div><MoreHorizontal size={16} /></div>
      </div>
    </aside>
  );
}

function AppTopbar({ title, openMobile }: { title: string; openMobile: () => void }) {
  return (
    <header className="app-topbar">
      <button className="mobile-only" onClick={openMobile}><Menu /></button>
      <div><span className="app-breadcrumb">Workspace /</span> <b>{title}</b></div>
      <div className="app-top-actions">
        <div className="search-box"><Search size={16} /><input placeholder="Search anything" /><kbd>⌘ K</kbd></div>
        <Link className="credit-chip" href="/app/credits"><Sparkles size={14} /> 2,480</Link>
        <button className="icon-button"><Bell size={18} /><i /></button>
        <span className="avatar">RT</span>
      </div>
    </header>
  );
}

function Dashboard() {
  return (
    <div className="dashboard page-pad">
      <section className="welcome-banner">
        <div><span className="eyebrow plain">MONDAY · CREATIVE STUDIO</span><h1>Good afternoon, Rayad.</h1><p>What will you bring to life today?</p></div>
        <div className="welcome-glow"><Sparkles /></div>
      </section>
      <section className="quick-create">
        {tools.slice(0, 4).map(({ title, icon: Icon, tint }) => <Link href={title.includes("Video") ? "/app/video" : title.includes("Image") ? "/app/image" : "/app/create"} className={`quick-card ${tint}`} key={title}><span><Icon /></span><b>{title}</b><small>Start creating <ArrowRight size={12} /></small></Link>)}
      </section>
      <section className="stat-grid">
        {dashboardStats.map(({ label, value, delta, icon: Icon }) => <article key={label}><span><Icon size={18} /></span><div><p>{label}</p><h3>{value}</h3><small>{delta}</small></div></article>)}
      </section>
      <div className="dashboard-grid">
        <section className="panel usage-panel">
          <div className="panel-head"><div><h3>Creative activity</h3><p>Your generations over the last 7 days</p></div><button>This week <ChevronDown size={14} /></button></div>
          <div className="chart">
            {[36, 62, 44, 78, 56, 88, 72, 95, 68, 84, 54, 76].map((height, index) => <i style={{ height: `${height}%` }} key={index} />)}
            <span className="chart-line" />
          </div>
          <div className="chart-labels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
        </section>
        <section className="panel job-panel">
          <div className="panel-head"><div><h3>Active jobs</h3><p>2 generations in progress</p></div><Link href="/app/history">View all</Link></div>
          {[
            ["Cyberpunk city sequence", "Swiip Motion", "74%"],
            ["Editorial product visual", "Flux Vision", "Queued"],
          ].map(([name, model, status], index) => <div className="job-row" key={name}><span className={`job-thumb jt-${index}`}><Play size={13} /></span><div><b>{name}</b><small>{model}</small></div><StatusPill tone={index ? "queued" : "live"}>{status}</StatusPill></div>)}
          <div className="queue-note"><Zap size={15} /><span>Pro priority is active</span></div>
        </section>
      </div>
      <section className="panel recent-panel">
        <div className="panel-head"><div><h3>Recent projects</h3><p>Pick up where you left off</p></div><Link href="/app/projects">All projects <ArrowRight size={14} /></Link></div>
        <div className="recent-grid">{community.slice(0, 4).map((item) => <article key={item.title}><div className={`recent-art ${item.tint}`}><span /></div><b>{item.title}</b><p>Updated 2 hours ago · 6 assets</p></article>)}</div>
      </section>
    </div>
  );
}

function Generator({ type }: { type: "video" | "image" | "audio" | "motion" | "lip" | "effects" }) {
  const [mode, setMode] = useState(type === "video" ? "Text to Video" : type === "image" ? "Text to Image" : type === "audio" ? "Text to Speech" : "Create");
  const [prompt, setPrompt] = useState("");
  const [running, setRunning] = useState(false);
  const title = { video: "AI Video", image: "AI Image", audio: "AI Audio", motion: "Motion Control", lip: "Lip Sync", effects: "AI Effects" }[type];
  const modes = type === "video" ? ["Text to Video", "Image to Video", "Start / End", "Extend"] : type === "image" ? ["Text to Image", "Image to Image", "Inpaint", "Product"] : type === "audio" ? ["Text to Speech", "Sound Effects", "Voice Clone", "Enhance"] : [title];
  return (
    <div className="generator-page">
      <div className="generator-tabs">{modes.map((item) => <button className={mode === item ? "active" : ""} onClick={() => setMode(item)} key={item}>{item}</button>)}</div>
      <div className="generator-layout">
        <section className="control-panel">
          <div className="control-head"><div><h2>{title}</h2><p>{mode}</p></div><button><Ellipsis /></button></div>
          {(mode.includes("Image") || type === "motion" || type === "lip") && <button className="dropzone"><CloudUpload /><b>Drop your media here</b><span>PNG, JPG, MP4 · up to 200 MB</span></button>}
          <label className="prompt-label"><span>Prompt <button><WandSparkles size={13} /> Enhance</button></span><textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={type === "audio" ? "Write the words or describe the sound you want..." : "Describe your scene, subject, lighting and camera movement..."} /><small>{prompt.length} / 2,000</small></label>
          <div className="form-grid">
            <label>Model<button>Swiip {type === "image" ? "Vision 3" : type === "audio" ? "Voice 2" : "Motion 2.1"} <ChevronDown /></button></label>
            <label>Aspect ratio<button>{type === "audio" ? "48 kHz" : "16:9"} <ChevronDown /></button></label>
            <label>{type === "image" ? "Outputs" : "Duration"}<button>{type === "image" ? "4 images" : "8 seconds"} <ChevronDown /></button></label>
            <label>Quality<button>Pro <ChevronDown /></button></label>
          </div>
          <details className="advanced"><summary><SlidersHorizontal size={16} /> Advanced settings <ChevronDown size={15} /></summary><div className="range-row"><span>Creativity</span><input type="range" /></div><div className="range-row"><span>Prompt adherence</span><input type="range" /></div></details>
          <div className="cost-row"><span>Estimated cost</span><b><Sparkles size={14} /> {type === "image" ? "8" : type === "audio" ? "12" : "40"} credits</b></div>
          <button className="primary full" onClick={() => setRunning(true)} disabled={!prompt || running}>{running ? <><span className="spinner" /> Preparing generation...</> : <><Sparkles size={17} /> Generate {title.replace("AI ", "")}</>}</button>
        </section>
        <section className="result-workspace">
          <div className="workspace-head"><span>Output</span><div><button><Grid2X2 size={16} /></button><button><Download size={16} /></button></div></div>
          {running ? <div className="processing-state"><div className="processing-visual"><span className="scan-line" /><Sparkles /></div><h3>Your idea is taking shape</h3><p>Validating settings and preparing the generation queue.</p><div className="progress-track"><i /></div><small>Mock mode · No credits were charged</small></div> :
          <div className="empty-workspace"><div className="empty-orbit"><Sparkles /><i /><i /></div><h3>Your canvas is ready</h3><p>Describe something on the left, customise your settings and generate your first result.</p><div className="prompt-suggestions">{["Dreamlike editorial", "Cinematic product shot", "Slow orbit camera"].map((x) => <button onClick={() => setPrompt(x)} key={x}>{x}</button>)}</div></div>}
        </section>
      </div>
    </div>
  );
}

function CreateHub() {
  return <div className="page-pad create-hub"><div className="page-title"><span className="eyebrow plain">CREATE</span><h1>What do you want to make?</h1><p>Start with the medium—or just follow the idea.</p></div><div className="create-grid">{tools.map(({ title, desc, icon: Icon, tint, cost }) => <Link className={`create-tile ${tint}`} href={title.includes("Video") ? "/app/video" : title.includes("Image") ? "/app/image" : title.includes("Audio") ? "/app/audio" : title.includes("Motion") ? "/app/motion-control" : "/app/create"} key={title}><div><Icon /><span className="preview-object" /></div><h3>{title}</h3><p>{desc}</p><small><Sparkles size={12} /> From {cost} credits <ArrowRight size={14} /></small></Link>)}</div></div>;
}

function LibraryPage({ page }: { page: "Projects" | "Assets" | "History" | "Favourites" | "Collections" }) {
  const [view, setView] = useState("grid");
  return <div className="page-pad library-page"><div className="page-title row"><div><span className="eyebrow plain">LIBRARY</span><h1>{page}</h1><p>Organise, revisit and share every part of your creative work.</p></div><button className="primary small"><Plus size={16} /> New {page === "Projects" ? "project" : "upload"}</button></div>
    <div className="library-tools"><div className="search-box"><Search size={16} /><input placeholder={`Search ${page.toLowerCase()}`} /></div><button><SlidersHorizontal size={15} /> Filters</button><button>Last updated <ChevronDown size={14} /></button><div className="view-toggle"><button className={view === "grid" ? "active" : ""} onClick={() => setView("grid")}><Grid2X2 size={16} /></button><button className={view === "list" ? "active" : ""} onClick={() => setView("list")}><AlignJustify size={16} /></button></div></div>
    <div className={view === "grid" ? "asset-grid" : "asset-grid list"}>{community.map((item, index) => <article key={item.title}><div className={`asset-preview ${item.tint}`}><span /><div><button><Heart size={15} /></button><button><Ellipsis size={15} /></button></div>{index % 2 === 0 && <Play fill="currentColor" />}</div><div className="asset-info"><div><b>{item.title}</b><p>{index + 2} assets · Edited today</p></div><StatusPill tone={index % 3 === 0 ? "live" : "draft"}>{index % 3 === 0 ? "Published" : "Private"}</StatusPill></div></article>)}</div>
  </div>;
}

function BillingPage() {
  return <div className="page-pad billing-page"><div className="page-title"><span className="eyebrow plain">BILLING</span><h1>Plan & credits</h1><p>Manage your subscription, balance and payment history.</p></div>
    <section className="billing-hero panel"><div><span>YOUR CURRENT PLAN</span><h2>Pro</h2><p>3,500 monthly credits · Priority generation · API access</p></div><div><b>$29 <small>/ month</small></b><button className="secondary">Manage plan</button></div></section>
    <div className="billing-grid"><section className="panel balance-card"><div><span>Available balance</span><Sparkles /></div><h2>2,480</h2><p>credits remaining</p><div className="balance-bar"><i /></div><small>1,020 of 3,500 used this period</small><button className="primary full">Buy more credits</button></section><section className="panel usage-breakdown"><h3>Usage breakdown</h3>{[["Video generation", "620", 60], ["Image generation", "284", 35], ["Audio & effects", "116", 18]].map(([name, value, width]) => <div className="usage-row" key={name}><span><b>{name}</b><small>{value} credits</small></span><i><b style={{ width: `${width}%` }} /></i></div>)}</section></div>
    <section className="panel payment-table"><div className="panel-head"><div><h3>Payment history</h3><p>Your recent invoices and credit purchases</p></div><button>Download all</button></div>{[["INV-2048", "Pro subscription", "$29.00", "Paid"], ["INV-1982", "2,000 credit pack", "$18.00", "Paid"], ["INV-1861", "Pro subscription", "$29.00", "Paid"]].map((row) => <div className="table-row" key={row[0]}>{row.map((cell, i) => <span key={cell}>{i === 3 ? <StatusPill>{cell}</StatusPill> : cell}</span>)}<button><Download size={15} /></button></div>)}</section>
  </div>;
}

function SettingsPage() {
  return <div className="page-pad settings-page"><div className="page-title"><span className="eyebrow plain">ACCOUNT</span><h1>Settings</h1><p>Manage your profile, preferences and security.</p></div><div className="settings-layout"><nav>{["Profile", "Appearance", "Notifications", "Security", "API keys", "Sessions"].map((x, i) => <button className={i === 0 ? "active" : ""} key={x}>{x}</button>)}</nav><section className="panel settings-form"><div className="settings-user"><span>RT</span><div><h3>Profile information</h3><p>This information appears on your public creator profile.</p></div><button>Change photo</button></div><div className="input-grid"><label>Full name<input defaultValue="Rayad Temo" /></label><label>Username<input defaultValue="rayadtemo" /></label><label>Email<input defaultValue="rayad@studio.ai" /></label><label>Country<button>Morocco <ChevronDown size={15} /></button></label><label className="wide">Bio<textarea defaultValue="Digital creator exploring the future of cinematic AI." /></label></div><div className="settings-actions"><button className="secondary">Cancel</button><button className="primary">Save changes</button></div></section></div></div>;
}

function CommunityPage() {
  return <div className="page-pad"><div className="page-title row"><div><span className="eyebrow plain">EXPLORE</span><h1>Community</h1><p>Discover what creators are making with SwiipAI.</p></div><button className="primary small"><Upload size={15} /> Publish</button></div><div className="tab-row"><button className="active">For you</button><button>Trending</button><button>Latest</button><button>Following</button></div><div className="asset-grid community-app">{community.concat(community.slice(0, 2)).map((item, i) => <article key={`${item.title}-${i}`}><div className={`asset-preview ${item.tint}`}><span />{i % 2 === 0 && <Play fill="currentColor" />}</div><div className="post-user"><span>{item.author[0]}</span><div><b>{item.title}</b><p>@{item.author.toLowerCase()}</p></div><small><Heart size={14} /> {item.likes}</small></div></article>)}</div></div>;
}

export function UserApp({ path }: { path: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const title = useMemo(() => appNav.find((x) => x.href === path)?.label ?? path.split("/").pop()?.replace("-", " ") ?? "Workspace", [path]);
  let content: React.ReactNode = <Dashboard />;
  if (path === "/app/create") content = <CreateHub />;
  else if (path === "/app/video") content = <Generator type="video" />;
  else if (path === "/app/image") content = <Generator type="image" />;
  else if (path === "/app/audio") content = <Generator type="audio" />;
  else if (path === "/app/motion-control") content = <Generator type="motion" />;
  else if (path === "/app/lip-sync") content = <Generator type="lip" />;
  else if (path === "/app/effects") content = <Generator type="effects" />;
  else if (["projects", "assets", "history", "favourites", "collections"].some((x) => path.endsWith(x))) content = <LibraryPage page={(title.charAt(0).toUpperCase() + title.slice(1)) as "Projects"} />;
  else if (path === "/app/community") content = <CommunityPage />;
  else if (["/app/billing", "/app/credits"].includes(path)) content = <BillingPage />;
  else if (["/app/settings", "/app/api-keys", "/app/notifications", "/app/referrals", "/app/support"].includes(path)) content = <SettingsPage />;
  else if (path === "/app/canvas") content = <CanvasPage />;
  return (
    <main className="app-shell">
      <div className={mobile ? "mobile-sidebar-cover open" : "mobile-sidebar-cover"} onClick={() => setMobile(false)} />
      <div className={mobile ? "mobile-sidebar-wrap open" : "mobile-sidebar-wrap"}><button className="close-mobile" onClick={() => setMobile(false)}><X /></button><Sidebar path={path} collapsed={false} setCollapsed={() => setMobile(false)} /></div>
      <Sidebar path={path} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="app-main"><AppTopbar title={title} openMobile={() => setMobile(true)} />{content}</div>
    </main>
  );
}

function CanvasPage() {
  return <div className="canvas-page"><div className="canvas-toolbar"><button><Menu size={17} /></button><button><Upload size={17} /></button><button><ImageIcon size={17} /></button><button><Mic2 size={17} /></button><button><Layers3 size={17} /></button><span /><button><Trash2 size={17} /></button></div><div className="infinite-canvas"><div className="canvas-grid" /><div className="canvas-node node-a"><div className="node-art scene-two" /><span>Source image</span></div><div className="canvas-connector" /><div className="canvas-node node-b"><div className="node-art scene-five" /><span>Motion result</span></div><button className="canvas-add"><Plus /></button><div className="canvas-zoom">− &nbsp; 72% &nbsp; +</div></div></div>;
}
