'use client';

import { useEffect, useState } from 'react';
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
  
  // 初始化编辑器（只在客户端执行）
  useEffect(() => {
    initialize(initialDocument);
    setIsReady(true);
  }, [initialize, initialDocument]);
  
  // 键盘快捷键
  useKeyboardShortcuts();
  
  // 未准备好时显示加载状态
  if (!isReady) {
    return (
      <div className="flex flex-col h-screen bg-background items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">加载编辑器...</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen bg-background">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <ElementPanel />
        <ScoreCanvas />
      </div>
    </div>
  );
}
