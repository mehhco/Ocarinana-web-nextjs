'use client';

import { useCallback, memo } from 'react';
import { cn } from '@/lib/utils';
import { useScoreStore } from '../hooks/useScoreStore';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import type { ScoreElement, Measure } from '@/lib/editor/types';

// 指法图路径映射
function getFingeringImage(keySignature: string, noteValue: string, hasHighDot: boolean, hasLowDot: boolean): string {
  const keyMap: Record<string, string> = {
    'C': 'C-graph',
    'F': 'F-graph',
    'G': 'G-graph',
    'Bb': 'F-graph',
    'Eb': 'C-graph',
    'D': 'G-graph',
    'A': 'G-graph',
    'E': 'C-graph',
  };
  
  const folder = keyMap[keySignature] || 'C-graph';
  
  let filename = noteValue;
  if (hasHighDot) filename += 'h';
  if (hasLowDot) filename += 'l';
  
  return `/webfile/static/${folder}/${filename}.webp`;
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

// 音符渲染组件
const NoteElementComponent = memo(function NoteElementComponent({
  element,
  isSelected,
  keySignature,
  showFingering,
  onClick,
}: NoteElementProps) {
  if (element.type === 'note') {
    const fingeringUrl = showFingering
      ? getFingeringImage(keySignature, element.value, element.hasHighDot || false, element.hasLowDot || false)
      : null;

    return (
      <div
        className={cn(
          "flex flex-col items-center cursor-pointer transition-all w-10 py-1",
          isSelected ? "bg-indigo-50 rounded-md ring-2 ring-indigo-500" : "hover:bg-slate-50"
        )}
        onClick={onClick}
      >
        {/* 指法图 */}
        <div className="w-8 h-8 flex-shrink-0">
          {showFingering && fingeringUrl && (
            <Image
              src={fingeringUrl}
              alt={`${element.value}指法`}
              width={32}
              height={32}
              className="w-full h-full object-contain"
              unoptimized
            />
          )}
        </div>
        
        {/* 高音点 */}
        <div className="h-4 flex items-center justify-center flex-shrink-0">
          {element.hasHighDot && <span className="text-xl font-bold text-slate-800 leading-none">·</span>}
        </div>
        
        {/* 音符数字 */}
        <div className="h-5 flex items-center justify-center flex-shrink-0">
          <span className="text-lg font-bold text-slate-800">{element.value}</span>
        </div>
        
        {/* 低音点 */}
        <div className="h-4 flex items-center justify-center flex-shrink-0">
          {element.hasLowDot && <span className="text-xl font-bold text-slate-800 leading-none">·</span>}
        </div>
      </div>
    );
  }

  if (element.type === 'rest') {
    return (
      <div
        className={cn(
          "flex flex-col items-center cursor-pointer transition-all w-10 py-1",
          isSelected ? "bg-indigo-50 rounded-md ring-2 ring-indigo-500" : "hover:bg-slate-50"
        )}
        onClick={onClick}
      >
        {/* 占位：指法图位置 */}
        <div className="w-8 h-8 flex-shrink-0" />
        
        {/* 占位：高音点位置 */}
        <div className="h-4 flex-shrink-0" />
        
        {/* 休止符数字 - 与音符数字同高度 */}
        <div className="h-5 flex items-center justify-center flex-shrink-0">
          <span className="text-lg font-bold text-slate-800">0</span>
        </div>
        
        {/* 占位：低音点位置 */}
        <div className="h-4 flex-shrink-0" />
      </div>
    );
  }

  if (element.type === 'extension') {
    return (
      <div
        className={cn(
          "flex flex-col items-center cursor-pointer transition-all w-6 py-1",
          isSelected ? "bg-indigo-50 rounded-md ring-2 ring-indigo-500" : "hover:bg-slate-50"
        )}
        onClick={onClick}
      >
        {/* 占位：指法图位置 */}
        <div className="w-8 h-8 flex-shrink-0" />
        
        {/* 占位：高音点位置 */}
        <div className="h-4 flex-shrink-0" />
        
        {/* 延长线 - 与音符数字同高度 */}
        <div className="h-5 flex items-center justify-center flex-shrink-0">
          <span className="text-lg font-bold text-slate-800">—</span>
        </div>
        
        {/* 占位：低音点位置 */}
        <div className="h-4 flex-shrink-0" />
      </div>
    );
  }

  if (element.type === 'barline') {
    return (
      <div
        className={cn(
          "flex flex-col items-center cursor-pointer transition-all w-4 py-1",
          isSelected ? "bg-indigo-50 rounded-md ring-2 ring-indigo-500" : "hover:bg-slate-50"
        )}
        onClick={onClick}
      >
        {/* 占位：指法图位置 */}
        <div className="w-8 h-8 flex-shrink-0" />
        
        {/* 占位：高音点位置 */}
        <div className="h-4 flex-shrink-0" />
        
        {/* 小节线 - 与音符数字同高度 */}
        <div className="h-5 flex items-center justify-center flex-shrink-0">
          <span className="text-lg font-bold text-slate-700">|</span>
        </div>
        
        {/* 占位：低音点位置 */}
        <div className="h-4 flex-shrink-0" />
      </div>
    );
  }

  return null;
});

interface MeasureProps {
  measure: Measure;
  measureIndex: number;
  selectedNoteIndex: number | null;
  keySignature: string;
  showFingering: boolean;
  onSelectNote: (noteIndex: number) => void;
}

// 小节组件 - 移除所有宽度限制，让音符根据容器宽度自由换行
const MeasureComponent = memo(function MeasureComponent({
  measure,
  measureIndex,
  selectedNoteIndex,
  keySignature,
  showFingering,
  onSelectNote,
}: MeasureProps) {
  return (
    <div className="flex flex-wrap items-start w-full px-1 py-2">
      {measure.elements.map((element, noteIndex) => (
        <NoteElementComponent
          key={element.id}
          element={element}
          measureIndex={measureIndex}
          noteIndex={noteIndex}
          isSelected={selectedNoteIndex === noteIndex}
          keySignature={keySignature}
          showFingering={showFingering}
          onClick={() => onSelectNote(noteIndex)}
        />
      ))}
    </div>
  );
});

export function ScoreCanvas() {
  const {
    document: scoreDoc,
    selectedMeasureIndex,
    selectedNoteIndex,
    selectElement,
    addMeasure,
    clearSelection,
  } = useScoreStore();

  const handleSelectNote = useCallback((measureIndex: number, noteIndex: number) => {
    // 如果点击的是已选中的音符，则取消选中
    if (selectedMeasureIndex === measureIndex && selectedNoteIndex === noteIndex) {
      clearSelection();
    } else {
      selectElement(measureIndex, noteIndex);
    }
  }, [selectElement, clearSelection, selectedMeasureIndex, selectedNoteIndex]);

  const handleBackgroundClick = useCallback((e: React.MouseEvent) => {
    // 如果点击的是背景（不是音符），则清除选中状态
    if (e.target === e.currentTarget) {
      clearSelection();
    }
  }, [clearSelection]);

  return (
    <div className="w-full h-full overflow-y-auto bg-white">
      {/* 乐谱标题区 */}
      <div className="text-center py-5 border-b border-slate-200 bg-slate-50/50">
        <h1 className="text-xl font-bold text-slate-800 mb-1">{scoreDoc.title}</h1>
        <div className="text-xs text-slate-500 flex items-center justify-center gap-4">
          <span>调号: <span className="font-medium text-slate-700">{scoreDoc.settings.keySignature}</span></span>
          <span>拍号: <span className="font-medium text-slate-700">{scoreDoc.settings.timeSignature}</span></span>
          <span>速度: <span className="font-medium text-slate-700">♩={scoreDoc.settings.tempo}</span></span>
        </div>
      </div>

      {/* 乐谱编辑区 - 确保占满全部可用宽度 */}
      <div className="p-4 w-full" onClick={handleBackgroundClick}>
        {/* 调号拍号 */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200 w-full">
          <div className="text-sm font-bold text-slate-800">
            {scoreDoc.settings.keySignature} {scoreDoc.settings.timeSignature}
          </div>
        </div>

        {/* 小节列表 - 移除任何宽度限制，让音符自由填充 */}
        <div className="space-y-3 w-full">
          {scoreDoc.measures.map((measure, measureIndex) => {
            const isSelected = selectedMeasureIndex === measureIndex;
            
            return (
              <div 
                key={measure.id}
                className={cn(
                  "border-b border-slate-300 pb-3 w-full",
                  isSelected && "bg-amber-50/30"
                )}
              >
                <MeasureComponent
                  measure={measure}
                  measureIndex={measureIndex}
                  selectedNoteIndex={isSelected ? selectedNoteIndex : null}
                  keySignature={scoreDoc.settings.keySignature}
                  showFingering={scoreDoc.settings.showFingering}
                  onSelectNote={(noteIndex) => handleSelectNote(measureIndex, noteIndex)}
                />
              </div>
            );
          })}
        </div>

        {/* 添加小节按钮 */}
        <button
          onClick={addMeasure}
          className="mt-4 w-full py-2.5 border-2 border-dashed border-slate-300 rounded-lg text-slate-400 hover:border-indigo-400 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          添加小节
        </button>
      </div>
    </div>
  );
}
