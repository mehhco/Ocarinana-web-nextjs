import type { Metadata } from "next";
import Link from "next/link";
import { AppNav } from "@/components/app-nav";
import { LazyThemeSwitcher } from "@/components/lazy-components";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EyeIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "游客浏览次数已用完 - Ocarinana",
  robots: {
    index: false,
    follow: false,
  },
};

export default function GuestScoreLimitPage() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      <AppNav currentPath="/scores/guest-limit" />

      <div className="flex flex-1 items-center justify-center px-5 py-12">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <EyeIcon className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl">今日游客浏览次数已用完</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-center">
            <p className="text-sm leading-6 text-muted-foreground">
              游客每天可以浏览 3 首公开乐谱的详情。注册或登录后，可以继续浏览乐谱广场里的所有公开乐谱。
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link href="/auth/sign-up">注册账号</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/auth/login">登录</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/scores">返回广场</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <footer className="w-full flex items-center justify-center border-t text-center text-xs gap-8 py-10">
        <p>© {new Date().getFullYear()} Ocarinana · 陶笛谱生成器</p>
        <LazyThemeSwitcher />
      </footer>
    </main>
  );
}
