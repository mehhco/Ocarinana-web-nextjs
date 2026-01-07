import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app-nav";
import { LazyThemeSwitcher, LazyScoreListClient } from "@/components/lazy-components";
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "我的乐谱 - Ocarinana",
  description: "管理你的数字简谱与陶笛指法谱",
  robots: {
    index: false, // 用户个人页面不应被搜索引擎索引
    follow: false,
  },
};

interface PageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default async function UserNotesPage({ params }: PageProps) {
  const { userId } = await params;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  // 验证用户身份
  if (!user || user.id !== userId) {
    redirect("/auth/login");
  }

  // 获取用户的所有乐谱
  const { data: scoresData, error } = await supabase
    .from("scores")
    .select("score_id, title, document, created_at, updated_at")
    .eq("owner_user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch scores:", error);
    return (
      <main className="min-h-screen flex flex-col">
        <AppNav currentPath={`/${userId}/notes`} />
        <div className="flex-1 w-full max-w-6xl mx-auto px-5 py-16">
          <p className="text-center text-red-500">加载乐谱失败，请刷新页面重试</p>
        </div>
      </main>
    );
  }

  // 格式化数据
  const scores = (scoresData || []).map((row) => ({
    scoreId: row.score_id,
    title: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    settings: {
      keySignature: row.document?.settings?.keySignature || "C",
      timeSignature: row.document?.settings?.timeSignature || "4/4",
    },
  }));

  return (
    <main className="min-h-screen flex flex-col">
      {/* 顶部导航 */}
      <AppNav currentPath={`/${userId}/notes`} />

      {/* 主内容区域 */}
      <div className="flex-1 w-full max-w-6xl mx-auto px-5 py-8 space-y-6">
        {/* 标题区域 */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">我的乐谱</h1>
            <p className="text-sm text-muted-foreground mt-1">
              管理你的数字简谱与陶笛指法谱
            </p>
          </div>
          <Button asChild size="lg" className="gap-2">
            <Link href="/protected/scores/new">
              <Plus className="h-5 w-5" />
              新建
            </Link>
          </Button>
        </div>

        {/* 乐谱列表（懒加载客户端组件） */}
        <LazyScoreListClient initialScores={scores} />
      </div>

      {/* 页脚 */}
      <footer className="w-full flex items-center justify-center border-t text-center text-xs gap-8 py-10 mt-12">
        <p>© {new Date().getFullYear()} Ocarinana · 陶笛谱生成器</p>
        <LazyThemeSwitcher />
      </footer>
    </main>
  );
}

