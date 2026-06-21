'use client';

import { useScoreStore } from '../hooks/useScoreStore';
import { KEY_SIGNATURE_OPTIONS, TIME_SIGNATURE_OPTIONS, getInstrumentLabel } from '../lib/constants';
import { MobileSheet } from './MobileSheet';
import type { KeySignature, TimeSignature } from '@/lib/editor/types';

interface ScoreSettingsSheetProps {
  open: boolean;
  onClose: () => void;
}

const INPUT_CLASS =
  'h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-base text-slate-900 outline-none transition-shadow focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-slate-600">{label}</span>
      {children}
    </label>
  );
}

export function ScoreSettingsSheet({ open, onClose }: ScoreSettingsSheetProps) {
  const document = useScoreStore((state) => state.document);
  const updateTitle = useScoreStore((state) => state.updateTitle);
  const updateScoreInfo = useScoreStore((state) => state.updateScoreInfo);
  const updateSettings = useScoreStore((state) => state.updateSettings);

  return (
    <MobileSheet open={open} onClose={onClose} title="乐谱设置" description={getInstrumentLabel(document.settings.instrumentType)}>
      <div className="space-y-5 p-4">
        <Field label="乐谱标题">
          <input className={INPUT_CLASS} value={document.title} onChange={(event) => updateTitle(event.target.value)} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="调号">
            <select
              className={INPUT_CLASS}
              value={document.settings.keySignature}
              onChange={(event) => updateSettings({ keySignature: event.target.value as KeySignature })}
            >
              {KEY_SIGNATURE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </Field>
          <Field label="拍号">
            <select
              className={INPUT_CLASS}
              value={document.settings.timeSignature}
              onChange={(event) => updateSettings({ timeSignature: event.target.value as TimeSignature })}
            >
              {TIME_SIGNATURE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-[1fr_auto] items-end gap-3">
          <Field label="速度">
            <input
              type="number"
              min={40}
              max={300}
              className={INPUT_CLASS}
              value={document.settings.tempo}
              onChange={(event) => {
                const tempo = Number.parseInt(event.target.value, 10);
                if (Number.isFinite(tempo)) updateSettings({ tempo: Math.min(300, Math.max(40, tempo)) });
              }}
            />
          </Field>
          <label className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={document.settings.showTempo !== false}
              onChange={(event) => updateSettings({ showTempo: event.target.checked })}
              className="h-5 w-5 accent-indigo-600"
            />
            显示
          </label>
        </div>

        <div className="grid gap-4 border-t border-slate-200 pt-5 sm:grid-cols-2">
          <Field label="制谱">
            <input className={INPUT_CLASS} value={document.producer} onChange={(event) => updateScoreInfo({ producer: event.target.value })} />
          </Field>
          <Field label="作词">
            <input className={INPUT_CLASS} value={document.lyricist || ''} onChange={(event) => updateScoreInfo({ lyricist: event.target.value })} />
          </Field>
          <Field label="作曲">
            <input className={INPUT_CLASS} value={document.composer || ''} onChange={(event) => updateScoreInfo({ composer: event.target.value })} />
          </Field>
          <Field label="其他信息">
            <input className={INPUT_CLASS} value={document.additionalInfo || ''} onChange={(event) => updateScoreInfo({ additionalInfo: event.target.value })} />
          </Field>
        </div>
      </div>
    </MobileSheet>
  );
}

