"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { EyeIcon, EyeOffIcon, ImageIcon } from "@/components/ui/icons";
import { ScoreCanvas } from "@/components/editor/core/ScoreCanvas";
import { ScoreScaleControl } from "@/components/editor/core/ScoreScaleControl";
import { useScoreStore } from "@/components/editor/hooks/useScoreStore";
import { useScoreDisplayScale } from "@/components/editor/hooks/useScoreDisplayScale";
import { exportAsImage } from "@/components/editor/lib/exportUtils";
import { showError, showSuccess, showToast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { ScoreDocument } from "@/lib/editor/types";

const PUBLIC_SCORE_VIEWER_DISPLAY_STORAGE_KEY = "ocarinana.publicScore.viewerDisplay";

interface ViewerDisplayPreferences {
  showLyrics: boolean;
  showFingering: boolean;
}

interface PublicScoreViewerProps {
  document: Partial<ScoreDocument>;
}

function getDefaultViewerDisplayPreferences(document: Partial<ScoreDocument>): ViewerDisplayPreferences {
  return {
    showLyrics: document.settings?.showLyrics ?? false,
    showFingering: document.settings?.showFingering ?? true,
  };
}

function parseStoredViewerDisplayPreferences(value: string | null): ViewerDisplayPreferences | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<ViewerDisplayPreferences>;

    if (typeof parsed.showLyrics !== "boolean" || typeof parsed.showFingering !== "boolean") {
      return null;
    }

    return {
      showLyrics: parsed.showLyrics,
      showFingering: parsed.showFingering,
    };
  } catch {
    return null;
  }
}

function getStoredViewerDisplayPreferences(): ViewerDisplayPreferences | null {
  try {
    return parseStoredViewerDisplayPreferences(window.localStorage.getItem(PUBLIC_SCORE_VIEWER_DISPLAY_STORAGE_KEY));
  } catch {
    return null;
  }
}

function storeViewerDisplayPreferences(preferences: ViewerDisplayPreferences) {
  try {
    window.localStorage.setItem(PUBLIC_SCORE_VIEWER_DISPLAY_STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Ignore storage failures; the current in-memory view state should still work.
  }
}

export function PublicScoreViewer({ document }: PublicScoreViewerProps) {
  const initialize = useScoreStore((state) => state.initialize);
  const title = useScoreStore((state) => state.document.title);
  const setExporting = useScoreStore((state) => state.setExporting);
  const isExporting = useScoreStore((state) => state.isExporting);
  const exportRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [displayScale, setDisplayScale] = useScoreDisplayScale();
  const [viewerDisplay, setViewerDisplay] = useState<ViewerDisplayPreferences>(() =>
    getDefaultViewerDisplayPreferences(document)
  );

  useEffect(() => {
    initialize(document);
    setViewerDisplay(getStoredViewerDisplayPreferences() ?? getDefaultViewerDisplayPreferences(document));
    setReady(true);
  }, [document, initialize]);

  const updateViewerDisplay = useCallback((nextPreferences: ViewerDisplayPreferences) => {
    setViewerDisplay(nextPreferences);
    storeViewerDisplayPreferences(nextPreferences);
  }, []);

  const toggleLyrics = useCallback(() => {
    updateViewerDisplay({
      ...viewerDisplay,
      showLyrics: !viewerDisplay.showLyrics,
    });
  }, [updateViewerDisplay, viewerDisplay]);

  const toggleFingering = useCallback(() => {
    updateViewerDisplay({
      ...viewerDisplay,
      showFingering: !viewerDisplay.showFingering,
    });
  }, [updateViewerDisplay, viewerDisplay]);

  const handleExport = useCallback(async () => {
    if (isExporting) return;

    setExporting(true);
    try {
      const response = await fetch("/api/guest-export-limit", {
        method: "POST",
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.allowed) {
        showError(payload?.error || "今日导出次数已用完，请稍后再试。");
        return;
      }

      if (typeof payload.remaining === "number") {
        showToast(`今日还可导出 ${payload.remaining} 次`);
      }

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
  }, [isExporting, setExporting, title]);

  if (!ready) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-lg border bg-white text-sm text-muted-foreground dark:border-white/10 dark:bg-white/[0.045]">
        正在加载乐谱...
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-950">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 dark:border-white/10 dark:bg-white/[0.045]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">显示</span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            aria-pressed={viewerDisplay.showLyrics}
            onClick={toggleLyrics}
            className={cn(
              "h-8 px-2.5",
              viewerDisplay.showLyrics
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200"
                : "text-slate-500 dark:text-slate-300"
            )}
          >
            {viewerDisplay.showLyrics ? <EyeIcon className="h-4 w-4" /> : <EyeOffIcon className="h-4 w-4" />}
            歌词
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            aria-pressed={viewerDisplay.showFingering}
            onClick={toggleFingering}
            className={cn(
              "h-8 px-2.5",
              viewerDisplay.showFingering
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200"
                : "text-slate-500 dark:text-slate-300"
            )}
          >
            {viewerDisplay.showFingering ? <EyeIcon className="h-4 w-4" /> : <EyeOffIcon className="h-4 w-4" />}
            指法图
          </Button>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <ScoreScaleControl value={displayScale} onChange={setDisplayScale} />
          <Button size="sm" variant="outline" onClick={handleExport} disabled={isExporting}>
            <ImageIcon className="h-4 w-4" />
            {isExporting ? "导出中" : "导出图片"}
          </Button>
        </div>
      </div>
      <div className="h-[70vh] min-h-[520px] overflow-x-auto bg-white">
        <div className="mx-auto h-full w-[760px] max-w-none">
          <ScoreCanvas
            exportRef={exportRef}
            readOnly
            displayScale={displayScale}
            showLyricsOverride={viewerDisplay.showLyrics}
            showFingeringOverride={viewerDisplay.showFingering}
          />
        </div>
      </div>
    </div>
  );
}
