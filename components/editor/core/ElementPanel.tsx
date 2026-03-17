'use client';

import { useCallback, memo } from 'react';
import { Eye, EyeOff, Trash2, Music, Mic2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScoreStore } from '../hooks/useScoreStore';
import type { Duration, NoteValue } from '@/lib/editor/types';

// 音符按钮组件
const NoteButton = memo(function NoteButton({
  value,
  display,
  onClick,
  disabled = false,
}: {
  value: string;
  display: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center justify-center h-9 rounded-md text-sm font-semibold transition-all",
        "bg-white border border-slate-200 text-slate-700",
        "hover:border-indigo-400 hover:text-indigo-600 hover:shadow-sm",
        "active:scale-95 active:bg-indigo-50",
        disabled && "opacity-40 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400"
      )}
    >
      {display}
    </button>
  );
});

// 操作按钮组件
const ActionButton = memo(function ActionButton({
  onClick,
  children,
  variant = 'default',
}: {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'danger';
}) {
  const variantStyles = {
    default: 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600',
    primary: 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700 hover:border-indigo-700',
    danger: 'bg-white border-slate-200 text-slate-700 hover:border-red-400 hover:text-red-600',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-2 rounded-md text-xs font-medium transition-all border",
        "hover:shadow-sm active:scale-95",
        variantStyles[variant]
      )}
    >
      {children}
    </button>
  );
});

// 高音音符 (1-7 带高音点)
const HIGH_NOTES: { value: NoteValue; display: string }[] = [
  { value: '1', display: '1̇' },
  { value: '2', display: '2̇' },
  { value: '3', display: '3̇' },
  { value: '4', display: '4̇' },
  { value: '5', display: '5̇' },
  { value: '6', display: '6̇' },
  { value: '7', display: '7̇' },
];

// 中音音符 (1-7)
const BASIC_NOTES: { value: NoteValue; display: string }[] = [
  { value: '1', display: '1' },
  { value: '2', display: '2' },
  { value: '3', display: '3' },
  { value: '4', display: '4' },
  { value: '5', display: '5' },
  { value: '6', display: '6' },
  { value: '7', display: '7' },
];

// 低音音符 (1-7 带低音点)
const LOW_NOTES: { value: NoteValue; display: string }[] = [
  { value: '1', display: '1̣' },
  { value: '2', display: '2̣' },
  { value: '3', display: '3̣' },
  { value: '4', display: '4̣' },
  { value: '5', display: '5̣' },
  { value: '6', display: '6̣' },
  { value: '7', display: '7̣' },
];

// 时值选项
const DURATION_OPTIONS: { value: Duration; label: string }[] = [
  { value: '1', label: '全音符' },
  { value: '1/2', label: '二分' },
  { value: '1/4', label: '四分' },
  { value: '1/8', label: '八分' },
  { value: '1/16', label: '十六分' },
  { value: '1/32', label: '三十二分' },
];

// 休止符选项
const REST_OPTIONS: { value: Duration; label: string }[] = [
  { value: '1', label: '全休止' },
  { value: '1/2', label: '二分' },
  { value: '1/4', label: '四分' },
  { value: '1/8', label: '八分' },
];

export const ElementPanel = memo(function ElementPanel() {
  const addNote = useScoreStore((state) => state.addNote);
  const addRest = useScoreStore((state) => state.addRest);
  const addExtension = useScoreStore((state) => state.addExtension);
  const addBarline = useScoreStore((state) => state.addBarline);
  const clearAllLyrics = useScoreStore((state) => state.clearAllLyrics);
  const clearSelection = useScoreStore((state) => state.clearSelection);
  const selectedMeasureIndex = useScoreStore((state) => state.selectedMeasureIndex);
  const selectedNoteIndex = useScoreStore((state) => state.selectedNoteIndex);
  const settings = useScoreStore((state) => state.document.settings);
  const updateSettings = useScoreStore((state) => state.updateSettings);

  const handleHighNoteClick = useCallback((noteValue: NoteValue) => {
    addNote(noteValue, '1/4', { hasHighDot: true });
    // 如果有选中的音符，替换后清除选中状态
    if (selectedMeasureIndex !== null && selectedNoteIndex !== null) {
      clearSelection();
    }
  }, [addNote, clearSelection, selectedMeasureIndex, selectedNoteIndex]);

  const handleBasicNoteClick = useCallback((noteValue: NoteValue) => {
    addNote(noteValue, '1/4');
    // 如果有选中的音符，替换后清除选中状态
    if (selectedMeasureIndex !== null && selectedNoteIndex !== null) {
      clearSelection();
    }
  }, [addNote, clearSelection, selectedMeasureIndex, selectedNoteIndex]);

  const handleLowNoteClick = useCallback((noteValue: NoteValue) => {
    addNote(noteValue, '1/4', { hasLowDot: true });
    // 如果有选中的音符，替换后清除选中状态
    if (selectedMeasureIndex !== null && selectedNoteIndex !== null) {
      clearSelection();
    }
  }, [addNote, clearSelection, selectedMeasureIndex, selectedNoteIndex]);

  const handleRestClick = useCallback((duration: Duration) => {
    addRest(duration);
    // 如果有选中的音符，替换后清除选中状态
    if (selectedMeasureIndex !== null && selectedNoteIndex !== null) {
      clearSelection();
    }
  }, [addRest, clearSelection, selectedMeasureIndex, selectedNoteIndex]);

  const toggleFingering = useCallback(() => {
    updateSettings({ showFingering: !settings.showFingering });
  }, [settings.showFingering, updateSettings]);

  const toggleLyrics = useCallback(() => {
    updateSettings({ showLyrics: !settings.showLyrics });
  }, [settings.showLyrics, updateSettings]);

  return (
    <aside className="w-full h-full bg-slate-50/50 overflow-y-auto">
      <div className="p-4 space-y-5">
        {/* 功能区卡片 */}
        <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-indigo-100 rounded-md flex items-center justify-center">
              <Music className="h-3 w-3 text-indigo-600" />
            </div>
            <span className="text-xs font-semibold text-slate-700">指法图</span>
          </div>
          <button 
            onClick={toggleFingering}
            className={cn(
              "w-full py-1.5 px-3 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5",
              settings.showFingering 
                ? "bg-indigo-600 text-white hover:bg-indigo-700" 
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            {settings.showFingering ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            {settings.showFingering ? '隐藏指法' : '显示指法'}
          </button>
        </div>

        {/* 歌词控制 */}
        <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-indigo-100 rounded-md flex items-center justify-center">
              <Mic2 className="h-3 w-3 text-indigo-600" />
            </div>
            <span className="text-xs font-semibold text-slate-700">歌词</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={toggleLyrics}
              className={cn(
                "flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all",
                settings.showLyrics 
                  ? "bg-indigo-600 text-white hover:bg-indigo-700" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {settings.showLyrics ? '隐藏' : '显示'}
            </button>
            <button
              onClick={clearAllLyrics}
              className="py-1.5 px-2 rounded-md text-xs font-medium bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* 音符区域 */}
        <div className="space-y-4">
          {/* 高音音符 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">高音</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {HIGH_NOTES.map((note) => (
                <NoteButton
                  key={`high-${note.value}`}
                  value={note.value}
                  display={note.display}
                  onClick={() => handleHighNoteClick(note.value)}
                />
              ))}
            </div>
          </div>

          {/* 中音音符 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">中音</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {BASIC_NOTES.map((note) => (
                <NoteButton
                  key={`basic-${note.value}`}
                  value={note.value}
                  display={note.display}
                  onClick={() => handleBasicNoteClick(note.value)}
                />
              ))}
            </div>
          </div>

          {/* 低音音符 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">低音</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {LOW_NOTES.map((note) => (
                <NoteButton
                  key={`low-${note.value}`}
                  value={note.value}
                  display={note.display}
                  onClick={() => handleLowNoteClick(note.value)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 时值选择 */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">时值</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {DURATION_OPTIONS.map((option) => (
              <ActionButton
                key={option.value}
                onClick={() => {}}
                variant="default"
              >
                {option.label}
              </ActionButton>
            ))}
          </div>
        </div>

        {/* 休止符 */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">休止符</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {REST_OPTIONS.map((option) => (
              <ActionButton
                key={option.value}
                onClick={() => handleRestClick(option.value)}
                variant="default"
              >
                {option.label}
              </ActionButton>
            ))}
          </div>
        </div>

        {/* 装饰音 */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">装饰音</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <ActionButton onClick={addExtension} variant="default">
              延长线
            </ActionButton>
            <ActionButton onClick={addBarline} variant="default">
              小节线
            </ActionButton>
          </div>
        </div>
      </div>
    </aside>
  );
});
