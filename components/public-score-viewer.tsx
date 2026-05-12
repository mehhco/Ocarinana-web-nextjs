"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "@/components/ui/icons";
import { ScoreCanvas } from "@/components/editor/core/ScoreCanvas";
import { ScoreScaleControl } from "@/components/editor/core/ScoreScaleControl";
import { useScoreStore } from "@/components/editor/hooks/useScoreStore";
import { useScoreDisplayScale } from "@/components/editor/hooks/useScoreDisplayScale";
import { exportAsImage } from "@/components/editor/lib/exportUtils";
import { showError, showSuccess } from "@/lib/toast";
import type { ScoreDocument } from "@/lib/editor/types";

interface PublicScoreViewerProps {
  document: Partial<ScoreDocument>;
  isAuthenticated: boolean;
}

export function PublicScoreViewer({ document, isAuthenticated }: PublicScoreViewerProps) {
  const initialize = useScoreStore((state) => state.initialize);
  const title = useScoreStore((state) => state.document.title);
  const setExporting = useScoreStore((state) => state.setExporting);
  const isExporting = useScoreStore((state) => state.isExporting);
  const exportRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [displayScale, setDisplayScale] = useScoreDisplayScale();

  useEffect(() => {
    initialize(document);
    setReady(true);
  }, [document, initialize]);

  const handleExport = useCallback(async () => {
    if (isExporting) return;

    if (!isAuthenticated) {
      const next = `${window.location.pathname}${window.location.search}`;
      window.location.assign(`/auth/login?next=${encodeURIComponent(next)}`);
      return;
    }

    setExporting(true);
    try {
      await new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => resolve());
        });
      });

      await exportAsImage(exportRef, title);
      showSuccess("图片已导出");
    } catch (error) {
      console.error("Failed to export public score", error);
      showError(error instanceof Error ? error.message : "图片导出失败");
    } finally {
      setExporting(false);
    }
  }, [isAuthenticated, isExporting, setExporting, title]);

  if (!ready) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-lg border bg-white text-sm text-muted-foreground">
        正在加载乐谱...
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-end gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2">
        <ScoreScaleControl value={displayScale} onChange={setDisplayScale} />
        <Button size="sm" variant="outline" onClick={handleExport} disabled={isExporting}>
          <ImageIcon className="h-4 w-4" />
          {isExporting ? "导出中" : "导出图片"}
        </Button>
      </div>
      <div className="h-[70vh] min-h-[520px] bg-white">
        <ScoreCanvas exportRef={exportRef} readOnly displayScale={displayScale} />
      </div>
    </div>
  );
}
