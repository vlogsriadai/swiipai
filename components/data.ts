import {
  AudioLines, BadgeDollarSign, Blocks, Bot, Box, Brush, Clapperboard,
  Clock3, Code2, CreditCard, Film, FolderKanban, Gauge, ImageIcon,
  KeyRound, LayoutDashboard, LifeBuoy, Megaphone, Mic2, Move3d, Palette,
  PanelsTopLeft, ScanFace, Settings2, ShieldCheck, Sparkles, Users, WandSparkles,
} from "lucide-react";

export const publicNav = [
  ["Home", "/"], ["All Tools", "/all-tools"], ["Models", "/models"],
  ["Templates", "/templates"], ["Explore", "/explore"], ["Pricing", "/pricing"],
] as const;

export const creativeTools = [
  { name: "AI Director", category: "Studio", href: "/app/director", icon: Clapperboard, badge: "NEW", description: "Plan scenes, shots and complete stories in one directed workflow." },
  { name: "Text to Video", category: "Video", href: "/app/video", icon: Film, badge: "HOT", description: "Create cinematic clips from a detailed prompt." },
  { name: "Image to Video", category: "Video", href: "/app/video", icon: Clapperboard, description: "Animate a still frame with controlled camera motion." },
  { name: "Edit Video", category: "Video", href: "/app/video-editor", icon: WandSparkles, description: "Restyle, extend and retake parts of an existing clip." },
  { name: "Motion Control", category: "Video", href: "/app/motion-control", icon: Move3d, description: "Transfer a performance while protecting identity." },
  { name: "Lip Sync", category: "Video", href: "/app/lip-sync", icon: ScanFace, description: "Match natural speech and facial motion in 40+ languages." },
  { name: "VFX Studio", category: "Video", href: "/app/effects", icon: Sparkles, description: "Add production-ready effects, transformations and transitions." },
  { name: "Create Image", category: "Image", href: "/app/image", icon: ImageIcon, badge: "FAST", description: "Generate polished visuals with leading image models." },
  { name: "Edit Image", category: "Image", href: "/app/image-editor", icon: Brush, description: "Replace, expand, relight and refine using natural language." },
  { name: "Image Upscale", category: "Image", href: "/app/upscale", icon: ImageIcon, description: "Restore detail and export crisp high-resolution artwork." },
  { name: "Character Studio", category: "Identity", href: "/app/characters", icon: Users, badge: "NEW", description: "Build reusable, consistent characters for every scene." },
  { name: "World Builder", category: "Identity", href: "/app/worlds", icon: Palette, description: "Save locations, visual rules and story-world references." },
  { name: "Brand Kit", category: "Assets", href: "/app/brand-kit", icon: Megaphone, description: "Keep products, colors, type and campaign style consistent." },
  { name: "AI Voice", category: "Audio", href: "/app/audio", icon: Mic2, description: "Generate expressive multilingual narration and dialogue." },
  { name: "Create Music", category: "Audio", href: "/app/music", icon: AudioLines, description: "Compose original music from mood, genre and story cues." },
  { name: "Sound Effects", category: "Audio", href: "/app/sound-effects", icon: AudioLines, description: "Design precise ambience and effects for every edit." },
] as const;

export const appNav = [
  { label: "Home", href: "/app/home", icon: LayoutDashboard },
  { label: "Create", href: "/app/create", icon: Sparkles },
  { label: "Video", href: "/app/video", icon: Clapperboard },
  { label: "Image", href: "/app/image", icon: ImageIcon },
  { label: "Audio", href: "/app/audio", icon: AudioLines },
  { label: "Effects", href: "/app/effects", icon: WandSparkles },
  { label: "Motion", href: "/app/motion-control", icon: Move3d },
  { label: "Lip Sync", href: "/app/lip-sync", icon: ScanFace },
  { label: "Canvas", href: "/app/canvas", icon: Brush },
  { label: "Projects", href: "/app/projects", icon: FolderKanban },
  { label: "Assets", href: "/app/assets", icon: Box },
  { label: "Community", href: "/app/community", icon: Users },
] as const;

export const adminNav = [
  { label: "Overview", href: "/admin/dashboard", icon: Gauge },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Generations", href: "/admin/generations", icon: Sparkles },
  { label: "Models", href: "/admin/models", icon: Bot },
  { label: "Providers", href: "/admin/providers", icon: Blocks },
  { label: "Plans", href: "/admin/plans", icon: BadgeDollarSign },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "CMS", href: "/admin/pages", icon: PanelsTopLeft },
  { label: "Moderation", href: "/admin/moderation", icon: ShieldCheck },
  { label: "Support", href: "/admin/support", icon: LifeBuoy },
  { label: "API keys", href: "/admin/api-keys", icon: KeyRound },
  { label: "Settings", href: "/admin/settings", icon: Settings2 },
] as const;

export const tools = [
  { title: "Text to Video", label: "Seedance Studio", icon: Film, cost: 18, tint: "blue", desc: "Create cinematic sequences with Seedance and Kling.", minPlan: "basic" },
  { title: "Image to Video", label: "Seedance Fast", icon: Clapperboard, cost: 17, tint: "violet", desc: "Give still images natural, directed movement.", minPlan: "basic" },
  { title: "AI Image", label: "Nano Banana Pro", icon: ImageIcon, cost: 2, tint: "pink", desc: "Create polished visuals with leading image models.", minPlan: "basic" },
  { title: "Motion Control", label: "Kling 3.0", icon: Move3d, cost: 24, tint: "cyan", desc: "Transfer motion while preserving character identity.", minPlan: "basic" },
  { title: "Lip Sync", label: "Voice Match", icon: ScanFace, cost: 12, tint: "amber", desc: "Synchronise speech naturally with premium voices.", minPlan: "pro" },
  { title: "AI Audio", label: "Eleven v3", icon: Mic2, cost: 4, tint: "green", desc: "Generate voice, ambience and precise sound effects.", minPlan: "basic" },
] as const;

export const community = [
  { title: "Neon Monsoon", author: "Mira", ratio: "tall", tint: "scene-one", likes: "8.4K" },
  { title: "Glass Horizon", author: "Theo", ratio: "wide", tint: "scene-two", likes: "6.9K" },
  { title: "Desert Bloom", author: "Ayla", ratio: "square", tint: "scene-three", likes: "12K" },
  { title: "Afterlight", author: "Nox", ratio: "tall", tint: "scene-four", likes: "4.2K" },
  { title: "Blue Hour", author: "Sami", ratio: "wide", tint: "scene-five", likes: "9.1K" },
  { title: "Future Form", author: "Lina", ratio: "square", tint: "scene-six", likes: "7.7K" },
] as const;

export const plans = [
  {
    slug: "basic", name: "Basic", copy: "For first-time AI creators", monthlyPrice: 9, annualPrice: 9,
    credits: 120, equivalents: ["≈ 60 Nano Banana Pro generations", "≈ 7 Seedance 2.0 Fast videos"],
    parallel: "Up to 2 videos · 2 images", badge: null, discount: null, featured: false,
    features: ["Fixed 120 credits every month", "Access to Supercomputer", "Seedance 2.0 Fast & Mini", "Selected models and features", "Early access to advanced AI features", "Unlimited marketplace access"],
    limits: ["Selected models only", "No Unlimited mode on top models"],
    modelGroups: [
      ["ByteDance", "Seedance 2.0 Fast & Mini", "Seedream 5.0 Pro"],
      ["Google · up to 2K", "Nano Banana Pro", "Nano Banana 2", "Gemini Omni Flash"],
      ["Kling", "Kling 3.0", "Kling 3.0 Motion Control"],
      ["Audio", "Seed Audio 1.0", "Eleven v3", "MiniMax Speech 2.8 HD", "VibeVoice", "Seed Speech"],
      ["Other", "GPT Image 2", "Wan 2.7"],
    ],
  },
  {
    slug: "pro", name: "Pro", copy: "For everyday AI creation", monthlyPrice: 29, annualPrice: 23,
    credits: 600, equivalents: ["≈ 300 Nano Banana Pro generations", "≈ 27 Seedance 2.0 videos"],
    parallel: "Up to 3 videos · 4 images", badge: "MOST POPULAR", discount: "21% OFF", featured: true,
    features: ["600 credits every month", "Access to all Seedance models", "Access to all models and features", "7-day Unlimited on all models", "Extended duration and resolution", "Unlimited marketplace access"],
    limits: ["Unlimited mode uses fewer parallel generations"],
    modelGroups: [
      ["ByteDance", "Seedance 2.0 · 1080p / 15s", "Seedance 2.0 Fast & Mini · 10s", "Seedream 5.0 Pro"],
      ["Google · up to 2K", "Nano Banana Pro", "Nano Banana 2", "Gemini Omni Flash · 10s"],
      ["Kling", "Kling 3.0 · 1080p / 10s", "Kling 3.0 Motion Control · 1080p / 10s"],
      ["Audio", "Seed Audio 1.0", "Eleven v3", "MiniMax Speech 2.8 HD", "VibeVoice", "Seed Speech"],
      ["Other", "GPT Image 2", "Wan 2.7 · 1080p / 10s"],
    ],
  },
  {
    slug: "max", name: "Max", copy: "For ambitious AI projects", monthlyPrice: 79, annualPrice: 59,
    credits: 1800, equivalents: ["≈ 900 Nano Banana Pro generations", "≈ 80 Seedance 2.0 videos"],
    parallel: "Up to 8 videos · 8 images", badge: "BEST VALUE", discount: "25% OFF", featured: false,
    features: ["1,800 credits every month", "Full access to every model and feature", "7-day Unlimited on all models", "Up to 4K and extended duration", "60% lower effective generation cost", "Unlimited marketplace access"],
    limits: ["Unlimited mode uses fewer parallel generations"],
    modelGroups: [
      ["ByteDance", "Seedance 2.0 · 4K / 8s & 1080p / 15s", "Seedance Fast & Mini · 15s", "Seedream 5.0 Pro"],
      ["Google · up to 2K", "Nano Banana Pro", "Nano Banana 2", "Gemini Omni Flash · 10s"],
      ["Kling", "Kling 3.0 · 1080p / 15s", "Kling Motion Control · 1080p / 15s"],
      ["Audio", "Seed Audio 1.0", "Eleven v3", "MiniMax Speech 2.8 HD", "VibeVoice", "Seed Speech"],
      ["Other", "GPT Image 2", "Wan 2.7 · 1080p / 15s"],
    ],
  },
] as const;

export const dashboardStats = [
  { label: "Available credits", value: "2,480", delta: "Pro plan", icon: Sparkles },
  { label: "Created this month", value: "146", delta: "+18.4%", icon: WandSparkles },
  { label: "Storage", value: "18.2 GB", delta: "of 50 GB", icon: Box },
  { label: "Renewal", value: "Aug 19", delta: "23 days", icon: Clock3 },
] as const;

export const adminStats = [
  ["Total revenue", "$128,420", "+12.8%"], ["Active users", "18,946", "+8.2%"],
  ["Generations", "284,910", "+21.3%"], ["Gross margin", "64.7%", "+3.1%"],
] as const;

export const publicPages: Record<string, { eyebrow: string; title: string; copy: string }> = {
  "/features": { eyebrow: "One creative operating system", title: "Every AI tool your ideas need.", copy: "Move from first thought to finished visual without breaking your creative flow." },
  "/ai-video": { eyebrow: "AI Video Studio", title: "Direct motion like a filmmaker.", copy: "Generate, extend, restyle and refine cinematic video with precise creative controls." },
  "/ai-image": { eyebrow: "AI Image Studio", title: "Visuals with taste, speed and control.", copy: "Create, edit, relight and upscale production-ready imagery in one workspace." },
  "/ai-audio": { eyebrow: "Sonic AI", title: "Give every story a voice.", copy: "Create voices, sound effects and clean audio that feel made for your scene." },
  "/motion-control": { eyebrow: "Motion Control", title: "Make characters move your way.", copy: "Transfer movement from a reference video while preserving identity, clothing and scene." },
  "/lip-sync": { eyebrow: "Lip Sync", title: "Natural speech, in every language.", copy: "Synchronise any performance with uploaded audio or expressive AI voices." },
  "/ai-effects": { eyebrow: "AI Effects", title: "One click can change the whole scene.", copy: "Use curated effects, transformations and camera moves built for social storytelling." },
  "/enterprise": { eyebrow: "SwiipAI for Enterprise", title: "Creative AI your team can trust.", copy: "Private workflows, custom limits, roles and support for high-volume creative teams." },
  "/api": { eyebrow: "SwiipAI API", title: "Build creativity into your product.", copy: "A clean generation API with unified models, predictable credits and production observability." },
  "/developers": { eyebrow: "Developer platform", title: "One API. Every creative model.", copy: "Ship image, video and audio generation without rebuilding provider infrastructure." },
  "/blog": { eyebrow: "SwiipAI Journal", title: "Ideas for a new creative era.", copy: "Practical guides, model notes and stories from creators building what comes next." },
  "/help": { eyebrow: "Help centre", title: "How can we help you create?", copy: "Find clear guides for generation, billing, models, safety and your account." },
  "/contact": { eyebrow: "Talk to us", title: "We would love to hear from you.", copy: "Contact our product, support or enterprise team and we will route your message." },
  "/terms": { eyebrow: "Legal", title: "Terms of Service", copy: "The principles and terms that keep SwiipAI fair, safe and dependable." },
  "/privacy": { eyebrow: "Legal", title: "Privacy Policy", copy: "How SwiipAI handles, protects and gives you control over your information." },
  "/cookies": { eyebrow: "Legal", title: "Cookie Policy", copy: "How optional analytics and essential site functions use cookies." },
};
