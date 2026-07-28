"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight, Check, ChevronDown, CirclePlay, Globe2, Heart, ImagePlus,
  Menu, Play, Sparkles, Star, X, Zap,
} from "lucide-react";
import { Logo, ThemeButton } from "./brand";
import { community, plans, publicNav, publicPages, tools } from "./data";

function PublicHeader({ light, toggleTheme }: { light: boolean; toggleTheme: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="public-header">
      <Logo />
      <nav className={open ? "public-nav open" : "public-nav"}>
        {publicNav.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
        <button className="nav-resource">Resources <ChevronDown size={13} /></button>
      </nav>
      <div className="header-actions">
        <button className="language-button"><Globe2 size={16} /> EN</button>
        <ThemeButton light={light} onClick={toggleTheme} />
        <Link className="text-button" href="/login">Sign in</Link>
        <Link className="primary small" href="/register">Get started</Link>
        <button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="Open menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}

function HeroPrompt() {
  const [mode, setMode] = useState("Video");
  const [prompt, setPrompt] = useState("A silver sports car crossing a rain-soaked neon city at midnight");
  return (
    <div className="prompt-composer">
      <div className="prompt-tabs">
        {["Video", "Image", "Audio"].map((item) => (
          <button key={item} className={mode === item ? "active" : ""} onClick={() => setMode(item)}>
            {item}
          </button>
        ))}
        <span className="credit-estimate"><Sparkles size={13} /> 40 credits</span>
      </div>
      <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} aria-label="Generation prompt" />
      <div className="composer-actions">
        <button className="upload-chip"><ImagePlus size={17} /> Add image</button>
        <button className="select-chip">Swiip Motion 2.1 <ChevronDown size={14} /></button>
        <button className="select-chip">16:9 <ChevronDown size={14} /></button>
        <Link href={`/app/${mode.toLowerCase()}`} className="generate-button">
          <Sparkles size={16} /> Generate
        </Link>
      </div>
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="hero-visual" aria-label="AI cinematic workspace preview">
      <div className="orb orb-one" />
      <div className="orb orb-two" />
      <div className="cinema-frame">
        <div className="frame-toolbar"><span>PREVIEW / 00:08</span><span>4K · 24 FPS</span></div>
        <div className="frame-scene">
          <div className="scene-sun" />
          <div className="scene-mountain m1" />
          <div className="scene-mountain m2" />
          <div className="scene-road" />
          <div className="scene-car"><i /><b /></div>
          <button className="play-button"><Play fill="currentColor" size={22} /></button>
        </div>
        <div className="frame-timeline">
          <span /><span /><span /><span /><i />
        </div>
      </div>
      <div className="floating-card fc-model"><span className="mini-orb" />Swiip Motion 2.1<b>Ultra quality</b></div>
      <div className="floating-card fc-speed"><Zap size={16} />Rendered in 48s</div>
    </div>
  );
}

export function HomePage({ light, toggleTheme }: { light: boolean; toggleTheme: () => void }) {
  const [communityTab, setCommunityTab] = useState("Trending");
  return (
    <div className="public-site">
      <PublicHeader light={light} toggleTheme={toggleTheme} />
      <main>
        <section className="hero section">
          <div className="hero-copy">
            <div className="eyebrow"><i /> THE CREATIVE AI WORKSPACE</div>
            <h1>Create beyond<br /><span>imagination.</span></h1>
            <p>Turn a simple idea into cinematic video, striking imagery and immersive sound—with the world&apos;s most powerful creative AI in one fluid workspace.</p>
            <div className="hero-cta">
              <Link href="/register" className="primary">Start creating free <ArrowRight size={17} /></Link>
              <Link href="/explore" className="secondary"><CirclePlay size={18} /> Explore creations</Link>
            </div>
            <p className="micro-copy"><Check size={13} /> 80 free credits · No credit card required</p>
          </div>
          <HeroVisual />
          <div className="hero-prompt-wrap"><HeroPrompt /></div>
        </section>

        <section className="trust-strip">
          <span>ONE WORKSPACE</span><b>VIDEO</b><i /> <b>IMAGE</b><i /> <b>AUDIO</b><i /> <b>MOTION</b><i /> <b>CANVAS</b>
        </section>

        <section className="section capabilities">
          <div className="section-heading">
            <div><span className="eyebrow plain">CREATE WITHOUT LIMITS</span><h2>From spark to final cut.</h2></div>
            <p>Powerful tools that work beautifully together, designed for creators who care about the details.</p>
          </div>
          <div className="tool-grid">
            {tools.map(({ title, label, icon: Icon, cost, tint, desc }) => (
              <Link href={title.includes("Video") ? "/app/video" : title.includes("Image") ? "/app/image" : "/app/create"} className={`tool-card ${tint}`} key={title}>
                <div className="tool-preview">
                  <span className="tool-icon"><Icon size={22} /></span>
                  <span className="preview-object" />
                  <span className="preview-grid" />
                </div>
                <div className="tool-meta"><span>{label}</span><b><Sparkles size={12} /> {cost}</b></div>
                <h3>{title}</h3><p>{desc}</p>
                <span className="card-link">Open tool <ArrowRight size={15} /></span>
              </Link>
            ))}
          </div>
        </section>

        <section className="section workflow">
          <div className="workflow-panel">
            <div className="workflow-copy">
              <span className="eyebrow plain">A BETTER CREATIVE FLOW</span>
              <h2>Idea in. Wonder out.</h2>
              <p>Everything stays connected from your first prompt through edits, sound, delivery and publishing.</p>
              {[
                ["01", "Describe or upload", "Start with a prompt, image, video or audio."],
                ["02", "Direct the details", "Choose a model and shape motion, style and format."],
                ["03", "Generate and refine", "Compare results, iterate and publish in a few clicks."],
              ].map(([num, title, copy]) => <div className="workflow-step" key={num}><b>{num}</b><div><h4>{title}</h4><p>{copy}</p></div></div>)}
            </div>
            <div className="workflow-demo">
              <div className="demo-top"><span>New generation</span><i>Processing</i></div>
              <div className="demo-canvas"><div className="demo-subject" /><span>74%</span></div>
              <div className="demo-prompt">A dreamlike glass pavilion floating above the clouds...</div>
              <div className="demo-progress"><i /></div>
            </div>
          </div>
        </section>

        <section className="section community-section">
          <div className="section-heading">
            <div><span className="eyebrow plain">MADE WITH SWIIPAI</span><h2>Fresh from the community.</h2></div>
            <Link className="secondary" href="/explore">Explore all <ArrowRight size={15} /></Link>
          </div>
          <div className="tab-row">{["Trending", "Latest", "Most liked", "Staff picks"].map((tab) => <button onClick={() => setCommunityTab(tab)} className={communityTab === tab ? "active" : ""} key={tab}>{tab}</button>)}</div>
          <div className="community-grid">
            {community.map((item, index) => (
              <article className={`community-card ${item.ratio} ${item.tint}`} key={item.title}>
                <div className="community-art"><span className="art-core" /><span className="art-horizon" />{index % 2 === 0 && <Play fill="currentColor" size={16} />}</div>
                <div className="community-overlay"><div><b>{item.title}</b><span>by {item.author}</span></div><span><Heart size={14} /> {item.likes}</span></div>
              </article>
            ))}
          </div>
        </section>

        <section className="section pricing-section">
          <div className="center-heading"><span className="eyebrow plain">SIMPLE PRICING</span><h2>Create more. Pay for what you use.</h2><p>Start free, then choose the creative power that fits your workflow.</p></div>
          <div className="plan-grid">
            {plans.map((plan) => <article className={plan.featured ? "plan-card featured" : "plan-card"} key={plan.name}>
              {plan.featured && <span className="popular">MOST POPULAR</span>}
              <h3>{plan.name}</h3><p>{plan.copy}</p><div className="price">{plan.price}<span>/month</span></div><b className="credits">{plan.credits} monthly</b>
              <Link href="/register" className={plan.featured ? "primary plan-button" : "secondary plan-button"}>Choose {plan.name}</Link>
              <ul>{plan.features.map((f) => <li key={f}><Check size={15} />{f}</li>)}</ul>
            </article>)}
          </div>
        </section>

        <section className="section quote">
          <div className="stars">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={17} fill="currentColor" />)}</div>
          <blockquote>“SwiipAI feels less like a toolbox and more like a creative partner. I can move from visual concept to campaign-ready motion in one session.”</blockquote>
          <p><b>Amelia Hart</b> · Creative Director, Form Studio</p>
        </section>

        <section className="section final-cta">
          <div className="cta-glow" /><Logo compact />
          <h2>Bring your ideas to life.</h2>
          <p>Your next scene, story or campaign starts with a few words.</p>
          <div><Link href="/register" className="primary">Create for free <ArrowRight size={17} /></Link><Link href="/pricing" className="secondary">View pricing</Link></div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}

export function PublicDetail({ path, light, toggleTheme }: { path: string; light: boolean; toggleTheme: () => void }) {
  const page = publicPages[path] ?? publicPages["/features"];
  return (
    <div className="public-site">
      <PublicHeader light={light} toggleTheme={toggleTheme} />
      <main className="detail-main">
        <section className="detail-hero section">
          <span className="eyebrow">{page.eyebrow}</span>
          <h1>{page.title}</h1><p>{page.copy}</p>
          <div><Link className="primary" href="/register">Start creating <ArrowRight size={17} /></Link><Link className="secondary" href="/pricing">View pricing</Link></div>
        </section>
        <section className="detail-visual section">
          <div className="detail-stage"><span className="detail-orb" /><span className="detail-gridlines" /><div className="detail-console"><i /><i /><i /><b>SWIIP GENERATION ENGINE</b><span>Ready for your direction</span></div></div>
        </section>
        <section className="section detail-features">
          <article><Zap /><h3>Built for speed</h3><p>Go from idea to polished result through a focused, responsive workflow.</p></article>
          <article><Sparkles /><h3>Creative control</h3><p>Fine-tune models, movement, format and visual style without complexity.</p></article>
          <article><Check /><h3>Production ready</h3><p>Export, organise, share and integrate every result with your wider process.</p></article>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}

function PublicFooter() {
  return (
    <footer>
      <div className="footer-top"><div><Logo /><p>One platform. Infinite creativity.</p></div>
        {[
          ["Product", "Create", "Video", "Image", "Pricing"],
          ["Resources", "Explore", "Developers", "Help centre", "Journal"],
          ["Company", "Enterprise", "Contact", "Privacy", "Terms"],
        ].map(([head, ...items]) => <div key={head}><b>{head}</b>{items.map((i) => <Link href={`/${i.toLowerCase().replace(" ", "-")}`} key={i}>{i}</Link>)}</div>)}
      </div>
      <div className="footer-bottom"><span>© 2026 SwiipAI. Built for original ideas.</span><span>English · USD</span></div>
    </footer>
  );
}
