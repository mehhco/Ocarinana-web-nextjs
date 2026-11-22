import assert from 'node:assert/strict';
import test from 'node:test';
import { sanitizeNextPath } from './safe-next.ts';

test('站内路径原样返回', () => {
  assert.equal(sanitizeNextPath('/editor?instrument=6-hole&save=1'), '/editor?instrument=6-hole&save=1');
  assert.equal(sanitizeNextPath('/protected/me/scores'), '/protected/me/scores');
});

test('空值回退到首页', () => {
  assert.equal(sanitizeNextPath(undefined), '/');
  assert.equal(sanitizeNextPath(null), '/');
  assert.equal(sanitizeNextPath(''), '/');
});

test('站外地址一律回退，防开放重定向', () => {
  assert.equal(sanitizeNextPath('https://evil.example.com'), '/');
  assert.equal(sanitizeNextPath('//evil.example.com'), '/');
  assert.equal(sanitizeNextPath('/\\evil.example.com'), '/');
  assert.equal(sanitizeNextPath('javascript:alert(1)'), '/');
  assert.equal(sanitizeNextPath('editor'), '/');
});

test('不会回跳到登录相关页面形成循环', () => {
  assert.equal(sanitizeNextPath('/auth/login'), '/');
  assert.equal(sanitizeNextPath('/auth/sign-up?next=/editor'), '/');
});

test('控制字符被拒绝', () => {
  assert.equal(sanitizeNextPath('/editor\nX-Injected: 1'), '/');
});
