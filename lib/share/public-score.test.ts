import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildPublicScoreShareText,
  buildPublicScoreShareUrl,
} from './public-score.ts';

test('adds public score share tracking without changing the canonical path', () => {
  const result = buildPublicScoreShareUrl(
    'https://www.ocarinana.com/scores/score-a',
    'copy'
  );

  assert.equal(
    result,
    'https://www.ocarinana.com/scores/score-a?utm_source=copy&utm_medium=share&utm_campaign=public_score'
  );
});

test('builds a readable share message with score settings and link', () => {
  const result = buildPublicScoreShareText({
    title: '小星星',
    instrumentLabel: '六孔',
    keySignature: 'C',
    timeSignature: '4/4',
    url: 'https://www.ocarinana.com/scores/score-a?utm_source=native',
  });

  assert.equal(
    result,
    '《小星星》六孔陶笛谱，1=C，4/4 拍。\n打开查看指法图并导出图片：https://www.ocarinana.com/scores/score-a?utm_source=native'
  );
});
