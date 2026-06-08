import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { AuthButton } from "@/components/auth-button";
import { AppNavTabs, type AppNavItem } from "@/components/app-nav-tabs";
import { isAdminUserId } from "@/lib/admin/access";

interface AppNavProps {
  currentPath?: string;
  authSlot?: ReactNode;
  variant?: "default" | "banner" | "classroom" | "shop";
}

export async function AppNav({
  currentPath = "/",
  authSlot,
  variant = "default",
}: AppNavProps) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  const userEmail = typeof data?.claims?.email === "string" ? data.claims.email : null;
  const isAdmin = await isAdminUserId(userId);

  const navItems: AppNavItem[] = [
    ...(userId
      ? [
          {
            href: "/protected/me/scores",
            label: "我的",
            activeWhen: ["/protected/me", "/notes"],
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            href: "/protected/admin",
            label: "后台",
            activeWhen: ["/protected/admin"],
          },
        ]
      : []),
    { href: "/scores", label: "乐谱广场" },
    { href: "/music-classroom", label: "音乐课堂" },
    { href: "/shop", label: "陶笛推荐" },
  ];

  return (
    <AppNavTabs
      items={navItems}
      currentPath={currentPath}
      authSlot={authSlot ?? <AuthButton userEmail={userEmail} />}
      variant={variant}
    />
  );
}
