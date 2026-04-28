'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useScoreStore } from './useScoreStore';
import { saveToCloud } from '../lib/exportUtils';
import { useDocumentSnapshot, useIsDirty, useIsSaving } from './useSelectors';
import type { ScoreDocument } from '@/lib/editor/types';

const AUTO_SAVE_CONFIG = {
  DEBOUNCE_MS: 2000,
  THROTTLE_MS: 10000,
  MAX_WAIT_MS: 30000,
};

type SaveResult = {
  success: boolean;
  error?: string;
  skipped?: boolean;
};

export function useAutoSave(scoreId: string | undefined) {
  const document = useDocumentSnapshot();
  const isDirty = useIsDirty();
  const isSaving = useIsSaving();
  const setSaving = useScoreStore((state) => state.setSaving);
  const markAsSaved = useScoreStore((state) => state.markAsSaved);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaveTimeRef = useRef<number>(0);
  const isSavingInProgressRef = useRef(false);
  const pendingSaveRef = useRef(false);
  const documentRef = useRef<ScoreDocument>(document);
  const isDirtyRef = useRef(isDirty);

  documentRef.current = document;
  isDirtyRef.current = isDirty;

  const clearPendingTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const executeSave = useCallback(
    async (options: { force?: boolean } = {}): Promise<SaveResult> => {
      if (!scoreId) {
        return { success: false, error: '乐谱 ID 不存在' };
      }

      if (!options.force && !isDirtyRef.current) {
        return { success: true, skipped: true };
      }

      if (isSavingInProgressRef.current) {
        pendingSaveRef.current = true;
        return { success: true, skipped: true };
      }

      isSavingInProgressRef.current = true;
      pendingSaveRef.current = false;
      setSaving(true);

      try {
        const docToSave = documentRef.current;
        const savedPayload = JSON.stringify(docToSave);
        const result = await saveToCloud(docToSave, scoreId);

        if (result.success) {
          if (JSON.stringify(documentRef.current) === savedPayload) {
            markAsSaved();
          } else {
            pendingSaveRef.current = true;
          }
          lastSaveTimeRef.current = Date.now();
        }

        return result;
      } finally {
        setSaving(false);
        isSavingInProgressRef.current = false;

        if (pendingSaveRef.current) {
          timeoutRef.current = setTimeout(() => {
            void executeSave();
          }, 100);
        }
      }
    },
    [markAsSaved, scoreId, setSaving]
  );

  const saveNow = useCallback(async () => {
    clearPendingTimer();
    return executeSave({ force: true });
  }, [clearPendingTimer, executeSave]);

  const triggerAutoSave = useCallback(() => {
    if (!scoreId || !isDirtyRef.current) return;

    const now = Date.now();
    const timeSinceLastSave = now - lastSaveTimeRef.current;

    clearPendingTimer();

    if (
      timeSinceLastSave >= AUTO_SAVE_CONFIG.MAX_WAIT_MS ||
      timeSinceLastSave >= AUTO_SAVE_CONFIG.THROTTLE_MS
    ) {
      void executeSave();
      return;
    }

    timeoutRef.current = setTimeout(() => {
      void executeSave();
    }, AUTO_SAVE_CONFIG.DEBOUNCE_MS);
  }, [clearPendingTimer, executeSave, scoreId]);

  useEffect(() => {
    if (!isDirty || !scoreId || isSaving) return;

    triggerAutoSave();

    return clearPendingTimer;
  }, [clearPendingTimer, document, isDirty, isSaving, scoreId, triggerAutoSave]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!isDirtyRef.current || !scoreId || isSavingInProgressRef.current) return;

      const payload = new Blob([JSON.stringify(documentRef.current)], {
        type: 'application/json',
      });
      navigator.sendBeacon?.(`/api/scores/${encodeURIComponent(scoreId)}`, payload);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [scoreId]);

  return {
    isSaving,
    isDirty,
    saveNow,
  };
}
