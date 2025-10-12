import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import NewScoreButton from "@/components/new-score-button";
import { Metadata } from "next";
import { AppNav } from "@/components/app-nav";
import { ThemeSwitcher } from "@/components/theme-switcher";

export const metadata: Metadata = {
  title: "我的 - Ocarinana",
  description: "管理你的账户与作品",
};

export default async function HomeDashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  if (!user) {
    return (
      <main className="min-h-screen flex flex-col">
        {/* 顶部导航 */}
        <AppNav currentPath="/home" />
        
        <div className="flex-1 w-full max-w-5xl mx-auto px-5 py-16">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">欢迎来到 Ocarinana</h1>
            <p className="text-foreground/70">登录后即可创建、保存并管理你的数字简谱与陶笛指法谱。</p>
            <div className="flex items-center justify-center gap-4 pt-2">
              <Button asChild>
                <Link href="/auth/login">登录</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/auth/sign-up">注册</Link>
              </Button>
            </div>
            <p className="text-xs text-foreground/60">无需安装，打开即用；支持图片导出与本地保存。</p>
          </div>
        </div>

        {/* 页脚 */}
        <footer className="w-full flex items-center justify-center border-t text-center text-xs gap-8 py-10">
          <p>© {new Date().getFullYear()} Ocarinana · 陶笛谱生成器</p>
          <ThemeSwitcher />
        </footer>
      </main>
    );
  }

  // 查询当前用户乐谱数量
  const { count: notesCount } = await supabase
    .from("scores")
    .select("score_id", { count: "exact", head: true })
    .eq("owner_user_id", user.id);
  const fakeNotesCount = typeof notesCount === "number" ? notesCount : 0;
  const fakeCredits = 120;
  const userId = user.id;

  return (
    <main className="min-h-screen flex flex-col">
      {/* 顶部导航 */}
      <AppNav currentPath="/home" />

      <div className="flex-1 w-full max-w-6xl mx-auto px-5 py-12 grid gap-8">
        <div>
          <h1 className="text-2xl font-bold">我的</h1>
          <p className="text-sm text-foreground/60 mt-1">管理你的账户与作品</p>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>账户信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-foreground/60">昵称：</span>
              <span>{user.user_metadata?.full_name || user.user_metadata?.name || "未设置"}</span>
            </div>
            <div>
              <span className="text-foreground/60">邮箱：</span>
              <span>{user.email}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>我的乐谱</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-3">
              <Link href={`/${userId}/notes`} className="text-3xl font-extrabold hover:underline">
                {fakeNotesCount}
              </Link>
              <NewScoreButton />
            </div>
            <div className="text-xs text-foreground/60 mt-1">点击查看全部乐谱</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>账户点数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold">{fakeCredits}</div>
            <div className="text-xs text-foreground/60 mt-1">用于高级导出、模板与增值服务</div>
            <div className="mt-3">
              <Button size="sm" variant="secondary">充值</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>开始创作</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-foreground/70">直接前往编辑器创建新的乐谱。</p>
            <Button asChild>
              <Link href="/protected/scores/new">打开编辑器</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>帮助与支持</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-foreground/70">
            <p>常见问题与教程即将上线，敬请期待。</p>
            <div className="text-xs">如有问题，欢迎反馈以便我们持续改进体验。</div>
          </CardContent>
        </Card>
      </div>
    </div>

    {/* 页脚 */}
    <footer className="w-full flex items-center justify-center border-t text-center text-xs gap-8 py-10">
      <p>© {new Date().getFullYear()} Ocarinana · 陶笛谱生成器</p>
      <ThemeSwitcher />
    </footer>
  </main>
  );
}


