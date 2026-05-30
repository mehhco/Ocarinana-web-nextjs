import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { AppNav } from "@/components/app-nav";
import { PublicScoreViewer } from "@/components/public-score-viewer";
import { LazyThemeSwitcher } from "@/components/lazy-components";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { BreadcrumbSchema, MusicScoreSchema } from "@/components/seo/structured-data";
import { createClient } from "@/lib/supabase/server";
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
  const scoreUrl = absoluteUrl(`/scores/${data.score_id}`);
  const scoreDescription = getScoreDescription(data);
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

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold">{data.title}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{instrumentLabel}</Badge>
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
      </div>

      <footer className="w-full flex items-center justify-center border-t text-center text-xs gap-8 py-10 mt-12">
        <p>© {new Date().getFullYear()} Ocarinana · 陶笛谱生成器</p>
        <LazyThemeSwitcher />
      </footer>
    </main>
  );
}
