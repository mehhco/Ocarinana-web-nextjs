/**
 * Editor data types for the score editor.
 */

export type NoteValue = '1' | '2' | '3' | '4' | '5' | '6' | '7' | 'b7';

export type Duration = '1' | '1/2' | '1/4' | '1/8' | '1/16' | '1/32';

export type KeySignature = 'C' | 'F' | 'G';

export type TimeSignature = '2/4' | '3/4' | '4/4' | '6/8';

export type SkinType = 'white' | 'light-beige' | 'light-blue';

export type ElementType = 'note' | 'rest' | 'extension' | 'barline';

export type BarlineType = 'single' | 'double' | 'final' | 'repeat-start' | 'repeat-end';

export type DynamicMark = 'p' | 'mp' | 'mf' | 'f';

export interface Note {
  id: string;
  type: 'note';
  value: NoteValue;
  duration: Duration;
  hasHighDot?: boolean;
  hasLowDot?: boolean;
  hasAugmentationDot?: boolean;
  lyrics?: string;
}

export interface Rest {
  id: string;
  type: 'rest';
  value: '0';
  duration: Duration;
  restGroup?: 'full' | 'half';
}

export interface Extension {
  id: string;
  type: 'extension';
  value: '-';
  duration: Duration;
}

export interface Barline {
  id: string;
  type: 'barline';
  value: '|';
  barlineType?: BarlineType;
}

export type ScoreElement = Note | Rest | Extension | Barline;

export interface Beam {
  id: string;
  startMeasureIndex: number;
  startNoteIndex: number;
  endMeasureIndex: number;
  endNoteIndex: number;
  level: number;
}

export interface Tie {
  id: string;
  startMeasureIndex: number;
  startNoteIndex: number;
  endMeasureIndex: number;
  endNoteIndex: number;
}

export interface Lyric {
  measureIndex: number;
  noteIndex: number;
  text: string;
}

export interface ExpressionMark {
  id: string;
  measureIndex: number;
  noteIndex: number;
  type: 'dynamic';
  value: DynamicMark;
}

export interface Measure {
  id: string;
  elements: ScoreElement[];
}

export interface ScoreDocument {
  version: string;
  scoreId: string;
  ownerUserId?: string;
  title: string;
  measures: Measure[];
  beams?: Beam[];
  ties?: Tie[];
  expressions?: ExpressionMark[];
  lyrics: Lyric[];
  settings: ScoreSettings;
  createdAt?: string;
  updatedAt?: string;
}

export interface ScoreSettings {
  keySignature: KeySignature;
  timeSignature: TimeSignature;
  tempo: number;
  skin: SkinType;
  showLyrics: boolean;
  showFingering: boolean;
}

export interface EditorState {
  document: ScoreDocument;
  selectedMeasureIndex: number | null;
  selectedNoteIndex: number | null;
  isDirty: boolean;
  isExporting: boolean;
  isSaving: boolean;
  isBeamMode: boolean;
  beamStartPosition: { measureIndex: number; noteIndex: number } | null;
}

export interface HistoryState {
  document: ScoreDocument;
  selectedMeasureIndex: number | null;
  selectedNoteIndex: number | null;
}

export interface History {
  states: HistoryState[];
  currentIndex: number;
  maxSize: number;
}

export type FingeringKey =
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '1-high'
  | '2-high'
  | '3-high'
  | '4-high'
  | '5-high'
  | '6-high'
  | '7-high'
  | '1-low'
  | '2-low'
  | '3-low'
  | '4-low'
  | '5-low'
  | '6-low'
  | '7-low';

export type FingeringMap = Record<KeySignature, Record<FingeringKey, string>>;

export interface RenderOptions {
  container: HTMLElement;
  measures: Measure[];
  lyrics: Lyric[];
  settings: ScoreSettings;
  selectedMeasureIndex: number | null;
  selectedNoteIndex: number | null;
}

export interface MeasureRenderInfo {
  index: number;
  measure: Measure;
  isVisible: boolean;
  top: number;
  height: number;
}
