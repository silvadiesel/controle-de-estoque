import { isImagemValida } from './imagem';
import assert from 'node:assert/strict';
import test from 'node:test';

test('isImagemValida accepts null and undefined', () => {
  assert.equal(isImagemValida(null), true);
  assert.equal(isImagemValida(undefined), true);
});

test('isImagemValida accepts jpeg, png and webp data URLs', () => {
  assert.equal(isImagemValida('data:image/jpeg;base64,AAAA'), true);
  assert.equal(isImagemValida('data:image/png;base64,AA'), true);
  assert.equal(isImagemValida('data:image/webp;base64,AA'), true);
});

test('isImagemValida rejects URLs and other mime types', () => {
  assert.equal(isImagemValida('https://x.com/a.png'), false);
  assert.equal(isImagemValida('data:text/html;base64,AA'), false);
  assert.equal(isImagemValida('data:image/gif;base64,AA'), false);
});

test('isImagemValida rejects data URLs above 5_000_000 characters', () => {
  assert.equal(
    isImagemValida('data:image/jpeg;base64,' + 'A'.repeat(5_000_001)),
    false
  );
});
