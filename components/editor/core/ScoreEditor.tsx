'use client';

import { useEffect, memo } from 'react';
import { useScoreStore } from '../hooks/useScoreStore';
import { Toolbar } from './Toolbar';
import { ElementPanel } from './ElementPanel';
import { ScoreCanvas } from './ScoreCanvas';
import type { ScoreDocument } from '@/lib/editor/types';

interface ScoreEditorProps {
  initialDocument?: Partial<ScoreDocument>;
  scoreId?: string;
}

export const ScoreEditor = memo(function ScoreEditor({ initialDocument, scoreId }: ScoreEditorProps) {
  const initialize = useScoreStore((state) => state.initialize);

  useEffect(() => {
    initialize(initialDocument);
  }, [initialize, initialDocument]);

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* 顶部工具栏 */}
      <Toolbar />
      
      {/* 主内容区 - 屏幕正中间，宽度 3/4 */}
      <div className="flex-1 flex justify-center overflow-hidden p-4">
        {/* 容器：屏幕宽度的 3/4，最小 1000px */}
        <div className="w-[75vw] min-w-[1000px] h-full flex bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
          {/* 左侧：Element Panel 占 1/3 */}
          <div className="w-1/3 h-full border-r border-slate-200 bg-slate-50/50 overflow-hidden">
            <ElementPanel />
          </div>
          
          {/* 右侧：Score Canvas 占 2/3 */}
          <div className="w-2/3 h-full bg-white overflow-hidden">
            <ScoreCanvas />
          </div>
        </div>
      </div>
    </div>
  );
});
