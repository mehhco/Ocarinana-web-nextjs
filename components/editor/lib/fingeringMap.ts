import { DEFAULT_INSTRUMENT_TYPE } from './constants';
import type { FingeringKey, InstrumentType, KeySignature } from '@/lib/editor/types';

const FINGERING_BASE_PATH = '/webfile/static';

const TWELVE_HOLE_C_FINGERING: Partial<Record<FingeringKey, string>> = {
  '1': `${FINGERING_BASE_PATH}/C-graph/1.svg`,
  '2': `${FINGERING_BASE_PATH}/C-graph/2.svg`,
  '3': `${FINGERING_BASE_PATH}/C-graph/3.svg`,
  '4': `${FINGERING_BASE_PATH}/C-graph/4.svg`,
  '5': `${FINGERING_BASE_PATH}/C-graph/5.svg`,
  '6': `${FINGERING_BASE_PATH}/C-graph/6.svg`,
  '7': `${FINGERING_BASE_PATH}/C-graph/7.svg`,
  '1-high': `${FINGERING_BASE_PATH}/C-graph/1h.svg`,
  '2-high': `${FINGERING_BASE_PATH}/C-graph/2h.svg`,
  '3-high': `${FINGERING_BASE_PATH}/C-graph/3h.svg`,
  '4-high': `${FINGERING_BASE_PATH}/C-graph/4h.svg`,
  '6-low': `${FINGERING_BASE_PATH}/C-graph/6l.svg`,
  '7-low': `${FINGERING_BASE_PATH}/C-graph/7l.svg`,
};

const TWELVE_HOLE_F_FINGERING: Partial<Record<FingeringKey, string>> = {
  '1': `${FINGERING_BASE_PATH}/F-graph/1.svg`,
  '2': `${FINGERING_BASE_PATH}/F-graph/2.svg`,
  '3': `${FINGERING_BASE_PATH}/F-graph/3.svg`,
  '4': `${FINGERING_BASE_PATH}/F-graph/4.svg`,
  '5': `${FINGERING_BASE_PATH}/F-graph/5.svg`,
  '6': `${FINGERING_BASE_PATH}/F-graph/6.svg`,
  '7': `${FINGERING_BASE_PATH}/F-graph/7.svg`,
  '1-high': `${FINGERING_BASE_PATH}/F-graph/1h.svg`,
  '3-low': `${FINGERING_BASE_PATH}/F-graph/3l.svg`,
  '4-low': `${FINGERING_BASE_PATH}/F-graph/4l.svg`,
  '5-low': `${FINGERING_BASE_PATH}/F-graph/5l.svg`,
  '6-low': `${FINGERING_BASE_PATH}/F-graph/6l.svg`,
  '7-low': `${FINGERING_BASE_PATH}/F-graph/7l.svg`,
};

const TWELVE_HOLE_G_FINGERING: Partial<Record<FingeringKey, string>> = {
  '1': `${FINGERING_BASE_PATH}/G-graph/1.svg`,
  '2': `${FINGERING_BASE_PATH}/G-graph/2.svg`,
  '3': `${FINGERING_BASE_PATH}/G-graph/3.svg`,
  '4': `${FINGERING_BASE_PATH}/G-graph/4.svg`,
  '5': `${FINGERING_BASE_PATH}/G-graph/5.svg`,
  '6': `${FINGERING_BASE_PATH}/G-graph/6.svg`,
  'b7': `${FINGERING_BASE_PATH}/G-graph/b7.svg`,
  '2-low': `${FINGERING_BASE_PATH}/G-graph/2l.svg`,
  '3-low': `${FINGERING_BASE_PATH}/G-graph/3l.svg`,
  '4-low': `${FINGERING_BASE_PATH}/G-graph/4l.svg`,
  '5-low': `${FINGERING_BASE_PATH}/G-graph/5l.svg`,
  '6-low': `${FINGERING_BASE_PATH}/G-graph/6l.svg`,
  '7-low': `${FINGERING_BASE_PATH}/G-graph/7l.svg`,
};

const SIX_HOLE_C_FINGERING: Partial<Record<FingeringKey, string>> = {
  '1': `${FINGERING_BASE_PATH}/6hole-C-graph/1.svg`,
  '2': `${FINGERING_BASE_PATH}/6hole-C-graph/2.svg`,
  '3': `${FINGERING_BASE_PATH}/6hole-C-graph/3.svg`,
  '4': `${FINGERING_BASE_PATH}/6hole-C-graph/4.svg`,
  '5': `${FINGERING_BASE_PATH}/6hole-C-graph/5.svg`,
  '6': `${FINGERING_BASE_PATH}/6hole-C-graph/6.svg`,
  '7': `${FINGERING_BASE_PATH}/6hole-C-graph/7.svg`,
  '1-high': `${FINGERING_BASE_PATH}/6hole-C-graph/1h.svg`,
  '2-high': `${FINGERING_BASE_PATH}/6hole-C-graph/2h.svg`,
  '3-high': `${FINGERING_BASE_PATH}/6hole-C-graph/3h.svg`,
  '4-high': `${FINGERING_BASE_PATH}/6hole-C-graph/4h.svg`,
  '7-low': `${FINGERING_BASE_PATH}/6hole-C-graph/7l.svg`,
};

const SIX_HOLE_F_FINGERING: Partial<Record<FingeringKey, string>> = {
  '1': `${FINGERING_BASE_PATH}/6hole-F-graph/1.svg`,
  '2': `${FINGERING_BASE_PATH}/6hole-F-graph/2.svg`,
  '3': `${FINGERING_BASE_PATH}/6hole-F-graph/3.svg`,
  '4': `${FINGERING_BASE_PATH}/6hole-F-graph/4.svg`,
  '5': `${FINGERING_BASE_PATH}/6hole-F-graph/5.svg`,
  '6': `${FINGERING_BASE_PATH}/6hole-F-graph/6.svg`,
  '7': `${FINGERING_BASE_PATH}/6hole-F-graph/7.svg`,
  '1-high': `${FINGERING_BASE_PATH}/6hole-F-graph/1h.svg`,
  '4-low': `${FINGERING_BASE_PATH}/6hole-F-graph/4l.svg`,
  '5-low': `${FINGERING_BASE_PATH}/6hole-F-graph/5l.svg`,
  '6-low': `${FINGERING_BASE_PATH}/6hole-F-graph/6l.svg`,
  '7-low': `${FINGERING_BASE_PATH}/6hole-F-graph/7l.svg`,
};

const SIX_HOLE_G_FINGERING: Partial<Record<FingeringKey, string>> = {
  '1': `${FINGERING_BASE_PATH}/6hole-G-graph/1.svg`,
  '2': `${FINGERING_BASE_PATH}/6hole-G-graph/2.svg`,
  '3': `${FINGERING_BASE_PATH}/6hole-G-graph/3.svg`,
  '4': `${FINGERING_BASE_PATH}/6hole-G-graph/4.svg`,
  '5': `${FINGERING_BASE_PATH}/6hole-G-graph/5.svg`,
  '#6': `${FINGERING_BASE_PATH}/6hole-G-graph/6.svg`,
  '3-low': `${FINGERING_BASE_PATH}/6hole-G-graph/3l.svg`,
  '4-low': `${FINGERING_BASE_PATH}/6hole-G-graph/4l.svg`,
  '5-low': `${FINGERING_BASE_PATH}/6hole-G-graph/5l.svg`,
  '6-low': `${FINGERING_BASE_PATH}/6hole-G-graph/6l.svg`,
  '7-low': `${FINGERING_BASE_PATH}/6hole-G-graph/7l.svg`,
};

export const FINGERING_MAP: Record<InstrumentType, Record<KeySignature, Partial<Record<FingeringKey, string>>>> = {
  '12-hole': {
    C: TWELVE_HOLE_C_FINGERING,
    F: TWELVE_HOLE_F_FINGERING,
    G: TWELVE_HOLE_G_FINGERING,
  },
  '6-hole': {
    C: SIX_HOLE_C_FINGERING,
    F: SIX_HOLE_F_FINGERING,
    G: SIX_HOLE_G_FINGERING,
  },
};

export function getFingeringUrl(
  keySignature: KeySignature,
  noteValue: string,
  hasHighDot: boolean = false,
  hasLowDot: boolean = false,
  instrumentType: InstrumentType = DEFAULT_INSTRUMENT_TYPE
): string | null {
  const map = FINGERING_MAP[instrumentType]?.[keySignature];
  if (!map) return null;

  let key: FingeringKey = noteValue as FingeringKey;

  if (hasHighDot) {
    key = `${noteValue}-high` as FingeringKey;
  } else if (hasLowDot) {
    key = `${noteValue}-low` as FingeringKey;
  }

  return map[key] || null;
}

export function hasFingering(
  keySignature: KeySignature,
  noteValue: string,
  hasHighDot: boolean = false,
  hasLowDot: boolean = false,
  instrumentType: InstrumentType = DEFAULT_INSTRUMENT_TYPE
): boolean {
  return getFingeringUrl(keySignature, noteValue, hasHighDot, hasLowDot, instrumentType) !== null;
}

export function getAvailableKeySignatures(
  instrumentType: InstrumentType = DEFAULT_INSTRUMENT_TYPE
): KeySignature[] {
  return Object.keys(FINGERING_MAP[instrumentType] ?? FINGERING_MAP[DEFAULT_INSTRUMENT_TYPE]) as KeySignature[];
}

export function getFingeringMapForKey(
  keySignature: KeySignature,
  instrumentType: InstrumentType = DEFAULT_INSTRUMENT_TYPE
): Partial<Record<FingeringKey, string>> | null {
  return FINGERING_MAP[instrumentType]?.[keySignature] || null;
}
