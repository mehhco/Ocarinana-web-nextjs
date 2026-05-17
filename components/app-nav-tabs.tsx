"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface AppNavItem {
  href: string;
  label: string;
  activeWhen?: string[];
}

interface AppNavTabsProps {
  items: AppNavItem[];
  currentPath: string;
  authSlot: ReactNode;
  variant?: "default" | "banner" | "classroom" | "shop";
}

function isActive(pathname: string, item: AppNavItem) {
  if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
    return true;
  }

  return item.activeWhen?.some((pattern) => pathname.includes(pattern)) ?? false;
}

export function AppNavTabs({
  items,
  currentPath,
  authSlot,
  variant = "default",
}: AppNavTabsProps) {
  const pathname = usePathname() || currentPath;
  const router = useRouter();
  const isBanner = variant !== "default";
  const isClassroom = variant === "classroom";
  const isShop = variant === "shop";

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full border-b backdrop-blur-xl",
        variant === "banner" &&
          "border-emerald-950/10 bg-[#e9f5ec] shadow-none supports-[backdrop-filter]:bg-[#e9f5ec]/92 dark:border-white/10 dark:bg-[#061511] dark:supports-[backdrop-filter]:bg-[#061511]/94",
        isClassroom &&
          "border-lime-950/10 bg-[#eef3dd] shadow-none supports-[backdrop-filter]:bg-[#eef3dd]/92 dark:border-white/10 dark:bg-[#111908] dark:supports-[backdrop-filter]:bg-[#111908]/94",
        isShop &&
          "border-teal-950/10 bg-[#e5f3f1] shadow-none supports-[backdrop-filter]:bg-[#e5f3f1]/92 dark:border-white/10 dark:bg-[#061719] dark:supports-[backdrop-filter]:bg-[#061719]/94",
        variant === "default" &&
          "border-emerald-950/10 bg-white/78 shadow-[0_10px_32px_rgba(15,23,42,0.08)] supports-[backdrop-filter]:bg-white/70 dark:border-white/10 dark:bg-zinc-950/76",
      )}
    >
      <div className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-4 py-2 md:h-16 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-7 md:px-5 md:py-0">
        <Link
          href="/"
          className={cn(
            "brand-font min-w-0 truncate text-3xl drop-shadow-sm transition-colors duration-200 md:text-4xl",
            isClassroom && "text-lime-800 hover:text-lime-950 dark:text-lime-200 dark:hover:text-white",
            isShop && "text-teal-800 hover:text-teal-950 dark:text-teal-200 dark:hover:text-white",
            variant === "banner" && "text-emerald-800 hover:text-emerald-950 dark:text-emerald-200 dark:hover:text-white",
            variant === "default" && "text-emerald-700 hover:text-emerald-800",
          )}
          onFocus={() => router.prefetch("/")}
          onMouseEnter={() => router.prefetch("/")}
        >
          Ocarinana
        </Link>

        <div className="justify-self-end md:col-start-3 md:row-start-1">
          {authSlot}
        </div>

        <div className="col-span-2 overflow-x-auto scrollbar-hide md:col-span-1 md:col-start-2 md:row-start-1 md:justify-self-start md:overflow-visible">
          <div
            className={cn(
              "relative inline-flex h-10 min-w-max items-center gap-1",
              isBanner ? "text-emerald-950 dark:text-emerald-50" : "text-zinc-950 dark:text-zinc-50",
            )}
          >
            {items.map((item) => {
              const active = isActive(pathname, item);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onFocus={() => router.prefetch(item.href)}
                  onMouseEnter={() => router.prefetch(item.href)}
                  className={cn(
                    "relative z-10 inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap px-3 text-sm tracking-normal transition-[color,transform] duration-200",
                    "after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:origin-center after:rounded-full after:transition-transform after:duration-300",
                    "hover:-translate-y-0.5",
                    isClassroom && "hover:text-lime-800 dark:hover:text-lime-200",
                    isShop && "hover:text-teal-800 dark:hover:text-teal-200",
                    !isClassroom && !isShop && "hover:text-emerald-800 dark:hover:text-emerald-200",
                    active
                      ? cn(
                          "font-semibold after:scale-x-100",
                          isClassroom &&
                            "text-lime-800 after:bg-lime-700 after:shadow-[0_0_18px_rgba(132,204,22,0.24)] dark:text-lime-100 dark:after:bg-lime-300 dark:after:shadow-[0_0_18px_rgba(190,242,100,0.22)]",
                          isShop &&
                            "text-teal-800 after:bg-teal-700 after:shadow-[0_0_18px_rgba(20,184,166,0.24)] dark:text-teal-100 dark:after:bg-teal-300 dark:after:shadow-[0_0_18px_rgba(94,234,212,0.22)]",
                          !isClassroom &&
                            !isShop &&
                            "text-emerald-800 after:bg-emerald-600 after:shadow-[0_0_18px_rgba(16,185,129,0.2)] dark:text-emerald-100 dark:after:bg-emerald-300",
                          variant === "banner" &&
                            "after:bg-emerald-700 after:shadow-[0_0_18px_rgba(16,185,129,0.28)] dark:after:bg-emerald-300 dark:after:shadow-[0_0_18px_rgba(110,231,183,0.24)]",
                        )
                      : cn(
                          "font-medium after:scale-x-0",
                          isClassroom && "text-lime-950/70 dark:text-lime-50/72",
                          isShop && "text-teal-950/70 dark:text-teal-50/72",
                          variant === "banner" && "text-emerald-950/70 dark:text-emerald-50/72",
                          variant === "default" && "text-zinc-600 dark:text-zinc-300",
                        ),
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
