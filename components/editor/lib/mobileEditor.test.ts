import assert from 'node:assert/strict';
import test from 'node:test';
import { getMobileNoteOptions } from './mobileEditor.ts';

test('C 调中音区保持七个稳定音符位置且全部可用', () => {
  const options = getMobileNoteOptions('basic', '12-hole', 'C');

  assert.deepEqual(
    options.map(({ value, display, disabled }) => ({ value, display, disabled })),
    [
      { value: '1', display: '1', disabled: false },
      { value: '2', display: '2', disabled: false },
      { value: '3', display: '3', disabled: false },
      { value: '4', display: '4', disabled: false },
      { value: '5', display: '5', disabled: false },
      { value: '6', display: '6', disabled: false },
      { value: '7', display: '7', disabled: false },
    ],
  );
});

test('十二孔 G 调中音区使用降七音', () => {
  const options = getMobileNoteOptions('basic', '12-hole', 'G');

  assert.equal(options[6]?.value, 'b7');
  assert.equal(options[6]?.display, '♭7');
  assert.equal(options[6]?.disabled, false);
});

test('六孔 G 调中音区使用升六音并禁用第七个位置', () => {
  const options = getMobileNoteOptions('basic', '6-hole', 'G');

  assert.equal(options[5]?.value, '#6');
  assert.equal(options[5]?.display, '♯6');
  assert.equal(options[5]?.disabled, false);
  assert.equal(options[6]?.disabled, true);
});

test('高音区保留七个位置并根据音域禁用不可用音符', () => {
  const options = getMobileNoteOptions('high', '12-hole', 'F');

  assert.equal(options.length, 7);
  assert.equal(options[0]?.display, '1̇');
  assert.equal(options[0]?.disabled, false);
  assert.equal(options[1]?.disabled, true);
});

