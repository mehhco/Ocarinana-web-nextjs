/**
 * 乐谱落地页的收录策略。
 *
 * 按孔数/调号切出来的落地页，内容主要来自公开乐谱。
 * 公开谱太少的页面（比如只有一两首的调号）容易被判成薄页面，
 * 所以低于阈值时只允许 follow、不参与索引，等公开谱补上来再自动放开。
 */

export const MIN_PUBLIC_SCORES_FOR_INDEX = 3;

export function shouldIndexLanding(publicScoreCount: number): boolean {
  return publicScoreCount >= MIN_PUBLIC_SCORES_FOR_INDEX;
}

export interface LandingScoreCounts {
  instrument: Record<'6-hole' | '12-hole', number>;
  key: Record<'C' | 'F' | 'G', number>;
}

export function emptyLandingScoreCounts(): LandingScoreCounts {
  return {
    instrument: { '6-hole': 0, '12-hole': 0 },
    key: { C: 0, F: 0, G: 0 },
  };
}

export interface PublicScoreSettingsSample {
  instrumentType?: string | null;
  keySignature?: string | null;
}

export function countLandingScores(
  samples: PublicScoreSettingsSample[]
): LandingScoreCounts {
  const counts = emptyLandingScoreCounts();

  for (const sample of samples) {
    // 十二孔是旧数据的默认值：instrumentType 为空时按十二孔统计，和列表页保持一致。
    if (sample.instrumentType === '6-hole') {
      counts.instrument['6-hole'] += 1;
    } else {
      counts.instrument['12-hole'] += 1;
    }

    if (sample.keySignature === 'C' || sample.keySignature === 'F' || sample.keySignature === 'G') {
      counts.key[sample.keySignature] += 1;
    }
  }

  return counts;
}
