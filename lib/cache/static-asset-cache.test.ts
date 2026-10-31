import assert from 'node:assert/strict';
import test from 'node:test';
import {
  applyDevelopmentDocumentCacheReset,
  getStaticAssetCacheHeaders,
} from './static-asset-cache.ts';

test('prevents persistent browser caching of development CSS and JavaScript', () => {
  assert.deepEqual(getStaticAssetCacheHeaders(false), [
    {
      key: 'Cache-Control',
      value: 'no-store, max-age=0',
    },
  ]);
});

test('keeps immutable caching for production CSS and JavaScript', () => {
  assert.deepEqual(getStaticAssetCacheHeaders(true), [
    {
      key: 'Cache-Control',
      value: 'public, max-age=31536000, immutable',
    },
    {
      key: 'Vary',
      value: 'Accept',
    },
  ]);
});

test('resets cache only for development document responses', () => {
  const developmentHeaders = new Headers();
  applyDevelopmentDocumentCacheReset(
    developmentHeaders,
    false,
    'text/html,application/xhtml+xml'
  );

  assert.equal(
    developmentHeaders.get('Cache-Control'),
    'no-store, max-age=0'
  );
  assert.equal(developmentHeaders.get('Clear-Site-Data'), '"cache"');

  const productionHeaders = new Headers();
  applyDevelopmentDocumentCacheReset(
    productionHeaders,
    true,
    'text/html,application/xhtml+xml'
  );
  assert.equal(productionHeaders.get('Clear-Site-Data'), null);

  const assetHeaders = new Headers();
  applyDevelopmentDocumentCacheReset(assetHeaders, false, '*/*');
  assert.equal(assetHeaders.get('Clear-Site-Data'), null);
});
