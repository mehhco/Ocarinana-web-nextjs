'use client';

import { memo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  MAX_SCORE_DISPLAY_SCALE,
  MIN_SCORE_DISPLAY_SCALE,
  SCORE_DISPLAY_SCALE_STEP,
  getNormalizedScoreDisplayScale,
} from '../hooks/useScoreDisplayScale';
import { useEditorT } from '../i18n/editor-locale';

const SCALE_PRESETS = [
  { zh: '紧凑', en: 'Compact', value: 85 },
  { zh: '标准', en: 'Normal', value: 100 },
  { zh: '清晰', en: 'Large', value: 120 },
];

interface ScoreScaleControlProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export const ScoreScaleControl = memo(function ScoreScaleControl({
  value,
  onChange,
  className,
}: ScoreScaleControlProps) {
  const normalizedValue = getNormalizedScoreDisplayScale(value);
  const t = useEditorT();

  const handleRangeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number.parseInt(event.target.value, 10));
    },
    [onChange]
  );

  return (
    <div
      className={cn(
        'flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 text-xs text-slate-600 shadow-sm',
        className
      )}
    >
      <span className="shrink-0 font-medium text-slate-500">{t('比例', 'Zoom')}</span>
      <div className="flex overflow-hidden rounded-md border border-slate-200 bg-white">
        {SCALE_PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            className={cn(
              'h-5 min-w-10 px-2 text-[11px] font-medium leading-none transition-colors hover:bg-indigo-50 hover:text-indigo-600',
              normalizedValue === preset.value ? 'bg-indigo-600 text-white hover:bg-indigo-600 hover:text-white' : 'text-slate-500',
              preset.value !== SCALE_PRESETS[SCALE_PRESETS.length - 1].value && 'border-r border-slate-200'
            )}
            onClick={() => onChange(preset.value)}
          >
            {t(preset.zh, preset.en)}
          </button>
        ))}
      </div>
      <input
        type="range"
        min={MIN_SCORE_DISPLAY_SCALE}
        max={MAX_SCORE_DISPLAY_SCALE}
        step={SCORE_DISPLAY_SCALE_STEP}
        value={normalizedValue}
        onChange={handleRangeChange}
        aria-label={t('乐谱显示比例', 'Score display zoom')}
        className="h-5 w-20 accent-indigo-600"
      />
      <span className="w-9 shrink-0 text-right font-semibold text-slate-700">{normalizedValue}%</span>
    </div>
  );
});
