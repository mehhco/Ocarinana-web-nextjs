'use client';

import { useEffect, useRef } from 'react';
import { useScoreStore } from './useScoreStore';
import { saveToCloud } from '../lib/exportUtils';
import { HISTORY_CONFIG } from '../lib/constants';

/**
 * 自动保存 Hook
 * 当文档有更改时自动保存到云端
 */
export function useAutoSave(scoreId: string | undefined) {
  const document = useScoreStore((state) => state.document);
  const isDirty = useScoreStore((state) => state.isDirty);
  const isSaving = useScoreStore((state) => state.isSaving);
  const setSaving = useScoreStore((state) => state.setSaving);
  const markAsSaved = useScoreStore((state) => state.markAsSaved);
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // 如果没有 scoreId 或没有更改，不保存
    if (!scoreId || !isDirty || isSaving) {
      return;
    }
    
    // 防抖：等待用户停止编辑后自动保存
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(async () => {
      setSaving(true);
      
      const result = await saveToCloud(document, scoreId);
      
      if (result.success) {
        markAsSaved();
        console.log('自动保存成功');
      } else {
        console.error('自动保存失败:', result.error);
      }
      
      setSaving(false);
    }, HISTORY_CONFIG.DEBOUNCE_MS);
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [document, isDirty, isSaving, scoreId, setSaving, markAsSaved]);
  
  return {
    isSaving,
    isDirty,
  };
}
