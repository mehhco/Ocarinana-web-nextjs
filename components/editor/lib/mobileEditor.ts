import type { InstrumentType, NoteValue } from '@/lib/editor/types';
import { getAvailableNoteRange } from './constants.ts';

export type MobilePitchRegister = 'low' | 'basic' | 'high';

export interface MobileNoteOption {
  value: NoteValue;
  display: string;
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

function getDisplay(value: NoteValue, register: MobilePitchRegister): string {
  const symbol = value === 'b7' ? '♭7' : value === '#6' ? '♯6' : value;

  if (register === 'high') return `${symbol}̇`;
  if (register === 'low') return `${symbol}̣`;
  return symbol;
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
    display: getDisplay(value, register),
    disabled: !range[register].includes(value),
  }));
}

