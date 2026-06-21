import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getNextSectionLabel,
  normalizeSectionData,
  preserveAnchoredElementId,
  relocateSectionsBeforeElementDelete,
  sortSectionsByScorePosition,
} from './sections.ts';
import type { Measure, ScoreSection } from './types.ts';
import { scoreDocumentSchema } from '../validations/score.ts';

const measures: Measure[] = [
  {
    id: 'measure-a',
    elements: [
      { id: 'note-a', type: 'note', value: '1', duration: '1/4' },
      { id: 'note-b', type: 'note', value: '2', duration: '1/4' },
    ],
  },
  {
    id: 'measure-b',
    elements: [{ id: 'note-c', type: 'note', value: '3', duration: '1/4' }],
  },
];

test('generates the first unused spreadsheet-style section label', () => {
  assert.equal(getNextSectionLabel(['A', 'C']), 'B');
  assert.equal(
    getNextSectionLabel(Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index))),
    'AA'
  );
});

test('sorts sections by measure and element position, with line-end markers last', () => {
  const sections: ScoreSection[] = [
    { id: 'c', label: 'C', anchor: { measureId: 'measure-b', beforeElementId: 'note-c' } },
    { id: 'end', label: '尾声', anchor: { measureId: 'measure-a', beforeElementId: null } },
    { id: 'a', label: 'A', anchor: { measureId: 'measure-a', beforeElementId: 'note-a' } },
  ];

  assert.deepEqual(sortSectionsByScorePosition(sections, measures).map((section) => section.id), ['a', 'end', 'c']);
});

test('filters invalid sections and playback references while preserving repeated valid references', () => {
  const result = normalizeSectionData(
    [
      { id: 'a', label: ' A ', anchor: { measureId: 'measure-a', beforeElementId: 'note-a' } },
      { id: 'missing', label: 'B', anchor: { measureId: 'measure-a', beforeElementId: 'missing-note' } },
      { id: 'duplicate-label', label: 'a', anchor: { measureId: 'measure-b', beforeElementId: 'note-c' } },
    ],
    ['a', 'missing', 'a'],
    measures
  );

  assert.deepEqual(result.sections, [
    { id: 'a', label: 'A', anchor: { measureId: 'measure-a', beforeElementId: 'note-a' } },
  ]);
  assert.deepEqual(result.playbackOrder, ['a', 'a']);
});

test('moves a marker to the next element when its anchor element is deleted', () => {
  const sections: ScoreSection[] = [
    { id: 'b', label: 'B', anchor: { measureId: 'measure-a', beforeElementId: 'note-a' } },
  ];

  assert.deepEqual(relocateSectionsBeforeElementDelete(sections, measures[0], 0, 1), [
    { id: 'b', label: 'B', anchor: { measureId: 'measure-a', beforeElementId: 'note-b' } },
  ]);
  assert.deepEqual(relocateSectionsBeforeElementDelete(sections, measures[0], 0, 2), [
    { id: 'b', label: 'B', anchor: { measureId: 'measure-a', beforeElementId: null } },
  ]);
});

test('preserves the stable element id when replacing an anchored score element', () => {
  const existing = { id: 'barline-a', type: 'barline' as const, value: '|' as const };
  const replacement = { id: 'new-note', type: 'note' as const, value: '5' as const, duration: '1/4' as const };

  assert.deepEqual(preserveAnchoredElementId(existing, replacement), {
    id: 'barline-a',
    type: 'note',
    value: '5',
    duration: '1/4',
  });
});

function createScoreDocumentForValidation() {
  return {
    version: '2.0',
    scoreId: 'score-a',
    title: '测试乐谱',
    producer: 'Ocarinana',
    measures,
    ties: [],
    beams: [],
    expressions: [],
    lyrics: [],
    sections: [
      { id: 'a', label: 'A', anchor: { measureId: 'measure-a', beforeElementId: 'note-a' } },
    ],
    playbackOrder: ['a', 'a'],
    settings: {
      instrumentType: '12-hole',
      keySignature: 'C',
      timeSignature: '4/4',
      tempo: 120,
      showTempo: true,
      skin: 'white',
      showLyrics: false,
      showFingering: true,
    },
  };
}

test('accepts repeated playback references to an existing section', () => {
  assert.equal(scoreDocumentSchema.safeParse(createScoreDocumentForValidation()).success, true);
});

test('rejects duplicate labels, invalid anchors, and unknown playback references', () => {
  const duplicateLabelDocument = createScoreDocumentForValidation();
  duplicateLabelDocument.sections.push({
    id: 'duplicate',
    label: ' a ',
    anchor: { measureId: 'measure-b', beforeElementId: 'note-c' },
  });
  assert.equal(scoreDocumentSchema.safeParse(duplicateLabelDocument).success, false);

  const invalidAnchorDocument = createScoreDocumentForValidation();
  invalidAnchorDocument.sections[0].anchor.beforeElementId = 'missing';
  assert.equal(scoreDocumentSchema.safeParse(invalidAnchorDocument).success, false);

  const unknownOrderDocument = createScoreDocumentForValidation();
  unknownOrderDocument.playbackOrder.push('missing');
  assert.equal(scoreDocumentSchema.safeParse(unknownOrderDocument).success, false);
});
