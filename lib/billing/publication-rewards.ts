import { createAdminClient } from '@/lib/supabase/admin';

const DEFAULT_TITLES = new Set(['未命名简谱', '无标题', '测试', 'test', 'demo']);
const REWARD_DAYS = 1;

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

function isLowQualityTitle(title: string) {
  const normalized = normalizeText(title);
  if (!normalized) return true;
  if (DEFAULT_TITLES.has(normalized)) return true;
  if (/^(.)\1{2,}$/.test(normalized)) return true;
  if (/https?:\/\//i.test(title)) return true;

  const chineseChars = normalized.match(/[\u4e00-\u9fff]/g)?.length || 0;
  const latinChars = normalized.match(/[a-z0-9]/gi)?.length || 0;
  return chineseChars < 2 && latinChars < 4;
}

function countMusicTokens(value: unknown): number {
  if (!value) return 0;

  if (Array.isArray(value)) {
    return value.reduce((total, item) => total + countMusicTokens(item), 0);
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const tokenLike =
      record.type === 'note' ||
      typeof record.pitch === 'string' ||
      typeof record.note === 'string' ||
      typeof record.number === 'number' ||
      typeof record.value === 'string' ||
      typeof record.lyric === 'string' ||
      typeof record.degree === 'number' ||
      typeof record.octave === 'number';

    if (tokenLike && record.type !== 'barline' && record.type !== 'rest') {
      return 1;
    }

    return Object.values(record).reduce<number>(
      (total, item) => total + countMusicTokens(item),
      0,
    );
  }

  return 0;
}

export function checkScorePublicationQuality(score: ScoreForReward): QualityCheckResult {
  const title = score.title || '';
  const titleLength = normalizeText(title).length;
  const noteCount = countMusicTokens(score.document);

  if (isLowQualityTitle(title)) {
    return {
      passed: false,
      reason: 'title_too_generic',
      noteCount,
      titleLength,
    };
  }

  if (noteCount < 8) {
    return {
      passed: false,
      reason: 'content_too_short',
      noteCount,
      titleLength,
    };
  }

  return {
    passed: true,
    reason: 'passed',
    noteCount,
    titleLength,
  };
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
