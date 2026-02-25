/**
 * 编辑器常量定义
 */

// ============ 调号选项 ============

export const KEY_SIGNATURE_OPTIONS = [
  { value: 'C' as const, label: '1=C' },
  { value: 'G' as const, label: '1=G' },
  { value: 'D' as const, label: '1=D' },
  { value: 'A' as const, label: '1=A' },
  { value: 'E' as const, label: '1=E' },
  { value: 'F' as const, label: '1=F' },
  { value: 'Bb' as const, label: '1=Bb' },
  { value: 'Eb' as const, label: '1=Eb' },
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
];

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

// ============ 装饰音 ============

export const ORNAMENT_NOTES = [
  { value: 'high-dot', label: '高音点', description: '在音符上方添加高音点' },
  { value: 'low-dot', label: '低音点', description: '在音符下方添加低音点' },
  { value: 'extension', label: '延长线', description: '延长音符时值' },
  { value: 'underline', label: '下划线', description: '缩短音符时值' },
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

export const DEFAULT_SETTINGS = {
  keySignature: 'C' as const,
  timeSignature: '4/4' as const,
  tempo: 120,
  skin: 'white' as const,
  showLyrics: false,
  showFingering: true,
};
