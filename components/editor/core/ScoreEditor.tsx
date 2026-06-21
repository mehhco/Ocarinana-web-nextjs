'use client';

import { useCallback, useEffect, memo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useScoreStore } from '../hooks/useScoreStore';
import { Toolbar } from './Toolbar';
import { ElementPanel } from './ElementPanel';
import { ScoreCanvas } from './ScoreCanvas';
import { MobileEditorHeader } from '../mobile/MobileEditorHeader';
import { MobileNoteBar } from '../mobile/MobileNoteBar';
import { MobileToolSheet } from '../mobile/MobileToolSheet';
import { ScoreSettingsSheet } from '../mobile/ScoreSettingsSheet';
import { createScoreInCloud, exportAsImage } from '../lib/exportUtils';
import { useAutoSave } from '../hooks/useAutoSave';
import { EDITOR_SCORE_DISPLAY_SCALE_STORAGE_KEY, useScoreDisplayScale } from '../hooks/useScoreDisplayScale';
import { shouldCreateNewScoreInCloud } from '@/lib/editor/cloud-save-policy';
import {
  BARLINE_SHORTCUTS,
  DURATION_SHORTCUTS,
  EDITOR_SHORTCUT_LABELS,
  isEditableShortcutTarget,
  matchesEditorShortcut,
} from '../lib/keyboardShortcuts';
import { showError, showSuccess, showToast } from '@/lib/toast';
import type { BarlineType, Duration, ScoreDocument } from '@/lib/editor/types';

interface ScoreEditorProps {
  initialDocument?: Partial<ScoreDocument>;
  scoreId?: string;
  allowCloudCreate?: boolean;
  backHref?: string;
}

const DURATION_SHORTCUT_ENTRIES = Object.entries(DURATION_SHORTCUTS) as Array<
  [Extract<Duration, '1/4' | '1/8' | '1/16' | '1/32'>, string]
>;
const BARLINE_SHORTCUT_ENTRIES = Object.entries(BARLINE_SHORTCUTS) as Array<[BarlineType, string]>;

export const ScoreEditor = memo(function ScoreEditor({ initialDocument, scoreId, allowCloudCreate = false, backHref }: ScoreEditorProps) {
  const router = useRouter();
  const [currentScoreId, setCurrentScoreId] = useState(scoreId);
  const initialize = useScoreStore((state) => state.initialize);
  const documentTitle = useScoreStore((state) => state.document.title);
  const setExporting = useScoreStore((state) => state.setExporting);
  const setSaving = useScoreStore((state) => state.setSaving);
  const setCloudScoreId = useScoreStore((state) => state.setCloudScoreId);
  const markAsSaved = useScoreStore((state) => state.markAsSaved);
  const getDocumentSnapshot = useScoreStore((state) => state.getDocumentSnapshot);
  const isExporting = useScoreStore((state) => state.isExporting);
  const deleteSelectedElement = useScoreStore((state) => state.deleteSelectedElement);
  const updateNoteDuration = useScoreStore((state) => state.updateNoteDuration);
  const addBarline = useScoreStore((state) => state.addBarline);
  const addExtension = useScoreStore((state) => state.addExtension);
  const toggleAugmentationDot = useScoreStore((state) => state.toggleAugmentationDot);
  const toggleTieMode = useScoreStore((state) => state.toggleTieMode);
  const toggleBeamMode = useScoreStore((state) => state.toggleBeamMode);
  const scoreExportRef = useRef<HTMLDivElement>(null);
  const { isDirty, isSaving, saveNow } = useAutoSave(currentScoreId);
  const [displayScale, setDisplayScale] = useScoreDisplayScale(EDITOR_SCORE_DISPLAY_SCALE_STORAGE_KEY);
  const [isMobileToolSheetOpen, setMobileToolSheetOpen] = useState(false);
  const [isScoreSettingsOpen, setScoreSettingsOpen] = useState(false);

  useEffect(() => {
    initialize(initialDocument);
  }, [initialize, initialDocument]);

  useEffect(() => {
    setCurrentScoreId(scoreId);
  }, [scoreId]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.repeat || isEditableShortcutTarget(event.target)) {
        return;
      }

      let handled = true;

      const durationShortcut = DURATION_SHORTCUT_ENTRIES.find(([, shortcut]) => matchesEditorShortcut(event, shortcut));
      const barlineShortcut = BARLINE_SHORTCUT_ENTRIES.find(([, shortcut]) => matchesEditorShortcut(event, shortcut));

      if (matchesEditorShortcut(event, EDITOR_SHORTCUT_LABELS.deleteSelected)) {
        deleteSelectedElement();
      } else if (durationShortcut) {
        updateNoteDuration(durationShortcut[0]);
      } else if (barlineShortcut) {
        addBarline(barlineShortcut[0]);
      } else if (matchesEditorShortcut(event, EDITOR_SHORTCUT_LABELS.extension)) {
        addExtension();
      } else if (matchesEditorShortcut(event, EDITOR_SHORTCUT_LABELS.augmentationDot)) {
        toggleAugmentationDot();
      } else if (matchesEditorShortcut(event, EDITOR_SHORTCUT_LABELS.tieMode)) {
        toggleTieMode();
      } else if (matchesEditorShortcut(event, EDITOR_SHORTCUT_LABELS.beamMode)) {
        toggleBeamMode();
      } else {
        handled = false;
      }

      if (!handled) {
        return;
      }

      event.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    addBarline,
    addExtension,
    deleteSelectedElement,
    toggleAugmentationDot,
    toggleBeamMode,
    toggleTieMode,
    updateNoteDuration,
  ]);

  const reserveExport = useCallback(async () => {
    const response = await fetch('/api/guest-export-limit', {
      method: 'POST',
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok || !payload?.allowed) {
      showError(payload?.error || '今日导出次数已用完，请稍后再试。');
      return false;
    }

    if (typeof payload.remaining === 'number') {
      showToast(`今日还可导出 ${payload.remaining} 次`);
    }

    return true;
  }, []);

  const handleExportImage = useCallback(async () => {
    if (isExporting) return;

    setExporting(true);

    try {
      const canExport = await reserveExport();
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
  }, [documentTitle, isExporting, reserveExport, setExporting]);

  const createCurrentDraftInCloud = useCallback(async () => {
    const document = getDocumentSnapshot();

    if (!shouldCreateNewScoreInCloud(document)) {
      return { success: true, skipped: true };
    }

    setSaving(true);

    try {
      const result = await createScoreInCloud(document);

      if (result.success && result.scoreId) {
        setCloudScoreId(result.scoreId);
        setCurrentScoreId(result.scoreId);
        router.replace(`/protected/editor/v2?scoreId=${encodeURIComponent(result.scoreId)}`, { scroll: false });
      }

      return result;
    } finally {
      setSaving(false);
    }
  }, [getDocumentSnapshot, router, setCloudScoreId, setSaving]);

  const handleManualSave = useCallback(async () => {
    if (!currentScoreId && !allowCloudCreate) {
      router.push('/auth/login');
      return;
    }

    const result = currentScoreId ? await saveNow() : await createCurrentDraftInCloud();

    if (result.success) {
      showSuccess(result.skipped ? '请先修改标题，或填写作词/作曲后再保存到云端' : '乐谱已保存');
      return;
    }

    showError(result.error || '保存失败');
  }, [allowCloudCreate, createCurrentDraftInCloud, currentScoreId, router, saveNow]);

  const handleBack = useCallback(async () => {
    if (!backHref) return;

    if (!currentScoreId) {
      if (allowCloudCreate && shouldCreateNewScoreInCloud(getDocumentSnapshot())) {
        const result = await createCurrentDraftInCloud();

        if (!result.success || !result.scoreId) {
          showError(result.error || '保存失败，请稍后重试');
          return;
        }
      } else {
        markAsSaved();
      }

      router.push(backHref);
      return;
    }

    if (isDirty) {
      const result = await saveNow();

      if (!result.success) {
        showError(result.error || '保存失败，请稍后重试');
        return;
      }
    }

    router.push(backHref);
  }, [
    allowCloudCreate,
    backHref,
    createCurrentDraftInCloud,
    currentScoreId,
    getDocumentSnapshot,
    isDirty,
    markAsSaved,
    router,
    saveNow,
  ]);

  return (
    <div className="mobile-editor flex h-full min-h-0 w-full flex-col overflow-hidden bg-slate-50">
      <MobileEditorHeader
        isDirty={isDirty}
        isSaving={isSaving}
        isExporting={isExporting}
        backHref={backHref}
        onBack={handleBack}
        onSave={handleManualSave}
        onExport={handleExportImage}
        onOpenSettings={() => setScoreSettingsOpen(true)}
      />

      <div className="hidden lg:block">
        <Toolbar
          isDirty={isDirty}
          isSaving={isSaving}
          cloudSaveAvailable={Boolean(currentScoreId) || allowCloudCreate}
          backHref={backHref}
          displayScale={displayScale}
          onBack={handleBack}
          onExportImage={handleExportImage}
          onSave={handleManualSave}
          onDisplayScaleChange={setDisplayScale}
        />
      </div>

      <div className="flex min-h-0 flex-1 justify-center overflow-hidden lg:px-3 lg:pb-3 lg:pt-1.5">
        <div className="flex h-full min-h-0 w-full overflow-hidden bg-white lg:w-[80vw] lg:min-w-[1000px] lg:rounded-lg lg:border lg:border-slate-200 lg:shadow-md">
          <div className="hidden h-full min-h-0 w-1/3 overflow-hidden border-r border-slate-200 bg-slate-50/50 lg:block">
            <ElementPanel />
          </div>
          <div className="h-full min-h-0 w-full overflow-hidden bg-white lg:w-2/3">
            <ScoreCanvas exportRef={scoreExportRef} displayScale={displayScale} />
          </div>
        </div>
      </div>

      <MobileNoteBar onOpenTools={() => setMobileToolSheetOpen(true)} />
      <MobileToolSheet open={isMobileToolSheetOpen} onClose={() => setMobileToolSheetOpen(false)} />
      <ScoreSettingsSheet open={isScoreSettingsOpen} onClose={() => setScoreSettingsOpen(false)} />
    </div>
  );
});
