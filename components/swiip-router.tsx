"use client";

import { useEffect, useState } from "react";
import { AdminApp } from "./admin-shell";
import { UserApp } from "./app-shell";
import { AuthPage } from "./auth-pages";
import { HomePage, PublicDetail } from "./public-site";

const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];

export function SwiipRouter({ path }: { path: string }) {
  const [light, setLight] = useState(false);
  useEffect(() => {
    document.documentElement.dataset.theme = light ? "light" : "dark";
  }, [light]);

  if (path.startsWith("/admin")) return <AdminApp path={path} />;
  if (path.startsWith("/app")) return <UserApp path={path === "/app" ? "/app/home" : path} />;
  if (authRoutes.includes(path)) return <AuthPage path={path} />;
  if (path === "/") return <HomePage light={light} toggleTheme={() => setLight(!light)} />;
  if (path === "/pricing") return <HomePage light={light} toggleTheme={() => setLight(!light)} />;
  if (path === "/explore") return <UserApp path="/app/community" />;
  return <PublicDetail path={path} light={light} toggleTheme={() => setLight(!light)} />;
}
