'use client';

import { useEffect, useCallback } from 'react';
import { useScoreStore } from './useScoreStore';
import type { NoteValue } from '@/lib/editor/types';

export function useKeyboardShortcuts() {
  const {
    addNote,
    addRest,
    deleteSelectedElement,
    undo,
    redo,
    selectNextElement,
    selectPrevElement,
    toggleHighDot,
    toggleLowDot,
    addExtension,
    canUndo,
    canRedo,
  } = useScoreStore();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // 忽略在输入框中的按键
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // 数字键 1-7：添加音符
      if (e.key >= '1' && e.key <= '7' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        addNote(e.key as NoteValue);
        return;
      }

      // 数字键 0：添加休止符
      if (e.key === '0' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        addRest('1/4');
        return;
      }

      // Ctrl/Cmd + Z：撤销
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
        return;
      }

      // Ctrl/Cmd + Shift + Z：重做
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (canRedo) redo();
        return;
      }

      // Delete/Backspace：删除选中元素
      if ((e.key === 'Delete' || e.key === 'Backspace') && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        deleteSelectedElement();
        return;
      }

      // 方向键：移动选中
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        selectNextElement();
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        selectPrevElement();
        return;
      }

      // . (句号)：高音点
      if (e.key === '.') {
        e.preventDefault();
        toggleHighDot();
        return;
      }

      // , (逗号)：低音点
      if (e.key === ',') {
        e.preventDefault();
        toggleLowDot();
        return;
      }

      // - (减号)：延长线
      if (e.key === '-') {
        e.preventDefault();
        addExtension();
        return;
      }
    },
    [
      addNote,
      addRest,
      deleteSelectedElement,
      undo,
      redo,
      selectNextElement,
      selectPrevElement,
      toggleHighDot,
      toggleLowDot,
      addExtension,
      canUndo,
      canRedo,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}
