import {
  AudioLines, BadgeDollarSign, Blocks, Bot, Box, Brush, Clapperboard,
  Clock3, CreditCard, Film, FolderKanban, Gauge, ImageIcon,
  KeyRound, LayoutDashboard, LifeBuoy, Mic2, Move3d,
  PanelsTopLeft, ScanFace, Settings2, ShieldCheck, Sparkles, Users, WandSparkles,
} from "lucide-react";

export const publicNav = [
  ["Create", "/app/create"], ["Video", "/ai-video"], ["Image", "/ai-image"],
  ["Effects", "/ai-effects"], ["Explore", "/explore"], ["Pricing", "/pricing"],
  ["API", "/developers"],
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
  { title: "Text to Video", label: "Veo Studio", icon: Film, cost: 40, tint: "blue", desc: "Turn a written idea into a cinematic sequence." },
  { title: "Image to Video", label: "Motion 2.1", icon: Clapperboard, cost: 35, tint: "violet", desc: "Give still images natural, directed movement." },
  { title: "AI Image", label: "Flux Vision", icon: ImageIcon, cost: 8, tint: "pink", desc: "Create polished visuals in any art direction." },
  { title: "Motion Control", label: "Character Lab", icon: Move3d, cost: 55, tint: "cyan", desc: "Transfer motion while preserving character identity." },
  { title: "Lip Sync", label: "Voice Match", icon: ScanFace, cost: 22, tint: "amber", desc: "Synchronise speech naturally in 40+ languages." },
  { title: "AI Audio", label: "Sonic AI", icon: Mic2, cost: 12, tint: "green", desc: "Generate voice, ambience and precise sound effects." },
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
  { name: "Free", price: "$0", credits: "80 credits", copy: "Explore the essentials", features: ["Standard queue", "Community models", "Watermarked video"] },
  { name: "Creator", price: "$12", credits: "1,000 credits", copy: "For a steady creative flow", features: ["Faster generation", "Private creations", "No watermark"] },
  { name: "Pro", price: "$29", credits: "3,500 credits", copy: "For serious creators", features: ["Priority queue", "Advanced models", "API access"], featured: true },
  { name: "Business", price: "$79", credits: "10,000 credits", copy: "For teams and studios", features: ["5 team seats", "Shared assets", "Priority support"] },
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
