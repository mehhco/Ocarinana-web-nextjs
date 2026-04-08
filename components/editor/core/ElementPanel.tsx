'use client';

import { memo, useCallback } from 'react';
import { EyeIcon, EyeOffIcon, Mic2Icon, MusicIcon, Trash2Icon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import { useScoreStore } from '../hooks/useScoreStore';
import type { Duration, NoteValue } from '@/lib/editor/types';

const NoteButton = memo(function NoteButton({
  display,
  onClick,
  disabled = false,
}: {
  display: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex h-9 items-center justify-center rounded-md border text-sm font-semibold transition-all',
        'border-slate-200 bg-white text-slate-700',
        'hover:border-indigo-400 hover:text-indigo-600 hover:shadow-sm',
        'active:scale-95 active:bg-indigo-50',
        disabled && 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400 opacity-40'
      )}
    >
      {display}
    </button>
  );
});

const ActionButton = memo(function ActionButton({
  onClick,
  children,
  active = false,
}: {
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-md border px-2.5 py-2 text-xs font-medium transition-all',
        'hover:shadow-sm active:scale-95',
        active
          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
          : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-400 hover:text-indigo-600'
      )}
    >
      {children}
    </button>
  );
});

const HIGH_NOTES: { value: NoteValue; display: string }[] = [
  { value: 'b7', display: '↑b7' },
  { value: '1', display: '↑1' },
  { value: '2', display: '↑2' },
  { value: '3', display: '↑3' },
  { value: '4', display: '↑4' },
  { value: '5', display: '↑5' },
  { value: '6', display: '↑6' },
  { value: '7', display: '↑7' },
];

const BASIC_NOTES: { value: NoteValue; display: string }[] = [
  { value: '1', display: '1' },
  { value: '2', display: '2' },
  { value: '3', display: '3' },
  { value: '4', display: '4' },
  { value: '5', display: '5' },
  { value: '6', display: '6' },
  { value: '7', display: '7' },
];

const LOW_NOTES: { value: NoteValue; display: string }[] = [
  { value: '1', display: '↓1' },
  { value: '2', display: '↓2' },
  { value: '3', display: '↓3' },
  { value: '4', display: '↓4' },
  { value: '5', display: '↓5' },
  { value: '6', display: '↓6' },
  { value: '7', display: '↓7' },
];

const DURATION_OPTIONS: { value: Duration; label: string }[] = [
  { value: '1/4', label: '1/4' },
  { value: '1/8', label: '1/8' },
  { value: '1/16', label: '1/16' },
  { value: '1/32', label: '1/32' },
];

// 根据调号获取可用的音符
// C调: 高音 1h-4h, 低音 6l-7l
// F调: 高音 1h, 低音 3l-7l
// G调: 高音 b7, 低音 2l-5l
function getAvailableNotes(keySignature: string): { high: string[]; low: string[] } {
  const ranges: Record<string, { high: string[]; low: string[] }> = {
    'C': {
      high: ['1', '2', '3', '4'],
      low: ['6', '7'],
    },
    'F': {
      high: ['1'],
      low: ['3', '4', '5', '6', '7'],
    },
    'G': {
      high: ['b7'],
      low: ['2', '3', '4', '5'],
    },
  };
  return ranges[keySignature] || ranges['C'];
}

const REST_OPTIONS: { value: Duration; label: string }[] = [
  { value: '1', label: '全休止符' },
  { value: '1/2', label: '二分休止' },
  { value: '1/4', label: '四分休止' },
  { value: '1/8', label: '八分休止' },
];

export const ElementPanel = memo(function ElementPanel() {
  const addNote = useScoreStore((state) => state.addNote);
  const addRest = useScoreStore((state) => state.addRest);
  const addExtension = useScoreStore((state) => state.addExtension);
  const addBarline = useScoreStore((state) => state.addBarline);
  const updateNoteDuration = useScoreStore((state) => state.updateNoteDuration);
  const toggleBeamMode = useScoreStore((state) => state.toggleBeamMode);
  const clearAllLyrics = useScoreStore((state) => state.clearAllLyrics);
  const clearSelection = useScoreStore((state) => state.clearSelection);
  const isBeamMode = useScoreStore((state) => state.isBeamMode);
  const selectedMeasureIndex = useScoreStore((state) => state.selectedMeasureIndex);
  const selectedNoteIndex = useScoreStore((state) => state.selectedNoteIndex);
  const selectedElement = useScoreStore((state) => {
    if (state.selectedMeasureIndex === null || state.selectedNoteIndex === null) {
      return null;
    }

    return state.document.measures[state.selectedMeasureIndex]?.elements[state.selectedNoteIndex] ?? null;
  });
  const settings = useScoreStore((state) => state.document.settings);
  const updateSettings = useScoreStore((state) => state.updateSettings);

  // 根据调号获取可用的音符
  const availableNotes = getAvailableNotes(settings.keySignature);

  const hasSelection = selectedMeasureIndex !== null && selectedNoteIndex !== null;
  const selectedDuration =
    selectedElement && (selectedElement.type === 'note' || selectedElement.type === 'rest')
      ? selectedElement.duration
      : null;

  const handleHighNoteClick = useCallback(
    (noteValue: NoteValue) => {
      // b7（降7）是G调特有的高音，不需要高音点标记
      // 其指法图文件名直接是 b7.webp
      const hasHighDot = noteValue !== 'b7';
      addNote(noteValue, '1/4', { hasHighDot });
      if (hasSelection) {
        clearSelection();
      }
    },
    [addNote, clearSelection, hasSelection]
  );

  const handleBasicNoteClick = useCallback(
    (noteValue: NoteValue) => {
      addNote(noteValue, '1/4');
      if (hasSelection) {
        clearSelection();
      }
    },
    [addNote, clearSelection, hasSelection]
  );

  const handleLowNoteClick = useCallback(
    (noteValue: NoteValue) => {
      addNote(noteValue, '1/4', { hasLowDot: true });
      if (hasSelection) {
        clearSelection();
      }
    },
    [addNote, clearSelection, hasSelection]
  );

  const handleRestClick = useCallback(
    (duration: Duration) => {
      addRest(duration);
      if (hasSelection) {
        clearSelection();
      }
    },
    [addRest, clearSelection, hasSelection]
  );

  const handleDurationClick = useCallback(
    (duration: Duration) => {
      updateNoteDuration(duration);
    },
    [updateNoteDuration]
  );

  const toggleFingering = useCallback(() => {
    updateSettings({ showFingering: !settings.showFingering });
  }, [settings.showFingering, updateSettings]);

  const toggleLyrics = useCallback(() => {
    updateSettings({ showLyrics: !settings.showLyrics });
  }, [settings.showLyrics, updateSettings]);

  return (
    <aside className="h-full w-full overflow-y-auto bg-slate-50/50">
      <div className="space-y-3 p-3">
        <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-100">
              <MusicIcon className="h-3 w-3 text-indigo-600" />
            </div>
            <span className="text-xs font-semibold text-slate-700">指法图</span>
          </div>
          <button
            onClick={toggleFingering}
            className={cn(
              'flex w-full items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
              settings.showFingering
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            {settings.showFingering ? <EyeOffIcon className="h-3 w-3" /> : <EyeIcon className="h-3 w-3" />}
            {settings.showFingering ? '隐藏指法图' : '显示指法图'}
          </button>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-100">
              <Mic2Icon className="h-3 w-3 text-indigo-600" />
            </div>
            <span className="text-xs font-semibold text-slate-700">歌词</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleLyrics}
              className={cn(
                'flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all',
                settings.showLyrics
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {settings.showLyrics ? '隐藏歌词' : '显示歌词'}
            </button>
            <button
              onClick={clearAllLyrics}
              className="flex items-center justify-center rounded-md bg-slate-100 px-2 py-1.5 text-xs font-medium text-slate-600 transition-all hover:bg-red-50 hover:text-red-600"
            >
              <Trash2Icon className="h-3 w-3" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wider text-slate-500">高音</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {HIGH_NOTES.map((note) => {
                const isAvailable = availableNotes.high.includes(note.value);
                return (
                  <NoteButton
                    key={`high-${note.value}`}
                    display={note.display}
                    onClick={() => handleHighNoteClick(note.value)}
                    disabled={!isAvailable}
                  />
                );
              })}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wider text-slate-500">中音</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {BASIC_NOTES.map((note) => (
                <NoteButton
                  key={`basic-${note.value}`}
                  display={note.display}
                  onClick={() => handleBasicNoteClick(note.value)}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wider text-slate-500">低音</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {LOW_NOTES.map((note) => {
                const isAvailable = availableNotes.low.includes(note.value);
                return (
                  <NoteButton
                    key={`low-${note.value}`}
                    display={note.display}
                    onClick={() => handleLowNoteClick(note.value)}
                    disabled={!isAvailable}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider text-slate-500">时值</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {DURATION_OPTIONS.map((option) => (
              <ActionButton
                key={option.value}
                onClick={() => handleDurationClick(option.value)}
                active={selectedDuration === option.value}
              >
                {option.label}
              </ActionButton>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider text-slate-500">休止符</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {REST_OPTIONS.map((option) => (
              <ActionButton key={option.value} onClick={() => handleRestClick(option.value)}>
                {option.label}
              </ActionButton>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider text-slate-500">记谱辅助</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <ActionButton onClick={addExtension}>延长线</ActionButton>
            <ActionButton onClick={addBarline}>小节线</ActionButton>
            <ActionButton onClick={toggleBeamMode} active={isBeamMode}>
              {isBeamMode ? '取消合并' : '合并时值线'}
            </ActionButton>
          </div>
        </div>
      </div>
    </aside>
  );
});
