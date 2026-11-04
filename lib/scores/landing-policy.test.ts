import assert from 'node:assert/strict';
import test from 'node:test';
import {
  MIN_PUBLIC_SCORES_FOR_INDEX,
  countLandingScores,
  emptyLandingScoreCounts,
  shouldIndexLanding,
} from './landing-policy.ts';

test('公开谱数量达到阈值才允许索引', () => {
  assert.equal(shouldIndexLanding(0), false);
  assert.equal(shouldIndexLanding(MIN_PUBLIC_SCORES_FOR_INDEX - 1), false);
  assert.equal(shouldIndexLanding(MIN_PUBLIC_SCORES_FOR_INDEX), true);
  assert.equal(shouldIndexLanding(MIN_PUBLIC_SCORES_FOR_INDEX + 5), true);
});

test('按孔数与调号分别计数，空的 instrumentType 计入十二孔', () => {
  const counts = countLandingScores([
    { instrumentType: '6-hole', keySignature: 'C' },
    { instrumentType: '6-hole', keySignature: 'G' },
    { instrumentType: '12-hole', keySignature: 'F' },
    { instrumentType: null, keySignature: 'C' },
    { instrumentType: '12-hole', keySignature: null },
  ]);

  assert.equal(counts.instrument['6-hole'], 2);
  assert.equal(counts.instrument['12-hole'], 3);
  assert.equal(counts.key.C, 2);
  assert.equal(counts.key.F, 1);
  assert.equal(counts.key.G, 1);
});

test('没有公开谱时所有计数为零', () => {
  assert.deepEqual(countLandingScores([]), emptyLandingScoreCounts());
});
