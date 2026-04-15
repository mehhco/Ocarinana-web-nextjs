'use client';

import Image from 'next/image';
import { memo, useCallback } from 'react';
import { PlusIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import { useScoreStore } from '../hooks/useScoreStore';
import type { Beam, Duration, Measure, ScoreElement } from '@/lib/editor/types';

function getFingeringImage(
  keySignature: string,
  noteValue: string,
  hasHighDot: boolean,
  hasLowDot: boolean
): string {
  const folder = `${keySignature}-graph`;

  let filename = noteValue;
  
  // b7（降7）是G调特有的高音，其文件名就是b7.webp，不需要加后缀
  if (noteValue === 'b7') {
    return `/webfile/static/${folder}/${filename}.webp`;
  }
  
  // 其他高音音符添加 h 后缀（如 1h, 2h...）
  if (hasHighDot) filename += 'h';
  // 低音音符添加 l 后缀（如 1l, 2l...）
  if (hasLowDot) filename += 'l';

  return `/webfile/static/${folder}/${filename}.webp`;
}

// 检查音符在该调号下是否有对应的指法图
function hasFingeringForKey(keySignature: string, noteValue: string, hasHighDot: boolean, hasLowDot: boolean): boolean {
  // C调可用: 高音1-4, 中音1-7, 低音6-7
  if (keySignature === 'C') {
    if (hasHighDot) return ['1', '2', '3', '4'].includes(noteValue);
    if (hasLowDot) return ['6', '7'].includes(noteValue);
    return ['1', '2', '3', '4', '5', '6', '7'].includes(noteValue);
  }
  // F调可用: 高音1, 中音1-7, 低音3-7
  if (keySignature === 'F') {
    if (hasHighDot) return ['1'].includes(noteValue);
    if (hasLowDot) return ['3', '4', '5', '6', '7'].includes(noteValue);
    return ['1', '2', '3', '4', '5', '6', '7'].includes(noteValue);
  }
  // G调可用: 高音b7, 中音1-7, 低音2-5
  if (keySignature === 'G') {
    if (noteValue === 'b7') return true;
    if (hasHighDot) return false;
    if (hasLowDot) return ['2', '3', '4', '5'].includes(noteValue);
    return ['1', '2', '3', '4', '5', '6', '7'].includes(noteValue);
  }
  return false;
}

function getDurationLineCount(duration: Duration): number {
  switch (duration) {
    case '1/8': return 1;
    case '1/16': return 2;
    case '1/32': return 3;
    default: return 0;
  }
}

function getElementDurationLineCount(element: ScoreElement): number {
  if (element.type !== 'note') return 0;
  return getDurationLineCount(element.duration);
}

function getDurationBeamSegmentPosition(
  beams: Beam[],
  measureElements: ScoreElement[],
  measureIndex: number,
  noteIndex: number,
  level: number
): 'none' | 'start' | 'middle' | 'end' {
  for (const beam of beams) {
    if (
      beam.startMeasureIndex !== measureIndex ||
      beam.endMeasureIndex !== measureIndex ||
      noteIndex < beam.startNoteIndex ||
      noteIndex > beam.endNoteIndex
    ) {
      continue;
    }

    let segmentStart: number | null = null;

    for (let i = beam.startNoteIndex; i <= beam.endNoteIndex; i += 1) {
      const canJoinAtLevel = getElementDurationLineCount(measureElements[i]) >= level;

      if (canJoinAtLevel) {
        if (segmentStart === null) {
          segmentStart = i;
        }
        continue;
      }

      if (segmentStart !== null) {
        const segmentEnd = i - 1;
        if (segmentEnd - segmentStart + 1 >= 2 && segmentStart <= noteIndex && noteIndex <= segmentEnd) {
          if (noteIndex === segmentStart) return 'start';
          if (noteIndex === segmentEnd) return 'end';
          return 'middle';
        }
        segmentStart = null;
      }
    }

    if (segmentStart !== null) {
      const segmentEnd = beam.endNoteIndex;
      if (segmentEnd - segmentStart + 1 >= 2 && segmentStart <= noteIndex && noteIndex <= segmentEnd) {
        if (noteIndex === segmentStart) return 'start';
        if (noteIndex === segmentEnd) return 'end';
        return 'middle';
      }
    }
  }

  return 'none';
}

interface NoteElementProps {
  element: ScoreElement;
  measureIndex: number;
  noteIndex: number;
  isSelected: boolean;
  isBeamPreview: boolean;
  keySignature: string;
  showFingering: boolean;
  measureElements: ScoreElement[];
  beams: Beam[];
  isBeamStart: boolean;
  onClick: () => void;
}

const NoteElementComponent = memo(function NoteElementComponent({
  element,
  measureIndex,
  noteIndex,
  isSelected,
  isBeamPreview,
  keySignature,
  showFingering,
  measureElements,
  beams,
  isBeamStart,
  onClick,
}: NoteElementProps) {
  if (element.type === 'note') {
    const durationLineCount = getDurationLineCount(element.duration);
    const hasDurationLines = durationLineCount > 0;

    // 检查音符在该调号下是否有对应的指法图
    const hasFingering = showFingering && hasFingeringForKey(
      keySignature,
      element.value,
      element.hasHighDot || false,
      element.hasLowDot || false
    );
    const fingeringUrl = hasFingering
      ? getFingeringImage(
          keySignature,
          element.value,
          element.hasHighDot || false,
          element.hasLowDot || false
        )
      : null;

    return (
      <div
        className={cn(
          'flex w-14 cursor-pointer flex-col items-center py-1 transition-all',
          isBeamStart || isBeamPreview
            ? 'rounded-md bg-amber-50 ring-2 ring-amber-500'
            : isSelected
              ? 'rounded-md bg-indigo-50 ring-2 ring-indigo-500'
              : 'hover:bg-slate-50'
        )}
        onClick={onClick}
      >
        {/* 指法图区域：有指法图时显示，否则留白 */}
        <div className={cn('w-12 flex-shrink-0 overflow-hidden transition-[height]', showFingering ? 'h-12' : 'h-0')}>
          {fingeringUrl && (
            <Image
              src={fingeringUrl}
              alt={`${element.value} 指法图`}
              width={48}
              height={48}
              className="h-full w-full object-contain"
              unoptimized
            />
          )}
        </div>

        <div className="flex h-4 flex-shrink-0 items-center justify-center">
          {/* b7是G调特有的高音，不需要显示高音点标记 */}
          {element.hasHighDot && element.value !== 'b7' && <span className="text-xl font-bold leading-none text-slate-800">•</span>}
        </div>

        <div className="flex h-5 flex-shrink-0 items-center justify-center">
          <span className="text-lg font-bold leading-none text-slate-800">{element.value}</span>
        </div>

        {hasDurationLines && (
          <div className="mt-1 flex w-full flex-shrink-0 flex-col items-center gap-[3px]">
            {[1, 2, 3].map((level) => {
              const shouldShowLine = level <= durationLineCount;
              const beamSegmentPosition = getDurationBeamSegmentPosition(
                beams,
                measureElements,
                measureIndex,
                noteIndex,
                level
              );

              return (
                <span
                  key={level}
                  className={cn(
                    'block h-0 flex-shrink-0 box-border border-t-[2px] border-solid',
                    shouldShowLine ? 'border-slate-900' : 'border-transparent',
                    beamSegmentPosition === 'middle' && 'w-full',
                    beamSegmentPosition === 'start' && 'w-[calc(50%+0.625rem)] self-end',
                    beamSegmentPosition === 'end' && 'w-[calc(50%+0.625rem)] self-start',
                    beamSegmentPosition === 'none' && 'w-5'
                  )}
                />
              );
            })}
          </div>
        )}

        <div className="flex h-4 flex-shrink-0 items-center justify-center">
          {element.hasLowDot && <span className="text-xl font-bold leading-none text-slate-800">•</span>}
        </div>
      </div>
    );
  }

  if (element.type === 'rest') {
    return (
      <div
        className={cn(
          'flex w-14 cursor-pointer flex-col items-center py-1 transition-all',
          isSelected ? 'rounded-md bg-indigo-50 ring-2 ring-indigo-500' : 'hover:bg-slate-50'
        )}
        onClick={onClick}
      >
        <div className={cn('w-12 flex-shrink-0 overflow-hidden transition-[height]', showFingering ? 'h-12' : 'h-0')} />
        <div className="h-4 flex-shrink-0" />
        <div className="flex h-5 flex-shrink-0 items-center justify-center">
          <span className="text-lg font-bold text-slate-800">0</span>
        </div>
        <div className="h-[14px] flex-shrink-0" />
        <div className="h-4 flex-shrink-0" />
      </div>
    );
  }

  if (element.type === 'extension') {
    return (
      <div
        className={cn(
          'flex w-10 cursor-pointer flex-col items-center py-1 transition-all',
          isSelected ? 'rounded-md bg-indigo-50 ring-2 ring-indigo-500' : 'hover:bg-slate-50'
        )}
        onClick={onClick}
      >
        <div className={cn('w-12 flex-shrink-0 overflow-hidden transition-[height]', showFingering ? 'h-12' : 'h-0')} />
        <div className="h-4 flex-shrink-0" />
        <div className="flex h-5 flex-shrink-0 items-center justify-center">
          <span className="text-lg font-bold text-slate-800">-</span>
        </div>
        <div className="h-[14px] flex-shrink-0" />
        <div className="h-4 flex-shrink-0" />
      </div>
    );
  }

  if (element.type === 'barline') {
    return (
      <div
        className={cn(
          'flex w-8 cursor-pointer flex-col items-center py-1 transition-all',
          isSelected ? 'rounded-md bg-indigo-50 ring-2 ring-indigo-500' : 'hover:bg-slate-50'
        )}
        onClick={onClick}
      >
        <div className={cn('w-12 flex-shrink-0 overflow-hidden transition-[height]', showFingering ? 'h-12' : 'h-0')} />
        <div className="h-4 flex-shrink-0" />
        <div className="flex h-5 flex-shrink-0 items-center justify-center">
          <span className="text-lg font-bold text-slate-700">|</span>
        </div>
        <div className="h-[14px] flex-shrink-0" />
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
  beams: Beam[];
  beamStartPosition: { measureIndex: number; noteIndex: number } | null;
  isBeamMode: boolean;
  onSelectNote: (noteIndex: number) => void;
}

const MeasureComponent = memo(function MeasureComponent({
  measure,
  measureIndex,
  selectedNoteIndex,
  keySignature,
  showFingering,
  beams,
  beamStartPosition,
  isBeamMode,
  onSelectNote,
}: MeasureProps) {
  return (
    <div className="flex w-full flex-wrap items-start px-1 py-2">
      {measure.elements.map((element, noteIndex) => (
        <NoteElementComponent
          key={element.id}
          element={element}
          measureIndex={measureIndex}
          noteIndex={noteIndex}
          isSelected={selectedNoteIndex === noteIndex}
          isBeamPreview={
            !!(
              isBeamMode &&
              beamStartPosition &&
              beamStartPosition.measureIndex === measureIndex &&
              selectedNoteIndex !== null &&
              selectedNoteIndex > beamStartPosition.noteIndex &&
              beamStartPosition.noteIndex <= noteIndex &&
              noteIndex <= selectedNoteIndex
            )
          }
          keySignature={keySignature}
          showFingering={showFingering}
          measureElements={measure.elements}
          beams={beams}
          isBeamStart={
            beamStartPosition?.measureIndex === measureIndex &&
            beamStartPosition.noteIndex === noteIndex
          }
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
    isBeamMode,
    beamStartPosition,
    startBeam,
    cancelBeamMode,
  } = useScoreStore();

  const handleSelectNote = useCallback(
    (measureIndex: number, noteIndex: number) => {
      if (isBeamMode) {
        const element = scoreDoc.measures[measureIndex]?.elements[noteIndex];

        if (!element || element.type !== 'note') return;

        if (!beamStartPosition) {
          startBeam(measureIndex, noteIndex);
          selectElement(measureIndex, noteIndex);
          return;
        }

        if (beamStartPosition.measureIndex !== measureIndex || noteIndex <= beamStartPosition.noteIndex) {
          startBeam(measureIndex, noteIndex);
          selectElement(measureIndex, noteIndex);
          return;
        }

        selectElement(measureIndex, noteIndex);
        return;
      }

      if (selectedMeasureIndex === measureIndex && selectedNoteIndex === noteIndex) {
        clearSelection();
      } else {
        selectElement(measureIndex, noteIndex);
      }
    },
    [
      beamStartPosition,
      clearSelection,
      isBeamMode,
      scoreDoc.measures,
      selectElement,
      selectedMeasureIndex,
      selectedNoteIndex,
      startBeam,
    ]
  );

  const handleBackgroundClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        if (isBeamMode) {
          cancelBeamMode();
        } else {
          clearSelection();
        }
      }
    },
    [cancelBeamMode, clearSelection, isBeamMode]
  );

  return (
    <div className="h-full w-full overflow-y-auto bg-white">
      <div className="border-b border-slate-200 bg-slate-50/50 py-3 text-center">
        <h1 className="mb-1 text-lg font-bold text-slate-800">{scoreDoc.title}</h1>
        <div className="flex items-center justify-center gap-3 text-[11px] text-slate-500">
          <span>
            调号: <span className="font-medium text-slate-700">{scoreDoc.settings.keySignature}</span>
          </span>
          <span>
            拍号: <span className="font-medium text-slate-700">{scoreDoc.settings.timeSignature}</span>
          </span>
          <span>
            速度: <span className="font-medium text-slate-700">♩={scoreDoc.settings.tempo}</span>
          </span>
        </div>
      </div>

      <div className="w-full px-4 pb-4 pt-3" onClick={handleBackgroundClick}>
        <div className="mb-3 flex w-full items-center gap-3 border-b border-slate-200 pb-2">
          <div className="text-xs font-semibold text-slate-800">
            {scoreDoc.settings.keySignature} {scoreDoc.settings.timeSignature}
          </div>
        </div>

        <div className="w-full space-y-2.5">
          {scoreDoc.measures.map((measure, measureIndex) => {
            const isSelected = selectedMeasureIndex === measureIndex;

            return (
              <div
                key={measure.id}
                className={cn('w-full border-b border-slate-300 pb-2.5', isSelected && 'bg-amber-50/30')}
              >
                <MeasureComponent
                  measure={measure}
                  measureIndex={measureIndex}
                  selectedNoteIndex={isSelected ? selectedNoteIndex : null}
                  keySignature={scoreDoc.settings.keySignature}
                  showFingering={scoreDoc.settings.showFingering}
                  beams={scoreDoc.beams || []}
                  beamStartPosition={beamStartPosition}
                  isBeamMode={isBeamMode}
                  onSelectNote={(noteIndex) => handleSelectNote(measureIndex, noteIndex)}
                />
              </div>
            );
          })}
        </div>

        <button
          onClick={addMeasure}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 py-2 text-sm font-medium text-slate-400 transition-all hover:border-indigo-400 hover:text-indigo-600"
        >
          <PlusIcon className="h-4 w-4" />
          添加小节
        </button>
      </div>
    </div>
  );
}
