'use client';

import { useEffect } from 'react';
import { useScoreStore } from '../hooks/useScoreStore';
import { Toolbar } from './Toolbar';
import { ElementPanel } from './ElementPanel';
import { ScoreCanvas } from './ScoreCanvas';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import type { ScoreDocument } from '@/lib/editor/types';

interface ScoreEditorProps {
  initialDocument?: ScoreDocument;
  scoreId?: string;
}

export function ScoreEditor({ initialDocument, scoreId }: ScoreEditorProps) {
  const initialize = useScoreStore((state) => state.initialize);
  
  // 初始化编辑器
  useEffect(() => {
    initialize(initialDocument);
  }, [initialize, initialDocument]);
  
  // 键盘快捷键
  useKeyboardShortcuts();
  
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
