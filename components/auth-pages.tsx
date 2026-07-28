"use client";

import Link from "next/link";
import { ArrowRight, Check, Code2, Eye, LockKeyhole, Mail, Sparkles } from "lucide-react";
import { Logo } from "./brand";

const copy: Record<string, [string, string, string]> = {
  "/login": ["Welcome back", "Sign in to continue creating.", "Sign in"],
  "/register": ["Create your account", "Start with 80 free credits. No card required.", "Create account"],
  "/forgot-password": ["Reset your password", "We will send a secure reset link to your inbox.", "Send reset link"],
  "/reset-password": ["Choose a new password", "Use at least 10 characters for a stronger account.", "Update password"],
  "/verify-email": ["Check your inbox", "We sent a verification link to your email address.", "Open email app"],
};

export function AuthPage({ path }: { path: string }) {
  const [title, subtitle, action] = copy[path] ?? copy["/login"];
  const isRegister = path === "/register";
  const isVerify = path === "/verify-email";
  return (
    <main className="auth-layout">
      <section className="auth-brand-panel">
        <Link href="/"><Logo /></Link>
        <div className="auth-promise">
          <span className="eyebrow"><i /> CREATIVE AI, BEAUTIFULLY SIMPLE</span>
          <h2>Make the impossible<br />feel <em>effortless.</em></h2>
          <div className="auth-scene"><span /><i /><b><Sparkles size={15} /> Generated with SwiipAI</b></div>
        </div>
        <p>Trusted by creators in 120+ countries</p>
      </section>
      <section className="auth-form-panel">
        <div className="auth-mobile-logo"><Logo /></div>
        <div className="auth-card">
          <h1>{title}</h1><p>{subtitle}</p>
          {!isVerify && <>
            <button className="social-login google"><span>G</span> Continue with Google</button>
            <button className="social-login"><Code2 size={18} /> Continue with GitHub</button>
            <div className="divider"><span>or continue with email</span></div>
            {isRegister && <label>Full name<div className="field"><Sparkles size={16} /><input placeholder="Your name" /></div></label>}
            <label>Email address<div className="field"><Mail size={16} /><input type="email" placeholder="you@example.com" /></div></label>
            {path !== "/forgot-password" && <label>Password<div className="field"><LockKeyhole size={16} /><input type="password" placeholder="••••••••••" /><Eye size={16} /></div></label>}
            {path === "/login" && <div className="form-options"><label><input type="checkbox" /> Remember me</label><Link href="/forgot-password">Forgot password?</Link></div>}
            {isRegister && <label className="terms-line"><input type="checkbox" /> I agree to the Terms and Privacy Policy.</label>}
          </>}
          <Link href={isVerify ? "/app/home" : isRegister ? "/verify-email" : "/app/home"} className="primary auth-submit">{action}<ArrowRight size={17} /></Link>
          {path === "/login" && <p className="auth-switch">New to SwiipAI? <Link href="/register">Create an account</Link></p>}
          {isRegister && <p className="auth-switch">Already have an account? <Link href="/login">Sign in</Link></p>}
          {isVerify && <><div className="verify-icon"><Check /></div><p className="auth-switch">Didn&apos;t receive it? <button>Resend email</button></p></>}
        </div>
      </section>
    </main>
  );
}
