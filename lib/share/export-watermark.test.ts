import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildExportShareUrl,
  getExportFooterCaption,
  getExportFooterMetrics,
} from './export-watermark.ts';

test('添加导出回流参数，并指向公开乐谱', () => {
  const result = buildExportShareUrl({
    origin: 'https://www.ocarinana.com',
    scoreId: 'score-a',
  });

  assert.equal(
    result,
    'https://www.ocarinana.com/scores/score-a?utm_source=export&utm_medium=image&utm_campaign=score_export',
  );
});

test('没有乐谱 ID 时指向首页，并容忍 origin 末尾斜杠', () => {
  const result = buildExportShareUrl({ origin: 'https://www.ocarinana.com/' });

  assert.equal(
    result,
    'https://www.ocarinana.com/?utm_source=export&utm_medium=image&utm_campaign=score_export',
  );
});

test('页脚尺寸随导出倍率等比放大', () => {
  const base = getExportFooterMetrics(1);
  const doubled = getExportFooterMetrics(2);

  assert.equal(doubled.height, base.height * 2);
  assert.equal(doubled.qrSize, base.qrSize * 2);
  assert.ok(base.height > base.qrSize, '页脚要留出上下内边距');
});

test('非法倍率回退到 1 倍，避免生成 0 高度页脚', () => {
  assert.deepEqual(getExportFooterMetrics(0), getExportFooterMetrics(1));
  assert.deepEqual(getExportFooterMetrics(Number.NaN), getExportFooterMetrics(1));
});

test('文案区分公开乐谱与首页入口', () => {
  assert.match(getExportFooterCaption('score-a'), /这份陶笛谱/);
  assert.match(getExportFooterCaption(null), /在线制作/);
});
