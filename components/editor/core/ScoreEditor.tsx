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
  void scoreId;

  useEffect(() => {
    initialize(initialDocument);
  }, [initialize, initialDocument]);

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-slate-50">
      <Toolbar />
      <div className="flex flex-1 justify-center overflow-hidden px-3 pb-3 pt-1.5">
        <div className="flex h-full min-h-0 w-[80vw] min-w-[1000px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-md">
          <div className="h-full min-h-0 w-1/3 overflow-hidden border-r border-slate-200 bg-slate-50/50">
            <ElementPanel />
          </div>
          <div className="h-full min-h-0 w-2/3 overflow-hidden bg-white">
            <ScoreCanvas />
          </div>
        </div>
      </div>
    </div>
  );
});
