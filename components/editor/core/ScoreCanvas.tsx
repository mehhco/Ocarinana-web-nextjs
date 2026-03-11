'use client';

import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useScoreStore } from '../hooks/useScoreStore';
import { getFingeringUrl } from '../lib/fingeringMap';
import type { ScoreElement, Measure, Beam } from '@/lib/editor/types';

// 计算音符的时值线层级 (1/8=1, 1/16=2, 1/32=3)
function getBeamLevel(duration: string): number {
  switch (duration) {
    case '1/8': return 1;
    case '1/16': return 2;
    case '1/32': return 3;
    default: return 0;
  }
}

// 计算所有音符的时值线连接信息
function calculateBeamConnections(
  measures: Measure[],
  beams: Beam[] = []
): Map<string, { beamLeft: boolean; beamRight: boolean; beamLevel: number; beamConnectionLevel: number }> {
  const connections = new Map<string, { beamLeft: boolean; beamRight: boolean; beamLevel: number; beamConnectionLevel: number }>();
  
  // 为每个元素初始化连接信息（默认无连接）
  measures.forEach((measure, measureIndex) => {
    measure.elements.forEach((element, noteIndex) => {
      const key = `${measureIndex}-${noteIndex}`;
      if (element.type === 'note') {
        const level = getBeamLevel(element.duration);
        connections.set(key, { beamLeft: false, beamRight: false, beamLevel: level, beamConnectionLevel: 0 });
      } else {
        connections.set(key, { beamLeft: false, beamRight: false, beamLevel: 0, beamConnectionLevel: 0 });
      }
    });
  });
  
  // 应用手动时值线连接
  beams.forEach(beam => {
    const startKey = `${beam.startMeasureIndex}-${beam.startNoteIndex}`;
    const endKey = `${beam.endMeasureIndex}-${beam.endNoteIndex}`;
    
    const startConn = connections.get(startKey);
    const endConn = connections.get(endKey);
    
    if (startConn) {
      startConn.beamRight = true;
      startConn.beamConnectionLevel = Math.max(startConn.beamConnectionLevel, beam.level);
    }
    
    if (endConn) {
      endConn.beamLeft = true;
      endConn.beamConnectionLevel = Math.max(endConn.beamConnectionLevel, beam.level);
    }
    
    // 连接中间的所有延长线
    if (beam.startMeasureIndex === beam.endMeasureIndex) {
      const measure = measures[beam.startMeasureIndex];
      if (measure) {
        for (let i = beam.startNoteIndex + 1; i < beam.endNoteIndex; i++) {
          const middleKey = `${beam.startMeasureIndex}-${i}`;
          const middleConn = connections.get(middleKey);
          if (middleConn) {
            middleConn.beamLeft = true;
            middleConn.beamRight = true;
            middleConn.beamConnectionLevel = Math.max(middleConn.beamConnectionLevel, beam.level);
          }
        }
      }
    }
  });

  return connections;
}

interface NoteElementProps {
  element: ScoreElement;
  measureIndex: number;
  noteIndex: number;
  isSelected: boolean;
  keySignature: string;
  showFingering: boolean;
  showLyrics: boolean;
  onClick: () => void;
  noteRef?: (el: HTMLDivElement | null) => void;
  // 时值线连接信息
  beamLeft?: boolean;
  beamRight?: boolean;
  beamLevel: number;
  beamConnectionLevel?: number;
}

function NoteElementComponent({ 
  element, 
  measureIndex, 
  noteIndex, 
  isSelected, 
  keySignature,
  showFingering,
  showLyrics,
  onClick,
  noteRef,
  beamLeft,
  beamRight,
  beamLevel,
  beamConnectionLevel = 0
}: NoteElementProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (noteRef && elementRef.current) {
      noteRef(elementRef.current);
    }
    return () => {
      if (noteRef) {
        noteRef(null);
      }
    };
  }, [noteRef]);

  if (element.type === 'note') {
    const fingeringUrl = showFingering 
      ? getFingeringUrl(keySignature as any, element.value, element.hasHighDot, element.hasLowDot)
      : null;

    return (
      <div
        ref={elementRef}
        className={cn(
          "inline-flex flex-col items-center cursor-pointer transition-all rounded-lg py-1 w-16 flex-shrink-0 relative overflow-visible",
          isSelected ? "bg-primary/10 shadow-md ring-2 ring-primary" : "hover:bg-muted/50"
        )}
        onClick={onClick}
        data-note-key={`${measureIndex}-${noteIndex}`}
      >
        {/* 指法图 - 固定高度容器 */}
        <div className="w-14 h-14 flex-shrink-0">
          {fingeringUrl && (
            <img src={fingeringUrl} alt={`指法 ${element.value}`} className="w-full h-full object-contain" loading="lazy" />
          )}
        </div>
        {/* 高音点 - 固定高度容器 */}
        <div className="h-4 flex items-center justify-center">
          {element.hasHighDot && <span className="text-base leading-none">·</span>}
        </div>
        {/* 音符数字 */}
        <div className="flex items-center justify-center h-8">
          <span className="text-2xl font-bold">{element.value}</span>
        </div>
        {/* 低音点 - 固定高度容器 */}
        <div className="h-4 flex items-center justify-center">
          {element.hasLowDot && <span className="text-base leading-none">·</span>}
        </div>
        {/* 时值线（减时线）- 每条线根据连接层级独立判断是否连接 */}
        {beamLevel > 0 && (
          <div className="flex flex-col items-center gap-[2px] mt-1 w-full">
            {/* 第1条线 (1/8) - 只有 beamConnectionLevel >= 1 时才连接 */}
            <div className="relative w-full h-[2px]">
              <div 
                className={cn(
                  "absolute top-0 h-[2px] bg-foreground",
                  // 没有连接或连接层级 < 1：短线（居中显示）
                  beamConnectionLevel < 1 ? "left-1/2 -translate-x-1/2 w-6" :
                  // 只连接左侧：从左侧音符中心延伸到当前音符中心
                  beamLeft && !beamRight ? "inset-x-[-32px] right-1/2 left-auto w-[calc(50%+32px)]" :
                  // 只连接右侧：从当前音符中心延伸到右侧音符中心
                  !beamLeft && beamRight ? "left-1/2 right-[-32px] w-[calc(50%+32px)]" :
                  // 两侧都连接：贯穿整个区域
                  "inset-x-[-32px] w-[calc(100%+64px)]"
                )}
              />
            </div>
            {/* 第2条线 (1/16) - 只有 beamConnectionLevel >= 2 时才连接 */}
            {beamLevel >= 2 && (
              <div className="relative w-full h-[2px]">
                <div 
                  className={cn(
                    "absolute top-0 h-[2px] bg-foreground",
                    beamConnectionLevel < 2 ? "left-1/2 -translate-x-1/2 w-6" :
                    beamLeft && !beamRight ? "right-1/2 left-[-32px] w-[calc(50%+32px)]" :
                    !beamLeft && beamRight ? "left-1/2 right-[-32px] w-[calc(50%+32px)]" :
                    "inset-x-[-32px] w-[calc(100%+64px)]"
                  )}
                />
              </div>
            )}
            {/* 第3条线 (1/32) - 只有 beamConnectionLevel >= 3 时才连接 */}
            {beamLevel >= 3 && (
              <div className="relative w-full h-[2px]">
                <div 
                  className={cn(
                    "absolute top-0 h-[2px] bg-foreground",
                    beamConnectionLevel < 3 ? "left-1/2 -translate-x-1/2 w-6" :
                    beamLeft && !beamRight ? "right-1/2 left-[-32px] w-[calc(50%+32px)]" :
                    !beamLeft && beamRight ? "left-1/2 right-[-32px] w-[calc(50%+32px)]" :
                    "inset-x-[-32px] w-[calc(100%+64px)]"
                  )}
                />
              </div>
            )}
          </div>
        )}
        {beamLevel > 0 && (
          <div className="flex flex-col items-center gap-[2px] mt-1 w-full">
            {/* 第1条线 (1/8) - 只有 beamConnectionLevel >= 1 时才连接 */}
            <div className="relative w-full h-[2px]">
              <div 
                className={cn(
                  "absolute top-0 h-[2px] bg-foreground",
                  // 没有连接或连接层级 < 1：短线（居中显示）
                  beamConnectionLevel < 1 ? "left-1/2 -translate-x-1/2 w-6" :
                  // 只连接左侧：从左侧音符中心延伸到当前音符中心
                  beamLeft && !beamRight ? "left-[-32px] right-1/2" :
                  // 只连接右侧：从当前音符中心延伸到右侧音符中心
                  !beamLeft && beamRight ? "left-1/2 right-[-32px]" :
                  // 两侧都连接：贯穿整个区域
                  "left-[-32px] right-[-32px]"
                )}
              />
            </div>
            {/* 第2条线 (1/16) - 只有 beamConnectionLevel >= 2 时才连接 */}
            {beamLevel >= 2 && (
              <div className="relative w-full h-[2px]">
                <div 
                  className={cn(
                    "absolute top-0 h-[2px] bg-foreground",
                    beamConnectionLevel < 2 ? "left-1/2 -translate-x-1/2 w-6" :
                    beamLeft && !beamRight ? "left-[-32px] right-1/2" :
                    !beamLeft && beamRight ? "left-1/2 right-[-32px]" :
                    "left-[-32px] right-[-32px]"
                  )}
                />
              </div>
            )}
            {/* 第3条线 (1/32) - 只有 beamConnectionLevel >= 3 时才连接 */}
            {beamLevel >= 3 && (
              <div className="relative w-full h-[2px]">
                <div 
                  className={cn(
                    "absolute top-0 h-[2px] bg-foreground",
                    beamConnectionLevel < 3 ? "left-1/2 -translate-x-1/2 w-6" :
                    beamLeft && !beamRight ? "left-[-32px] right-1/2" :
                    !beamLeft && beamRight ? "left-1/2 right-[-32px]" :
                    "left-[-32px] right-[-32px]"
                  )}
                />
              </div>
            )}
          </div>
        )}
        {beamLevel > 0 && (
          <div className="flex flex-col items-center gap-[2px] mt-1 w-full">
            {/* 第1条线 (1/8) - 只有 beamConnectionLevel >= 1 时才连接 */}
            <div className="relative w-full h-[2px]">
              <div 
                className={cn(
                  "absolute top-0 h-[2px] bg-foreground",
                  beamConnectionLevel < 1 ? "left-1/2 -translate-x-1/2 w-6" :
                  beamLeft && !beamRight ? "left-0 right-1/2" :
                  !beamLeft && beamRight ? "left-1/2 right-0" :
                  "left-0 right-0"
                )}
              />
            </div>
            {/* 第2条线 (1/16) - 只有 beamConnectionLevel >= 2 时才连接 */}
            {beamLevel >= 2 && (
              <div className="relative w-full h-[2px]">
                <div 
                  className={cn(
                    "absolute top-0 h-[2px] bg-foreground",
                    beamConnectionLevel < 2 ? "left-1/2 -translate-x-1/2 w-6" :
                    beamLeft && !beamRight ? "left-0 right-1/2" :
                    !beamLeft && beamRight ? "left-1/2 right-0" :
                    "left-0 right-0"
                  )}
                />
              </div>
            )}
            {/* 第3条线 (1/32) - 只有 beamConnectionLevel >= 3 时才连接 */}
            {beamLevel >= 3 && (
              <div className="relative w-full h-[2px]">
                <div 
                  className={cn(
                    "absolute top-0 h-[2px] bg-foreground",
                    beamConnectionLevel < 3 ? "left-1/2 -translate-x-1/2 w-6" :
                    beamLeft && !beamRight ? "left-0 right-1/2" :
                    !beamLeft && beamRight ? "left-1/2 right-0" :
                    "left-0 right-0"
                  )}
                />
              </div>
            )}
          </div>
        )}
        {/* 歌词显示 */}
        {showLyrics && (
          <span className="text-xs text-muted-foreground mt-1 font-medium truncate max-w-full px-1 min-h-[16px]">
            {element.lyrics || '\u00A0'}
          </span>
        )}
      </div>
    );
  }

  if (element.type === 'rest') {
    return (
      <div
        ref={elementRef}
        className={cn(
          "inline-flex flex-col items-center justify-center w-16 py-3 cursor-pointer transition-all rounded-lg flex-shrink-0 bg-muted/30 border-2 border-dashed border-muted-foreground/20",
          isSelected ? "bg-primary/10 shadow-md ring-2 ring-primary border-primary/30" : "hover:bg-muted/50"
        )}
        onClick={onClick}
        data-note-key={`${measureIndex}-${noteIndex}`}
      >
        <span className="text-2xl font-bold text-muted-foreground/60">0</span>
        <span className="text-[10px] text-muted-foreground/40 mt-1">休止</span>
      </div>
    );
  }

  if (element.type === 'extension') {
    return (
      <div
        ref={elementRef}
        className={cn(
          "inline-flex items-center justify-center w-10 py-3 cursor-pointer transition-all rounded-lg flex-shrink-0",
          isSelected ? "bg-primary/10 ring-2 ring-primary" : "hover:bg-muted/50"
        )}
        onClick={onClick}
        data-note-key={`${measureIndex}-${noteIndex}`}
      >
        <span className="text-2xl font-bold text-muted-foreground">—</span>
      </div>
    );
  }

  return null;
}

interface MeasureComponentProps {
  measure: Measure;
  index: number;
  selectedNoteIndex: number | null;
  keySignature: string;
  showFingering: boolean;
  showLyrics: boolean;
  onSelectNote: (noteIndex: number) => void;
  beams: Beam[];
  measures: Measure[];
}

function MeasureComponent({ measure, index, selectedNoteIndex, keySignature, showFingering, showLyrics, onSelectNote, beams, measures }: MeasureComponentProps) {
  const noteRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  // Calculate beam connections for this measure
  const beamConnections = useMemo(() => calculateBeamConnections(measures, beams), [measures, beams]);
  
  return (
    <div className="flex items-end gap-3 px-4 py-3 relative">
      <div className="flex flex-wrap content-start items-start gap-2 w-[794px] max-w-full">
        {measure.elements.map((element, noteIndex) => {
          const beamInfo = beamConnections.get(`${index}-${noteIndex}`) || { beamLeft: false, beamRight: false, beamLevel: 0, beamConnectionLevel: 0 };
          return (
            <NoteElementComponent
              key={element.id}
              element={element}
              measureIndex={index}
              noteIndex={noteIndex}
              isSelected={selectedNoteIndex === noteIndex}
              keySignature={keySignature}
              showFingering={showFingering}
              showLyrics={showLyrics}
              onClick={() => onSelectNote(noteIndex)}
              noteRef={(el) => { noteRefs.current[`${index}-${noteIndex}`] = el; }}
              beamLeft={beamInfo.beamLeft}
              beamRight={beamInfo.beamRight}
              beamLevel={beamInfo.beamLevel}
              beamConnectionLevel={beamInfo.beamConnectionLevel}
            />
          );
        })}
        {measure.elements.length === 0 && (
          <div className="flex items-center justify-center w-full h-20 text-sm text-muted-foreground/50 italic">
            点击左侧音符按钮添加音符
          </div>
        )}
      </div>
    </div>
  );
}

// Simple TieLine component for rendering ties between notes
function TieLine({ startNoteKey, endNoteKey, containerRef }: { startNoteKey: string; endNoteKey: string; containerRef: React.RefObject<HTMLDivElement | null> }) {
  const [path, setPath] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const calculatePath = () => {
      const container = containerRef.current;
      if (!container) return;

      const startEl = container.querySelector(`[data-note-key="${startNoteKey}"]`);
      const endEl = container.querySelector(`[data-note-key="${endNoteKey}"]`);

      if (!startEl || !endEl) return;

      const startRect = startEl.getBoundingClientRect();
      const endRect = endEl.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      const startX = startRect.left + startRect.width / 2 - containerRect.left;
      const startY = startRect.top + startRect.height * 0.4 - containerRect.top;
      const endX = endRect.left + endRect.width / 2 - containerRect.left;
      const endY = endRect.top + endRect.height * 0.4 - containerRect.top;

      const midX = (startX + endX) / 2;
      const controlY1 = startY - 15;
      const controlY2 = endY - 15;

      setPath(`M ${startX} ${startY} Q ${midX} ${controlY1} ${endX} ${endY}`);
    };

    calculatePath();

    // Recalculate on resize
    const observer = new ResizeObserver(calculatePath);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [startNoteKey, endNoteKey, containerRef]);

  if (!path) return null;

  return (
    <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-foreground"
      />
    </svg>
  );
}

export function ScoreCanvas() {
  const { document: scoreDoc, selectedMeasureIndex, selectedNoteIndex, selectElement, addMeasure } = useScoreStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [ties, setTies] = useState<Array<{ startNoteKey: string; endNoteKey: string }>>([]);

  // Parse ties from document
  useEffect(() => {
    if (!scoreDoc.ties || scoreDoc.ties.length === 0) {
      setTies([]);
      return;
    }

    const parsedTies = scoreDoc.ties.map(tie => ({
      startNoteKey: `${tie.startMeasureIndex}-${tie.startNoteIndex}`,
      endNoteKey: `${tie.endMeasureIndex}-${tie.endNoteIndex}`
    }));
    setTies(parsedTies);
  }, [scoreDoc.ties]);

  useEffect(() => {
    if (selectedMeasureIndex !== null && containerRef.current) {
      const measureElements = containerRef.current.querySelectorAll('.measure-item');
      const selectedMeasure = measureElements[selectedMeasureIndex];
      if (selectedMeasure) {
        selectedMeasure.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedMeasureIndex]);

  useEffect(() => {
    const handleExportImage = async () => {
      const scoreContent = containerRef.current?.querySelector('.score-content');
      if (!scoreContent) return;
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const html2canvas = (window as any).html2canvas;
        if (!html2canvas) { alert('导出功能未加载'); return; }
        const canvas = await html2canvas(scoreContent as HTMLElement, { backgroundColor: '#ffffff', scale: 2, useCORS: true });
        const link = window.document.createElement('a');
        link.download = `${scoreDoc.title || '乐谱'}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
      } catch (error) {
        console.error('导出图片失败:', error);
        alert('导出图片失败');
      }
    };
    window.addEventListener('editor:export-image', handleExportImage);
    return () => window.removeEventListener('editor:export-image', handleExportImage);
  }, [scoreDoc.title]);

  const getSkinBackground = () => {
    switch (scoreDoc.settings.skin) {
      case 'light-beige': return 'bg-amber-50/30';
      case 'light-blue': return 'bg-blue-50/30';
      default: return 'bg-slate-50/50';
    }
  };

  return (
    <div ref={containerRef} className={cn("flex-1 overflow-y-auto p-4 md:p-8", getSkinBackground())}>
      <div className="mx-auto mb-6 text-center space-y-2" style={{ width: '794px', maxWidth: '100%' }}>
        <h1 className="text-2xl font-bold text-foreground">{scoreDoc.title}</h1>
        <div className="flex items-center justify-center gap-4 md:gap-6 text-sm text-muted-foreground flex-wrap">
          <span className="px-3 py-1 bg-muted rounded-full">调号: 1={scoreDoc.settings.keySignature}</span>
          <span className="px-3 py-1 bg-muted rounded-full">拍号: {scoreDoc.settings.timeSignature}</span>
          <span className="px-3 py-1 bg-muted rounded-full">速度: ♩ = {scoreDoc.settings.tempo}</span>
        </div>
      </div>

      <div className="mx-auto bg-white shadow-sm rounded-xl border border-border overflow-hidden pb-4 score-content relative" style={{ width: '794px', maxWidth: '100%' }}>
        {scoreDoc.measures.map((measure, index) => (
          <div key={measure.id} className={cn("measure-item transition-colors relative", selectedMeasureIndex === index && "bg-primary/5")}>
            <MeasureComponent
              measure={measure}
              index={index}
              selectedNoteIndex={selectedMeasureIndex === index ? selectedNoteIndex : null}
              keySignature={scoreDoc.settings.keySignature}
              showFingering={scoreDoc.settings.showFingering}
              showLyrics={scoreDoc.settings.showLyrics}
              onSelectNote={(noteIndex) => selectElement(index, noteIndex)}
              beams={scoreDoc.beams || []}
              measures={scoreDoc.measures}
            />
            {/* Render ties for this measure */}
            {ties.filter(tie => 
              tie.startNoteKey.startsWith(`${index}-`) || tie.endNoteKey.startsWith(`${index}-`)
            ).map((tie, tieIdx) => (
              <TieLine 
                key={tieIdx}
                startNoteKey={tie.startNoteKey}
                endNoteKey={tie.endNoteKey}
                containerRef={containerRef}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="mx-auto mt-6 flex justify-center" style={{ width: '794px', maxWidth: '100%' }}>
        <button onClick={addMeasure} className="px-6 py-3 border-2 border-dashed border-muted-foreground/30 rounded-xl text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-200 flex items-center gap-2">
          <span className="text-lg">+</span>
          <span>添加小节</span>
        </button>
      </div>

      <div className="h-24" />
    </div>
  );
}
