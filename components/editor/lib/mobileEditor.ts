import type { InstrumentType, NoteValue } from '@/lib/editor/types';
import { getAvailableNoteRange } from './constants.ts';

export type MobilePitchRegister = 'low' | 'basic' | 'high';

export interface MobileNoteOption {
  value: NoteValue;
  /** 简谱数字，含升降号；高低音点由界面按音区渲染 */
  degree: string;
  disabled: boolean;
}

const DEFAULT_NOTE_VALUES: NoteValue[] = ['1', '2', '3', '4', '5', '6', '7'];

function getBasicNoteValues(instrumentType: InstrumentType, keySignature: string): NoteValue[] {
  if (keySignature !== 'G') {
    return DEFAULT_NOTE_VALUES;
  }

  return instrumentType === '6-hole'
    ? ['1', '2', '3', '4', '5', '#6', '7']
    : ['1', '2', '3', '4', '5', '6', 'b7'];
}

function getDegree(value: NoteValue): string {
  if (value === 'b7') return '♭7';
  if (value === '#6') return '♯6';
  return value;
}

export function getMobileNoteOptions(
  register: MobilePitchRegister,
  instrumentType: InstrumentType,
  keySignature: string,
): MobileNoteOption[] {
  const range = getAvailableNoteRange(instrumentType, keySignature);
  const values = register === 'basic' ? getBasicNoteValues(instrumentType, keySignature) : DEFAULT_NOTE_VALUES;

  return values.map((value) => ({
    value,
    degree: getDegree(value),
    disabled: !range[register].includes(value),
  }));
}
