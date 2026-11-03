import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getInstrumentLanding,
  getInstrumentLandingHref,
  getKeyLanding,
  getKeyLandingHref,
  instrumentLandings,
  keyLandings,
} from './landing.ts';

test('孔数落地页覆盖六孔与十二孔且 slug 唯一', () => {
  assert.deepEqual(
    instrumentLandings.map((landing) => landing.slug),
    ['6-hole', '12-hole']
  );
  assert.equal(instrumentLandings[0].instrumentType, '6-hole');
  assert.equal(instrumentLandings[1].instrumentType, '12-hole');
});

test('调号落地页覆盖 C/F/G 且映射到正确调号', () => {
  assert.deepEqual(
    keyLandings.map((landing) => landing.keySignature),
    ['C', 'F', 'G']
  );
});

test('每个落地页都有足够的标题、描述和问题', () => {
  for (const landing of [...instrumentLandings, ...keyLandings]) {
    assert.ok(landing.title.length >= 12, `${landing.slug} 标题过短`);
    assert.ok(landing.description.length >= 60, `${landing.slug} 描述过短`);
    assert.ok(landing.intro.length >= 1, `${landing.slug} 缺少导语`);
    assert.ok(landing.faqs.length >= 2, `${landing.slug} 问题太少`);
    assert.ok(landing.keywords.length >= 3, `${landing.slug} 关键词太少`);
  }
});

test('按 slug 查找落地页，未知 slug 返回 undefined', () => {
  assert.equal(getInstrumentLanding('6-hole')?.label, '六孔陶笛谱');
  assert.equal(getInstrumentLanding('9-hole'), undefined);
  assert.equal(getKeyLanding('g')?.keySignature, 'G');
  assert.equal(getKeyLanding('d'), undefined);
});

test('落地页链接带上前缀且没有多余斜杠', () => {
  assert.equal(getInstrumentLandingHref('12-hole'), '/scores/instrument/12-hole');
  assert.equal(getKeyLandingHref('c'), '/scores/key/c');
});
