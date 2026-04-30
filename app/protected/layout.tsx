import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col items-center">
        <nav className="relative flex h-16 w-full items-center justify-center border-b border-b-foreground/10 px-5 text-sm">
          <Link
            href={"/"}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-semibold"
          >
            Ocarinana 陶笛谱生成器
          </Link>
          <div className="ml-auto flex items-center">
            {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
          </div>
        </nav>
        <div className="flex-1 flex flex-col w-full p-5">
          {children}
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>© {new Date().getFullYear()} Ocarinana · 陶笛谱生成器</p>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}
