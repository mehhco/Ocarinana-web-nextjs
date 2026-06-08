import type { ScoreDocument } from '@/lib/editor/types';

const DEFAULT_UNTITLED_TITLES = new Set([
  '未命名简谱',
  '未命名乐谱',
  '无标题',
  'untitled score',
]);

function normalizeScoreText(value: string | null | undefined): string {
  return (value || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

export function shouldCreateNewScoreInCloud(
  document: Pick<ScoreDocument, 'title'> & Partial<Pick<ScoreDocument, 'lyricist' | 'composer'>>
): boolean {
  const normalizedTitle = normalizeScoreText(document.title);
  const hasCustomTitle = Boolean(normalizedTitle) && !DEFAULT_UNTITLED_TITLES.has(normalizedTitle);
  const hasCreatorInfo = Boolean(normalizeScoreText(document.lyricist) || normalizeScoreText(document.composer));

  return hasCustomTitle || hasCreatorInfo;
}
