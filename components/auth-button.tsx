import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

interface AuthButtonProps {
  userEmail?: string | null;
}

export async function AuthButton({ userEmail }: AuthButtonProps = {}) {
  let email = userEmail;

  if (typeof userEmail === "undefined") {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    email = typeof data?.claims?.email === "string" ? data.claims.email : null;
  }

  return email ? (
    <div className="flex min-w-0 items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
      <Link href="/protected/me" className="hidden max-w-44 truncate hover:text-emerald-800 md:inline">
        你好，{email}
      </Link>
      <Button asChild size="sm" variant="outline" className="md:hidden">
        <Link href="/protected/me">我的</Link>
      </Button>
      <LogoutButton />
    </div>
  ) : (
    <div className="flex shrink-0 gap-2">
      <Button asChild size="sm" variant="outline">
        <Link href="/auth/login">登录</Link>
      </Button>
      <Button asChild size="sm">
        <Link href="/auth/sign-up">注册</Link>
      </Button>
    </div>
  );
}
