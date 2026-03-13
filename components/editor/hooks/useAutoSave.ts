'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useScoreStore } from './useScoreStore';
import { saveToCloud } from '../lib/exportUtils';
import { useIsDirty, useDocumentSnapshot, useIsSaving } from './useSelectors';

/**
 * 自动保存配置
 */
const AUTO_SAVE_CONFIG = {
  DEBOUNCE_MS: 2000,    // 防抖时间：用户停止编辑 2 秒后保存
  THROTTLE_MS: 10000,   // 节流时间：最少每 10 秒保存一次
  MAX_WAIT_MS: 30000,   // 最大等待：最多 30 秒必须保存一次
};

/**
 * 增强版自动保存 Hook
 * 使用防抖 + 节流策略
 */
export function useAutoSave(scoreId: string | undefined) {
  const document = useDocumentSnapshot();
  const isDirty = useIsDirty();
  const isSaving = useIsSaving();

  const setSaving = useScoreStore((state) => state.setSaving);
  const markAsSaved = useScoreStore((state) => state.markAsSaved);

  // 使用 refs 管理定时器和状态
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTimeRef = useRef<number>(0);
  const isSavingInProgressRef = useRef<boolean>(false);
  const pendingSaveRef = useRef<boolean>(false);
  const documentRef = useRef(document);

  // 保持 document 引用最新
  documentRef.current = document;

  // 执行保存的函数
  const executeSave = useCallback(async () => {
    if (isSavingInProgressRef.current || !scoreId) {
      pendingSaveRef.current = true;
      return;
    }

    const docToSave = documentRef.current;
    if (!docToSave) return;

    isSavingInProgressRef.current = true;
    pendingSaveRef.current = false;
    setSaving(true);

    try {
      const result = await saveToCloud(docToSave, scoreId);

      if (result.success) {
        markAsSaved();
        lastSaveTimeRef.current = Date.now();
        console.log('自动保存成功');
      } else {
        console.error('自动保存失败:', result.error);
      }
    } catch (error) {
      console.error('自动保存异常:', error);
    } finally {
      setSaving(false);
      isSavingInProgressRef.current = false;

      // 如果有待保存的操作，继续保存
      if (pendingSaveRef.current) {
        timeoutRef.current = setTimeout(executeSave, 100);
      }
    }
  }, [scoreId, setSaving, markAsSaved]);

  // 触发保存的策略函数
  const triggerSave = useCallback(() => {
    if (!scoreId || !isDirty) return;

    const now = Date.now();
    const timeSinceLastSave = now - lastSaveTimeRef.current;

    // 清除现有的定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // 如果超过最大等待时间，立即保存
    if (timeSinceLastSave >= AUTO_SAVE_CONFIG.MAX_WAIT_MS) {
      executeSave();
      return;
    }

    // 如果超过节流时间，立即保存
    if (timeSinceLastSave >= AUTO_SAVE_CONFIG.THROTTLE_MS) {
      executeSave();
      return;
    }

    // 否则使用防抖：等待用户停止编辑
    timeoutRef.current = setTimeout(() => {
      executeSave();
    }, AUTO_SAVE_CONFIG.DEBOUNCE_MS);
  }, [scoreId, isDirty, executeSave]);

  // 监听 document 变化触发自动保存
  useEffect(() => {
    if (!isDirty || !scoreId || isSaving) return;

    triggerSave();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [document, isDirty, scoreId, isSaving, triggerSave]);

  // 手动保存事件处理
  useEffect(() => {
    const handleManualSave = () => {
      if (!scoreId || isSavingInProgressRef.current) return;

      // 清除现有的自动保存定时器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      executeSave();
    };

    window.addEventListener('editor:manual-save', handleManualSave);
    return () => window.removeEventListener('editor:manual-save', handleManualSave);
  }, [scoreId, executeSave]);

  // 页面关闭前强制保存
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isDirty && scoreId && !isSavingInProgressRef.current) {
        // 使用 sendBeacon 确保数据发送
        const data = JSON.stringify({ document, scoreId });
        navigator.sendBeacon?.('/api/scores/auto-save', data);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, scoreId, document]);

  return {
    isSaving,
    isDirty,
  };
}
