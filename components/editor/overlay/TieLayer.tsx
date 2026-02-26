'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { Tie, Measure, ScoreElement } from '@/lib/editor/types';

interface TieLayerProps {
  ties: Tie[];
  measures: Measure[];
  measureIndex: number;
  noteRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
}

// 计算两个音符之间的连线路径
function calculateTiePath(
  startRect: DOMRect,
  endRect: DOMRect
): string {
  const startX = startRect.left + startRect.width / 2;
  const startY = startRect.top + startRect.height * 0.3;
  const endX = endRect.left + endRect.width / 2;
  const endY = endRect.top + endRect.height * 0.3;

  // 控制点用于二次贝塞尔曲线
  const controlX1 = startX + (endX - startX) * 0.5;
  const controlY1 = startY - 20;
  const controlX2 = startX + (endX - startX) * 0.5;
  const controlY2 = endY - 20;

  return `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`;
}

// 连音线 SVG 渲染层
export function TieLayer({ ties, measures, measureIndex, noteRefs }: TieLayerProps) {
  const measureTies = useMemo(() => {
    return ties.filter(
      tie => tie.startMeasureIndex === measureIndex || tie.endMeasureIndex === measureIndex
    );
  }, [ties, measureIndex]);

  if (measureTies.length === 0) return null;

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ width: '100%', height: '100%' }}
    >
      {measureTies.map(tie => {
        const startKey = `${tie.startMeasureIndex}-${tie.startNoteIndex}`;
        const endKey = `${tie.endMeasureIndex}-${tie.endNoteIndex}`;
        
        const startEl = noteRefs.current[startKey];
        const endEl = noteRefs.current[endKey];

        if (!startEl || !endEl) return null;

        const startRect = startEl.getBoundingClientRect();
        const endRect = endEl.getBoundingClientRect();

        // 计算相对路径
        const containerRect = startEl.closest('.measure-svg-container')?.getBoundingClientRect();
        if (!containerRect) return null;

        const path = calculateTiePath(startRect, endRect);

        return (
          <path
            key={tie.id}
            d={path}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-foreground"
          />
        );
      })}
    </svg>
  );
}
