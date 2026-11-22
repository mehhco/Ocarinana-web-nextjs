import { hasScoreContent, type ScoreContentCandidate } from './guest-draft';

const DEFAULT_UNTITLED_TITLES = new Set([
  '未命名简谱',
  '未命名乐谱',
  '无标题',
  'untitled score',
]);

function normalizeScoreText(value: string | null | undefined): string {
  return (value || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

export interface CloudSaveCandidate extends ScoreContentCandidate {
  title?: string | null;
}

/**
 * 是否需要把这团内容落到云端。
 *
 * 除了自定义标题/作者信息，只要谱子里已经写进了音符、休止符或延音线，
 * 就算用户没改标题也必须允许保存——否则“编了一小时却没换标题”的谱子会被直接丢弃。
 */
export function shouldCreateNewScoreInCloud(document: CloudSaveCandidate): boolean {
  if (hasScoreContent(document)) {
    return true;
  }

  const normalizedTitle = normalizeScoreText(document.title);
  const hasCustomTitle = Boolean(normalizedTitle) && !DEFAULT_UNTITLED_TITLES.has(normalizedTitle);
  const hasCreatorInfo = Boolean(normalizeScoreText(document.lyricist) || normalizeScoreText(document.composer));

  return hasCustomTitle || hasCreatorInfo;
}
