import Link from "next/link";
import type { Metadata } from "next";
import { ScoreEditor } from "@/components/editor/core/ScoreEditor";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "免费试用陶笛谱编辑器 - Ocarinana",
  description: "无需登录，立即试用 Ocarinana 在线陶笛谱编辑器，制作数字简谱与陶笛指法图。",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PublicEditorPage() {
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
            <Link href="/auth/login">登录保存</Link>
          </Button>
        </div>
      </div>
      <div className="min-h-0 flex-1">
        <ScoreEditor backHref="/" />
      </div>
    </main>
  );
}
