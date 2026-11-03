import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildFingeringChart,
  getNoteLabel,
  getNoteSolfege,
} from './fingering-chart.ts';

const map = {
  '1': '/1.svg',
  '2': '/2.svg',
  '7': '/7.svg',
  '1-high': '/1h.svg',
  '7-low': '/7l.svg',
};

test('orders notes from low register to high register', () => {
  const notes = buildFingeringChart({
    instrumentLabel: '十二孔陶笛',
    keySignature: 'C',
    map,
    ranges: { low: ['7'], basic: ['1', '2', '7'], high: ['1'] },
  });

  assert.deepEqual(
    notes.map((note) => note.key),
    ['7-low', '1', '2', '7', '1-high']
  );
  assert.deepEqual(
    notes.map((note) => note.register),
    ['low', 'basic', 'basic', 'basic', 'high']
  );
});

test('skips notes that have no fingering in the map', () => {
  const notes = buildFingeringChart({
    instrumentLabel: '六孔陶笛',
    keySignature: 'G',
    map: { '1': '/1.svg' },
    ranges: { low: ['3'], basic: ['1', '2'], high: ['1'] },
  });

  assert.deepEqual(
    notes.map((note) => note.key),
    ['1']
  );
});

test('labels notes with register dots and readable pitch names', () => {
  assert.equal(getNoteLabel('1', 'basic'), '1');
  assert.equal(getNoteLabel('1', 'high'), '1\u0307');
  assert.equal(getNoteLabel('7', 'low'), '7\u0323');
  assert.equal(getNoteLabel('b7', 'basic'), '\u266D7');
  assert.equal(getNoteLabel('#6', 'basic'), '\u266F6');
});

test('describes solfege with the matching register prefix', () => {
  assert.equal(getNoteSolfege('1', 'basic'), 'do');
  assert.equal(getNoteSolfege('1', 'high'), '高音 do');
  assert.equal(getNoteSolfege('7', 'low'), '低音 si');
  assert.equal(getNoteSolfege('b7', 'basic'), '降 si');
});

test('builds accessible alt text that mentions instrument, key and note', () => {
  const [note] = buildFingeringChart({
    instrumentLabel: '十二孔陶笛',
    keySignature: 'F',
    map: { '1': '/1.svg' },
    ranges: { low: [], basic: ['1'], high: [] },
  });

  assert.equal(note.alt, '十二孔陶笛 F 调 do 的陶笛指法图');
  assert.equal(note.degree, '1');
  assert.equal(note.image, '/1.svg');
});

test('separates the plain degree from the register dots', () => {
  const notes = buildFingeringChart({
    instrumentLabel: '十二孔陶笛',
    keySignature: 'C',
    map: { '1': '/1.svg', '1-high': '/1h.svg', 'b7': '/b7.svg' },
    ranges: { low: [], basic: ['1', 'b7'], high: ['1'] },
  });

  assert.deepEqual(
    notes.map((note) => [note.degree, note.label, note.register]),
    [
      ['1', '1', 'basic'],
      ['\u266D7', '\u266D7', 'basic'],
      ['1', '1\u0307', 'high'],
    ]
  );
});
