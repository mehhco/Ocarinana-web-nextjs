'use client';

import { useEffect, useState, useLayoutEffect } from 'react';
import { useScoreStore } from '../hooks/useScoreStore';
import { Toolbar } from './Toolbar';
import { ElementPanel } from './ElementPanel';
import { ScoreCanvas } from './ScoreCanvas';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import type { ScoreDocument } from '@/lib/editor/types';
import { Loader2 } from 'lucide-react';

interface ScoreEditorProps {
  initialDocument?: ScoreDocument;
  scoreId?: string;
}

export function ScoreEditor({ initialDocument, scoreId }: ScoreEditorProps) {
  const initialize = useScoreStore((state) => state.initialize);
  const [isReady, setIsReady] = useState(false);
  
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
            <ElementPanel />
            <ScoreCanvas />
          </>
        )}
      </div>
    </div>
  );
}
