/**
 * 乐谱编辑器类型定义
 * 与旧版本 script.js 中的 ScoreModel 对应
 */

// ============ 基础类型 ============

export type NoteValue = '1' | '2' | '3' | '4' | '5' | '6' | '7';

export type Duration = '1' | '1/2' | '1/4' | '1/8' | '1/16' | '1/32';

export type KeySignature = 'C' | 'G' | 'D' | 'A' | 'E' | 'F' | 'Bb' | 'Eb';

export type TimeSignature = '2/4' | '3/4' | '4/4' | '6/8';

export type SkinType = 'white' | 'light-beige' | 'light-blue';

export type ElementType = 'note' | 'rest' | 'extension' | 'tie-start' | 'tie-end';

// ============ 音符数据类型 ============

export interface Note {
  id: string;                       // 唯一标识（用于 React key）
  type: 'note';
  value: NoteValue;
  duration: Duration;
  hasHighDot?: boolean;             // 高音点
  hasLowDot?: boolean;              // 低音点
  lyrics?: string;                  // 关联的歌词
}

export interface Rest {
  id: string;
  type: 'rest';
  value: '0';
  duration: Duration;
  restGroup?: 'full' | 'half';      // 全/二分休止符组标记
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
}

export type ScoreElement = Note | Rest | Extension | Barline;

// ============ 连音线类型 ============

export interface Tie {
  id: string;
  startMeasureIndex: number;
  startNoteIndex: number;
  endMeasureIndex: number;
  endNoteIndex: number;
}

// ============ 时值线连接类型 ============

export interface Beam {
  id: string;
  startMeasureIndex: number;
  startNoteIndex: number;
  endMeasureIndex: number;
  endNoteIndex: number;
  level: number; // 1=1/8, 2=1/16, 3=1/32，表示连接哪条时值线
}


export interface Lyric {
  measureIndex: number;
  noteIndex: number;
  text: string;
}

// ============ 小节类型 ============

export interface Measure {
  id: string;
  elements: ScoreElement[];
}

// ============ 乐谱文档类型 ============

export interface ScoreDocument {
  version: string;
  scoreId: string;
  ownerUserId?: string;
  title: string;
  measures: Measure[];
  ties: Tie[];
  beams: Beam[];
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

// ============ 编辑器状态类型 ============

export interface EditorState {
  // 当前文档
  document: ScoreDocument;
  
  // 选中状态
  selectedMeasureIndex: number | null;
  selectedNoteIndex: number | null;
  
  // UI 状态
  isDirty: boolean;                 // 是否有未保存更改
  isExporting: boolean;             // 是否正在导出
  
  // 连音线工具状态
  isTieMode: boolean;
  tieStartPosition: { measureIndex: number; noteIndex: number } | null;
  
  // 时值线连接工具状态
  isBeamMode: boolean;
  beamStartPosition: { measureIndex: number; noteIndex: number } | null;
}


// ============ 历史记录类型 ============

export interface HistoryState {
  document: ScoreDocument;
  selectedMeasureIndex: number | null;
  selectedNoteIndex: number | null;
}

export interface History {
  states: HistoryState[];
  currentIndex: number;
  maxSize: number;                  // 最大历史记录数（默认 50）
}

// ============ 指法图类型 ============

export type FingeringKey = 
  | '1' | '2' | '3' | '4' | '5' | '6' | '7'
  | '1-high' | '2-high' | '3-high' | '4-high' | '5-high' | '6-high' | '7-high'
  | '1-low' | '2-low' | '3-low' | '4-low' | '5-low' | '6-low' | '7-low';

export type FingeringMap = Record<KeySignature, Record<FingeringKey, string>>;

// ============ 渲染相关类型 ============

export interface RenderOptions {
  container: HTMLElement;
  measures: Measure[];
  ties: Tie[];
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
