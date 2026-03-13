'use client';

import { useEffect, useRef, memo, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
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
}

// 计算时值线数量（仅根据音符时值，无连接逻辑）
const getBeamCount = (duration: string): number => {
  switch (duration) {
    case '1/8': return 1;
    case '1/16': return 2;
    case '1/32': return 3;
    default: return 0;
  }
};

// 优化：使用 memo 包裹 NoteElementComponent
const NoteElementComponent = memo(function NoteElementComponent({
  element,
  measureIndex,
  noteIndex,
  isSelected,
  keySignature,
  showFingering,
  showLyrics,
  onClick,
}: NoteElementProps) {
  if (element.type === 'note') {
    const fingeringUrl = showFingering
      ? getFingeringUrl(keySignature as any, element.value, element.hasHighDot, element.hasLowDot)
      : null;

    const beamCount = getBeamCount(element.duration);

    return (
      <div
        className={cn(
          "inline-flex flex-col items-center cursor-pointer transition-all rounded-lg py-1 w-16 flex-shrink-0 relative",
          isSelected ? "bg-primary/10 shadow-md ring-2 ring-primary" : "hover:bg-muted/50"
        )}
        onClick={onClick}
        data-note-key={`${measureIndex}-${noteIndex}`}
      >
        {/* 指法图 - 固定高度容器 */}
        <div className="w-14 h-14 flex-shrink-0">
          {fingeringUrl && (
            <img
              src={fingeringUrl}
              alt={`指法 ${element.value}`}
              className="w-full h-full object-contain"
              loading="lazy"
              decoding="async"
            />
          )}
        </div>
        {/* 高音点 - 固定高度容器 */}
        <div className="h-4 flex items-center justify-center">
          {element.hasHighDot && <span className="text-base leading-none">·</span>}
        </div>
        {/* 音符数字 */}
        <div className="flex items-center justify-center h-8">
          <span className="text-2xl font-bold text-foreground">{element.value}</span>
        </div>
        {/* 低音点 - 固定高度容器 */}
        <div className="h-4 flex items-center justify-center">
          {element.hasLowDot && <span className="text-base leading-none">·</span>}
        </div>
        {/* 时值线（减时线） */}
        {beamCount > 0 && (
          <div className="flex flex-col items-center gap-[2px] mt-1">
            {Array.from({ length: beamCount }).map((_, i) => (
              <div key={i} className="w-6 h-[2px] bg-foreground" />
            ))}
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
        className={cn(
          "inline-flex flex-col items-center cursor-pointer transition-all rounded-lg py-1 w-10 flex-shrink-0 relative",
          isSelected ? "bg-primary/10 ring-2 ring-primary" : "hover:bg-muted/50"
        )}
        onClick={onClick}
        data-note-key={`${measureIndex}-${noteIndex}`}
      >
        {/* 占位：指法图高度 */}
        <div className="w-14 h-14 flex-shrink-0" />
        {/* 占位：高音点高度 */}
        <div className="h-4 flex-shrink-0" />
        {/* 延长线 - 与音符数字对齐 */}
        <div className="flex items-center justify-center h-8">
          <span className="text-2xl font-bold text-muted-foreground">—</span>
        </div>
        {/* 占位：低音点高度 */}
        <div className="h-4 flex-shrink-0" />
      </div>
    );
  }

  if (element.type === 'barline') {
    return (
      <div
        className={cn(
          "inline-flex flex-col items-center cursor-pointer transition-all rounded-lg py-1 w-8 flex-shrink-0 relative",
          isSelected ? "bg-primary/10 ring-2 ring-primary" : "hover:bg-muted/50"
        )}
        onClick={onClick}
        data-note-key={`${measureIndex}-${noteIndex}`}
      >
        {/* 占位：指法图高度 */}
        <div className="w-14 h-14 flex-shrink-0" />
        {/* 占位：高音点高度 */}
        <div className="h-4 flex-shrink-0" />
        {/* 小节线 - 与音符数字对齐 */}
        <div className="flex items-center justify-center h-8">
          <span className="text-2xl font-bold text-foreground">|</span>
        </div>
        {/* 占位：低音点高度 */}
        <div className="h-4 flex-shrink-0" />
      </div>
    );
  }

  return null;
}, (prevProps, nextProps) => {
  // 自定义比较函数：只有关键属性变化时才重渲染
  return (
    prevProps.element === nextProps.element &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.showFingering === nextProps.showFingering &&
    prevProps.showLyrics === nextProps.showLyrics &&
    prevProps.keySignature === nextProps.keySignature
  );
});

interface MeasureComponentProps {
  measure: Measure;
  index: number;
  selectedNoteIndex: number | null;
  keySignature: string;
  showFingering: boolean;
  showLyrics: boolean;
  onSelectNote: (noteIndex: number) => void;
  style?: React.CSSProperties;
}

// 优化：使用 memo 包裹 MeasureComponent
const MeasureComponent = memo(function MeasureComponent({
  measure,
  index,
  selectedNoteIndex,
  keySignature,
  showFingering,
  showLyrics,
  onSelectNote,
  style,
}: MeasureComponentProps) {
  const handleSelectNote = useCallback((noteIndex: number) => {
    onSelectNote(noteIndex);
  }, [onSelectNote]);

  return (
    <div
      className="flex items-end gap-3 px-4 py-3 relative"
      style={style}
    >
      <div className="flex flex-wrap content-start items-start gap-2 w-full">
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
            onClick={() => handleSelectNote(noteIndex)}
          />
        ))}
        {measure.elements.length === 0 && (
          <div className="flex items-center justify-center w-full h-20 text-sm text-muted-foreground/50 italic">
            点击左侧音符按钮添加音符
          </div>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数
  return (
    prevProps.measure === nextProps.measure &&
    prevProps.selectedNoteIndex === nextProps.selectedNoteIndex &&
    prevProps.showFingering === nextProps.showFingering &&
    prevProps.showLyrics === nextProps.showLyrics &&
    prevProps.keySignature === nextProps.keySignature
  );
});

// 预估小节高度
const ESTIMATED_MEASURE_HEIGHT = 120;

export function ScoreCanvas() {
  const {
    document: scoreDoc,
    selectedMeasureIndex,
    selectedNoteIndex,
    selectElement,
    addMeasure,
  } = useScoreStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 虚拟滚动实现
  const virtualizer = useVirtualizer({
    count: scoreDoc.measures.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => ESTIMATED_MEASURE_HEIGHT,
    overscan: 5, // 上下多渲染 5 个小节，避免滚动时的白屏
    getItemKey: (index) => scoreDoc.measures[index]?.id ?? index,
  });

  const virtualItems = virtualizer.getVirtualItems();

  // 选中小节时滚动到视图
  useEffect(() => {
    if (selectedMeasureIndex !== null && scrollContainerRef.current) {
      virtualizer.scrollToIndex(selectedMeasureIndex, {
        align: 'center',
        behavior: 'smooth',
      });
    }
  }, [selectedMeasureIndex, virtualizer]);

  // 导出图片处理
  useEffect(() => {
    const handleExportImage = async () => {
      // 导出时临时渲染所有小节
      const scoreContent = containerRef.current?.querySelector('.score-content');
      if (!scoreContent) return;

      try {
        const html2canvas = (window as any).html2canvas;
        if (!html2canvas) {
          alert('导出功能未加载');
          return;
        }

        const canvas = await html2canvas(scoreContent as HTMLElement, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
        });

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

  const handleSelectNote = useCallback((measureIndex: number, noteIndex: number) => {
    selectElement(measureIndex, noteIndex);
  }, [selectElement]);

  return (
    <div ref={containerRef} className={cn("flex-1 flex flex-col h-full overflow-hidden", getSkinBackground())}>
      {/* 标题区域 - 更紧凑 */}
      <div className="px-4 py-3 border-b bg-background/50 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">{scoreDoc.title}</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <span className="px-2 py-0.5 bg-muted rounded">调号: 1={scoreDoc.settings.keySignature}</span>
              <span className="px-2 py-0.5 bg-muted rounded">拍号: {scoreDoc.settings.timeSignature}</span>
              <span className="px-2 py-0.5 bg-muted rounded">速度: ♩ = {scoreDoc.settings.tempo}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 虚拟滚动容器 - 占据剩余空间 */}
      <div
        ref={scrollContainerRef}
        className="flex-1 bg-white overflow-auto score-content"
      >
        {/* 虚拟滚动总高度占位 */}
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualItems.map((virtualItem) => {
            const measure = scoreDoc.measures[virtualItem.index];
            const isSelectedMeasure = selectedMeasureIndex === virtualItem.index;

            return (
              <div
                key={measure.id}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                className={cn(
                  "measure-item transition-colors relative border-b border-border",
                  isSelectedMeasure && "bg-primary/5"
                )}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <MeasureComponent
                  measure={measure}
                  index={virtualItem.index}
                  selectedNoteIndex={isSelectedMeasure ? selectedNoteIndex : null}
                  keySignature={scoreDoc.settings.keySignature}
                  showFingering={scoreDoc.settings.showFingering}
                  showLyrics={scoreDoc.settings.showLyrics}
                  onSelectNote={(noteIndex) => handleSelectNote(virtualItem.index, noteIndex)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* 添加小节按钮 - 固定在底部 */}
      <div className="px-4 py-3 border-t bg-background shrink-0">
        <button
          onClick={addMeasure}
          className="w-full px-4 py-2 border-2 border-dashed border-muted-foreground/30 rounded-lg text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <span className="text-lg">+</span>
          <span>添加小节</span>
        </button>
      </div>
    </div>
  );
}
