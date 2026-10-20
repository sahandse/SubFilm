import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSubtitleSearch } from '../dist-server/server/validation.js';

test('accepts a valid search and preserves filters', () => {
  const result = validateSubtitleSearch(new URLSearchParams('q=Interstellar&languages=fa,en&type=movie&year=2014&limit=10'));
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.query, 'Interstellar');
    assert.deepEqual(result.value.languages, ['fa', 'en']);
    assert.equal(result.value.year, 2014);
    assert.equal(result.value.limit, 10);
  }
});

test('rejects short queries and invalid types', () => {
  assert.equal(validateSubtitleSearch(new URLSearchParams('q=a')).ok, false);
  assert.equal(validateSubtitleSearch(new URLSearchParams('q=Movie&type=music')).ok, false);
});

test('rejects out-of-range numbers', () => {
  assert.equal(validateSubtitleSearch(new URLSearchParams('q=Movie&year=1700')).ok, false);
  assert.equal(validateSubtitleSearch(new URLSearchParams('q=Movie&limit=999')).ok, false);
});

test('falls back to supported default languages', () => {
  const result = validateSubtitleSearch(new URLSearchParams('q=Series&languages=invalid-value'));
  assert.equal(result.ok, true);
  if (result.ok) assert.deepEqual(result.value.languages, ['fa', 'en']);
});