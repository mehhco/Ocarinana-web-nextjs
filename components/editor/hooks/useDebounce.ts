/**
 * 防抖 Hook
 * 延迟执行，直到停止调用一段时间后执行
 */
'use client';

import { useCallback, useRef } from 'react';

export function useDebounce<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      // 立即执行
      callback();
    }
  }, [callback]);

  return { debouncedCallback, cancel, flush };
}

/**
 * 节流 Hook
 * 限制执行频率，在指定时间内最多执行一次
 */
export function useThrottle<T extends (...args: unknown[]) => unknown>(
  callback: T,
  limit: number
) {
  const inThrottleRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastArgsRef = useRef<Parameters<T> | null>(null);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      if (!inThrottleRef.current) {
        callback(...args);
        inThrottleRef.current = true;

        timeoutRef.current = setTimeout(() => {
          inThrottleRef.current = false;
          // 如果有累积的调用，执行最后一次
          if (lastArgsRef.current) {
            callback(...lastArgsRef.current);
            lastArgsRef.current = null;
          }
        }, limit);
      } else {
        // 记录最后一次调用的参数
        lastArgsRef.current = args;
      }
    },
    [callback, limit]
  );

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    inThrottleRef.current = false;
    lastArgsRef.current = null;
  }, []);

  return { throttledCallback, cancel };
}

/**
 * 自动保存专用 Hook
 * 结合防抖和节流策略
 */
export function useAutoSaveStrategy(
  saveFn: () => Promise<void>,
  options: {
    debounceMs?: number;
    throttleMs?: number;
    maxWaitMs?: number;
  } = {}
) {
  const { debounceMs = 2000, throttleMs = 10000, maxWaitMs = 30000 } = options;

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTimeRef = useRef<number>(0);
  const isSavingRef = useRef<boolean>(false);
  const pendingSaveRef = useRef<boolean>(false);

  const executeSave = useCallback(async () => {
    if (isSavingRef.current) {
      pendingSaveRef.current = true;
      return;
    }

    isSavingRef.current = true;
    pendingSaveRef.current = false;

    try {
      await saveFn();
      lastSaveTimeRef.current = Date.now();
    } finally {
      isSavingRef.current = false;

      // 如果有待保存的操作，继续保存
      if (pendingSaveRef.current) {
        timeoutRef.current = setTimeout(executeSave, 100);
      }
    }
  }, [saveFn]);

  const triggerSave = useCallback(() => {
    const now = Date.now();
    const timeSinceLastSave = now - lastSaveTimeRef.current;

    // 如果超过最大等待时间，立即保存
    if (timeSinceLastSave >= maxWaitMs) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      executeSave();
      return;
    }

    // 如果超过节流时间，立即保存
    if (timeSinceLastSave >= throttleMs) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      executeSave();
      return;
    }

    // 否则使用防抖
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      executeSave();
    }, debounceMs);
  }, [debounceMs, throttleMs, maxWaitMs, executeSave]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    pendingSaveRef.current = false;
  }, []);

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    executeSave();
  }, [executeSave]);

  return { triggerSave, cancel, flush, isSaving: () => isSavingRef.current };
}
