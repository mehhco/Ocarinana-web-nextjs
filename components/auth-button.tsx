import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import { PendingLink } from "@/components/pending-link";

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
      <PendingLink href="/protected/me" className="hidden max-w-44 truncate hover:text-emerald-800 md:inline">
        你好，{email}
      </PendingLink>
      <Button asChild size="sm" variant="outline" className="md:hidden">
        <PendingLink href="/protected/me" pendingText="打开中..." showPendingSpinner>
          我的
        </PendingLink>
      </Button>
      <LogoutButton />
    </div>
  ) : (
    <div className="flex shrink-0 gap-2">
      <Button asChild size="sm" variant="outline">
        <PendingLink href="/auth/login" pendingText="打开中..." showPendingSpinner>
          登录
        </PendingLink>
      </Button>
      <Button asChild size="sm">
        <PendingLink href="/auth/sign-up" pendingText="打开中..." showPendingSpinner>
          注册
        </PendingLink>
      </Button>
    </div>
  );
}
