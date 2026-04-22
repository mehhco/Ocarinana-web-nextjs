/**
 * 陶笛指法图映射数据
 * 从 public/webfile/script.js 迁移而来
 * 
 * 图片格式：支持 .png 和 .webp
 * 浏览器会自动选择最优格式
 */

import type { KeySignature, FingeringKey } from '@/lib/editor/types';

// 指法图基础路径
const FINGERING_BASE_PATH = '/webfile/static';

// ============ C 调指法图 ============

const C_FINGERING: Partial<Record<FingeringKey, string>> = {
  // 基础音符
  '1': `${FINGERING_BASE_PATH}/C-graph/1.webp`,
  '2': `${FINGERING_BASE_PATH}/C-graph/2.webp`,
  '3': `${FINGERING_BASE_PATH}/C-graph/3.webp`,
  '4': `${FINGERING_BASE_PATH}/C-graph/4.webp`,
  '5': `${FINGERING_BASE_PATH}/C-graph/5.webp`,
  '6': `${FINGERING_BASE_PATH}/C-graph/6.webp`,
  '7': `${FINGERING_BASE_PATH}/C-graph/7.webp`,
  // 高音
  '1-high': `${FINGERING_BASE_PATH}/C-graph/1h.webp`,
  '2-high': `${FINGERING_BASE_PATH}/C-graph/2h.webp`,
  '3-high': `${FINGERING_BASE_PATH}/C-graph/3h.webp`,
  '4-high': `${FINGERING_BASE_PATH}/C-graph/4h.webp`,
  // 低音
  '6-low': `${FINGERING_BASE_PATH}/C-graph/6l.webp`,
  '7-low': `${FINGERING_BASE_PATH}/C-graph/7l.webp`,
};

// ============ F 调指法图 ============

const F_FINGERING: Partial<Record<FingeringKey, string>> = {
  // 基础音符
  '1': `${FINGERING_BASE_PATH}/F-graph/1.webp`,
  '2': `${FINGERING_BASE_PATH}/F-graph/2.webp`,
  '3': `${FINGERING_BASE_PATH}/F-graph/3.webp`,
  '4': `${FINGERING_BASE_PATH}/F-graph/4.webp`,
  '5': `${FINGERING_BASE_PATH}/F-graph/5.webp`,
  '6': `${FINGERING_BASE_PATH}/F-graph/6.webp`,
  '7': `${FINGERING_BASE_PATH}/F-graph/7.webp`,
  // 高音
  '1-high': `${FINGERING_BASE_PATH}/F-graph/1h.webp`,
  // 低音（F 调特有的低音范围）
  '3-low': `${FINGERING_BASE_PATH}/F-graph/3l.webp`,
  '4-low': `${FINGERING_BASE_PATH}/F-graph/4l.webp`,
  '5-low': `${FINGERING_BASE_PATH}/F-graph/5l.webp`,
  '6-low': `${FINGERING_BASE_PATH}/F-graph/6l.webp`,
  '7-low': `${FINGERING_BASE_PATH}/F-graph/7l.webp`,
};

// ============ G 调指法图 ============

const G_FINGERING: Partial<Record<FingeringKey, string>> = {
  // 基础音符
  '1': `${FINGERING_BASE_PATH}/G-graph/1.webp`,
  '2': `${FINGERING_BASE_PATH}/G-graph/2.webp`,
  '3': `${FINGERING_BASE_PATH}/G-graph/3.webp`,
  '4': `${FINGERING_BASE_PATH}/G-graph/4.webp`,
  '5': `${FINGERING_BASE_PATH}/G-graph/5.webp`,
  '6': `${FINGERING_BASE_PATH}/G-graph/6.webp`,
  'b7': `${FINGERING_BASE_PATH}/G-graph/b7.webp`,
  // 高音
  // 低音（G 调特有的低音范围）
  '2-low': `${FINGERING_BASE_PATH}/G-graph/2l.webp`,
  '3-low': `${FINGERING_BASE_PATH}/G-graph/3l.webp`,
  '4-low': `${FINGERING_BASE_PATH}/G-graph/4l.webp`,
  '5-low': `${FINGERING_BASE_PATH}/G-graph/5l.webp`,
  '6-low': `${FINGERING_BASE_PATH}/G-graph/6l.webp`,
  '7-low': `${FINGERING_BASE_PATH}/G-graph/7l.webp`,
};

// ============ 完整指法图映射 ============

export const FINGERING_MAP: Record<KeySignature, Partial<Record<FingeringKey, string>>> = {
  'C': C_FINGERING,
  'F': F_FINGERING,
  'G': G_FINGERING,
};

// ============ 辅助函数 ============

/**
 * 获取指法图 URL
 * @param keySignature 调号
 * @param noteValue 音符值（1-7）
 * @param hasHighDot 是否有高音点
 * @param hasLowDot 是否有低音点
 * @returns 指法图 URL，如果不存在则返回 null
 */
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

/**
 * 检查指法图是否存在
 * @param keySignature 调号
 * @param noteValue 音符值
 * @param hasHighDot 是否有高音点
 * @param hasLowDot 是否有低音点
 */
export function hasFingering(
  keySignature: KeySignature,
  noteValue: string,
  hasHighDot: boolean = false,
  hasLowDot: boolean = false
): boolean {
  return getFingeringUrl(keySignature, noteValue, hasHighDot, hasLowDot) !== null;
}

/**
 * 获取所有可用的调号
 */
export function getAvailableKeySignatures(): KeySignature[] {
  return Object.keys(FINGERING_MAP) as KeySignature[];
}

/**
 * 获取指定调号的所有指法图
 * @param keySignature 调号
 */
export function getFingeringMapForKey(
  keySignature: KeySignature
): Partial<Record<FingeringKey, string>> | null {
  return FINGERING_MAP[keySignature] || null;
}
