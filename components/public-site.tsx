"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight, AudioLines, Braces, Check, ChevronDown, CirclePlay, Clapperboard,
  FolderKanban, Globe2, Heart, ImageIcon, ImagePlus, Menu, Move3d, Palette,
  Play, ScanFace, Search, ShieldCheck, Sparkles, Star, Video, WandSparkles, X, Zap,
} from "lucide-react";
import { Logo, ThemeButton } from "./brand";
import { community, creativeTools, plans, publicNav, publicPages, tools } from "./data";
import { getSupabaseBrowserClient } from "../lib/supabase-browser";

function PublicHeader({ light, toggleTheme }: { light: boolean; toggleTheme: () => void }) {
  const [open, setOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState<"create" | "assets" | "inspire" | null>(null);
  return (
    <header className="public-header">
      <Logo />
      <nav className={open ? "public-nav open" : "public-nav"}>
        {publicNav.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
        <div className="nav-dropdown">
          <button className="nav-resource" onClick={() => setResourcesOpen(resourcesOpen === "create" ? null : "create")}>
            Create <ChevronDown size={13} />
          </button>
          {resourcesOpen === "create" && <div className="resource-menu mega">
            <Link href="/app/director"><Clapperboard size={16} /><span><b>AI Director</b><small>Stories, shots and campaigns</small></span></Link>
            <Link href="/app/video"><CirclePlay size={16} /><span><b>Video Studio</b><small>Text, image and video creation</small></span></Link>
            <Link href="/app/image"><ImageIcon size={16} /><span><b>Image Studio</b><small>Create, edit and upscale</small></span></Link>
            <Link href="/app/audio"><AudioLines size={16} /><span><b>Audio Studio</b><small>Voice, music and sound</small></span></Link>
            <Link href="/characters"><ScanFace size={16} /><span><b>Character</b><small>Consistent identity creation</small></span></Link>
            <Link href="/worlds"><Globe2 size={16} /><span><b>World</b><small>Build reusable story worlds</small></span></Link>
          </div>}
        </div>
        <div className="nav-dropdown">
          <button className="nav-resource" onClick={() => setResourcesOpen(resourcesOpen === "assets" ? null : "assets")}>Assets <ChevronDown size={13} /></button>
          {resourcesOpen === "assets" && <div className="resource-menu">
            <Link href="/app/projects"><FolderKanban size={16} /><span><b>Projects</b><small>Your creative workspaces</small></span></Link>
            <Link href="/brand-kit"><Palette size={16} /><span><b>Brand Kit</b><small>Keep every campaign consistent</small></span></Link>
            <Link href="/media"><ImageIcon size={16} /><span><b>Media</b><small>Generated and uploaded assets</small></span></Link>
          </div>}
        </div>
        <div className="nav-dropdown">
          <button className="nav-resource" onClick={() => setResourcesOpen(resourcesOpen === "inspire" ? null : "inspire")}>Inspire <ChevronDown size={13} /></button>
          {resourcesOpen === "inspire" && <div className="resource-menu">
            <Link href="/templates"><Sparkles size={16} /><span><b>Templates</b><small>Start with proven creative flows</small></span></Link>
            <Link href="/tutorials"><CirclePlay size={16} /><span><b>Tutorials</b><small>Learn every creative workflow</small></span></Link>
            <Link href="/blog"><WandSparkles size={16} /><span><b>Journal</b><small>Releases, ideas and guides</small></span></Link>
          </div>}
        </div>
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

const catalogCopy: Record<string, { eyebrow: string; title: string; copy: string }> = {
  "/all-tools": { eyebrow: "SWIIPAI CREATIVE SUITE", title: "Every creative AI tool. One fluid workspace.", copy: "Generate, direct, edit, enhance and publish without jumping between disconnected apps." },
  "/models": { eyebrow: "MODEL LIBRARY", title: "The right model for every idea.", copy: "Compare leading image, video and audio engines through one clear, consistent interface." },
  "/templates": { eyebrow: "CREATIVE TEMPLATES", title: "Start closer to the finish line.", copy: "Ready-made workflows for product ads, music videos, films, social posts and branded stories." },
  "/characters": { eyebrow: "CHARACTER STUDIO", title: "One character. Every scene.", copy: "Build a reusable identity and keep faces, clothing and style consistent across images and videos." },
  "/worlds": { eyebrow: "WORLD BUILDER", title: "Create a world worth returning to.", copy: "Save locations, visual rules, mood and references so every new shot belongs to the same universe." },
  "/brand-kit": { eyebrow: "BRAND KIT", title: "Make every generation feel like your brand.", copy: "Centralize products, logos, colors, type, voice and references for consistent campaign creation." },
  "/media": { eyebrow: "MEDIA LIBRARY", title: "Everything you create, beautifully organized.", copy: "Search, filter, reuse and download generated or uploaded assets from one visual library." },
  "/tutorials": { eyebrow: "SWIIPAI ACADEMY", title: "Learn the workflow. Master the result.", copy: "Practical, visual lessons for stronger prompts, consistent characters and better final edits." },
};

const templates = ["Short Film", "Music Video", "Product Ad", "UGC Ad", "Social Content", "Micro Drama", "Brand Film", "Explainer", "Film Trailer", "Ad Remake"];
const models = ["Swiip Motion 2.1", "Veo 3.1", "Seedance 2.0", "Kling 3.0", "Flux Vision Pro", "Nano Banana 2", "Swiip Voice", "Sonic Music"];

export function CreativeCatalogPage({ path, light, toggleTheme }: { path: string; light: boolean; toggleTheme: () => void }) {
  const info = catalogCopy[path] ?? catalogCopy["/all-tools"];
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const isTemplates = path === "/templates" || path === "/tutorials";
  const isModels = path === "/models";
  const categories = ["All", "Video", "Image", "Audio", "Identity", "Assets", "Studio"];
  const filtered = creativeTools.filter((tool) => (category === "All" || tool.category === category) && `${tool.name} ${tool.description}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="public-site"><PublicHeader light={light} toggleTheme={toggleTheme} /><main className="catalog-page">
    <section className="catalog-hero section">
      <span className="eyebrow">{info.eyebrow}</span><h1>{info.title}</h1><p>{info.copy}</p>
      <div className="catalog-search"><Search size={18}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${isModels ? "models" : isTemplates ? "templates" : "creative tools"}...`}/><kbd>⌘ K</kbd></div>
    </section>
    {isModels ? <section className="section model-showcase">
      {models.filter((name) => name.toLowerCase().includes(query.toLowerCase())).map((name, i) => <Link href={i < 4 ? "/app/video" : i < 6 ? "/app/image" : "/app/audio"} className={`model-card model-${i % 4}`} key={name}><span>{i < 4 ? "VIDEO" : i < 6 ? "IMAGE" : "AUDIO"}</span><div className="model-art"><Sparkles size={28}/></div><h3>{name}</h3><p>{i % 2 ? "Fast, expressive generation with precise creative controls." : "Premium quality for polished production workflows."}</p><b>Open model <ArrowRight size={14}/></b></Link>)}
    </section> : isTemplates ? <section className="section template-grid">
      {templates.filter((name) => name.toLowerCase().includes(query.toLowerCase())).map((name, i) => <Link href="/app/director" className={`template-card template-${i % 5}`} key={name}><div className="template-art"><Play size={18} fill="currentColor"/></div><span>{path === "/tutorials" ? `${4 + i} MIN LESSON` : "DIRECTOR TEMPLATE"}</span><h3>{path === "/tutorials" ? `How to create a ${name.toLowerCase()}` : name}</h3><p>{path === "/tutorials" ? "A practical step-by-step SwiipAI workflow." : "Structure, shot plan and ready-to-edit creative direction."}</p></Link>)}
    </section> : <>
      <section className="section catalog-controls"><div className="tab-row">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={category === item ? "active" : ""}>{item}</button>)}</div><span>{filtered.length} tools</span></section>
      <section className="section catalog-grid">{filtered.map(({name, category: group, href, icon: Icon, badge, description}, i) => <Link href={href} className={`catalog-card catalog-${i % 6}`} key={name}><div className="catalog-card-top"><span><Icon size={22}/></span>{badge && <b>{badge}</b>}</div><small>{group}</small><h3>{name}</h3><p>{description}</p><i>Open tool <ArrowRight size={14}/></i></Link>)}</section>
    </>}
    <section className="section catalog-cta"><Sparkles size={28}/><h2>One account. Every creative workflow.</h2><p>Start free and turn your next idea into something ready to share.</p><Link href="/register" className="primary">Start creating free <ArrowRight size={17}/></Link></section>
  </main><PublicFooter /></div>;
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

function SeedanceSpotlight() {
  return (
    <section className="seedance-spotlight section" aria-labelledby="seedance-title">
      <div className="seedance-aura seedance-aura-left" />
      <div className="seedance-aura seedance-aura-right" />
      <div className="seedance-console">
        <div className="seedance-console-rim">
          <div className="seedance-screen">
            <video
              className="seedance-video"
              src="/videos/seedance-swiipai-4k.mp4"
              poster="/images/seedance-swiipai-poster.jpg"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="Animated Seedance 2.0 cinematic preview"
            />
            <div className="seedance-scanlines" />
            <div className="seedance-screen-glow" />
            <span className="seedance-4k">4K</span>
            <div className="seedance-copy">
              <span className="seedance-kicker"><i /> NEW VIDEO MODEL</span>
              <h2 id="seedance-title">Seedance 2.0</h2>
              <span className="seedance-resolution">Now in 4K</span>
              <p>Already available on <strong>SwiipAI</strong></p>
              <Link href="/app/video" className="seedance-cta">
                Try now <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
        <span className="seedance-status"><i /> LIVE MODEL</span>
        <span className="seedance-spec">CINEMATIC VIDEO · ULTRA HD</span>
      </div>
    </section>
  );
}

const modelStudios = [
  { name: "Grok", company: "xAI", logo: "https://cdn.simpleicons.org/x/FFFFFF", href: "/app/video", type: "Video + image", status: "API ready" },
  { name: "Gemini", company: "Google", logo: "https://cdn.simpleicons.org/googlegemini/FFFFFF", href: "/app/create", type: "Multimodal", status: "API ready" },
  { name: "Higgsfield", company: "Higgsfield AI", logo: "", href: "/app/motion-control", type: "Cinematic video", status: "Provider setup" },
  { name: "Sora", company: "OpenAI", logo: "https://cdn.simpleicons.org/openai/FFFFFF", href: "/app/video", type: "Video", status: "Provider setup" },
  { name: "Claude", company: "Anthropic", logo: "https://cdn.simpleicons.org/anthropic/FFFFFF", href: "/app/create", type: "Prompt assistant", status: "API ready" },
];

const showcaseProjects = [
  { title: "Neon Drive", model: "Grok Video", type: "video", image: "/showcase/neon-drive.png", prompt: "A black electric supercar crossing a rain-soaked neon city at blue hour.", href: "/app/video" },
  { title: "Desert Couture", model: "Gemini Image", type: "image", image: "/showcase/desert-couture.png", prompt: "Editorial fashion portrait inside a glass desert pavilion at sunrise.", href: "/app/image" },
  { title: "Midnight Campaign", model: "Higgsfield", type: "video", image: "/showcase/neon-drive.png", prompt: "Cinematic tracking shot with realistic reflections, rain and camera motion.", href: "/app/motion-control" },
  { title: "Future Heritage", model: "Sora", type: "image", image: "/showcase/desert-couture.png", prompt: "North African future fashion, natural skin texture and luxury lighting.", href: "/app/image" },
];

const omniProjects = [
  { title: "Neon Velocity", category: "Marketing", creator: "Maya Chen", handle: "@mayamotion", avatar: "MC", prompt: "A midnight-black hypercar racing through a rain-soaked futuristic city, neon green reflections, low tracking camera, cinematic motion blur, premium commercial lighting.", tone: "cyan" },
  { title: "Desert Muse", category: "Fashion", creator: "Lina Noor", handle: "@linanoor", avatar: "LN", prompt: "Editorial portrait of a Moroccan model crossing sculpted desert dunes at golden hour, flowing emerald fabric, slow orbit camera, realistic skin, luxury campaign mood.", tone: "amber" },
  { title: "Chrome Bloom", category: "Concept Art", creator: "Alex Vale", handle: "@alexvale", avatar: "AV", prompt: "A chrome flower unfolding in zero gravity, microscopic water droplets, black studio background, macro lens, elegant slow motion and vivid green caustic light.", tone: "violet" },
  { title: "After the Rain", category: "Film & Stories", creator: "Sofia Reed", handle: "@sofireed", avatar: "SR", prompt: "A quiet cinematic street after summer rain, one woman under a transparent umbrella, reflections moving naturally, handheld 35mm camera, intimate film grain.", tone: "blue" },
  { title: "Liquid Future", category: "Animation", creator: "Noah Kim", handle: "@noahframes", avatar: "NK", prompt: "Translucent liquid glass shapes transforming into a futuristic sneaker, seamless morph animation, dark gallery, green rim light, precise product cinematography.", tone: "green" },
  { title: "Atlas Sky", category: "Mood", creator: "Yasmine Idris", handle: "@yasmineidris", avatar: "YI", prompt: "An aerial journey above the Atlas Mountains at sunrise, clouds spilling through the valleys, majestic slow drone push, photoreal detail, hopeful atmosphere.", tone: "rose" },
  { title: "Signal Lost", category: "Micro Drama", creator: "Eli Stone", handle: "@elistone", avatar: "ES", prompt: "A lone astronaut receives an impossible message inside a dim spacecraft, subtle facial emotion, flickering green monitors, slow dolly in, tense science-fiction drama.", tone: "slate" },
  { title: "Pulse", category: "Music Video", creator: "Juno Rae", handle: "@junorae", avatar: "JR", prompt: "A dancer moving through volumetric laser tunnels synchronized to an electronic beat, energetic camera swings, crisp silhouettes, glossy black and neon green palette.", tone: "lime" },
  { title: "Tiny Kingdom", category: "Animation", creator: "Omar Bell", handle: "@omarbell", avatar: "OB", prompt: "A miniature city waking inside a moss-covered terrarium, tiny commuters and glowing windows, playful tilt-shift lens, warm morning light, detailed animated world.", tone: "forest" },
  { title: "Orbital Coffee", category: "Advertising", creator: "Nora West", handle: "@norawest", avatar: "NW", prompt: "A premium coffee cup floating in a space station while crema forms a perfect galaxy, smooth product rotation, dramatic sun rim, clean luxury advertisement.", tone: "copper" },
];

function OmniInspirations() {
  const [active, setActive] = useState<(typeof omniProjects)[number] | null>(null);
  const [category, setCategory] = useState("All");
  const categories = ["All", "Marketing", "Film & Stories", "Music Video", "Animation", "Fashion", "Mood"];
  const visible = category === "All" ? omniProjects : omniProjects.filter((item) => item.category === category);
  useEffect(() => {
    if (!active) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setActive(null);
    document.body.classList.add("modal-open");
    window.addEventListener("keydown", close);
    return () => { document.body.classList.remove("modal-open"); window.removeEventListener("keydown", close); };
  }, [active]);
  return <section className="section omni-inspirations" aria-labelledby="omni-title">
    <div className="omni-heading"><div><span className="eyebrow plain">MADE WITH SWIIPAI OMNI</span><h2 id="omni-title">Infinite ideas. One intelligent director.</h2></div><p>Explore ten community films made with Omni, then reuse the exact creative setup in one click.</p></div>
    <div className="omni-tabs" role="tablist" aria-label="Filter Omni videos">{categories.map((item) => <button role="tab" aria-selected={category === item} className={category === item ? "active" : ""} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div>
    <div className="omni-mosaic">{visible.map((project, index) => <button className={`omni-card omni-${project.tone} omni-card-${index % 10}`} onClick={() => setActive(project)} key={project.title} aria-label={`Play ${project.title}`}>
      <video src="/videos/seedance-swiipai-4k.mp4" muted loop playsInline preload="metadata" onMouseEnter={(event) => event.currentTarget.play().catch(() => {})} onMouseLeave={(event) => { event.currentTarget.pause(); event.currentTarget.currentTime = 0; }} />
      <span className="omni-tint" /><span className="omni-play"><Play fill="currentColor" size={22}/></span>
      <span className="omni-card-meta"><small>OMNI · {project.category}</small><b>{project.title}</b></span>
    </button>)}</div>
    {active && <div className="omni-modal" role="dialog" aria-modal="true" aria-label={`${active.title} details`} onMouseDown={(event) => event.target === event.currentTarget && setActive(null)}>
      <div className="omni-viewer"><button className="omni-close" onClick={() => setActive(null)} aria-label="Close"><X size={20}/></button>
        <div className="omni-player"><video src="/videos/seedance-swiipai-4k.mp4" autoPlay controls playsInline /><span className="omni-watermark"><Logo compact/> OMNI</span></div>
        <aside className="omni-details"><div className="omni-creator"><span>{active.avatar}</span><div><b>{active.creator}</b><small>{active.handle}</small></div></div>
          <div><span className="eyebrow plain">OMNI CREATION</span><h3>{active.title}</h3><small className="omni-category">{active.category}</small></div>
          <div className="omni-prompt"><b>Prompt</b><p>{active.prompt}</p></div>
          <div className="omni-model"><span><Sparkles size={16}/></span><div><small>Created with</small><b>SwiipAI Omni</b></div><Check size={16}/></div>
          <Link className="primary omni-remix" href={`/app/video?model=omni&prompt=${encodeURIComponent(active.prompt)}`}><Sparkles size={17}/> Get started with this prompt</Link>
        </aside>
      </div>
    </div>}
  </section>;
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

        <SeedanceSpotlight />

        <section className="section model-studios">
          <div className="section-heading">
            <div><span className="eyebrow plain">WORLD-CLASS AI MODELS</span><h2>Choose the right creative engine.</h2></div>
            <p>Open a dedicated studio for each model while keeping prompts, assets, generations and credits in one SwiipAI workspace.</p>
          </div>
          <div className="model-rail">
            {modelStudios.map((model) => (
              <Link href={model.href} className="model-studio-card" key={model.name}>
                <span className="provider-logo">{model.logo ? <img src={model.logo} alt={`${model.name} logo`} /> : <b>H</b>}</span>
                <span className="provider-copy"><b>{model.name}</b><small>{model.company} · {model.type}</small></span>
                <span className={model.status === "API ready" ? "provider-status ready" : "provider-status"}>{model.status}</span>
                <ArrowRight size={17} />
              </Link>
            ))}
          </div>
          <p className="provider-note">SwiipAI is an independent platform. Provider names and logos identify compatible services and do not imply endorsement or partnership.</p>
        </section>

        <section className="section generated-showcase">
          <div className="section-heading">
            <div><span className="eyebrow plain">CREATED WITH SWIIPAI</span><h2>From prompt to believable content.</h2></div>
            <Link className="secondary" href="/explore">View all projects <ArrowRight size={15} /></Link>
          </div>
          <div className="showcase-grid">
            {showcaseProjects.map((project) => (
              <Link className="showcase-card" href={project.href} key={project.title}>
                <img src={project.image} alt={`${project.title} AI-generated project preview`} />
                <span className="showcase-type">{project.type === "video" ? <Video size={14} /> : <ImageIcon size={14} />}{project.type}</span>
                {project.type === "video" && <span className="showcase-play"><Play fill="currentColor" size={19} /></span>}
                <span className="showcase-gradient" />
                <span className="showcase-copy"><small>{project.model}</small><b>{project.title}</b><em>{project.prompt}</em></span>
              </Link>
            ))}
          </div>
        </section>

        <OmniInspirations />

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
          <div className="center-heading"><span className="eyebrow plain">SIMPLE PRICING</span><h2>Choose the power behind your ideas.</h2><p>Monthly credits, clear model access and secure billing through Stripe or PayPal.</p></div>
          <div className="plan-grid">
            {plans.map((plan) => <article className={plan.featured ? "plan-card featured" : "plan-card"} key={plan.name}>
              {plan.badge && <span className="popular">{plan.badge}</span>}
              <h3>{plan.name}</h3><p>{plan.copy}</p><div className="price">${plan.annualPrice}<span>/month</span></div><b className="credits">{plan.credits.toLocaleString()} credits monthly</b>
              <Link href="/pricing" className={plan.featured ? "primary plan-button" : "secondary plan-button"}>Explore {plan.name}</Link>
              <ul>{plan.features.slice(0, 4).map((f) => <li key={f}><Check size={15} />{f}</li>)}</ul>
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
  const experiences: Record<string, { icon: typeof Sparkles; accent: string; kicker: string; stats: string[][]; features: string[][]; demo: string[] }> = {
    "/ai-video": { icon: Clapperboard, accent: "blue", kicker: "TEXT · IMAGE · MOTION", stats: [["4K", "Export"], ["40+", "Video models"], ["60s", "Generation"]], demo: ["Opening shot", "Camera orbit", "Cinematic grade"], features: [["Text to video", "Describe the scene, movement, lens and mood."], ["Image to video", "Animate any frame while preserving its visual identity."], ["Video control", "Extend, restyle and direct precise camera movement."]] },
    "/ai-image": { icon: ImageIcon, accent: "pink", kicker: "CREATE · EDIT · UPSCALE", stats: [["8K", "Resolution"], ["30+", "Image models"], ["10x", "Faster ideas"]], demo: ["Editorial portrait", "Product relight", "Brand campaign"], features: [["Text to image", "Turn detailed directions into polished visuals."], ["Smart editing", "Replace, expand and refine with natural language."], ["Consistent style", "Keep characters, products and visual identity aligned."]] },
    "/ai-audio": { icon: AudioLines, accent: "green", kicker: "VOICE · MUSIC · SOUND", stats: [["40+", "Languages"], ["Studio", "Quality"], ["Instant", "Dubbing"]], demo: ["Natural voiceover", "Scene ambience", "Sound design"], features: [["AI voices", "Generate expressive speech across languages."], ["Sound effects", "Create precise audio matched to your visuals."], ["Clean & translate", "Repair, translate and dub audio in one flow."]] },
    "/motion-control": { icon: Move3d, accent: "violet", kicker: "REFERENCE · TRANSFER · DIRECT", stats: [["1:1", "Motion match"], ["Stable", "Identity"], ["1080p", "Output"]], demo: ["Upload character", "Add motion", "Preserve identity"], features: [["Motion transfer", "Use a reference performance to guide movement."], ["Identity lock", "Preserve face, clothing and core scene details."], ["Creative direction", "Control framing, strength and final format."]] },
    "/lip-sync": { icon: ScanFace, accent: "amber", kicker: "SPEECH · PERFORMANCE · LANGUAGE", stats: [["40+", "Languages"], ["Frame", "Accurate"], ["Multi", "Speaker"]], demo: ["Upload portrait", "Choose voice", "Perfect sync"], features: [["Natural timing", "Match phonemes, emotion and facial movement."], ["Any voice", "Upload audio or create a voice directly in SwiipAI."], ["Global content", "Translate performances without reshooting."]] },
    "/ai-effects": { icon: WandSparkles, accent: "cyan", kicker: "EFFECTS · TRANSITIONS · SOCIAL", stats: [["100+", "Effects"], ["1 click", "Workflow"], ["Daily", "New drops"]], demo: ["Select a moment", "Choose effect", "Share instantly"], features: [["Curated effects", "Use transformations built around current formats."], ["Camera moves", "Add orbit, zoom, dolly and cinematic motion."], ["Social ready", "Generate vertical, square and landscape versions."]] },
    "/developers": { icon: Braces, accent: "blue", kicker: "ONE API · EVERY MODEL", stats: [["99.9%", "Uptime"], ["1", "Unified API"], ["Live", "Webhooks"]], demo: ["POST /generations", "Track status", "Receive asset"], features: [["Unified models", "Switch providers without rebuilding your product."], ["Predictable credits", "Track cost and usage from a single dashboard."], ["Production tools", "Webhooks, logs, limits and secure server keys."]] },
    "/enterprise": { icon: ShieldCheck, accent: "violet", kicker: "SECURE · SCALABLE · SUPPORTED", stats: [["SSO", "Access"], ["24/7", "Support"], ["Custom", "Limits"]], demo: ["Invite team", "Set permissions", "Review usage"], features: [["Team control", "Roles, workspaces and shared brand assets."], ["Private by default", "Protected generations and configurable retention."], ["Built to scale", "Custom capacity, onboarding and priority support."]] },
  };
  const exp = experiences[path] ?? { icon: Sparkles, accent: "pink", kicker: "ONE CREATIVE OPERATING SYSTEM", stats: [["6+", "Creative tools"], ["40+", "AI models"], ["One", "Workspace"]], demo: ["Start with an idea", "Choose your tool", "Create and refine"], features: [["Everything connected", "Move between video, image and audio without losing context."], ["Models that fit", "Choose the best engine for every creative direction."], ["Built for flow", "Projects, assets and exports stay organised."]] };
  const PageIcon = exp.icon;
  return (
    <div className="public-site">
      <PublicHeader light={light} toggleTheme={toggleTheme} />
      <main className="detail-main">
        <section className={`detail-hero section detail-${exp.accent}`}>
          <div className="detail-copy">
            <span className="detail-icon"><PageIcon size={21} /></span>
            <span className="eyebrow">{page.eyebrow}</span>
            <h1>{page.title}</h1><p>{page.copy}</p>
            <div><Link className="primary" href="/register">Try it for free <ArrowRight size={17} /></Link><Link className="secondary" href="#how-it-works"><CirclePlay size={17} /> See how it works</Link></div>
            <small><Check size={13} /> 80 free credits · No card required</small>
          </div>
          <div className="product-showcase">
            <div className="showcase-bar"><span>{exp.kicker}</span><i>LIVE PREVIEW</i></div>
            <div className="showcase-canvas"><span className="showcase-core" /><PageIcon size={42} /><b>{exp.demo[1]}</b><small>Created with SwiipAI</small></div>
            <div className="showcase-steps">{exp.demo.map((item, i) => <span className={i === 1 ? "active" : ""} key={item}><i>0{i + 1}</i>{item}</span>)}</div>
          </div>
        </section>
        <section className="detail-stats section">
          {exp.stats.map(([value, label]) => <div key={label}><b>{value}</b><span>{label}</span></div>)}
        </section>
        <section className="section feature-story" id="how-it-works">
          <div><span className="eyebrow plain">BUILT FOR YOUR WORKFLOW</span><h2>More control at every step.</h2><p>Professional creative tools, simple enough to feel effortless from the first generation.</p></div>
          <div className="detail-features">
            {exp.features.map(([title, copy], i) => <article key={title}><span>0{i + 1}</span><h3>{title}</h3><p>{copy}</p><Check size={17} /></article>)}
          </div>
        </section>
        <section className="section detail-cta"><PageIcon size={30} /><h2>Ready to create with {page.eyebrow}?</h2><p>Join SwiipAI and turn your next idea into something people remember.</p><Link className="primary" href="/register">Start creating free <ArrowRight size={17} /></Link></section>
      </main>
      <PublicFooter />
    </div>
  );
}

export function PricingPage({ light, toggleTheme }: { light: boolean; toggleTheme: () => void }) {
  const [annual, setAnnual] = useState(true);
  const [checkout, setCheckout] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  async function startCheckout(planSlug: string, provider: "stripe" | "paypal") {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return setCheckoutError("Secure checkout is not configured yet.");
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      localStorage.setItem("swiipai_checkout", JSON.stringify({ planSlug, provider, annual }));
      window.location.assign("/register");
      return;
    }
    setCheckout(`${planSlug}:${provider}`);
    setCheckoutError("");
    const idempotencyKey = crypto.randomUUID();
    const { data, error } = await supabase.functions.invoke("create-subscription-checkout", {
      body: { plan_slug: planSlug, provider, billing_period: annual ? "annual" : "monthly" },
      headers: { "idempotency-key": idempotencyKey },
    });
    if (error || !data?.url) {
      setCheckoutError(error?.message || data?.error || "Checkout is temporarily unavailable.");
      setCheckout("");
      return;
    }
    location.assign(data.url);
  }
  return <div className="public-site"><PublicHeader light={light} toggleTheme={toggleTheme} /><main className="pricing-page">
    <section className="section pricing-hero"><span className="eyebrow">CREATIVE POWER, YOUR WAY</span><h1>A plan for every level of ambition.</h1><p>Unlock only the models, limits and generation power included in your plan. Credits refresh every month after verified payment.</p>
      <div className="billing-toggle"><button className={!annual ? "active" : ""} onClick={() => setAnnual(false)}>Monthly</button><button className={annual ? "active" : ""} onClick={() => setAnnual(true)}>Yearly <span>Save up to 25%</span></button></div>
    </section>
    <section className="section plan-grid premium-plans">{plans.map((plan) => {
      const price = annual ? plan.annualPrice : plan.monthlyPrice;
      const annualTotal = plan.annualPrice * 12;
      return <article className={plan.featured ? "plan-card featured" : "plan-card"} key={plan.name}>
        {plan.badge && <span className="popular">{plan.badge}</span>}
        <div className="plan-title-row"><div><h3>{plan.name}</h3><p>{plan.copy}</p></div>{plan.discount && annual && <em>{plan.discount}</em>}</div>
        <div className="price">${price}<span>/month</span></div>
        <small className="billing-copy">{annual ? `$${annualTotal} billed annually` : "Billed monthly · cancel anytime"}</small>
        <div className="credit-block"><Sparkles size={18}/><div><b>{plan.credits.toLocaleString()} credits/mo.</b><span>{plan.equivalents[0]}<br/>{plan.equivalents[1]}</span></div></div>
        <div className="parallel-pill"><Zap size={14}/>{plan.parallel}</div>
        <div className="payment-buttons">
          <button onClick={() => startCheckout(plan.slug, "stripe")} disabled={checkout !== ""} className={plan.featured ? "primary" : "secondary"}>{checkout === `${plan.slug}:stripe` ? "Opening…" : `Get ${plan.name} with Stripe`}</button>
          <button onClick={() => startCheckout(plan.slug, "paypal")} disabled={checkout !== ""} className="paypal-button">{checkout === `${plan.slug}:paypal` ? "Opening…" : "Pay with PayPal"}</button>
        </div>
        <ul>{plan.features.map((f) => <li key={f}><Check size={15}/>{f}</li>)}</ul>
        <div className="plan-models">{plan.modelGroups.map(([group, ...models]) => <details key={group}><summary>{group}<ChevronDown size={14}/></summary><div>{models.map(model => <span key={model}><Check size={12}/>{model}</span>)}</div></details>)}</div>
        {plan.limits.map(limit => <p className="plan-limit" key={limit}>● {limit}</p>)}
      </article>;
    })}</section>
    {checkoutError && <p className="checkout-error">{checkoutError}</p>}
    <section className="section pricing-note"><ShieldCheck size={26}/><div><b>Access activates only after verified payment.</b><p>Stripe and PayPal webhooks control monthly credits and Dashboard model permissions. Redirects alone never unlock a plan.</p></div></section>
  </main><PublicFooter /></div>;
}

export function ExplorePage({ light, toggleTheme }: { light: boolean; toggleTheme: () => void }) {
  const [filter, setFilter] = useState("All");
  return <div className="public-site"><PublicHeader light={light} toggleTheme={toggleTheme} /><main className="explore-page">
    <section className="section explore-hero"><span className="eyebrow">CREATED WITH SWIIPAI</span><h1>Ideas worth exploring.</h1><p>Discover cinematic motion, visual worlds and experiments from a global creative community.</p><div className="tab-row">{["All","Video","Image","Motion","Effects"].map(x=><button className={filter===x?"active":""} onClick={()=>setFilter(x)} key={x}>{x}</button>)}</div></section>
    <section className="section community-grid explore-grid">{[...community,...community].map((item,index)=><article className={`community-card ${index%3===0?"tall":index%3===1?"wide":"square"} ${item.tint}`} key={`${item.title}-${index}`}><div className="community-art"><span className="art-core"/><span className="art-horizon"/>{index%2===0&&<Play fill="currentColor" size={16}/>}</div><div className="community-overlay"><div><b>{item.title}</b><span>by {item.author}</span></div><span><Heart size={14}/> {item.likes}</span></div></article>)}</section>
    <section className="section detail-cta"><Sparkles size={30}/><h2>Your work belongs here.</h2><p>Start with 80 free credits and share your first creation today.</p><Link className="primary" href="/register">Create something new <ArrowRight size={17}/></Link></section>
  </main><PublicFooter /></div>;
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
