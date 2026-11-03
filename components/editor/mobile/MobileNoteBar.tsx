'use client';

import { useMemo, useState } from 'react';
import { Trash2Icon } from '@/components/ui/icons';
import { JianpuNote } from '@/components/jianpu-note';
import { cn } from '@/lib/utils';
import { useScoreStore } from '../hooks/useScoreStore';
import { getMobileNoteOptions, type MobilePitchRegister } from '../lib/mobileEditor';
import { useEditorT } from '../i18n/editor-locale';

interface MobileNoteBarProps {
  onOpenTools: () => void;
}

const REGISTER_OPTIONS: Array<{ value: MobilePitchRegister; zh: string; en: string }> = [
  { value: 'low', zh: '低音', en: 'Low' },
  { value: 'basic', zh: '中音', en: 'Middle' },
  { value: 'high', zh: '高音', en: 'High' },
];

export function MobileNoteBar({ onOpenTools }: MobileNoteBarProps) {
  const t = useEditorT();
  const [register, setRegister] = useState<MobilePitchRegister>('basic');
  const instrumentType = useScoreStore((state) => state.document.settings.instrumentType);
  const keySignature = useScoreStore((state) => state.document.settings.keySignature);
  const addNote = useScoreStore((state) => state.addNote);
  const addRest = useScoreStore((state) => state.addRest);
  const deleteSelectedElement = useScoreStore((state) => state.deleteSelectedElement);
  const updateNoteDuration = useScoreStore((state) => state.updateNoteDuration);
  const toggleAugmentationDot = useScoreStore((state) => state.toggleAugmentationDot);
  const addExtension = useScoreStore((state) => state.addExtension);
  const selectedElement = useScoreStore((state) => {
    if (state.selectedMeasureIndex === null || state.selectedNoteIndex === null) return null;
    return state.document.measures[state.selectedMeasureIndex]?.elements[state.selectedNoteIndex] ?? null;
  });
  const hasSelection = useScoreStore(
    (state) => state.selectedMeasureIndex !== null && state.selectedNoteIndex !== null,
  );
  const options = useMemo(
    () => getMobileNoteOptions(register, instrumentType, keySignature),
    [instrumentType, keySignature, register],
  );

  return (
    <div className="editor-safe-bottom shrink-0 border-t border-slate-200 bg-white/97 px-2 pt-2 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
      {selectedElement && (
        <div className="mb-2 grid grid-cols-4 gap-1 rounded-xl bg-indigo-50 p-1" aria-label="选中元素快捷操作">
          <button
            type="button"
            onClick={() => updateNoteDuration('1/4')}
            disabled={selectedElement.type !== 'note' && selectedElement.type !== 'rest'}
            className="h-11 rounded-lg bg-white text-xs font-semibold text-slate-700 shadow-sm disabled:opacity-35"
          >
            1/4
          </button>
          <button
            type="button"
            onClick={() => updateNoteDuration('1/8')}
            disabled={selectedElement.type !== 'note' && selectedElement.type !== 'rest'}
            className="h-11 rounded-lg bg-white text-xs font-semibold text-slate-700 shadow-sm disabled:opacity-35"
          >
            1/8
          </button>
          <button
            type="button"
            onClick={toggleAugmentationDot}
            disabled={selectedElement.type !== 'note'}
            className="h-11 rounded-lg bg-white text-xs font-semibold text-slate-700 shadow-sm disabled:opacity-35"
          >
            附点
          </button>
          <button
            type="button"
            onClick={addExtension}
            className="h-11 rounded-lg bg-white text-xs font-semibold text-slate-700 shadow-sm"
          >
            延长线
          </button>
        </div>
      )}

      <div className="mb-2 flex items-center gap-1.5">
        <div className="grid min-w-0 flex-1 grid-cols-3 rounded-lg bg-slate-100 p-0.5">
          {REGISTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setRegister(option.value)}
              aria-pressed={register === option.value}
              className={cn(
                'h-9 rounded-md text-xs font-semibold transition-colors',
                register === option.value ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 active:bg-slate-200',
              )}
            >
              {t(option.zh, option.en)}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => addRest('1/4')}
          className="h-11 min-w-11 rounded-lg border border-slate-200 bg-white px-2 text-sm font-bold text-slate-700 active:bg-indigo-50"
          aria-label={t('添加四分休止符', 'Add quarter rest')}
        >
          0
        </button>
        <button
          type="button"
          onClick={deleteSelectedElement}
          disabled={!hasSelection}
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-600 active:bg-red-50 active:text-red-600 disabled:opacity-30"
          aria-label={t('删除选中元素', 'Delete selected element')}
        >
          <Trash2Icon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onOpenTools}
          className="h-11 rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white active:bg-indigo-700"
        >
          {t('工具', 'Tools')}
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {options.map((option, index) => (
          <button
            key={`${register}-${index}`}
            type="button"
            disabled={option.disabled}
            onClick={() =>
              addNote(option.value, '1/4', {
                hasHighDot: register === 'high',
                hasLowDot: register === 'low',
              })
            }
            className="h-11 min-w-0 rounded-lg border border-slate-200 bg-[#fffdf8] text-base font-bold text-slate-800 shadow-sm active:scale-95 active:border-indigo-400 active:bg-indigo-50 disabled:bg-slate-50 disabled:text-slate-300 disabled:shadow-none"
            aria-label={`${(() => {
              const current = REGISTER_OPTIONS.find((item) => item.value === register);
              return current ? t(current.zh, current.en) : '';
            })()} ${option.degree}`}
          >
            <JianpuNote degree={option.degree} octave={register} />
          </button>
        ))}
      </div>
    </div>
  );
}
