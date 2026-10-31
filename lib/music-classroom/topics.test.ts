import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getMusicClassroomTopic,
  musicClassroomTopics,
} from './topics.ts';

test('provides a focused set of unique classroom topics', () => {
  assert.equal(musicClassroomTopics.length, 5);
  assert.equal(
    new Set(musicClassroomTopics.map((topic) => topic.slug)).size,
    musicClassroomTopics.length
  );
  assert.equal(
    new Set(musicClassroomTopics.map((topic) => topic.legacyAnchor)).size,
    musicClassroomTopics.length
  );
});

test('every topic has substantial sections and valid internal relations', () => {
  const slugs = new Set(musicClassroomTopics.map((topic) => topic.slug));

  for (const topic of musicClassroomTopics) {
    assert.ok(topic.sections.length >= 3, `${topic.slug} needs at least 3 sections`);
    assert.ok(topic.description.length >= 60, `${topic.slug} needs a useful description`);
    assert.equal(
      new Set(topic.sections.map((section) => section.id)).size,
      topic.sections.length,
      `${topic.slug} has duplicate section ids`
    );

    for (const relatedSlug of topic.relatedSlugs) {
      assert.ok(slugs.has(relatedSlug), `${topic.slug} links to missing ${relatedSlug}`);
    }
  }
});

test('resolves classroom topics by slug', () => {
  const topic = getMusicClassroomTopic('jianpu-symbols');
  assert.equal(topic?.shortTitle, '简谱符号');
  assert.equal(getMusicClassroomTopic('missing'), undefined);
});
