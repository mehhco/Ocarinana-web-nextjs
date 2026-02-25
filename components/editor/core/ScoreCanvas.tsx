'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useScoreStore } from '../hooks/useScoreStore';
import { getFingeringUrl } from '../lib/fingeringMap';
import type { ScoreElement, Measure } from '@/lib/editor/types';

// 骨架屏组件 - 用于 SSR 和初始加载
function ScoreSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50">
      <div className="max-w-4xl mx-auto mb-6 text-center space-y-2">
        <div className="h-8 w-48 bg-muted rounded mx-auto animate-pulse" />
        <div className="flex items-center justify-center gap-4">
          <div className="h-6 w-24 bg-muted rounded-full animate-pulse" />
          <div className="h-6 w-24 bg-muted rounded-full animate-pulse" />
          <div className="h-6 w-24 bg-muted rounded-full animate-pulse" />
        </div>
      </div>
      <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-xl border border-border overflow-hidden p-8">
        <div className="h-20 bg-muted/50 rounded animate-pulse" />
      </div>
    </div>
  );
}

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
          "flex flex-col items-center justify-start w-14 cursor-pointer transition-all rounded-lg",
          isSelected 
            ? "bg-primary/10 shadow-md ring-2 ring-primary" 
            : "hover:bg-muted/50"
        )}
        onClick={onClick}
      >
        {/* 高音点 */}
        {element.hasHighDot && (
          <span className="text-lg leading-none h-4">·</span>
        )}
        
        {/* 音符值容器 */}
        <div className="relative flex items-center justify-center w-full h-12">
          <span className="text-3xl font-bold">{element.value}</span>
          
          {/* 低音点 */}
          {element.hasLowDot && (
            <span className="absolute bottom-0 text-lg">·</span>
          )}
        </div>

        {/* 指法图 - 放在音符下方 */}
        {fingeringUrl && (
          <div className="w-12 h-12 mt-1">
            <img 
              src={fingeringUrl} 
              alt={`指法 ${element.value}`}
              className="w-full h-full object-contain"
              loading="lazy"
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
          "flex flex-col items-center justify-center w-14 h-16 cursor-pointer transition-all rounded-lg",
          isSelected 
            ? "bg-primary/10 shadow-md ring-2 ring-primary" 
            : "hover:bg-muted/50"
        )}
        onClick={onClick}
      >
        <span className="text-3xl font-bold text-muted-foreground">0</span>
      </div>
    );
  }

  if (element.type === 'extension') {
    return (
      <div
        className={cn(
          "flex items-center justify-center w-8 h-16 cursor-pointer transition-all rounded-lg",
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
    <div className="flex items-start gap-3 p-4 border-b border-dashed border-muted-foreground/20">
      {/* 小节序号 */}
      <span className="text-xs text-muted-foreground w-6 shrink-0 pt-2">{index + 1}</span>
      
      {/* 音符容器 - 横向排列，自动换行 */}
      <div className="flex flex-wrap items-start gap-2 flex-1 min-h-[80px]">
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
      <div className="w-0.5 h-full min-h-[80px] bg-muted-foreground/20 ml-2" />
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
  const [mounted, setMounted] = useState(false);

  // 挂载后设置 mounted 状态，避免 hydration 不匹配
  useEffect(() => {
    setMounted(true);
  }, []);

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

  // 未挂载时显示骨架屏，避免 hydration 错误
  if (!mounted) {
    return <ScoreSkeleton />;
  }

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

  // 计算是否需要额外空间显示指法图
  const getContentPadding = () => {
    return document.settings.showFingering ? 'pb-8' : 'pb-4';
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
      <div className="max-w-4xl mx-auto mb-6 text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">{document.title}</h1>
        <div className="flex items-center justify-center gap-4 md:gap-6 text-sm text-muted-foreground flex-wrap">
          <span className="px-3 py-1 bg-muted rounded-full">调号: 1={document.settings.keySignature}</span>
          <span className="px-3 py-1 bg-muted rounded-full">拍号: {document.settings.timeSignature}</span>
          <span className="px-3 py-1 bg-muted rounded-full">速度: ♩ = {document.settings.tempo}</span>
        </div>
      </div>

      {/* 乐谱内容 */}
      <div className={cn(
        "max-w-4xl mx-auto bg-white shadow-sm rounded-xl border border-border overflow-hidden",
        getContentPadding()
      )}>
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
