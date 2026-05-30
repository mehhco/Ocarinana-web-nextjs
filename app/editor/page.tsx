import Link from "next/link";
import type { Metadata } from "next";
import { ScoreEditor } from "@/components/editor/core/ScoreEditor";
import { PendingLink } from "@/components/pending-link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DEFAULT_PRODUCER,
  DEFAULT_SETTINGS,
  DEFAULT_TITLE,
  INSTRUMENT_OPTIONS,
} from "@/components/editor/lib/constants";
import type { InstrumentType } from "@/lib/editor/types";

export const metadata: Metadata = {
  title: "免费试用陶笛谱编辑器 - Ocarinana",
  description: "无需登录，立即试用 Ocarinana 在线陶笛谱编辑器，制作六孔或十二孔陶笛数字简谱与指法图。",
  robots: {
    index: false,
    follow: false,
  },
};

interface PublicEditorPageProps {
  searchParams: Promise<{ instrument?: string }>;
}

function isInstrumentType(value: string | undefined): value is InstrumentType {
  return value === "12-hole" || value === "6-hole";
}

function createGuestDocument(instrumentType: InstrumentType) {
  const now = new Date().toISOString();

  return {
    version: "2.0",
    scoreId: `guest-${instrumentType}`,
    title: DEFAULT_TITLE,
    producer: DEFAULT_PRODUCER,
    lyricist: "",
    composer: "",
    additionalInfo: "",
    measures: [{ id: "measure-1", elements: [] }],
    ties: [],
    beams: [],
    expressions: [],
    lyrics: [],
    settings: {
      ...DEFAULT_SETTINGS,
      instrumentType,
    },
    createdAt: now,
    updatedAt: now,
  };
}

export default async function PublicEditorPage({ searchParams }: PublicEditorPageProps) {
  const params = await searchParams;
  const instrumentType = isInstrumentType(params.instrument) ? params.instrument : null;

  if (!instrumentType) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-10">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          <div>
            <Link href="/" className="text-sm font-semibold text-emerald-700">
              Ocarinana
            </Link>
            <h1 className="mt-6 text-2xl font-bold tracking-normal text-slate-900">选择试用的陶笛类型</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              进入编辑器后陶笛类型会锁定，六孔和十二孔会使用各自的音域与指法图。
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {INSTRUMENT_OPTIONS.map((option) => (
              <Card key={option.value} className="border-slate-200 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">{option.label}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="min-h-12 text-sm leading-6 text-slate-600">
                    {option.value === "6-hole"
                      ? "试用六孔陶笛谱制作，支持 C/F/G 调六孔指法图。"
                      : "试用十二孔陶笛谱制作，兼容现有 C/F/G 调十二孔指法图。"}
                  </p>
                  <Button asChild className="w-full">
                    <PendingLink href={`/editor?instrument=${option.value}`} pendingText="打开中..." showPendingSpinner>
                      选择{option.shortLabel}
                    </PendingLink>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-screen min-h-0 w-full flex-col overflow-hidden bg-slate-50">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
        <Link href="/" className="text-sm font-semibold text-emerald-700">
          Ocarinana
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-slate-500 sm:inline">
            当前为试用模式，可导出图片；登录后可保存到云端
          </span>
          <Button asChild size="sm" variant="outline">
            <PendingLink href="/auth/login" pendingText="打开中..." showPendingSpinner>
              登录保存
            </PendingLink>
          </Button>
        </div>
      </div>
      <div className="min-h-0 flex-1">
        <ScoreEditor initialDocument={createGuestDocument(instrumentType)} backHref="/" />
      </div>
    </main>
  );
}
