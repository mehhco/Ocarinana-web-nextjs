import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { PublicScoreViewer } from "@/components/public-score-viewer";
import { LazyThemeSwitcher } from "@/components/lazy-components";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { createClient } from "@/lib/supabase/server";
import type { ScoreDocument } from "@/lib/editor/types";

export const metadata: Metadata = {
  title: "公开乐谱 - Ocarinana",
  robots: {
    index: false,
    follow: true,
  },
};

interface PublicScorePageProps {
  params: Promise<{
    id: string;
  }>;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "未知时间";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function isV2Document(document: unknown): document is Partial<ScoreDocument> {
  if (!document || typeof document !== "object") return false;
  const measures = (document as { measures?: unknown }).measures;
  return Array.isArray(measures) && measures.every((measure) => {
    return !!measure && typeof measure === "object" && Array.isArray((measure as { elements?: unknown }).elements);
  });
}

export default async function PublicScorePage({ params }: PublicScorePageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("scores")
    .select("score_id, title, document, updated_at, published_at, public_author_label")
    .eq("score_id", id)
    .eq("is_public", true)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const document = data.document;
  const settings = document?.settings || {};
  const normalizedDocument = isV2Document(document)
    ? {
        ...document,
        scoreId: data.score_id,
        title: document.title || data.title,
        updatedAt: data.updated_at,
      }
    : null;

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <AppNav currentPath={`/scores/${id}`} />

      <div className="flex-1 w-full max-w-6xl mx-auto px-5 py-8 space-y-6">
        <Button asChild variant="ghost" size="sm" className="px-0">
          <Link href="/scores">
            <ArrowLeftIcon className="h-4 w-4" />
            返回乐谱广场
          </Link>
        </Button>

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold">{data.title}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">1={settings.keySignature || "C"}</Badge>
              <Badge variant="outline">{settings.timeSignature || "4/4"}</Badge>
              {settings.showTempo !== false && (
                <Badge variant="outline">速度 {settings.tempo || 120}</Badge>
              )}
            </div>
          </div>
          <div className="rounded-lg border bg-card px-4 py-3 text-sm text-muted-foreground">
            <div>作者：{data.public_author_label || "匿名用户"}</div>
            <div>公开于：{formatDate(data.published_at)}</div>
          </div>
        </div>

        {normalizedDocument ? (
          <PublicScoreViewer document={normalizedDocument} isAuthenticated={Boolean(user)} />
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <h2 className="text-lg font-semibold">暂不支持预览旧版乐谱</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                这首乐谱使用旧版数据格式，当前广场只展示它的公开信息。
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <footer className="w-full flex items-center justify-center border-t text-center text-xs gap-8 py-10 mt-12">
        <p>© {new Date().getFullYear()} Ocarinana · 陶笛谱生成器</p>
        <LazyThemeSwitcher />
      </footer>
    </main>
  );
}
