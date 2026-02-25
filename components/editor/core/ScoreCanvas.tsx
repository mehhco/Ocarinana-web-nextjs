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
          "relative flex flex-col items-center justify-center w-12 h-20 border-2 rounded cursor-pointer transition-all",
          isSelected 
            ? "border-primary bg-primary/10 shadow-md" 
            : "border-transparent hover:border-muted-foreground/30"
        )}
        onClick={onClick}
      >
        {/* 高音点 */}
        {element.hasHighDot && (
          <span className="absolute -top-1 text-lg">·</span>
        )}
        
        {/* 音符值 */}
        <span className="text-2xl font-bold">{element.value}</span>
        
        {/* 低音点 */}
        {element.hasLowDot && (
          <span className="absolute -bottom-1 text-lg">·</span>
        )}

        {/* 指法图 */}
        {fingeringUrl && (
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-14 h-14">
            <img 
              src={fingeringUrl} 
              alt={`指法 ${element.value}`}
              className="w-full h-full object-contain"
            />
          </div>
        )}
      </div>
    );
  }

  if (element.type === 'rest') {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center w-12 h-20 border-2 rounded cursor-pointer transition-all",
          isSelected 
            ? "border-primary bg-primary/10 shadow-md" 
            : "border-transparent hover:border-muted-foreground/30"
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
          "flex items-center justify-center w-8 h-20 border-2 rounded cursor-pointer transition-all",
          isSelected 
            ? "border-primary bg-primary/10" 
            : "border-transparent hover:border-muted-foreground/30"
        )}
        onClick={onClick}
      >
        <span className="text-xl font-bold text-muted-foreground">-</span>
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
    <div className="flex items-start gap-1 p-4 border-b border-dashed border-muted-foreground/30 min-h-[120px]">
      {/* 小节序号 */}
      <span className="text-xs text-muted-foreground w-6 shrink-0">{index + 1}</span>
      
      {/* 音符容器 */}
      <div className="flex flex-wrap gap-1 flex-1">
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
          <div className="flex items-center justify-center w-full h-20 text-sm text-muted-foreground/50">
            点击左侧音符按钮添加音符
          </div>
        )}
      </div>

      {/* 小节线 */}
      <div className="w-0.5 h-20 bg-muted-foreground/30 ml-2" />
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
        return 'bg-amber-50/50';
      case 'light-blue':
        return 'bg-blue-50/50';
      default:
        return 'bg-white';
    }
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "flex-1 overflow-y-auto p-8",
        getSkinBackground()
      )}
    >
      {/* 乐谱头部信息 */}
      <div className="max-w-4xl mx-auto mb-8 text-center space-y-2">
        <h1 className="text-2xl font-bold">{document.title}</h1>
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <span>调号: 1={document.settings.keySignature}</span>
          <span>拍号: {document.settings.timeSignature}</span>
          <span>速度: ♩ = {document.settings.tempo}</span>
        </div>
      </div>

      {/* 乐谱内容 */}
      <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg border overflow-hidden">
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
      <div className="max-w-4xl mx-auto mt-6 flex justify-center">
        <button
          onClick={addMeasure}
          className="px-6 py-3 border-2 border-dashed border-muted-foreground/30 rounded-lg text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          + 添加小节
        </button>
      </div>

      {/* 底部留白 */}
      <div className="h-32" />
    </div>
  );
}
