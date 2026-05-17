"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ProtectedShellProps {
  children: ReactNode;
  footer: ReactNode;
  nav: ReactNode;
}

export function ProtectedShell({ children, footer, nav }: ProtectedShellProps) {
  const pathname = usePathname();
  const isImmersiveEditor =
    pathname.startsWith("/protected/editor/v2") ||
    pathname.startsWith("/protected/scores");

  return (
    <main
      className={cn(
        "w-full",
        isImmersiveEditor
          ? "flex h-screen min-h-0 overflow-hidden bg-slate-50"
          : "flex min-h-screen flex-col items-center",
      )}
    >
      <div
        className={cn(
          "w-full flex-1",
          isImmersiveEditor
            ? "flex min-h-0 flex-col overflow-hidden"
            : "flex flex-col items-center",
        )}
      >
        {!isImmersiveEditor && nav}
        <div
          className={cn(
            "flex w-full flex-1 flex-col",
            isImmersiveEditor ? "min-h-0 overflow-hidden p-0" : "p-5",
          )}
        >
          {children}
        </div>
        {!isImmersiveEditor && footer}
      </div>
    </main>
  );
}
