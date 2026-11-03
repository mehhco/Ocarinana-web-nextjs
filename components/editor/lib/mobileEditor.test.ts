import assert from 'node:assert/strict';
import test from 'node:test';
import { getMobileNoteOptions } from './mobileEditor.ts';

test('C 调中音区保持七个稳定音符位置且全部可用', () => {
  const options = getMobileNoteOptions('basic', '12-hole', 'C');

  assert.deepEqual(
    options.map(({ value, degree, disabled }) => ({ value, degree, disabled })),
    [
      { value: '1', degree: '1', disabled: false },
      { value: '2', degree: '2', disabled: false },
      { value: '3', degree: '3', disabled: false },
      { value: '4', degree: '4', disabled: false },
      { value: '5', degree: '5', disabled: false },
      { value: '6', degree: '6', disabled: false },
      { value: '7', degree: '7', disabled: false },
    ],
  );
});

test('十二孔 G 调中音区使用降七音', () => {
  const options = getMobileNoteOptions('basic', '12-hole', 'G');

  assert.equal(options[6]?.value, 'b7');
  assert.equal(options[6]?.degree, '♭7');
  assert.equal(options[6]?.disabled, false);
});

test('六孔 G 调中音区使用升六音并禁用第七个位置', () => {
  const options = getMobileNoteOptions('basic', '6-hole', 'G');

  assert.equal(options[5]?.value, '#6');
  assert.equal(options[5]?.degree, '♯6');
  assert.equal(options[5]?.disabled, false);
  assert.equal(options[6]?.disabled, true);
});

test('高音区保留七个位置并根据音域禁用不可用音符', () => {
  const options = getMobileNoteOptions('high', '12-hole', 'F');

  assert.equal(options.length, 7);
  assert.equal(options[0]?.degree, '1');
  assert.equal(options[0]?.disabled, false);
  assert.equal(options[1]?.disabled, true);
});

test('音区不再拼接到显示文本里，由界面统一渲染高低音点', () => {
  const high = getMobileNoteOptions('high', '12-hole', 'C');
  const low = getMobileNoteOptions('low', '12-hole', 'C');

  assert.deepEqual(
    high.map((option) => option.degree),
    ['1', '2', '3', '4', '5', '6', '7'],
  );
  assert.deepEqual(
    low.map((option) => option.degree),
    ['1', '2', '3', '4', '5', '6', '7'],
  );
});
