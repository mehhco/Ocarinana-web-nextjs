'use client';

import Image from 'next/image';
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent,
  type CompositionEvent,
  type KeyboardEvent,
  type MouseEvent,
  type RefObject,
} from 'react';
import { PlusIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import { useScoreStore } from '../hooks/useScoreStore';
import { getFingeringUrl } from '../lib/fingeringMap';
import { LyricsInput } from '../overlay/LyricsInput';
import type { Beam, Duration, ExpressionMark, KeySignature, Lyric, Measure, ScoreElement, Tie } from '@/lib/editor/types';

interface NotePosition {
  measureIndex: number;
  noteIndex: number;
}

interface ScoreCanvasProps {
  exportRef?: RefObject<HTMLDivElement | null>;
}

function createPositionKey(measureIndex: number, noteIndex: number): string {
  return `${measureIndex}:${noteIndex}`;
}

function tokenizeLyricText(text: string): string[] {
  const normalized = text.replace(/\s+/g, ' ').trim();

  if (!normalized) {
    return [];
  }

  return normalized.match(/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*|[\u3400-\u9FFF]|[^\s]/g) ?? [];
}

function getDurationLineCount(duration: Duration): number {
  switch (duration) {
    case '1/8':
      return 1;
    case '1/16':
      return 2;
    case '1/32':
      return 3;
    default:
      return 0;
  }
}

function isBeamableElement(element: ScoreElement | undefined): element is ScoreElement & { duration: Duration } {
  return !!element && (element.type === 'note' || element.type === 'rest') && getDurationLineCount(element.duration) > 0;
}

function getElementDurationLineCount(element: ScoreElement | undefined): number {
  if (!isBeamableElement(element)) return 0;
  return getDurationLineCount(element.duration);
}

function getMeasureDurationLineCount(measure: Measure): number {
  return measure.elements.reduce((maxLineCount, element) => {
    if (element.type !== 'note' && element.type !== 'rest') {
      return maxLineCount;
    }

    return Math.max(maxLineCount, getDurationLineCount(element.duration));
  }, 0);
}

function getLowDotOffsetClassName(durationLineCount: number): string {
  switch (durationLineCount) {
    case 1:
      return '-top-[6px]';
    case 2:
      return '-top-[4px]';
    case 3:
      return '-top-[2px]';
    default:
      return '';
  }
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

function isPositionInDurationBeam(beams: Beam[], measureIndex: number, noteIndex: number): boolean {
  return beams.some(
    (beam) =>
      beam.startMeasureIndex === measureIndex &&
      beam.endMeasureIndex === measureIndex &&
      beam.startNoteIndex <= noteIndex &&
      noteIndex <= beam.endNoteIndex
  );
}

function getTieSegmentPosition(
  ties: Tie[],
  measureIndex: number,
  noteIndex: number
): 'none' | 'start' | 'middle' | 'end' {
  for (const tie of ties) {
    if (
      tie.startMeasureIndex !== measureIndex ||
      tie.endMeasureIndex !== measureIndex ||
      noteIndex < tie.startNoteIndex ||
      noteIndex > tie.endNoteIndex
    ) {
      continue;
    }

    if (noteIndex === tie.startNoteIndex) return 'start';
    if (noteIndex === tie.endNoteIndex) return 'end';
    return 'middle';
  }

  return 'none';
}

function TieSegment({
  position,
}: {
  position: 'none' | 'start' | 'middle' | 'end';
}) {
  return (
    <div className={TIE_SLOT_CLASS}>
      {position !== 'none' && (
        <span
          className={cn(
            'block h-2 border-t-2 border-slate-800',
            position === 'middle' && 'absolute bottom-0 left-0 right-0',
            position === 'start' && 'absolute bottom-0 left-1/2 right-0 rounded-tl-full',
            position === 'end' && 'absolute bottom-0 left-0 right-1/2 rounded-tr-full'
          )}
        />
      )}
    </div>
  );
}

function renderBarlineSymbol(element: ScoreElement) {
  if (element.type !== 'barline') return null;

  switch (element.barlineType) {
    case 'double':
      return <span className="tracking-[-0.12em]">||</span>;
    case 'final':
      return (
        <span className="flex h-6 items-stretch justify-center gap-1">
          <span className="block w-px bg-slate-700" />
          <span className="block w-[3px] bg-slate-700" />
        </span>
      );
    case 'repeat-start':
      return <span className="tracking-[-0.08em]">||:</span>;
    case 'repeat-end':
      return <span className="tracking-[-0.08em]">:||</span>;
    default:
      return <span>|</span>;
  }
}

function renderNoteValue(value: string) {
  return value === 'b7' ? '♭7' : value;
}

function buildNotePositions(measures: Measure[]): NotePosition[] {
  const positions: NotePosition[] = [];

  measures.forEach((measure, measureIndex) => {
    measure.elements.forEach((element, noteIndex) => {
      if (element.type === 'note') {
        positions.push({ measureIndex, noteIndex });
      }
    });
  });

  return positions;
}

const LYRIC_ROW_CLASS = 'mt-1 flex h-7 flex-shrink-0 items-center justify-center';
const TIE_SLOT_CLASS = 'relative h-[10px] w-full flex-shrink-0 overflow-hidden';
const EXPRESSION_ROW_CLASS = 'mt-0.5 flex h-5 flex-shrink-0 items-center justify-center';

function getDurationSlotClassName(slotLineCount: number): string {
  switch (slotLineCount) {
    case 1:
      return 'mt-1 flex h-[13px] w-full flex-shrink-0 flex-col items-center gap-[3px] pt-[8px]';
    case 2:
      return 'mt-1 flex h-[16px] w-full flex-shrink-0 flex-col items-center gap-[3px] pt-[8px]';
    case 3:
      return 'mt-1 flex h-[21px] w-full flex-shrink-0 flex-col items-center gap-[3px] pt-[8px]';
    default:
      return 'hidden';
  }
}

function getDurationSpacerClassName(slotLineCount: number): string {
  switch (slotLineCount) {
    case 1:
      return 'mt-1 h-[13px] flex-shrink-0';
    case 2:
      return 'mt-1 h-[16px] flex-shrink-0';
    case 3:
      return 'mt-1 h-[21px] flex-shrink-0';
    default:
      return 'hidden';
  }
}

function DurationLines({
  lineCount,
  slotLineCount,
  getLineClassName,
}: {
  lineCount: number;
  slotLineCount: number;
  getLineClassName?: (level: number) => string | undefined;
}) {
  return (
    <div className={getDurationSlotClassName(slotLineCount)}>
      {[1, 2, 3].slice(0, slotLineCount).map((level) => {
        const shouldShowLine = level <= lineCount;

        return (
          <span
            key={level}
            className={cn(
              'block h-[2px] flex-shrink-0',
              shouldShowLine ? 'bg-slate-900' : 'bg-transparent',
              getLineClassName ? getLineClassName(level) : 'w-3.5 rounded-full'
            )}
          />
        );
      })}
    </div>
  );
}

interface LyricFieldProps {
  value: string;
  active: boolean;
  disabled: boolean;
  placeholder?: string;
  inputRef: (node: HTMLInputElement | null) => void;
  onChange: (text: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (event: ClipboardEvent<HTMLInputElement>) => void;
  onCompositionStart: (event: CompositionEvent<HTMLInputElement>) => void;
  onCompositionEnd: (event: CompositionEvent<HTMLInputElement>) => void;
}

interface NoteElementProps {
  element: ScoreElement;
  measureIndex: number;
  noteIndex: number;
  isSelected: boolean;
  isBeamPreview: boolean;
  keySignature: KeySignature;
  showFingering: boolean;
  showLyrics: boolean;
  measureElements: ScoreElement[];
  durationSlotLineCount: number;
  beams: Beam[];
  ties: Tie[];
  isBeamStart: boolean;
  isTieStart: boolean;
  isTiePreview: boolean;
  isExporting: boolean;
  showTieRow: boolean;
  expression?: ExpressionMark;
  showExpressionRow: boolean;
  lyricField?: LyricFieldProps;
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
  showLyrics,
  measureElements,
  durationSlotLineCount,
  beams,
  ties,
  isBeamStart,
  isTieStart,
  isTiePreview,
  isExporting,
  showTieRow,
  expression,
  showExpressionRow,
  lyricField,
  onClick,
}: NoteElementProps) {
  if (element.type === 'note') {
    const durationLineCount = getDurationLineCount(element.duration);
    const hasDurationLines = durationLineCount > 0;
    const fingeringUrl = showFingering
      ? getFingeringUrl(keySignature, element.value, element.hasHighDot || false, element.hasLowDot || false)
      : null;
    const tieSegmentPosition = getTieSegmentPosition(ties, measureIndex, noteIndex);
    const isInDurationBeam = isPositionInDurationBeam(beams, measureIndex, noteIndex);

    return (
      <div
        className={cn(
          'flex w-14 cursor-pointer flex-col items-center py-1 transition-all',
          isBeamStart || isBeamPreview
            ? 'rounded-md bg-amber-50 ring-2 ring-amber-500'
            : isTieStart || isTiePreview
              ? 'rounded-md bg-sky-50 ring-2 ring-sky-500'
            : isSelected
              ? 'rounded-md bg-indigo-50 ring-2 ring-indigo-500'
              : 'hover:bg-slate-50'
        )}
        onClick={onClick}
      >
        <div className={cn('w-12 flex-shrink-0 overflow-hidden transition-[height]', showFingering ? 'h-12' : 'h-0')}>
          {fingeringUrl && (
            <Image
              src={fingeringUrl}
              alt={`${element.value} fingering`}
              width={48}
              height={48}
              className="h-full w-full object-contain"
              unoptimized
            />
          )}
        </div>

        {showTieRow && (
          <TieSegment position={tieSegmentPosition} />
        )}

        <div className="flex h-4 flex-shrink-0 items-center justify-center">
          {element.hasHighDot && element.value !== 'b7' && (
            <span className="text-xl font-bold leading-none text-slate-800">•</span>
          )}
        </div>

        <div className="flex h-5 flex-shrink-0 items-center justify-center">
          <div className="relative flex h-5 w-9 items-end justify-center">
            <span className="text-lg font-bold leading-none text-slate-800">{renderNoteValue(element.value)}</span>
            {element.hasAugmentationDot && (
              <span className="absolute bottom-0 right-0 text-sm font-bold leading-none text-slate-800">•</span>
            )}
          </div>
        </div>

        {hasDurationLines && (
          <DurationLines
            lineCount={durationLineCount}
            slotLineCount={durationSlotLineCount}
            getLineClassName={(level) => {
              const beamSegmentPosition = getDurationBeamSegmentPosition(
                beams,
                measureElements,
                measureIndex,
                noteIndex,
                level
              );

              return cn(
                beamSegmentPosition === 'middle' && '-mx-px w-[calc(100%+2px)] rounded-none',
                beamSegmentPosition === 'start' && '-mr-px w-[calc(50%+0.5625rem)] self-end rounded-l-full rounded-r-none',
                beamSegmentPosition === 'end' && '-ml-px w-[calc(50%+0.5625rem)] self-start rounded-l-none rounded-r-full',
                beamSegmentPosition === 'none' && isInDurationBeam && 'w-4 rounded-[1px]',
                beamSegmentPosition === 'none' && !isInDurationBeam && 'w-3.5 rounded-full'
              );
            }}
          />
        )}

        <div className="flex h-4 flex-shrink-0 items-center justify-center">
          {element.hasLowDot && (
            <span
              className={cn(
                'text-xl font-bold leading-none text-slate-800',
                hasDurationLines && 'relative',
                getLowDotOffsetClassName(durationLineCount)
              )}
            >
              •
            </span>
          )}
        </div>

        {showLyrics && !hasDurationLines && durationSlotLineCount > 0 && (
          <div className={getDurationSpacerClassName(durationSlotLineCount)} />
        )}

        {showLyrics && lyricField && (
          <div className={LYRIC_ROW_CLASS}>
            {isExporting ? (
              <span className="flex h-7 w-16 items-center justify-center px-1 text-center text-sm leading-none text-slate-700">
                {lyricField.value}
              </span>
            ) : (
              <LyricsInput
                value={lyricField.value}
                active={lyricField.active}
                disabled={lyricField.disabled}
                placeholder={lyricField.placeholder}
                inputRef={lyricField.inputRef}
                onChange={lyricField.onChange}
                onFocus={lyricField.onFocus}
                onBlur={lyricField.onBlur}
                onKeyDown={lyricField.onKeyDown}
                onPaste={lyricField.onPaste}
                onCompositionStart={lyricField.onCompositionStart}
                onCompositionEnd={lyricField.onCompositionEnd}
              />
            )}
          </div>
        )}

        {showExpressionRow && (
          <div className={EXPRESSION_ROW_CLASS}>
            {expression && (
              <span className="font-serif text-sm font-semibold italic leading-none text-slate-700">
                {expression.value}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  const widthClass = element.type === 'barline' ? 'w-8' : element.type === 'extension' ? 'w-10' : 'w-14';
  const symbol = element.type === 'rest' ? '0' : element.type === 'extension' ? '-' : null;
  const symbolColor = element.type === 'barline' ? 'text-slate-700' : 'text-slate-800';
  const restDurationLineCount = element.type === 'rest' ? getDurationLineCount(element.duration) : 0;
  const isInDurationBeam = isPositionInDurationBeam(beams, measureIndex, noteIndex);
  const tieSegmentPosition = getTieSegmentPosition(ties, measureIndex, noteIndex);

  return (
    <div
      className={cn(
        'flex cursor-pointer flex-col items-center py-1 transition-all',
        widthClass,
        isBeamStart || isBeamPreview
          ? 'rounded-md bg-amber-50 ring-2 ring-amber-500'
          : isSelected
            ? 'rounded-md bg-indigo-50 ring-2 ring-indigo-500'
            : 'hover:bg-slate-50'
      )}
      onClick={onClick}
    >
      <div className={cn('w-12 flex-shrink-0 overflow-hidden transition-[height]', showFingering ? 'h-12' : 'h-0')} />
      {showTieRow && <TieSegment position={tieSegmentPosition} />}
      <div className="h-4 flex-shrink-0" />
      <div className="flex h-5 flex-shrink-0 items-center justify-center">
        <span className={cn('text-lg font-bold', symbolColor)}>
          {element.type === 'barline' ? renderBarlineSymbol(element) : symbol}
        </span>
      </div>
      {restDurationLineCount > 0 ? (
        <DurationLines
          lineCount={restDurationLineCount}
          slotLineCount={durationSlotLineCount}
          getLineClassName={(level) => {
            const beamSegmentPosition = getDurationBeamSegmentPosition(
              beams,
              measureElements,
              measureIndex,
              noteIndex,
              level
            );

            return cn(
              beamSegmentPosition === 'middle' && '-mx-px w-[calc(100%+2px)] rounded-none',
              beamSegmentPosition === 'start' && '-mr-px w-[calc(50%+0.5625rem)] self-end rounded-l-full rounded-r-none',
              beamSegmentPosition === 'end' && '-ml-px w-[calc(50%+0.5625rem)] self-start rounded-l-none rounded-r-full',
              beamSegmentPosition === 'none' && isInDurationBeam && 'w-4 rounded-[1px]',
              beamSegmentPosition === 'none' && !isInDurationBeam && 'w-3.5 rounded-full'
            );
          }}
        />
      ) : durationSlotLineCount > 0 ? (
        <div className={getDurationSpacerClassName(durationSlotLineCount)} />
      ) : null}
      <div className="h-4 flex-shrink-0" />
      {showLyrics && <div className={LYRIC_ROW_CLASS} />}
      {showExpressionRow && <div className={EXPRESSION_ROW_CLASS} />}
    </div>
  );
});

interface MeasureProps {
  measure: Measure;
  measureIndex: number;
  selectedNoteIndex: number | null;
  keySignature: KeySignature;
  showFingering: boolean;
  showLyrics: boolean;
  durationSlotLineCount: number;
  beams: Beam[];
  ties: Tie[];
  beamStartPosition: { measureIndex: number; noteIndex: number } | null;
  tieStartPosition: { measureIndex: number; noteIndex: number } | null;
  isBeamMode: boolean;
  isTieMode: boolean;
  isExporting: boolean;
  showTieRow: boolean;
  lyricsDisabled: boolean;
  lyricsByKey: Map<string, string>;
  expressionsByKey: Map<string, ExpressionMark>;
  showExpressionRow: boolean;
  lyricDrafts: Record<string, string>;
  activeLyricKey: string | null;
  registerLyricInput: (measureIndex: number, noteIndex: number, node: HTMLInputElement | null) => void;
  onSelectNote: (noteIndex: number) => void;
  onLyricChange: (measureIndex: number, noteIndex: number, text: string) => void;
  onLyricFocus: (measureIndex: number, noteIndex: number) => void;
  onLyricBlur: (measureIndex: number, noteIndex: number) => void;
  onLyricKeyDown: (measureIndex: number, noteIndex: number, event: KeyboardEvent<HTMLInputElement>) => void;
  onLyricPaste: (measureIndex: number, noteIndex: number, event: ClipboardEvent<HTMLInputElement>) => void;
  onLyricCompositionStart: (
    measureIndex: number,
    noteIndex: number,
    event: CompositionEvent<HTMLInputElement>
  ) => void;
  onLyricCompositionEnd: (
    measureIndex: number,
    noteIndex: number,
    event: CompositionEvent<HTMLInputElement>
  ) => void;
}

const MeasureComponent = memo(function MeasureComponent({
  measure,
  measureIndex,
  selectedNoteIndex,
  keySignature,
  showFingering,
  showLyrics,
  durationSlotLineCount,
  beams,
  ties,
  beamStartPosition,
  tieStartPosition,
  isBeamMode,
  isTieMode,
  isExporting,
  showTieRow,
  lyricsDisabled,
  lyricsByKey,
  expressionsByKey,
  showExpressionRow,
  lyricDrafts,
  activeLyricKey,
  registerLyricInput,
  onSelectNote,
  onLyricChange,
  onLyricFocus,
  onLyricBlur,
  onLyricKeyDown,
  onLyricPaste,
  onLyricCompositionStart,
  onLyricCompositionEnd,
}: MeasureProps) {
  return (
    <div className="flex w-full flex-wrap items-start px-1 py-2">
      {measure.elements.map((element, noteIndex) => {
        const positionKey = createPositionKey(measureIndex, noteIndex);

        return (
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
            showLyrics={showLyrics}
            measureElements={measure.elements}
            durationSlotLineCount={durationSlotLineCount}
            beams={beams}
            ties={ties}
            isBeamStart={
              beamStartPosition?.measureIndex === measureIndex &&
              beamStartPosition.noteIndex === noteIndex
            }
            isTieStart={
              tieStartPosition?.measureIndex === measureIndex &&
              tieStartPosition.noteIndex === noteIndex
            }
            isExporting={isExporting}
            isTiePreview={
              !!(
                isTieMode &&
                tieStartPosition &&
                tieStartPosition.measureIndex === measureIndex &&
                selectedNoteIndex !== null &&
                selectedNoteIndex > tieStartPosition.noteIndex &&
                tieStartPosition.noteIndex <= noteIndex &&
                noteIndex <= selectedNoteIndex
              )
            }
            showTieRow={showTieRow}
            expression={expressionsByKey.get(positionKey)}
            showExpressionRow={showExpressionRow}
            lyricField={
              element.type === 'note' && showLyrics
                ? {
                    value: lyricDrafts[positionKey] ?? lyricsByKey.get(positionKey) ?? '',
                    active: activeLyricKey === positionKey,
                    disabled: lyricsDisabled,
                    placeholder: isExporting ? '' : undefined,
                    inputRef: (node) => registerLyricInput(measureIndex, noteIndex, node),
                    onChange: (text) => onLyricChange(measureIndex, noteIndex, text),
                    onFocus: () => onLyricFocus(measureIndex, noteIndex),
                    onBlur: () => onLyricBlur(measureIndex, noteIndex),
                    onKeyDown: (event) => onLyricKeyDown(measureIndex, noteIndex, event),
                    onPaste: (event) => onLyricPaste(measureIndex, noteIndex, event),
                    onCompositionStart: (event) => onLyricCompositionStart(measureIndex, noteIndex, event),
                    onCompositionEnd: (event) => onLyricCompositionEnd(measureIndex, noteIndex, event),
                  }
                : undefined
            }
            onClick={() => onSelectNote(noteIndex)}
          />
        );
      })}
    </div>
  );
});

export function ScoreCanvas({ exportRef }: ScoreCanvasProps) {
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
    isTieMode,
    tieStartPosition,
    startTie,
    endTie,
    cancelTieMode,
    updateLyrics,
    updateLyricsBatch,
    isExporting,
  } = useScoreStore();

  const [lyricDrafts, setLyricDrafts] = useState<Record<string, string>>({});
  const [composingLyricKey, setComposingLyricKey] = useState<string | null>(null);
  const lyricInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const showLyrics = scoreDoc.settings.showLyrics;
  const notePositions = useMemo(() => buildNotePositions(scoreDoc.measures), [scoreDoc.measures]);
  const notePositionIndexMap = useMemo<Map<string, number>>(() => {
    const entries: Array<[string, number]> = notePositions.map((position, index) => [
      createPositionKey(position.measureIndex, position.noteIndex),
      index,
    ]);
    return new Map<string, number>(entries);
  }, [notePositions]);
  const lyricsByKey = useMemo(() => {
    const map = new Map<string, string>();

    scoreDoc.lyrics.forEach((lyric) => {
      map.set(createPositionKey(lyric.measureIndex, lyric.noteIndex), lyric.text);
    });

    return map;
  }, [scoreDoc.lyrics]);
  const expressionsByKey = useMemo(() => {
    const map = new Map<string, ExpressionMark>();

    (scoreDoc.expressions || []).forEach((expression) => {
      map.set(createPositionKey(expression.measureIndex, expression.noteIndex), expression);
    });

    return map;
  }, [scoreDoc.expressions]);
  const tieMeasureIndexes = useMemo(() => {
    const indexes = new Set<number>();

    (scoreDoc.ties || []).forEach((tie) => {
      indexes.add(tie.startMeasureIndex);
      indexes.add(tie.endMeasureIndex);
    });

    return indexes;
  }, [scoreDoc.ties]);
  const showExpressionRow = expressionsByKey.size > 0;
  const activeLyricKey =
    !isExporting && selectedMeasureIndex !== null && selectedNoteIndex !== null
      ? createPositionKey(selectedMeasureIndex, selectedNoteIndex)
      : null;

  useEffect(() => {
    if (!showLyrics) {
      setLyricDrafts({});
      setComposingLyricKey(null);
    }
  }, [showLyrics]);

  useEffect(() => {
    if (scoreDoc.lyrics.length === 0) {
      setLyricDrafts({});
    }
  }, [scoreDoc.lyrics.length]);

  const registerLyricInput = useCallback((measureIndex: number, noteIndex: number, node: HTMLInputElement | null) => {
    const positionKey = createPositionKey(measureIndex, noteIndex);

    if (node) {
      lyricInputRefs.current[positionKey] = node;
      return;
    }

    delete lyricInputRefs.current[positionKey];
  }, []);

  const clearLyricDrafts = useCallback((positions: NotePosition[]) => {
    if (positions.length === 0) return;

    setLyricDrafts((previous) => {
      const next = { ...previous };

      positions.forEach((position) => {
        delete next[createPositionKey(position.measureIndex, position.noteIndex)];
      });

      return next;
    });
  }, []);

  const focusLyricPosition = useCallback(
    (position: NotePosition | null) => {
      if (!position) return;

      selectElement(position.measureIndex, position.noteIndex);

      if (typeof window === 'undefined') return;

      window.requestAnimationFrame(() => {
        const input = lyricInputRefs.current[createPositionKey(position.measureIndex, position.noteIndex)];

        if (input) {
          input.focus();
          input.select();
        }
      });
    },
    [selectElement]
  );

  const getRelativeNotePosition = useCallback(
    (measureIndex: number, noteIndex: number, offset: number): NotePosition | null => {
      const index = notePositionIndexMap.get(createPositionKey(measureIndex, noteIndex));

      if (index === undefined) {
        return null;
      }

      return notePositions[index + offset] ?? null;
    },
    [notePositionIndexMap, notePositions]
  );

  const applyLyricTokens = useCallback(
    (measureIndex: number, noteIndex: number, tokens: string[], advanceAfterApply: boolean) => {
      const startIndex = notePositionIndexMap.get(createPositionKey(measureIndex, noteIndex));

      if (startIndex === undefined || tokens.length === 0) {
        return;
      }

      const targetPositions = notePositions.slice(startIndex, startIndex + tokens.length);

      if (targetPositions.length === 0) {
        return;
      }

      const entries: Lyric[] = targetPositions.map((position, index) => ({
        measureIndex: position.measureIndex,
        noteIndex: position.noteIndex,
        text: tokens[index] ?? '',
      }));

      updateLyricsBatch(entries);
      clearLyricDrafts(targetPositions);

      if (advanceAfterApply) {
        focusLyricPosition(notePositions[startIndex + targetPositions.length] ?? null);
      }
    },
    [clearLyricDrafts, focusLyricPosition, notePositionIndexMap, notePositions, updateLyricsBatch]
  );

  const commitLyricValue = useCallback(
    (measureIndex: number, noteIndex: number, rawText: string, advanceAfterApply: boolean) => {
      const tokens = tokenizeLyricText(rawText);
      const currentPosition = { measureIndex, noteIndex };

      if (tokens.length === 0) {
        updateLyrics(measureIndex, noteIndex, '');
        clearLyricDrafts([currentPosition]);
        return;
      }

      applyLyricTokens(measureIndex, noteIndex, tokens, advanceAfterApply);
    },
    [applyLyricTokens, clearLyricDrafts, updateLyrics]
  );

  const handleSelectNote = useCallback(
    (measureIndex: number, noteIndex: number) => {
      if (isBeamMode) {
        const element = scoreDoc.measures[measureIndex]?.elements[noteIndex];

        if (!isBeamableElement(element)) return;

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

      if (isTieMode) {
        const element = scoreDoc.measures[measureIndex]?.elements[noteIndex];

        if (!element || element.type !== 'note') return;

        if (!tieStartPosition) {
          startTie(measureIndex, noteIndex);
          selectElement(measureIndex, noteIndex);
          return;
        }

        if (tieStartPosition.measureIndex !== measureIndex || noteIndex <= tieStartPosition.noteIndex) {
          startTie(measureIndex, noteIndex);
          selectElement(measureIndex, noteIndex);
          return;
        }

        endTie(measureIndex, noteIndex);
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
      endTie,
      isBeamMode,
      isTieMode,
      scoreDoc.measures,
      selectElement,
      selectedMeasureIndex,
      selectedNoteIndex,
      startBeam,
      startTie,
      tieStartPosition,
    ]
  );

  const handleLyricChange = useCallback((measureIndex: number, noteIndex: number, text: string) => {
    const positionKey = createPositionKey(measureIndex, noteIndex);

    setLyricDrafts((previous) => ({
      ...previous,
      [positionKey]: text,
    }));
  }, []);

  const handleLyricFocus = useCallback(
    (measureIndex: number, noteIndex: number) => {
      selectElement(measureIndex, noteIndex);
    },
    [selectElement]
  );

  const handleLyricBlur = useCallback(
    (measureIndex: number, noteIndex: number) => {
      const positionKey = createPositionKey(measureIndex, noteIndex);
      const draftValue = lyricDrafts[positionKey];

      if (draftValue === undefined) {
        return;
      }

      commitLyricValue(measureIndex, noteIndex, draftValue, false);
    },
    [commitLyricValue, lyricDrafts]
  );

  const handleLyricKeyDown = useCallback(
    (measureIndex: number, noteIndex: number, event: KeyboardEvent<HTMLInputElement>) => {
      event.stopPropagation();

      const positionKey = createPositionKey(measureIndex, noteIndex);
      const currentValue = lyricDrafts[positionKey] ?? lyricsByKey.get(positionKey) ?? '';

      if ((event.key === 'Enter' || event.key === ' ') && composingLyricKey !== positionKey) {
        event.preventDefault();
        commitLyricValue(measureIndex, noteIndex, currentValue, true);
        return;
      }

      if (event.key === 'Backspace' && currentValue === '') {
        event.preventDefault();
        updateLyrics(measureIndex, noteIndex, '');
        clearLyricDrafts([{ measureIndex, noteIndex }]);
        focusLyricPosition(getRelativeNotePosition(measureIndex, noteIndex, -1));
      }
    },
    [
      clearLyricDrafts,
      commitLyricValue,
      composingLyricKey,
      focusLyricPosition,
      getRelativeNotePosition,
      lyricDrafts,
      lyricsByKey,
      updateLyrics,
    ]
  );

  const handleLyricPaste = useCallback(
    (measureIndex: number, noteIndex: number, event: ClipboardEvent<HTMLInputElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const pastedText = event.clipboardData.getData('text');

      if (!pastedText.trim()) {
        return;
      }

      commitLyricValue(measureIndex, noteIndex, pastedText, true);
    },
    [commitLyricValue]
  );

  const handleLyricCompositionStart = useCallback((measureIndex: number, noteIndex: number) => {
    setComposingLyricKey(createPositionKey(measureIndex, noteIndex));
  }, []);

  const handleLyricCompositionEnd = useCallback(
    (measureIndex: number, noteIndex: number, event: CompositionEvent<HTMLInputElement>) => {
      const positionKey = createPositionKey(measureIndex, noteIndex);
      const composedValue = event.currentTarget.value;

      setComposingLyricKey((current) => (current === positionKey ? null : current));
      setLyricDrafts((previous) => ({
        ...previous,
        [positionKey]: composedValue,
      }));
    },
    []
  );

  const handleBackgroundClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        if (isBeamMode) {
          cancelBeamMode();
        } else if (isTieMode) {
          cancelTieMode();
        } else {
          clearSelection();
        }
      }
    },
    [cancelBeamMode, cancelTieMode, clearSelection, isBeamMode, isTieMode]
  );

  return (
    <div className="h-full w-full overflow-y-auto bg-white">
      <div ref={exportRef} className="bg-white">
        <div className="border-b border-slate-200 bg-slate-50/50 py-3 text-center">
          <h1 className="mb-1 text-lg font-bold text-slate-800">{scoreDoc.title}</h1>
          <div className="flex items-center justify-center gap-3 text-[11px] text-slate-500">
            <span>
              调号: <span className="font-medium text-slate-700">{scoreDoc.settings.keySignature}</span>
            </span>
            <span>
              拍号: <span className="font-medium text-slate-700">{scoreDoc.settings.timeSignature}</span>
            </span>
            {scoreDoc.settings.showTempo !== false && (
              <span>
                速度: <span className="font-medium text-slate-700">♩ {scoreDoc.settings.tempo}</span>
              </span>
            )}
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
              const isSelected = !isExporting && selectedMeasureIndex === measureIndex;
              const durationSlotLineCount = getMeasureDurationLineCount(measure);
              const showTieRow =
                tieMeasureIndexes.has(measureIndex) ||
                (!isExporting &&
                  isTieMode &&
                  (tieStartPosition?.measureIndex === measureIndex || selectedMeasureIndex === measureIndex));

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
                    showLyrics={showLyrics}
                    durationSlotLineCount={durationSlotLineCount}
                    beams={scoreDoc.beams || []}
                    ties={scoreDoc.ties || []}
                    beamStartPosition={isExporting ? null : beamStartPosition}
                    tieStartPosition={isExporting ? null : tieStartPosition}
                    isBeamMode={!isExporting && isBeamMode}
                    isTieMode={!isExporting && isTieMode}
                    isExporting={isExporting}
                    showTieRow={showTieRow}
                    lyricsDisabled={isBeamMode || isTieMode}
                    lyricsByKey={lyricsByKey}
                    expressionsByKey={expressionsByKey}
                    showExpressionRow={showExpressionRow}
                    lyricDrafts={lyricDrafts}
                    activeLyricKey={activeLyricKey}
                    registerLyricInput={registerLyricInput}
                    onSelectNote={(noteIndex) => handleSelectNote(measureIndex, noteIndex)}
                    onLyricChange={handleLyricChange}
                    onLyricFocus={handleLyricFocus}
                    onLyricBlur={handleLyricBlur}
                    onLyricKeyDown={handleLyricKeyDown}
                    onLyricPaste={handleLyricPaste}
                    onLyricCompositionStart={handleLyricCompositionStart}
                    onLyricCompositionEnd={handleLyricCompositionEnd}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {!isExporting && (
        <button
          onClick={addMeasure}
          className="mx-4 mb-4 mt-3 flex w-[calc(100%-2rem)] items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 py-2 text-sm font-medium text-slate-400 transition-all hover:border-indigo-400 hover:text-indigo-600"
        >
          <PlusIcon className="h-4 w-4" />
          添加小节
        </button>
      )}
    </div>
  );
}
