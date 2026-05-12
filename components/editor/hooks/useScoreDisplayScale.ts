'use client';

import { useCallback, useEffect, useState } from 'react';

export const DEFAULT_SCORE_DISPLAY_SCALE = 100;
export const MIN_SCORE_DISPLAY_SCALE = 75;
export const MAX_SCORE_DISPLAY_SCALE = 135;
export const SCORE_DISPLAY_SCALE_STEP = 5;
export const EDITOR_SCORE_DISPLAY_SCALE_STORAGE_KEY = 'ocarinana.editor.scoreDisplayScale';

function clampDisplayScale(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_SCORE_DISPLAY_SCALE;
  return Math.min(MAX_SCORE_DISPLAY_SCALE, Math.max(MIN_SCORE_DISPLAY_SCALE, value));
}

function normalizeDisplayScale(value: number): number {
  const clamped = clampDisplayScale(value);
  return Math.round(clamped / SCORE_DISPLAY_SCALE_STEP) * SCORE_DISPLAY_SCALE_STEP;
}

export function getNormalizedScoreDisplayScale(value: number): number {
  return normalizeDisplayScale(value);
}

export function useScoreDisplayScale(storageKey?: string) {
  const [displayScale, setDisplayScaleState] = useState(DEFAULT_SCORE_DISPLAY_SCALE);

  useEffect(() => {
    if (!storageKey) return;

    let storedValue: string | null = null;
    try {
      storedValue = window.localStorage.getItem(storageKey);
    } catch {
      return;
    }

    if (!storedValue) return;

    const parsedValue = Number.parseInt(storedValue, 10);
    setDisplayScaleState(normalizeDisplayScale(parsedValue));
  }, [storageKey]);

  const setDisplayScale = useCallback(
    (value: number) => {
      const nextValue = normalizeDisplayScale(value);
      setDisplayScaleState(nextValue);

      if (storageKey) {
        try {
          window.localStorage.setItem(storageKey, String(nextValue));
        } catch {
          // Ignore storage failures; the in-memory control should still work.
        }
      }
    },
    [storageKey]
  );

  return [displayScale, setDisplayScale] as const;
}
