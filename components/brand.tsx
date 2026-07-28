"use client";

import Link from "next/link";
import { Moon, Sun } from "lucide-react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="brand" aria-label="SwiipAI home">
      <span className="brand-mark" aria-hidden="true">
        <i />
        <i />
      </span>
      {!compact && <span>Swiip<span>AI</span></span>}
    </Link>
  );
}

export function ThemeButton({
  light,
  onClick,
}: {
  light: boolean;
  onClick: () => void;
}) {
  return (
    <button className="icon-button" onClick={onClick} aria-label="Toggle theme">
      {light ? <Moon size={17} /> : <Sun size={17} />}
    </button>
  );
}

export function StatusPill({ children, tone = "live" }: { children: React.ReactNode; tone?: string }) {
  return <span className={`status-pill ${tone}`}><i />{children}</span>;
}
