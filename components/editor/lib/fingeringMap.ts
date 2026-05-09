import type { FingeringKey, KeySignature } from '@/lib/editor/types';

const FINGERING_BASE_PATH = '/webfile/static';

const C_FINGERING: Partial<Record<FingeringKey, string>> = {
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

const F_FINGERING: Partial<Record<FingeringKey, string>> = {
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

const G_FINGERING: Partial<Record<FingeringKey, string>> = {
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

export const FINGERING_MAP: Record<KeySignature, Partial<Record<FingeringKey, string>>> = {
  C: C_FINGERING,
  F: F_FINGERING,
  G: G_FINGERING,
};

export function getFingeringUrl(
  keySignature: KeySignature,
  noteValue: string,
  hasHighDot: boolean = false,
  hasLowDot: boolean = false
): string | null {
  const map = FINGERING_MAP[keySignature];
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
  hasLowDot: boolean = false
): boolean {
  return getFingeringUrl(keySignature, noteValue, hasHighDot, hasLowDot) !== null;
}

export function getAvailableKeySignatures(): KeySignature[] {
  return Object.keys(FINGERING_MAP) as KeySignature[];
}

export function getFingeringMapForKey(
  keySignature: KeySignature
): Partial<Record<FingeringKey, string>> | null {
  return FINGERING_MAP[keySignature] || null;
}
