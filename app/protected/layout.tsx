import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { AppNav } from "@/components/app-nav";
import { ProtectedShell } from "@/components/protected-shell";
import { hasEnvVars } from "@/lib/utils";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nav = (
    <AppNav
      currentPath="/protected"
      authSlot={!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
    />
  );

  const footer = (
    <footer className="w-full border-t border-emerald-950/10 bg-white/80 text-center text-xs text-zinc-500 dark:border-white/10 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-8 px-5 py-12">
        <p>© {new Date().getFullYear()} Ocarinana · 陶笛谱生成器</p>
        <ThemeSwitcher />
      </div>
    </footer>
  );

  return (
    <ProtectedShell nav={nav} footer={footer}>
      {children}
    </ProtectedShell>
  );
}
