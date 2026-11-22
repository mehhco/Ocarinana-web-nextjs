'use client';

import { useEffect, useRef, useState } from 'react';
import { useScoreStore } from './useScoreStore';
import {
  clearGuestDraft,
  hasScoreContent,
  isGuestDraftStorageAvailable,
  readGuestDraft,
  writeGuestDraft,
} from '@/lib/editor/guest-draft';
import type { ScoreDocument } from '@/lib/editor/types';

const GUEST_DRAFT_DEBOUNCE_MS = 600;

export type GuestDraftStatus = 'pending' | 'restored' | 'empty' | 'unavailable';

interface UseGuestDraftOptions {
  /** 进入编辑器时是否尝试恢复本机草稿（未登录试用、以及登录回跳后都为 true） */
  restore: boolean;
  /** 编辑过程中是否持续写入本机草稿（只在未登录试用时需要） */
  persist: boolean;
  initialDocument?: Partial<ScoreDocument>;
  onRestore?: () => void;
}

interface UseGuestDraftResult {
  status: GuestDraftStatus;
  lastSavedAt: number | null;
  persistNow: () => void;
}

/**
 * 未登录编辑器的本地草稿：进入时恢复上次内容，编辑过程中自动写入 localStorage。
 * 这样点「保存」需要登录时，跳转登录页也不会把用户一小时的谱子弄丢。
 */
export function useGuestDraft({
  restore,
  persist,
  initialDocument,
  onRestore,
}: UseGuestDraftOptions): UseGuestDraftResult {
  const initialize = useScoreStore((state) => state.initialize);
  const [status, setStatus] = useState<GuestDraftStatus>('pending');
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const onRestoreRef = useRef(onRestore);
  const initializedRef = useRef(false);

  onRestoreRef.current = onRestore;

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;

    if (restore) {
      const draft = readGuestDraft();

      if (draft && hasScoreContent(draft.document)) {
        initialize(draft.document);
        setLastSavedAt(draft.savedAt);
        setStatus('restored');
        onRestoreRef.current?.();
        return;
      }
    }

    if (persist && !isGuestDraftStorageAvailable()) {
      initialize(initialDocument);
      setStatus('unavailable');
      return;
    }

    initialize(initialDocument);
    setStatus('empty');
  }, [initialize, initialDocument, persist, restore]);

  useEffect(() => {
    if (!persist) {
      return;
    }

    const persistSnapshot = () => {
      const snapshot = useScoreStore.getState().document;

      if (!hasScoreContent(snapshot)) {
        clearGuestDraft();
        return;
      }

      if (writeGuestDraft(snapshot)) {
        setLastSavedAt(Date.now());
        setStatus((current) => (current === 'unavailable' ? 'empty' : current));
      } else {
        setStatus('unavailable');
      }
    };

    let timer: ReturnType<typeof setTimeout> | null = null;

    const unsubscribe = useScoreStore.subscribe((state, previous) => {
      if (state.document === previous.document) {
        return;
      }

      if (timer) {
        clearTimeout(timer);
      }

      timer = setTimeout(persistSnapshot, GUEST_DRAFT_DEBOUNCE_MS);
    });

    const handlePageHide = () => persistSnapshot();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        persistSnapshot();
      }
    };

    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handlePageHide);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }

      unsubscribe();
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handlePageHide);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [persist]);

  const persistNow = () => {
    if (!persist) {
      return;
    }

    const snapshot = useScoreStore.getState().document;

    if (hasScoreContent(snapshot) && writeGuestDraft(snapshot)) {
      setLastSavedAt(Date.now());
    }
  };

  return { status, lastSavedAt, persistNow };
}
