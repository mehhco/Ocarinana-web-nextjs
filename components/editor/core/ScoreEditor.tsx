'use client';

import { useState, useLayoutEffect } from 'react';
import { useScoreStore } from '../hooks/useScoreStore';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useAutoSave } from '../hooks/useAutoSave';
import { Toolbar } from './Toolbar';
import { ElementPanel } from './ElementPanel';
import { ScoreCanvas } from './ScoreCanvas';
import type { ScoreDocument } from '@/lib/editor/types';
import { Loader2, Save } from 'lucide-react';

interface ScoreEditorProps {
  initialDocument?: ScoreDocument;
  scoreId?: string;
}

export function ScoreEditor({ initialDocument, scoreId }: ScoreEditorProps) {
  const initialize = useScoreStore((state) => state.initialize);
  const [isReady, setIsReady] = useState(false);
  
  // 自动保存
  const { isSaving, isDirty } = useAutoSave(scoreId);
  
  // 使用 useLayoutEffect 确保在客户端渲染前同步状态
  useLayoutEffect(() => {
    initialize(initialDocument);
    setIsReady(true);
  }, []);
  
  // 键盘快捷键
  useKeyboardShortcuts();
  
  return (
    <div className="flex flex-col h-screen bg-background">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        {!isReady ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* 保存状态指示器 */}
            {isSaving && (
              <div className="fixed top-20 right-4 z-50 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-sm flex items-center gap-2 shadow-lg">
                <Save className="h-4 w-4 animate-pulse" />
                保存中...
              </div>
            )}
            {!isSaving && isDirty && scoreId && (
              <div className="fixed top-20 right-4 z-50 bg-yellow-500 text-white px-3 py-1.5 rounded-full text-sm shadow-lg">
                未保存
              </div>
            )}
            <ElementPanel />
            <ScoreCanvas />
          </>
        )}
      </div>
    </div>
  );
}
