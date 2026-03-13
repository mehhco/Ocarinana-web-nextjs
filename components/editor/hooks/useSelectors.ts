/**
 * Zustand Store Selectors
 * 提供细粒度的状态选择器，减少不必要重渲染
 */

import { useScoreStore } from './useScoreStore';
import { useShallow } from 'zustand/react/shallow';
import type { ScoreDocument, ScoreSettings } from '@/lib/editor/types';

// ============ 文档相关 Selectors ============

export const useDocumentTitle = () =>
  useScoreStore((state) => state.document.title);

export const useDocumentMeasures = () =>
  useScoreStore((state) => state.document.measures);

export const useDocumentSettings = () =>
  useScoreStore((state) => state.document.settings);

export const useDocumentSkin = () =>
  useScoreStore((state) => state.document.settings.skin);

export const useDocumentKeySignature = () =>
  useScoreStore((state) => state.document.settings.keySignature);

export const useDocumentTimeSignature = () =>
  useScoreStore((state) => state.document.settings.timeSignature);

export const useDocumentTempo = () =>
  useScoreStore((state) => state.document.settings.tempo);

export const useShowLyrics = () =>
  useScoreStore((state) => state.document.settings.showLyrics);

export const useShowFingering = () =>
  useScoreStore((state) => state.document.settings.showFingering);

export const useDocumentSnapshot = () =>
  useScoreStore((state) => state.document);

// ============ 选择状态 Selectors ============

export const useSelectedMeasureIndex = () =>
  useScoreStore((state) => state.selectedMeasureIndex);

export const useSelectedNoteIndex = () =>
  useScoreStore((state) => state.selectedNoteIndex);

export const useSelection = () =>
  useScoreStore((state) => ({
    measureIndex: state.selectedMeasureIndex,
    noteIndex: state.selectedNoteIndex,
  }));

// ============ UI 状态 Selectors ============

export const useIsDirty = () =>
  useScoreStore((state) => state.isDirty);

export const useIsSaving = () =>
  useScoreStore((state) => state.isSaving);

export const useIsExporting = () =>
  useScoreStore((state) => state.isExporting);

export const useCanUndo = () =>
  useScoreStore((state) => state.canUndo);

export const useCanRedo = () =>
  useScoreStore((state) => state.canRedo);

// ============ 时值线模式 Selectors ============

export const useIsBeamMode = () =>
  useScoreStore((state) => state.isBeamMode);

export const useBeamStartPosition = () =>
  useScoreStore((state) => state.beamStartPosition);

// ============ Actions Selectors ============

export const useUpdateTitle = () =>
  useScoreStore((state) => state.updateTitle);

export const useUpdateSettings = () =>
  useScoreStore((state) => state.updateSettings);

export const useSelectElement = () =>
  useScoreStore((state) => state.selectElement);

export const useAddMeasure = () =>
  useScoreStore((state) => state.addMeasure);

export const useUndo = () =>
  useScoreStore((state) => state.undo);

export const useRedo = () =>
  useScoreStore((state) => state.redo);

// ============ 组合 Selector Hooks ============

/**
 * 获取当前选中元素的信息
 */
export const useSelectedElement = () => {
  return useScoreStore(
    useShallow((state) => {
      const { selectedMeasureIndex, selectedNoteIndex, document } = state;
      if (selectedMeasureIndex === null || selectedNoteIndex === null) {
        return null;
      }
      const measure = document.measures[selectedMeasureIndex];
      const element = measure?.elements[selectedNoteIndex];
      return {
        measureIndex: selectedMeasureIndex,
        noteIndex: selectedNoteIndex,
        measure,
        element,
      };
    }),
  );
};
/**
 * 获取当前小节数量
 */
export const useMeasureCount = () =>
  useScoreStore((state) => state.document.measures.length);

/**
 * 获取指定小节
 */
export const useMeasure = (index: number) =>
  useScoreStore((state) => state.document.measures[index]);

/**
 * 获取指定小节的歌词
 */
export const useMeasureLyrics = (measureIndex: number) =>
  useScoreStore((state) =>
    state.document.lyrics.filter((l) => l.measureIndex === measureIndex)
  );

/**
 * 获取特定位置的歌词
 */
export const useElementLyrics = (measureIndex: number, noteIndex: number) =>
  useScoreStore((state) =>
    state.document.lyrics.find(
      (l) => l.measureIndex === measureIndex && l.noteIndex === noteIndex
    )?.text ?? ''
  );
