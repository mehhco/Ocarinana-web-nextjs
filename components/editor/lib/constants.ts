/**
 * 编辑器常量定义
 */

import type { InstrumentType } from '@/lib/editor/types';

// ============ 陶笛类型选项 ============

export const INSTRUMENT_OPTIONS: { value: InstrumentType; label: string; shortLabel: string }[] = [
  { value: '12-hole', label: '十二孔陶笛', shortLabel: '十二孔' },
  { value: '6-hole', label: '六孔陶笛', shortLabel: '六孔' },
];

export const DEFAULT_INSTRUMENT_TYPE: InstrumentType = '12-hole';

export function getInstrumentLabel(instrumentType?: InstrumentType | string): string {
  return INSTRUMENT_OPTIONS.find((option) => option.value === instrumentType)?.label ?? '十二孔陶笛';
}

export function getInstrumentShortLabel(instrumentType?: InstrumentType | string): string {
  return INSTRUMENT_OPTIONS.find((option) => option.value === instrumentType)?.shortLabel ?? '十二孔';
}

// ============ 调号选项 ============

export const KEY_SIGNATURE_OPTIONS = [
  { value: 'C' as const, label: '1=C' },
  { value: 'F' as const, label: '1=F' },
  { value: 'G' as const, label: '1=G' },
];

// ============ 拍号选项 ============

export const TIME_SIGNATURE_OPTIONS = [
  { value: '4/4' as const, label: '4/4' },
  { value: '3/4' as const, label: '3/4' },
  { value: '2/4' as const, label: '2/4' },
  { value: '6/8' as const, label: '6/8' },
];

// ============ 皮肤选项 ============

export const SKIN_OPTIONS = [
  { value: 'white' as const, label: '白色' },
  { value: 'light-beige' as const, label: '浅米色' },
  { value: 'light-blue' as const, label: '浅蓝色' },
];

// ============ 音符时值选项 ============

export const DURATION_OPTIONS = [
  { value: '1' as const, label: '全音符', symbol: '𝅝' },
  { value: '1/2' as const, label: '二分音符', symbol: '𝅗𝅥' },
  { value: '1/4' as const, label: '四分音符', symbol: '♩' },
  { value: '1/8' as const, label: '八分音符', symbol: '♪' },
  { value: '1/16' as const, label: '十六分音符', symbol: '𝅘𝅥' },
  { value: '1/32' as const, label: '三十二分音符', symbol: '𝅘𝅥𝅮' },
];

// ============ 基础音符 ============



// ============ 基础音符 ============

export const BASIC_NOTES = [
  { value: '1', name: 'do', solfege: 'C' },
  { value: '2', name: 're', solfege: 'D' },
  { value: '3', name: 'mi', solfege: 'E' },
  { value: '4', name: 'fa', solfege: 'F' },
  { value: '5', name: 'sol', solfege: 'G' },
  { value: '6', name: 'la', solfege: 'A' },
  { value: '7', name: 'si', solfege: 'B' },
];
// ============ 三排音符系统 ============

// 高音音符（带高音点）
export const HIGH_NOTES = [
  { value: '1', display: '1̇', name: '高音do', solfege: 'C' },
  { value: '2', display: '2̇', name: '高音re', solfege: 'D' },
  { value: '3', display: '3̇', name: '高音mi', solfege: 'E' },
  { value: '4', display: '4̇', name: '高音fa', solfege: 'F' },
  { value: '5', display: '5̇', name: '高音sol', solfege: 'G' },
  { value: '6', display: '6̇', name: '高音la', solfege: 'A' },
  { value: '7', display: '7̇', name: '高音si', solfege: 'B' },
] as const;

// 基础音符
export const BASIC_NOTES_ROWS = [
  { value: '1', display: '1', name: 'do', solfege: 'C' },
  { value: '2', display: '2', name: 're', solfege: 'D' },
  { value: '3', display: '3', name: 'mi', solfege: 'E' },
  { value: '4', display: '4', name: 'fa', solfege: 'F' },
  { value: '5', display: '5', name: 'sol', solfege: 'G' },
  { value: '6', display: '6', name: 'la', solfege: 'A' },
  { value: '7', display: '7', name: 'si', solfege: 'B' },
] as const;

// 低音音符（带低音点）
export const LOW_NOTES = [
  { value: '1', display: '1̣', name: '低音do', solfege: 'C' },
  { value: '2', display: '2̣', name: '低音re', solfege: 'D' },
  { value: '3', display: '3̣', name: '低音mi', solfege: 'E' },
  { value: '4', display: '4̣', name: '低音fa', solfege: 'F' },
  { value: '5', display: '5̣', name: '低音sol', solfege: 'G' },
  { value: '6', display: '6̣', name: '低音la', solfege: 'A' },
  { value: '7', display: '7̣', name: '低音si', solfege: 'B' },
] as const;

export type NoteRange = {
  high: string[];
  basic: string[];
  low: string[];
};

// 各陶笛类型和调号可用音域配置，根据指法图素材命名得出。
export const KEY_SIGNATURE_RANGES: Record<InstrumentType, Record<string, NoteRange>> = {
  '12-hole': {
    C: {
      high: ['1', '2', '3', '4'],
      basic: ['1', '2', '3', '4', '5', '6', '7'],
      low: ['6', '7'],
    },
    F: {
      high: ['1'],
      basic: ['1', '2', '3', '4', '5', '6', '7'],
      low: ['3', '4', '5', '6', '7'],
    },
    G: {
      high: [],
      basic: ['1', '2', '3', '4', '5', '6', 'b7'],
      low: ['2', '3', '4', '5', '6', '7'],
    },
  },
  '6-hole': {
    C: {
      high: ['1', '2', '3', '4'],
      basic: ['1', '2', '3', '4', '5', '6', '7'],
      low: ['7'],
    },
    F: {
      high: ['1'],
      basic: ['1', '2', '3', '4', '5', '6', '7'],
      low: ['4', '5', '6', '7'],
    },
    G: {
      high: [],
      basic: ['1', '2', '3', '4', '5', '#6'],
      low: ['3', '4', '5', '6', '7'],
    },
  },
};

export function getAvailableNoteRange(
  instrumentType: InstrumentType = DEFAULT_INSTRUMENT_TYPE,
  keySignature: string = 'C'
): NoteRange {
  return KEY_SIGNATURE_RANGES[instrumentType]?.[keySignature] ?? KEY_SIGNATURE_RANGES[DEFAULT_INSTRUMENT_TYPE].C;
}

// ============ 装饰音 ============

export const ORNAMENT_NOTES = [
  { value: 'extension', label: '延长线', description: '在音符上方添加延长线' },
  { value: 'underline', label: '下划线', description: '在音符下方添加下划线（缩短时值）' },
];

// ============ 休止符 ============

export const REST_OPTIONS = [
  { value: '1', label: '全休止符', description: '休止四拍' },
  { value: '1/2', label: '二分休止符', description: '休止二拍' },
  { value: '1/4', label: '四分休止符', description: '休止一拍' },
  { value: '1/8', label: '八分休止符', description: '休止半拍' },
];

// ============ 历史记录配置 ============

export const HISTORY_CONFIG = {
  MAX_SIZE: 50,                   // 最大历史记录数
  DEBOUNCE_MS: 300,              // 自动保存防抖时间
};

// ============ 虚拟滚动配置 ============

export const VIRTUAL_SCROLL_CONFIG = {
  BUFFER_SIZE: 3,                // 上下缓冲区大小
  MEASURE_HEIGHT: 120,           // 小节预估高度（px）
  MAX_VISIBLE_MEASURES: 20,      // 最大同时渲染小节数
};

// ============ 导出配置 ============

export const EXPORT_CONFIG = {
  IMAGE_SCALE: 2,                // 图片导出缩放比例
  IMAGE_QUALITY: 1.0,            // 图片质量（0-1）
  BACKGROUND_COLOR: '#ffffff',   // 导出背景色
};

// ============ 键盘快捷键 ============

export const KEYBOARD_SHORTCUTS = {
  // 音符输入
  NOTE_1: '1',
  NOTE_2: '2',
  NOTE_3: '3',
  NOTE_4: '4',
  NOTE_5: '5',
  NOTE_6: '6',
  NOTE_7: '7',
  
  // 编辑操作
  UNDO: 'mod+z',
  REDO: 'mod+shift+z',
  DELETE: 'backspace',
  
  // 导航
  SELECT_NEXT: 'arrowright',
  SELECT_PREV: 'arrowleft',
  SELECT_UP: 'arrowup',
  SELECT_DOWN: 'arrowdown',
};

// ============ 默认文档 ============

export const DEFAULT_TITLE = '未命名简谱';
export const DEFAULT_PRODUCER = 'www.ocarinana.com';

export const DEFAULT_SETTINGS = {
  instrumentType: DEFAULT_INSTRUMENT_TYPE,
  keySignature: 'C' as const,
  timeSignature: '4/4' as const,
  tempo: 120,
  showTempo: true,
  skin: 'white' as const,
  showLyrics: false,
  showFingering: true,
};
