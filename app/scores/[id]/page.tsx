import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { AppNav } from "@/components/app-nav";
import { PublicScoreViewer } from "@/components/public-score-viewer";
import { PublicScoreShare } from "@/components/public-score-share";
import { LazyThemeSwitcher } from "@/components/lazy-components";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeftIcon, ArrowUpRightIcon, MusicIcon } from "@/components/ui/icons";
import { BreadcrumbSchema, MusicScoreSchema } from "@/components/seo/structured-data";
import { createClient } from "@/lib/supabase/server";
import { SiteOwnerContact } from "../../site-owner-contact";
import {
  SITE_NAME,
  absoluteUrl,
  defaultOpenGraphImage,
  siteUrl,
} from "@/lib/seo/site";
import type { ScoreDocument } from "@/lib/editor/types";

type PublicScoreRecord = {
  score_id: string;
  title: string;
  document: Partial<ScoreDocument> | null;
  updated_at: string | null;
  published_at: string | null;
  public_author_label: string | null;
};

type RelatedPublicScoreRecord = Pick<
  PublicScoreRecord,
  "score_id" | "title" | "document" | "published_at"
>;

interface PublicScorePageProps {
  params: Promise<{
    id: string;
  }>;
}

const getPublicScore = cache(async (id: string): Promise<PublicScoreRecord | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("scores")
    .select("score_id, title, document, updated_at, published_at, public_author_label")
    .eq("score_id", id)
    .eq("is_public", true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as PublicScoreRecord;
});

function getScoreSettings(document: unknown): Partial<ScoreDocument["settings"]> {
  if (!document || typeof document !== "object") {
    return {};
  }

  return (document as Partial<ScoreDocument>).settings || {};
}

function getInstrumentLabel(instrumentType: string | undefined) {
  return instrumentType === "6-hole" ? "六孔" : "十二孔";
}

function getScoreDescription(score: PublicScoreRecord) {
  const settings = getScoreSettings(score.document);
  const instrumentLabel = getInstrumentLabel(settings.instrumentType);
  const keySignature = settings.keySignature || "C";
  const timeSignature = settings.timeSignature || "4/4";

  return `${score.title} 是 Ocarinana 乐谱广场公开分享的${instrumentLabel}陶笛数字简谱，调号 1=${keySignature}，拍号 ${timeSignature}，可在线预览谱面与指法图。`;
}

const getRelatedScores = cache(
  async (
    currentScoreId: string,
    instrumentType: string | undefined,
    keySignature: string
  ): Promise<RelatedPublicScoreRecord[]> => {
    const supabase = await createClient();
    const selectColumns = "score_id, title, document, published_at";
    let relatedQuery = supabase
      .from("scores")
      .select(selectColumns)
      .eq("is_public", true)
      .neq("score_id", currentScoreId);

    if (instrumentType === "6-hole") {
      relatedQuery = relatedQuery.eq("document->settings->>instrumentType", "6-hole");
    } else {
      relatedQuery = relatedQuery.or(
        "document->settings->>instrumentType.eq.12-hole,document->settings->>instrumentType.is.null"
      );
    }

    relatedQuery = relatedQuery.eq(
      "document->settings->>keySignature",
      keySignature
    );

    const relatedResult = await relatedQuery
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(3);

    if (!relatedResult.error && relatedResult.data?.length) {
      return relatedResult.data as RelatedPublicScoreRecord[];
    }

    const fallbackResult = await supabase
      .from("scores")
      .select(selectColumns)
      .eq("is_public", true)
      .neq("score_id", currentScoreId)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(3);

    return fallbackResult.error
      ? []
      : ((fallbackResult.data || []) as RelatedPublicScoreRecord[]);
  }
);

export async function generateMetadata({ params }: PublicScorePageProps): Promise<Metadata> {
  const { id } = await params;
  const score = await getPublicScore(id);

  if (!score) {
    return {
      title: "乐谱不存在",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const settings = getScoreSettings(score.document);
  const instrumentLabel = getInstrumentLabel(settings.instrumentType);
  const title = `${score.title} - ${instrumentLabel}陶笛谱`;
  const description = getScoreDescription(score);
  const url = absoluteUrl(`/scores/${score.score_id}`);

  return {
    title,
    description,
    keywords: [
      score.title,
      `${score.title}陶笛谱`,
      `${instrumentLabel}陶笛谱`,
      "陶笛数字简谱",
      "陶笛指法图",
      "Ocarinana 乐谱广场",
    ],
    openGraph: {
      title,
      description,
      type: "article",
      locale: "zh_CN",
      url,
      siteName: SITE_NAME,
      publishedTime: score.published_at || undefined,
      modifiedTime: score.updated_at || undefined,
      images: [
        {
          url: absoluteUrl(defaultOpenGraphImage),
          width: 1200,
          height: 630,
          alt: `${score.title}陶笛谱`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl(defaultOpenGraphImage)],
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
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
  const data = await getPublicScore(id);

  if (!data) {
    notFound();
  }

  const document = data.document;
  const settings = getScoreSettings(document);
  const instrumentLabel = getInstrumentLabel(settings.instrumentType);
  const keySignature = settings.keySignature || "C";
  const timeSignature = settings.timeSignature || "4/4";
  const scoreUrl = absoluteUrl(`/scores/${data.score_id}`);
  const scoreDescription = getScoreDescription(data);
  const relatedScores = await getRelatedScores(
    data.score_id,
    settings.instrumentType,
    keySignature
  );
  const normalizedDocument = isV2Document(document)
    ? {
        ...document,
        scoreId: data.score_id,
        title: document.title || data.title,
        updatedAt: data.updated_at || undefined,
      }
    : null;

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <BreadcrumbSchema
        items={[
          { name: "首页", url: absoluteUrl("/") },
          { name: "乐谱广场", url: absoluteUrl("/scores") },
          { name: data.title, url: scoreUrl },
        ]}
      />
      <MusicScoreSchema
        name={data.title}
        description={scoreDescription}
        url={scoreUrl}
        datePublished={data.published_at}
        dateModified={data.updated_at}
        authorName={data.public_author_label}
        composer={document?.composer || null}
        lyricist={document?.lyricist || null}
        musicalKey={settings.keySignature || "C"}
        timeSignature={settings.timeSignature || "4/4"}
        instrument={`${instrumentLabel}陶笛`}
        publisherUrl={siteUrl}
      />
      <AppNav currentPath={`/scores/${id}`} />

      <div className="flex-1 w-full max-w-6xl mx-auto px-5 py-8 space-y-6">
        <Button asChild variant="ghost" size="sm" className="px-0">
          <Link href="/scores">
            <ArrowLeftIcon className="h-4 w-4" />
            返回乐谱广场
          </Link>
        </Button>

        <section className="rounded-xl border border-zinc-200 bg-card px-4 py-4 md:px-5 md:py-5 dark:border-white/10">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_280px] md:items-start">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">公开乐谱</p>
              <h1 className="mt-1.5 max-w-3xl text-2xl font-bold leading-tight tracking-normal text-foreground md:text-3xl">
                {data.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="outline">{instrumentLabel}陶笛</Badge>
                <Badge variant="outline">1={keySignature}</Badge>
                <Badge variant="outline">{timeSignature}</Badge>
                {settings.showTempo !== false && (
                  <Badge variant="outline">速度 {settings.tempo || 120}</Badge>
                )}
              </div>
              <p className="sr-only">{scoreDescription}</p>
            </div>

            <div className="border-t border-zinc-200 pt-4 md:border-l md:border-t-0 md:pl-5 md:pt-0 dark:border-white/10">
              <div className="mb-3 space-y-1 text-xs text-muted-foreground">
                <p>作者：{data.public_author_label || "匿名用户"}</p>
                <p>公开于：{formatDate(data.published_at)}</p>
              </div>
              <PublicScoreShare
                scoreId={data.score_id}
                title={data.title}
                instrumentLabel={instrumentLabel}
                keySignature={keySignature}
                timeSignature={timeSignature}
                url={scoreUrl}
              />
            </div>
          </div>
        </section>

        {normalizedDocument ? (
          <PublicScoreViewer document={normalizedDocument} />
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

        <section className="grid gap-5 rounded-2xl border border-zinc-200 bg-[#fffdf6] p-5 md:grid-cols-[1fr_auto] md:items-center md:p-6 dark:border-white/10 dark:bg-white/[0.045]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800 dark:text-emerald-300">
              把这份谱用起来
            </p>
            <h2 className="mt-2 text-xl font-bold text-zinc-950 dark:text-white">
              在线跟练、切换指法图，也可以导出打印
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-slate-300">
              先用“指法图”检查换指位置，需要歌词时再打开歌词显示。练习前可以导出图片，分享给同学或放进课堂讲义。
            </p>
          </div>
          <Button asChild className="h-11 bg-emerald-700 px-5 text-white hover:bg-emerald-800">
            <Link href="/editor">
              制作我的陶笛谱
              <ArrowUpRightIcon className="h-4 w-4" />
            </Link>
          </Button>
        </section>

        {relatedScores.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800 dark:text-emerald-300">
                  继续找谱
                </p>
                <h2 className="mt-1 text-2xl font-bold text-zinc-950 dark:text-white">
                  相似公开乐谱
                </h2>
              </div>
              <Link
                href="/scores"
                className="shrink-0 text-sm text-emerald-800 underline-offset-4 hover:underline dark:text-emerald-300"
              >
                浏览乐谱广场
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {relatedScores.map((score) => {
                const relatedSettings = getScoreSettings(score.document);
                const relatedInstrument = getInstrumentLabel(
                  relatedSettings.instrumentType
                );

                return (
                  <Link
                    key={score.score_id}
                    href={`/scores/${score.score_id}`}
                    className="group rounded-xl border border-zinc-200 bg-white p-5 transition-[border-color,transform,box-shadow] hover:-translate-y-0.5 hover:border-emerald-700 hover:shadow-md dark:border-white/10 dark:bg-white/[0.045]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <MusicIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-300" />
                      <ArrowUpRightIcon className="h-4 w-4 text-zinc-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-700" />
                    </div>
                    <h3 className="mt-4 line-clamp-2 text-base font-semibold leading-6 text-zinc-950 group-hover:text-emerald-800 dark:text-white dark:group-hover:text-emerald-300">
                      {score.title}
                    </h3>
                    <p className="mt-3 text-xs text-zinc-500">
                      {relatedInstrument}陶笛 · 1=
                      {relatedSettings.keySignature || "C"} ·{" "}
                      {relatedSettings.timeSignature || "4/4"}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>

      <footer className="mt-12 w-full border-t px-5 py-10 text-xs">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-5">
          <SiteOwnerContact align="center" />
          <div className="flex items-center justify-center gap-8 text-center">
            <p>© {new Date().getFullYear()} Ocarinana · 陶笛谱生成器</p>
            <LazyThemeSwitcher />
          </div>
        </div>
      </footer>
    </main>
  );
}
