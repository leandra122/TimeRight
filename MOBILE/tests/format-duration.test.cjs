const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');

const source = readFileSync(resolve(__dirname, '../src/utils/format.js'), 'utf8');
const modulePromise = import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));

for (const [minutes, expected] of [[30, '30 min'], [60, '1h'], [75, '1h15'], [90, '1h30'], [120, '2h'], [65, '1h05']]) {
  test('formats ' + minutes + ' minutes as ' + expected, async () => {
    const { formatDuration } = await modulePromise;
    assert.equal(formatDuration(minutes), expected);
  });
}
test('handles unavailable or invalid durations', async () => {
  const { formatDuration } = await modulePromise;
  for (const value of [null, undefined, '', 0, -1, 1.5, 'abc']) assert.equal(formatDuration(value), '—');
});
