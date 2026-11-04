"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LoadingButtonContent } from "@/components/loading-button-content";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PendingLink } from "@/components/pending-link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type RecoveryLinkState =
  | { status: "checking" }
  | { status: "ready" }
  | { status: "invalid"; reason: string };

const EMPTY_LINK_REASON =
  "当前地址中没有重置密码所需的凭证，请从密码重置邮件中的链接进入本页。";

function getInvalidLinkReason(searchParams: URLSearchParams, hashParams: URLSearchParams) {
  const errorCode = searchParams.get("error_code") ?? hashParams.get("error_code");
  const errorDescription =
    searchParams.get("error_description") ?? hashParams.get("error_description");

  if (errorCode === "otp_expired") {
    return "该重置链接已过期。出于安全考虑，重置链接只能使用一次且有时效性。";
  }

  if (errorCode === "access_denied") {
    return "该重置链接已被使用或已失效，请重新申请一封重置邮件。";
  }

  if (errorDescription) {
    return "重置链接无效或已过期，请重新申请一封重置邮件。";
  }

  const hasCredential =
    searchParams.has("code") ||
    searchParams.has("token_hash") ||
    hashParams.has("access_token") ||
    hashParams.has("refresh_token");

  if (hasCredential) {
    // Supabase (PKCE) stores the code verifier in the browser that requested the reset.
    // Landing here without a session means the link was opened somewhere else, or it expired.
    return "无法在当前浏览器中恢复登录状态：重置链接通常需要在申请重置密码的同一浏览器中打开。";
  }

  return EMPTY_LINK_REASON;
}

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [linkState, setLinkState] = useState<RecoveryLinkState>({
    status: "checking",
  });
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function resolveRecoverySession() {
      try {
        // Reading the session lets supabase-js parse the recovery credentials that the
        // email link put in the URL, so the form knows whether it can actually be used.
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (cancelled) {
          return;
        }

        if (session) {
          setLinkState({ status: "ready" });
          return;
        }

        const url = new URL(window.location.href);
        const searchParams = url.searchParams;
        const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));

        setLinkState({
          status: "invalid",
          reason: getInvalidLinkReason(searchParams, hashParams),
        });
      } catch {
        // Never trap the user on the loading state if the session lookup fails.
        if (!cancelled) {
          setLinkState({ status: "ready" });
        }
      }
    }

    void resolveRecoverySession();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      // Update this route to redirect to an authenticated route. The user already has an active session.
      router.replace("/protected");
      router.refresh();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "发生错误");
      setIsLoading(false);
    }
  };

  if (linkState.status === "checking") {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">重置密码</CardTitle>
            <CardDescription>正在校验重置链接...</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">请稍候</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (linkState.status === "invalid") {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">重置链接不可用</CardTitle>
            <CardDescription>{linkState.reason}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                <li>请重新申请一封重置邮件，并点击最新邮件里的链接。</li>
                <li>
                  如果在邮箱 App、微信或其他内置浏览器中点不开，请长按复制链接，粘贴到手机或电脑的浏览器地址栏中打开。
                </li>
                <li>提交重置申请后，请用同一个浏览器完成密码修改。</li>
              </ul>
              <Button asChild className="w-full">
                <PendingLink
                  href="/auth/forgot-password"
                  pendingText="打开中..."
                >
                  重新发送重置邮件
                </PendingLink>
              </Button>
              <div className="text-center text-sm">
                <PendingLink
                  href="/auth/login"
                  className="underline underline-offset-4"
                  pendingText="打开中..."
                >
                  返回登录
                </PendingLink>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">重置密码</CardTitle>
          <CardDescription>请在下方输入您的新密码</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleForgotPassword}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password">新密码</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="请输入新密码"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                <LoadingButtonContent loading={isLoading} loadingText="保存中...">
                  保存新密码
                </LoadingButtonContent>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
