import type { BarlineType, Duration } from '@/lib/editor/types';

type PanelDuration = Extract<Duration, '1/4' | '1/8' | '1/16' | '1/32'>;

export const EDITOR_SHORTCUT_LABELS = {
  deleteSelected: 'Delete',
  extension: '-',
  augmentationDot: 'D',
  tieMode: 'T',
  beamMode: 'Y',
} as const;

export const DURATION_SHORTCUTS: Record<PanelDuration, string> = {
  '1/4': 'Q',
  '1/8': 'W',
  '1/16': 'E',
  '1/32': 'R',
};

export const BARLINE_SHORTCUTS: Record<BarlineType, string> = {
  single: 'B',
  double: 'Shift+B',
  final: 'Shift+F',
  'repeat-start': '[',
  'repeat-end': ']',
};

export function isEditableShortcutTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName;

  return (
    target.isContentEditable ||
    tagName === 'INPUT' ||
    tagName === 'TEXTAREA' ||
    tagName === 'SELECT'
  );
}

export function matchesEditorShortcut(event: KeyboardEvent, shortcut: string): boolean {
  const parts = shortcut.toLowerCase().split('+');
  const expectsShift = parts.includes('shift');
  const key = parts[parts.length - 1];

  if (event.shiftKey !== expectsShift) {
    return false;
  }

  return event.key.toLowerCase() === key;
}
