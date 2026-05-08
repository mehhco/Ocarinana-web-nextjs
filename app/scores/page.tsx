import type { Metadata } from "next";
import Link from "next/link";
import { AppNav } from "@/components/app-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EyeIcon, MusicIcon, SearchIcon } from "@/components/ui/icons";
import { LazyThemeSwitcher } from "@/components/lazy-components";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "乐谱广场 - Ocarinana",
  description: "浏览 Ocarinana 用户主动公开分享的陶笛数字简谱。",
  robots: {
    index: true,
    follow: true,
  },
};

interface ScoresSquarePageProps {
  searchParams: Promise<{
    q?: string;
    key?: string;
    time?: string;
    sort?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 12;
const KEY_OPTIONS = ["C", "F", "G"];
const TIME_OPTIONS = ["2/4", "3/4", "4/4", "6/8", "9/8", "12/8"];
const SORT_OPTIONS = [
  { value: "published", label: "最新公开" },
  { value: "updated", label: "最近更新" },
  { value: "title", label: "标题" },
];

function formatDate(value: string | null | undefined): string {
  if (!value) return "未知时间";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function createPageHref(params: Record<string, string | undefined>, page: number): string {
  const search = new URLSearchParams();

  Object.entries({ ...params, page: String(page) }).forEach(([key, value]) => {
    if (value && value !== "all" && !(key === "page" && value === "1")) {
      search.set(key, value);
    }
  });

  const query = search.toString();
  return query ? `/scores?${query}` : "/scores";
}

export default async function ScoresSquarePage({ searchParams }: ScoresSquarePageProps) {
  const params = await searchParams;
  const q = (params.q || "").trim();
  const key = params.key || "all";
  const time = params.time || "all";
  const sort = params.sort || "published";
  const page = Math.max(1, Number.parseInt(params.page || "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const supabase = await createClient();
  let query = supabase
    .from("scores")
    .select("score_id, title, document, updated_at, published_at, public_author_label", { count: "exact" })
    .eq("is_public", true);

  if (q) {
    query = query.ilike("title", `%${q}%`);
  }

  if (key !== "all") {
    query = query.eq("document->settings->>keySignature", key);
  }

  if (time !== "all") {
    query = query.eq("document->settings->>timeSignature", time);
  }

  if (sort === "updated") {
    query = query.order("updated_at", { ascending: false });
  } else if (sort === "title") {
    query = query.order("title", { ascending: true });
  } else {
    query = query.order("published_at", { ascending: false, nullsFirst: false });
  }

  const { data, error, count } = await query.range(offset, offset + PAGE_SIZE - 1);
  const total = count || 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <AppNav currentPath="/scores" />

      <div className="flex-1 w-full max-w-6xl mx-auto px-5 py-8 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">乐谱广场</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              浏览用户主动公开分享的陶笛数字简谱。
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/protected/editor/v2/new">创作新乐谱</Link>
          </Button>
        </div>

        <form className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-[1fr_160px_160px_160px_auto]">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input name="q" defaultValue={q} placeholder="搜索乐谱标题..." className="pl-9" />
          </div>
          <Select name="key" defaultValue={key}>
            <SelectTrigger>
              <SelectValue placeholder="全部调号" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部调号</SelectItem>
              {KEY_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  1={option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select name="time" defaultValue={time}>
            <SelectTrigger>
              <SelectValue placeholder="全部拍号" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部拍号</SelectItem>
              {TIME_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select name="sort" defaultValue={sort}>
            <SelectTrigger>
              <SelectValue placeholder="排序" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit">筛选</Button>
        </form>

        {error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
            加载公开乐谱失败，请稍后重试。
          </div>
        ) : total === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border py-20 text-center">
            <div className="rounded-full bg-muted p-6">
              <MusicIcon className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="mt-5 text-xl font-semibold">还没有匹配的公开乐谱</h2>
            <p className="mt-2 text-sm text-muted-foreground">换个关键词或筛选条件试试。</p>
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground">共找到 {total} 首公开乐谱</div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(data || []).map((score) => {
                const settings = score.document?.settings || {};

                return (
                  <Card key={score.score_id} className="transition-shadow hover:shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="line-clamp-2 text-lg leading-snug">
                        <Link href={`/scores/${score.score_id}`} className="hover:text-emerald-600">
                          {score.title}
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">1={settings.keySignature || "C"}</Badge>
                        <Badge variant="outline">{settings.timeSignature || "4/4"}</Badge>
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div>作者：{score.public_author_label || "匿名用户"}</div>
                        <div>公开于：{formatDate(score.published_at)}</div>
                      </div>
                      <Button asChild size="sm" className="w-full">
                        <Link href={`/scores/${score.score_id}`}>
                          <EyeIcon className="h-4 w-4" />
                          查看乐谱
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                {page <= 1 ? (
                  <Button variant="outline" size="sm" disabled>
                    上一页
                  </Button>
                ) : (
                  <Button asChild variant="outline" size="sm">
                    <Link href={createPageHref({ q, key, time, sort }, page - 1)}>上一页</Link>
                  </Button>
                )}
                <span className="text-sm text-muted-foreground">
                  第 {page} / {totalPages} 页
                </span>
                {page >= totalPages ? (
                  <Button variant="outline" size="sm" disabled>
                    下一页
                  </Button>
                ) : (
                  <Button asChild variant="outline" size="sm">
                    <Link href={createPageHref({ q, key, time, sort }, page + 1)}>下一页</Link>
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <footer className="w-full flex items-center justify-center border-t text-center text-xs gap-8 py-10 mt-12">
        <p>© {new Date().getFullYear()} Ocarinana · 陶笛谱生成器</p>
        <LazyThemeSwitcher />
      </footer>
    </main>
  );
}
