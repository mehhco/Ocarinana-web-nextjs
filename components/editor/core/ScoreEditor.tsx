'use client';

import { useCallback, useEffect, memo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useScoreStore } from '../hooks/useScoreStore';
import { Toolbar } from './Toolbar';
import { ElementPanel } from './ElementPanel';
import { ScoreCanvas } from './ScoreCanvas';
import { exportAsImage } from '../lib/exportUtils';
import { useAutoSave } from '../hooks/useAutoSave';
import { EDITOR_SCORE_DISPLAY_SCALE_STORAGE_KEY, useScoreDisplayScale } from '../hooks/useScoreDisplayScale';
import { showError, showSuccess, showToast } from '@/lib/toast';
import type { ScoreDocument } from '@/lib/editor/types';

interface ScoreEditorProps {
  initialDocument?: Partial<ScoreDocument>;
  scoreId?: string;
  backHref?: string;
}

export const ScoreEditor = memo(function ScoreEditor({ initialDocument, scoreId, backHref }: ScoreEditorProps) {
  const router = useRouter();
  const initialize = useScoreStore((state) => state.initialize);
  const documentTitle = useScoreStore((state) => state.document.title);
  const setExporting = useScoreStore((state) => state.setExporting);
  const isExporting = useScoreStore((state) => state.isExporting);
  const deleteSelectedElement = useScoreStore((state) => state.deleteSelectedElement);
  const scoreExportRef = useRef<HTMLDivElement>(null);
  const { isDirty, isSaving, saveNow } = useAutoSave(scoreId);
  const [displayScale, setDisplayScale] = useScoreDisplayScale(EDITOR_SCORE_DISPLAY_SCALE_STORAGE_KEY);

  useEffect(() => {
    initialize(initialDocument);
  }, [initialize, initialDocument]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Delete' || event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      if (event.target instanceof HTMLElement) {
        const tagName = event.target.tagName;
        if (
          event.target.isContentEditable ||
          tagName === 'INPUT' ||
          tagName === 'TEXTAREA' ||
          tagName === 'SELECT'
        ) {
          return;
        }
      }

      event.preventDefault();
      deleteSelectedElement();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelectedElement]);

  const reserveGuestExport = useCallback(async () => {
    if (scoreId) return true;

    const response = await fetch('/api/guest-export-limit', {
      method: 'POST',
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok || !payload?.allowed) {
      showError(payload?.error || '今日游客导出次数已用完，请注册登录后继续导出。');
      return false;
    }

    if (typeof payload.remaining === 'number') {
      showToast(`游客今日还可导出 ${payload.remaining} 次`);
    }

    return true;
  }, [scoreId]);

  const handleExportImage = useCallback(async () => {
    if (isExporting) return;

    setExporting(true);

    try {
      const canExport = await reserveGuestExport();
      if (!canExport) return;

      await new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => resolve());
        });
      });

      await exportAsImage(scoreExportRef, documentTitle);
      showSuccess('图片已导出');
    } catch (error) {
      console.error('Failed to export score image', error);
      showError(error instanceof Error ? error.message : '图片导出失败');
    } finally {
      setExporting(false);
    }
  }, [documentTitle, isExporting, reserveGuestExport, setExporting]);

  const handleManualSave = useCallback(async () => {
    if (!scoreId) {
      router.push('/auth/login');
      return;
    }

    const result = await saveNow();

    if (result.success) {
      showSuccess(result.skipped ? '没有需要保存的更改' : '乐谱已保存');
      return;
    }

    showError(result.error || '保存失败');
  }, [router, saveNow, scoreId]);

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-slate-50">
      <Toolbar
        isDirty={isDirty}
        isSaving={isSaving}
        cloudSaveAvailable={Boolean(scoreId)}
        backHref={backHref}
        displayScale={displayScale}
        onExportImage={handleExportImage}
        onSave={handleManualSave}
        onDisplayScaleChange={setDisplayScale}
      />
      <div className="flex flex-1 justify-center overflow-hidden px-3 pb-3 pt-1.5">
        <div className="flex h-full min-h-0 w-[80vw] min-w-[1000px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-md">
          <div className="h-full min-h-0 w-1/3 overflow-hidden border-r border-slate-200 bg-slate-50/50">
            <ElementPanel />
          </div>
          <div className="h-full min-h-0 w-2/3 overflow-hidden bg-white">
            <ScoreCanvas exportRef={scoreExportRef} displayScale={displayScale} />
          </div>
        </div>
      </div>
    </div>
  );
});
