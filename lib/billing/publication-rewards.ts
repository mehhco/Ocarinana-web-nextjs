import { createAdminClient } from '@/lib/supabase/admin';

const DEFAULT_TITLES = new Set(['未命名简谱', '无标题', 'untitled score']);
const TEST_TITLES = new Set(['测试']);
const PUBLICATION_MIN_MUSIC_TOKENS = 20;
const REWARD_MIN_MUSIC_TOKENS = 30;
const MAX_DOMINANT_MUSIC_TOKEN_RATIO = 0.6;
const REWARD_DAYS = 1;

export const SCORE_PUBLICATION_RULES = [
  '标题不能为空，不能是默认标题，不能为“测试”。',
  '可识别音乐内容必须大于 20 个；小节线和休止符不计入。',
  '任一可识别音乐元素不能超过全部可识别音乐内容的 60%。',
] as const;

export const SCORE_PUBLICATION_REWARD_RULES = [
  '获得 Plus 权益奖励需要通过公开检查。',
  '获得 Plus 权益奖励的可识别音乐内容必须大于 30 个；小节线和休止符不计入。',
] as const;

type ScoreForReward = {
  score_id: string;
  title: string | null;
  document: unknown;
};

type QualityCheckResult = {
  passed: boolean;
  reason: string;
  noteCount: number;
  titleLength: number;
  dominantMusicElement: string | null;
  dominantMusicElementCount: number;
  dominantMusicElementRatio: number;
};

const QUALITY_FAILURE_MESSAGES: Record<string, string> = {
  title_empty: '标题不能为空，请填写正式标题后再公开。',
  title_default: '标题不能使用默认标题，请改成正式标题后再公开。',
  title_test: '标题不能为“测试”，请改成正式标题后再公开。',
  content_too_short: '乐谱内容太短，请填写超过 20 个可识别音乐内容后再公开。',
  content_too_repetitive: '乐谱内容重复度过高，请减少单个音乐元素的重复占比后再公开。',
  reward_content_too_short: '这首乐谱可以公开，但暂不能获得 Plus 权益奖励：可识别音乐内容需要大于 30 个。',
};

const QUALITY_FAILURE_RULES: Record<string, string[]> = {
  title_empty: [SCORE_PUBLICATION_RULES[0]],
  title_default: [SCORE_PUBLICATION_RULES[0]],
  title_test: [SCORE_PUBLICATION_RULES[0]],
  content_too_short: [SCORE_PUBLICATION_RULES[1]],
  content_too_repetitive: [SCORE_PUBLICATION_RULES[2]],
  reward_content_too_short: [SCORE_PUBLICATION_REWARD_RULES[1]],
};

type MusicToken = {
  signature: string;
  label: string;
};

type DominantMusicTokenStats = {
  label: string;
  count: number;
  ratio: number;
};

function getShanghaiDateKey() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function getRewardMonth() {
  return `${getShanghaiDateKey().slice(0, 7)}-01`;
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, '').toLowerCase();
}

function getTitleFailureReason(title: string): string | null {
  const normalized = normalizeText(title);
  if (!normalized) return 'title_empty';
  if (DEFAULT_TITLES.has(normalized)) return 'title_default';
  if (TEST_TITLES.has(normalized)) return 'title_test';
  return null;
}

function getStringValue(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number') return String(value);
  return null;
}

function getMusicToken(record: Record<string, unknown>): MusicToken | null {
  if (record.type === 'barline' || record.type === 'rest') {
    return null;
  }

  const type = getStringValue(record.type);
  if (type && type !== 'note' && type !== 'extension') {
    return null;
  }

  const value =
    getStringValue(record.value) ||
    getStringValue(record.pitch) ||
    getStringValue(record.note) ||
    getStringValue(record.number) ||
    getStringValue(record.degree) ||
    getStringValue(record.lyric) ||
    getStringValue(record.octave);

  if (record.type !== 'note' && !value) {
    return null;
  }

  const tokenType = type || 'music';
  const highDot = record.hasHighDot === true ? ':high' : '';
  const lowDot = record.hasLowDot === true ? ':low' : '';
  const signature = `${tokenType}:${value || 'unknown'}${highDot}${lowDot}`.toLowerCase();

  return {
    signature,
    label: tokenType === 'note' ? `音符 ${value || '-'}` : `${tokenType} ${value || '-'}`,
  };
}

function collectMusicTokens(value: unknown): MusicToken[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectMusicTokens(item));
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const token = getMusicToken(record);

    if (token) {
      return [token];
    }

    return Object.values(record).flatMap((item) => collectMusicTokens(item));
  }

  return [];
}

function getDominantMusicTokenStats(tokens: MusicToken[]): DominantMusicTokenStats | null {
  if (tokens.length === 0) return null;

  const counts = new Map<string, { label: string; count: number }>();

  tokens.forEach((token) => {
    const current = counts.get(token.signature);
    counts.set(token.signature, {
      label: token.label,
      count: (current?.count || 0) + 1,
    });
  });

  let dominant: DominantMusicTokenStats | null = null;
  counts.forEach((entry) => {
    if (!dominant || entry.count > dominant.count) {
      dominant = {
        label: entry.label,
        count: entry.count,
        ratio: entry.count / tokens.length,
      };
    }
  });

  return dominant;
}

function createQualityResult(input: {
  passed: boolean;
  reason: string;
  noteCount: number;
  titleLength: number;
  dominant: DominantMusicTokenStats | null;
}): QualityCheckResult {
  return {
    passed: input.passed,
    reason: input.reason,
    noteCount: input.noteCount,
    titleLength: input.titleLength,
    dominantMusicElement: input.dominant?.label || null,
    dominantMusicElementCount: input.dominant?.count || 0,
    dominantMusicElementRatio: input.dominant?.ratio || 0,
  };
}

export function checkScorePublicationQuality(score: ScoreForReward): QualityCheckResult {
  const title = score.title || '';
  const titleLength = normalizeText(title).length;
  const musicTokens = collectMusicTokens(score.document);
  const noteCount = musicTokens.length;
  const dominant = getDominantMusicTokenStats(musicTokens);

  const titleFailureReason = getTitleFailureReason(title);
  if (titleFailureReason) {
    return createQualityResult({
      passed: false,
      reason: titleFailureReason,
      noteCount,
      titleLength,
      dominant,
    });
  }

  if (noteCount <= PUBLICATION_MIN_MUSIC_TOKENS) {
    return createQualityResult({
      passed: false,
      reason: 'content_too_short',
      noteCount,
      titleLength,
      dominant,
    });
  }

  if (dominant && dominant.ratio > MAX_DOMINANT_MUSIC_TOKEN_RATIO) {
    return createQualityResult({
      passed: false,
      reason: 'content_too_repetitive',
      noteCount,
      titleLength,
      dominant,
    });
  }

  return createQualityResult({
    passed: true,
    reason: 'passed',
    noteCount,
    titleLength,
    dominant,
  });
}

export function checkScorePublicationRewardQuality(score: ScoreForReward): QualityCheckResult {
  const quality = checkScorePublicationQuality(score);

  if (!quality.passed) {
    return quality;
  }

  if (quality.noteCount <= REWARD_MIN_MUSIC_TOKENS) {
    return {
      ...quality,
      passed: false,
      reason: 'reward_content_too_short',
    };
  }

  return quality;
}

export function getScorePublicationQualityFailureMessage(quality: QualityCheckResult): string {
  return QUALITY_FAILURE_MESSAGES[quality.reason] || '乐谱暂未通过公开质量检查，请完善后再公开。';
}

export function getScorePublicationQualityFailedRules(quality: QualityCheckResult): string[] {
  return QUALITY_FAILURE_RULES[quality.reason] || SCORE_PUBLICATION_RULES.slice();
}

export async function grantPublicationReward(input: {
  userId: string;
  score: ScoreForReward;
  quality: QualityCheckResult;
}) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc('grant_score_publication_reward', {
    p_user_id: input.userId,
    p_score_id: input.score.score_id,
    p_reward_days: REWARD_DAYS,
    p_reward_month: getRewardMonth(),
    p_quality_result: input.quality,
  });

  if (error) {
    throw error;
  }

  const result = Array.isArray(data) ? data[0] : null;
  return {
    rewardGranted: result?.granted === true,
    rewardDays: result?.granted === true ? REWARD_DAYS : 0,
    rewardReason: typeof result?.reason === 'string' ? result.reason : 'unknown',
    monthlyRewardUsed: typeof result?.monthly_used_days === 'number' ? result.monthly_used_days : null,
    rewardPeriodEnd: typeof result?.period_end === 'string' ? result.period_end : null,
  };
}
