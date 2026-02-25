'use client';

import { useEffect, useRef } from 'react';
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
  onClick: () => void;
}

function NoteElementComponent({ 
  element, 
  measureIndex, 
  noteIndex, 
  isSelected, 
  keySignature,
  showFingering,
  onClick 
}: NoteElementProps) {
  if (element.type === 'note') {
    const fingeringUrl = showFingering 
      ? getFingeringUrl(keySignature as any, element.value, element.hasHighDot, element.hasLowDot)
      : null;

    return (
      <div
        className={cn(
          "inline-flex flex-col items-center cursor-pointer transition-all rounded-lg py-1 w-16 flex-shrink-0",
          isSelected 
            ? "bg-primary/10 shadow-md ring-2 ring-primary" 
            : "hover:bg-muted/50"
        )}
        onClick={onClick}
      >
        {/* 指法图 - 放在最上方 */}
        {fingeringUrl && (
          <div className="w-14 h-14 mb-1">
            <img 
              src={fingeringUrl} 
              alt={`指法 ${element.value}`}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </div>
        )}

        {/* 高音点 */}
        {element.hasHighDot && (
          <span className="text-base leading-none">·</span>
        )}
        
        {/* 音符值 */}
        <div className="relative flex items-center justify-center">
          <span className="text-2xl font-bold leading-tight">{element.value}</span>
        </div>

        {/* 低音点 */}
        {element.hasLowDot && (
          <span className="text-base leading-none">·</span>
        )}
      </div>
    );
  }

  if (element.type === 'rest') {
    return (
      <div
        className={cn(
          "inline-flex flex-col items-center justify-center w-16 py-3 cursor-pointer transition-all rounded-lg flex-shrink-0",
          isSelected 
            ? "bg-primary/10 shadow-md ring-2 ring-primary" 
            : "hover:bg-muted/50"
        )}
        onClick={onClick}
      >
        <span className="text-2xl font-bold text-muted-foreground">0</span>
      </div>
    );
  }

  if (element.type === 'extension') {
    return (
      <div
        className={cn(
          "inline-flex items-center justify-center w-10 py-3 cursor-pointer transition-all rounded-lg flex-shrink-0",
          isSelected 
            ? "bg-primary/10 ring-2 ring-primary" 
            : "hover:bg-muted/50"
        )}
        onClick={onClick}
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

function MeasureComponent({
  measure,
  index,
  selectedNoteIndex,
  keySignature,
  showFingering,
  onSelectNote,
}: MeasureComponentProps) {
  return (
    <div className="flex items-end gap-3 px-4 py-3 border-b border-dashed border-muted-foreground/20">
      {/* 小节序号 - 底部对齐 */}
      <span className="text-xs text-muted-foreground w-6 shrink-0 mb-1">{index + 1}</span>
      
      {/* 音符容器 - A4纸宽度，自动换行 */}
      <div className="flex flex-wrap content-start items-start gap-1 w-[794px] max-w-full">
        {measure.elements.map((element, noteIndex) => (
          <NoteElementComponent
            key={element.id}
            element={element}
            measureIndex={index}
            noteIndex={noteIndex}
            isSelected={selectedNoteIndex === noteIndex}
            keySignature={keySignature}
            showFingering={showFingering}
            onClick={() => onSelectNote(noteIndex)}
          />
        ))}
        
        {/* 空状态提示 */}
        {measure.elements.length === 0 && (
          <div className="flex items-center justify-center w-full h-20 text-sm text-muted-foreground/50 italic">
            点击左侧音符按钮添加音符
          </div>
        )}
      </div>

      {/* 小节线 */}
      <div className="w-0.5 h-16 bg-muted-foreground/20 ml-2" />
    </div>
  );
}

export function ScoreCanvas() {
  const { 
    document, 
    selectedMeasureIndex, 
    selectedNoteIndex,
    selectElement,
    addMeasure,
  } = useScoreStore();

  const containerRef = useRef<HTMLDivElement>(null);

  // 自动滚动到选中的小节
  useEffect(() => {
    if (selectedMeasureIndex !== null && containerRef.current) {
      const measureElements = containerRef.current.querySelectorAll('.measure-item');
      const selectedMeasure = measureElements[selectedMeasureIndex];
      if (selectedMeasure) {
        selectedMeasure.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedMeasureIndex]);

  // 背景色根据皮肤设置
  const getSkinBackground = () => {
    switch (document.settings.skin) {
      case 'light-beige':
        return 'bg-amber-50/30';
      case 'light-blue':
        return 'bg-blue-50/30';
      default:
        return 'bg-slate-50/50';
    }
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "flex-1 overflow-y-auto p-4 md:p-8",
        getSkinBackground()
      )}
    >
      {/* 乐谱头部信息 */}
      <div className="mx-auto mb-6 text-center space-y-2" style={{ width: '794px', maxWidth: '100%' }}>
        <h1 className="text-2xl font-bold text-foreground">{document.title}</h1>
        <div className="flex items-center justify-center gap-4 md:gap-6 text-sm text-muted-foreground flex-wrap">
          <span className="px-3 py-1 bg-muted rounded-full">调号: 1={document.settings.keySignature}</span>
          <span className="px-3 py-1 bg-muted rounded-full">拍号: {document.settings.timeSignature}</span>
          <span className="px-3 py-1 bg-muted rounded-full">速度: ♩ = {document.settings.tempo}</span>
        </div>
      </div>

      {/* 乐谱内容 - A4纸宽度 */}
      <div className="mx-auto bg-white shadow-sm rounded-xl border border-border overflow-hidden pb-4" style={{ width: '794px', maxWidth: '100%' }}>
        {document.measures.map((measure, index) => (
          <div 
            key={measure.id} 
            className={cn(
              "measure-item transition-colors",
              selectedMeasureIndex === index && "bg-primary/5"
            )}
          >
            <MeasureComponent
              measure={measure}
              index={index}
              selectedNoteIndex={selectedMeasureIndex === index ? selectedNoteIndex : null}
              keySignature={document.settings.keySignature}
              showFingering={document.settings.showFingering}
              onSelectNote={(noteIndex) => selectElement(index, noteIndex)}
            />
          </div>
        ))}
      </div>

      {/* 添加小节按钮 */}
      <div className="mx-auto mt-6 flex justify-center" style={{ width: '794px', maxWidth: '100%' }}>
        <button
          onClick={addMeasure}
          className="px-6 py-3 border-2 border-dashed border-muted-foreground/30 rounded-xl text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-200 flex items-center gap-2"
        >
          <span className="text-lg">+</span>
          <span>添加小节</span>
        </button>
      </div>

      {/* 底部留白 */}
      <div className="h-24" />
    </div>
  );
}
