'use client';

import { useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useScoreStore } from '../hooks/useScoreStore';
import { getFingeringUrl } from '../lib/fingeringMap';
import type { ScoreElement, Measure } from '@/lib/editor/types';

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
  noteRef 
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
          "inline-flex flex-col items-center cursor-pointer transition-all rounded-lg py-1 w-16 flex-shrink-0 relative",
          isSelected ? "bg-primary/10 shadow-md ring-2 ring-primary" : "hover:bg-muted/50"
        )}
        onClick={onClick}
        data-note-key={`${measureIndex}-${noteIndex}`}
      >
        {fingeringUrl && (
          <div className="w-14 h-14 flex-shrink-0">
            <img src={fingeringUrl} alt={`指法 ${element.value}`} className="w-full h-full object-contain" loading="lazy" />
          </div>
        )}
        {element.hasHighDot && <span className="text-base leading-none h-4">·</span>}
        <div className="flex items-center justify-center h-8">
          <span className="text-2xl font-bold">{element.value}</span>
        </div>
        {element.hasLowDot && <span className="text-base leading-none h-4">·</span>}
        {/* 歌词显示 */}
        {showLyrics && element.lyrics && (
          <span className="text-xs text-muted-foreground mt-1 font-medium truncate max-w-full px-1">
            {element.lyrics}
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
  onSelectNote: (noteIndex: number) => void;
}

function MeasureComponent({ measure, index, selectedNoteIndex, keySignature, showFingering, showLyrics, onSelectNote }: MeasureComponentProps & { showLyrics: boolean }) {
  const noteRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  return (
    <div className="flex items-end gap-3 px-4 py-3 border-b-2 border-muted-foreground/30 relative">
      <span className="text-xs text-muted-foreground w-6 shrink-0 mb-1 font-medium">{index + 1}</span>
      <div className="flex flex-wrap content-start items-start gap-2 w-[794px] max-w-full">
        {measure.elements.map((element, noteIndex) => (
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
          />
        ))}
        {measure.elements.length === 0 && (
          <div className="flex items-center justify-center w-full h-20 text-sm text-muted-foreground/50 italic">
            点击左侧音符按钮添加音符
          </div>
        )}
      </div>
      {/* 小节线 - 更明显的视觉分隔 */}
      <div className="w-1 h-20 bg-gradient-to-b from-transparent via-muted-foreground/40 to-transparent ml-2 rounded-full" />
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

import { useState } from 'react';

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
