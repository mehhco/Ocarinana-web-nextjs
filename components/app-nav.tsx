import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { AuthButton } from "@/components/auth-button";
import { AppNavTabs, type AppNavItem } from "@/components/app-nav-tabs";
import { isBillingEnabled } from "@/lib/supabase/config";

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
  const showBillingNav = userId
    ? await isBillingEnabled()
        .then(async (enabled) => {
          if (!enabled) return false;

          const { data: tester } = await supabase
            .from("billing_testers")
            .select("active")
            .eq("user_id", userId)
            .eq("active", true)
            .maybeSingle();

          return tester?.active === true;
        })
        .catch(() => false)
    : false;

  const navItems: AppNavItem[] = [
    ...(userId
      ? [
          {
            href: `/${userId}/notes`,
            label: "我的乐谱",
            activeWhen: ["/notes"],
          },
        ]
      : []),
    { href: "/scores", label: "乐谱广场" },
    { href: "/music-classroom", label: "音乐课堂" },
    { href: "/shop", label: "陶笛推荐" },
    ...(showBillingNav ? [{ href: "/protected/billing", label: "订阅内测" }] : []),
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
