const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { findViolations, parseTargets } = require('./check-changesets.js');

const IGNORE = ['tuple-backend', 'tuple-frontend', 'tuple-shared'];

function makeChangesetDir(files, ignore = IGNORE) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'changeset-test-'));
  fs.writeFileSync(path.join(dir, 'config.json'), JSON.stringify({ ignore }));
  for (const [name, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, name), content);
  }
  return dir;
}

test('flags a changeset that targets only an ignored package', () => {
  const dir = makeChangesetDir({
    'bad.md': "---\n'tuple-frontend': patch\n---\n\nSummary.\n",
  });
  const violations = findViolations(dir);
  assert.equal(violations.length, 1);
  assert.equal(violations[0].file, 'bad.md');
  assert.deepEqual(violations[0].ignoredTargets, ['tuple-frontend']);
});

test('flags a changeset with multiple ignored targets', () => {
  const dir = makeChangesetDir({
    'multi.md':
      "---\n'tuple-backend': patch\n'tuple-shared': patch\n---\n\nSummary.\n",
  });
  const violations = findViolations(dir);
  assert.equal(violations.length, 1);
  assert.deepEqual(violations[0].ignoredTargets, [
    'tuple-backend',
    'tuple-shared',
  ]);
});

test('flags a mix of tuple and an ignored target', () => {
  const dir = makeChangesetDir({
    'mixed.md':
      "---\n'tuple': patch\n'tuple-backend': patch\n---\n\nSummary.\n",
  });
  const violations = findViolations(dir);
  assert.equal(violations.length, 1);
  assert.deepEqual(violations[0].ignoredTargets, ['tuple-backend']);
});

test('accepts a changeset that targets tuple', () => {
  const dir = makeChangesetDir({
    'good.md': "---\n'tuple': patch\n---\n\nSummary.\n",
  });
  assert.deepEqual(findViolations(dir), []);
});

test('accepts an unquoted tuple target', () => {
  const dir = makeChangesetDir({ 'good.md': '---\ntuple: minor\n---\n\nx\n' });
  assert.deepEqual(findViolations(dir), []);
});

test('accepts an empty changeset', () => {
  const dir = makeChangesetDir({ 'empty.md': '---\n---\n' });
  assert.deepEqual(findViolations(dir), []);
});

test('ignores README.md even if it looks like a changeset', () => {
  const dir = makeChangesetDir({
    'README.md': "---\n'tuple-frontend': patch\n---\n\nnot a changeset\n",
  });
  assert.deepEqual(findViolations(dir), []);
});

test('parseTargets handles quoted, double-quoted and bare names', () => {
  assert.deepEqual(parseTargets("'tuple': patch"), ['tuple']);
  assert.deepEqual(parseTargets('"tuple-backend": patch'), [
    'tuple-backend',
  ]);
  assert.deepEqual(parseTargets('tuple: minor'), ['tuple']);
  assert.deepEqual(parseTargets(''), []);
});
