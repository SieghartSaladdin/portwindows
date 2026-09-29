import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stripMarkdown } from './plainText';

test('stripMarkdown removes bold, italic, headings and code', () => {
  assert.equal(stripMarkdown('Hi, I am **HelperBot** of *Aura OS*!'), 'Hi, I am HelperBot of Aura OS!');
  assert.equal(stripMarkdown('## Skills\nUse `help`'), 'Skills\nUse help');
});

test('stripMarkdown keeps link urls and turns lists into bullets', () => {
  assert.equal(stripMarkdown('See [GitHub](https://github.com/x)'), 'See GitHub (https://github.com/x)');
  assert.equal(stripMarkdown('- React\n- Next.js'), '• React\n• Next.js');
});

test('stripMarkdown leaves snake_case and multiplication alone', () => {
  assert.equal(stripMarkdown('run open_window with 2 * 3'), 'run open_window with 2 * 3');
});
