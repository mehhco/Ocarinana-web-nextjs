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
} from 'react';
import { PlusIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import { useScoreStore } from '../hooks/useScoreStore';
import { LyricsInput } from '../overlay/LyricsInput';
import type { Beam, Duration, Lyric, Measure, ScoreElement } from '@/lib/editor/types';

interface NotePosition {
  measureIndex: number;
  noteIndex: number;
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

function getFingeringImage(
  keySignature: string,
  noteValue: string,
  hasHighDot: boolean,
  hasLowDot: boolean
): string {
  const folder = `${keySignature}-graph`;

  let filename = noteValue;

  if (noteValue === 'b7') {
    return `/webfile/static/${folder}/${filename}.webp`;
  }

  if (hasHighDot) filename += 'h';
  if (hasLowDot) filename += 'l';

  return `/webfile/static/${folder}/${filename}.webp`;
}

function hasFingeringForKey(
  keySignature: string,
  noteValue: string,
  hasHighDot: boolean,
  hasLowDot: boolean
): boolean {
  if (keySignature === 'C') {
    if (hasHighDot) return ['1', '2', '3', '4'].includes(noteValue);
    if (hasLowDot) return ['6', '7'].includes(noteValue);
    return ['1', '2', '3', '4', '5', '6', '7'].includes(noteValue);
  }

  if (keySignature === 'F') {
    if (hasHighDot) return ['1'].includes(noteValue);
    if (hasLowDot) return ['3', '4', '5', '6', '7'].includes(noteValue);
    return ['1', '2', '3', '4', '5', '6', '7'].includes(noteValue);
  }

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

const DURATION_SLOT_CLASS = 'mt-1 flex h-[12px] w-full flex-shrink-0 flex-col items-center gap-[3px]';
const LYRIC_ALIGNMENT_SPACER_CLASS = 'mt-1 h-[12px] flex-shrink-0';
const LYRIC_ROW_CLASS = 'mt-1 flex h-7 flex-shrink-0 items-center justify-center';

interface LyricFieldProps {
  value: string;
  active: boolean;
  disabled: boolean;
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
  keySignature: string;
  showFingering: boolean;
  showLyrics: boolean;
  measureElements: ScoreElement[];
  beams: Beam[];
  isBeamStart: boolean;
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
  beams,
  isBeamStart,
  lyricField,
  onClick,
}: NoteElementProps) {
  if (element.type === 'note') {
    const durationLineCount = getDurationLineCount(element.duration);
    const hasDurationLines = durationLineCount > 0;
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

        <div className="flex h-4 flex-shrink-0 items-center justify-center">
          {element.hasHighDot && element.value !== 'b7' && (
            <span className="text-xl font-bold leading-none text-slate-800">•</span>
          )}
        </div>

        <div className="flex h-5 flex-shrink-0 items-center justify-center">
          <span className="text-lg font-bold leading-none text-slate-800">{element.value}</span>
        </div>

        {hasDurationLines && (
          <div className={DURATION_SLOT_CLASS}>
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

        {showLyrics && !hasDurationLines && <div className={LYRIC_ALIGNMENT_SPACER_CLASS} />}

        {showLyrics && lyricField && (
          <div className={LYRIC_ROW_CLASS}>
            <LyricsInput
              value={lyricField.value}
              active={lyricField.active}
              disabled={lyricField.disabled}
              inputRef={lyricField.inputRef}
              onChange={lyricField.onChange}
              onFocus={lyricField.onFocus}
              onBlur={lyricField.onBlur}
              onKeyDown={lyricField.onKeyDown}
              onPaste={lyricField.onPaste}
              onCompositionStart={lyricField.onCompositionStart}
              onCompositionEnd={lyricField.onCompositionEnd}
            />
          </div>
        )}
      </div>
    );
  }

  const widthClass = element.type === 'barline' ? 'w-8' : element.type === 'extension' ? 'w-10' : 'w-14';
  const symbol = element.type === 'rest' ? '0' : element.type === 'extension' ? '-' : '|';
  const symbolColor = element.type === 'barline' ? 'text-slate-700' : 'text-slate-800';

  return (
    <div
      className={cn(
        'flex cursor-pointer flex-col items-center py-1 transition-all',
        widthClass,
        isSelected ? 'rounded-md bg-indigo-50 ring-2 ring-indigo-500' : 'hover:bg-slate-50'
      )}
      onClick={onClick}
    >
      <div className={cn('w-12 flex-shrink-0 overflow-hidden transition-[height]', showFingering ? 'h-12' : 'h-0')} />
      <div className="h-4 flex-shrink-0" />
      <div className="flex h-5 flex-shrink-0 items-center justify-center">
        <span className={cn('text-lg font-bold', symbolColor)}>{symbol}</span>
      </div>
      <div className={LYRIC_ALIGNMENT_SPACER_CLASS} />
      <div className="h-4 flex-shrink-0" />
      {showLyrics && <div className={LYRIC_ROW_CLASS} />}
    </div>
  );
});

interface MeasureProps {
  measure: Measure;
  measureIndex: number;
  selectedNoteIndex: number | null;
  keySignature: string;
  showFingering: boolean;
  showLyrics: boolean;
  beams: Beam[];
  beamStartPosition: { measureIndex: number; noteIndex: number } | null;
  isBeamMode: boolean;
  lyricsDisabled: boolean;
  lyricsByKey: Map<string, string>;
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
  beams,
  beamStartPosition,
  isBeamMode,
  lyricsDisabled,
  lyricsByKey,
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
            beams={beams}
            isBeamStart={
              beamStartPosition?.measureIndex === measureIndex &&
              beamStartPosition.noteIndex === noteIndex
            }
            lyricField={
              element.type === 'note' && showLyrics
                ? {
                    value: lyricDrafts[positionKey] ?? lyricsByKey.get(positionKey) ?? '',
                    active: activeLyricKey === positionKey,
                    disabled: lyricsDisabled,
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
    updateLyrics,
    updateLyricsBatch,
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
  const activeLyricKey =
    selectedMeasureIndex !== null && selectedNoteIndex !== null
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
            速度: <span className="font-medium text-slate-700">♩ {scoreDoc.settings.tempo}</span>
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
                  showLyrics={showLyrics}
                  beams={scoreDoc.beams || []}
                  beamStartPosition={beamStartPosition}
                  isBeamMode={isBeamMode}
                  lyricsDisabled={isBeamMode}
                  lyricsByKey={lyricsByKey}
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
