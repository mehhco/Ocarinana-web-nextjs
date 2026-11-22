import assert from 'node:assert/strict';
import test from 'node:test';
import {
  GUEST_DRAFT_STORAGE_KEY,
  GUEST_DRAFT_MAX_AGE_MS,
  clearGuestDraft,
  hasScoreContent,
  markGuestDraftPendingCloudSave,
  readGuestDraft,
  writeGuestDraft,
} from './guest-draft.ts';
import type { ScoreDocument } from './types.ts';

const memoryStorage = new Map<string, string>();
const fakeLocalStorage = {
  getItem: (key: string) => memoryStorage.get(key) ?? null,
  setItem: (key: string, value: string) => {
    memoryStorage.set(key, value);
  },
  removeItem: (key: string) => {
    memoryStorage.delete(key);
  },
};

(globalThis as unknown as { window: { localStorage: typeof fakeLocalStorage } }).window = {
  localStorage: fakeLocalStorage,
};

function createDocument(overrides: Partial<ScoreDocument> = {}): ScoreDocument {
  return {
    version: '2.0',
    scoreId: 'guest-12-hole',
    title: '未命名简谱',
    producer: 'www.ocarinana.com',
    lyricist: '',
    composer: '',
    additionalInfo: '',
    measures: [{ id: 'measure-1', elements: [] }],
    ties: [],
    beams: [],
    expressions: [],
    lyrics: [],
    sections: [],
    playbackOrder: [],
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
    ...overrides,
  };
}

test('空白草稿不算用户内容，写进音符后算内容', () => {
  assert.equal(hasScoreContent(createDocument()), false);
  assert.equal(hasScoreContent(undefined), false);

  const withNotes = createDocument({
    measures: [
      {
        id: 'measure-1',
        elements: [{ id: 'note-1', type: 'note', value: '1', duration: '1/4' }],
      },
    ],
  });

  assert.equal(hasScoreContent(withNotes), true);
});

test('草稿可以写入并原样读回', () => {
  clearGuestDraft();
  const document = createDocument({ title: '故乡的原风景' });

  assert.equal(writeGuestDraft(document), true);

  const draft = readGuestDraft();

  assert.ok(draft);
  assert.equal(draft?.document.title, '故乡的原风景');
  assert.equal(draft?.instrumentType, '12-hole');
  assert.equal(draft?.pendingCloudSave, false);
  assert.ok(draft?.savedAt);
});

test('标记待上云后会带着 pendingCloudSave 读回', () => {
  clearGuestDraft();
  writeGuestDraft(createDocument());
  markGuestDraftPendingCloudSave();

  assert.equal(readGuestDraft()?.pendingCloudSave, true);
});

test('过期草稿会被丢弃并清理', () => {
  clearGuestDraft();
  writeGuestDraft(createDocument());

  const stored = JSON.parse(memoryStorage.get(GUEST_DRAFT_STORAGE_KEY) ?? '{}');
  stored.savedAt = Date.now() - GUEST_DRAFT_MAX_AGE_MS - 1000;
  memoryStorage.set(GUEST_DRAFT_STORAGE_KEY, JSON.stringify(stored));

  assert.equal(readGuestDraft(), null);
  assert.equal(memoryStorage.has(GUEST_DRAFT_STORAGE_KEY), false);
});

test('损坏的 JSON 不会抛错', () => {
  memoryStorage.set(GUEST_DRAFT_STORAGE_KEY, '{not-json');

  assert.equal(readGuestDraft(), null);
});

test('清理后读不到草稿', () => {
  writeGuestDraft(createDocument({ title: '测试' }));
  clearGuestDraft();

  assert.equal(readGuestDraft(), null);
});
