import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  chatSchema,
  defaultSpeaker,
  contactSchema,
  formatZodError,
  isAllowedUrl,
  profileSchema,
  projectCreateSchema,
  projectUpdateSchema,
  reorderSchema,
} from './validation';
import { detectFileType, resolveUploadPath } from './uploads';

const UPLOAD = '/api/uploads/123e4567-e89b-12d3-a456-426614174000.png';

test('URL rule: only http(s) or /api/uploads paths', () => {
  assert.equal(isAllowedUrl('https://github.com/someone'), true);
  assert.equal(isAllowedUrl('http://localhost:3000/x'), true);
  assert.equal(isAllowedUrl(UPLOAD), true);
  for (const bad of [
    'javascript:alert(1)',
    'data:text/html;base64,AAAA',
    'ftp://example.org/file',
    '//evil.test/x',
    '/api/uploads/../../etc/passwd',
    '/api/uploads/not-a-uuid.png',
    '/api/uploads/123e4567-e89b-12d3-a456-426614174000.svg',
    'github.com/someone',
    '',
  ]) {
    assert.equal(isAllowedUrl(bad), false, bad);
  }
});

test('project create: required fields, URL validation, empty optional -> null', () => {
  const ok = projectCreateSchema.safeParse({
    title: '  My App ',
    description: 'Does things',
    tags: 'React, Node ,',
    githubUrl: '',
    liveUrl: 'https://app.test',
    images: [UPLOAD],
  });
  assert.ok(ok.success);
  assert.equal(ok.data.title, 'My App');
  assert.deepEqual(ok.data.tags, ['React', 'Node']);
  assert.equal(ok.data.githubUrl, null);
  assert.equal(ok.data.liveUrl, 'https://app.test');

  const bad = projectCreateSchema.safeParse({ title: '', description: 'x', liveUrl: 'javascript:alert(1)', images: ['file:///etc'] });
  assert.equal(bad.success, false);
  const details = formatZodError(bad.error!);
  assert.ok(details.title);
  assert.ok(details.liveUrl);
  assert.ok(details['images.0']);
});

test('project update is partial and leaves omitted fields undefined', () => {
  const r = projectUpdateSchema.safeParse({ featured: true });
  assert.ok(r.success);
  assert.deepEqual(r.data, { featured: true });
});

test('profile: email may be empty but must be valid when given', () => {
  assert.ok(profileSchema.safeParse({ name: 'A', email: '' }).success);
  assert.equal(profileSchema.safeParse({ name: 'A', email: 'nope' }).success, false);
  const r = profileSchema.safeParse({ name: 'A', phone: '  ', avatarUrl: UPLOAD });
  assert.ok(r.success);
  assert.equal(r.data.phone, null);
  assert.equal(r.data.avatarUrl, UPLOAD);
});

test('contact form rules', () => {
  const valid = { name: 'Visitor', email: 'visitor@mail.test', message: 'Hello, I like your work!' };
  assert.ok(contactSchema.safeParse(valid).success);
  assert.ok(contactSchema.safeParse({ ...valid, website: '' }).success);
  assert.equal(contactSchema.safeParse({ ...valid, email: 'not-an-email' }).success, false);
  assert.equal(contactSchema.safeParse({ ...valid, message: 'too short' }).success, false);
  assert.equal(contactSchema.safeParse({ ...valid, message: 'x'.repeat(5001) }).success, false);
  assert.equal(contactSchema.safeParse({ ...valid, name: 'x'.repeat(101) }).success, false);
  assert.equal(contactSchema.safeParse({ ...valid, email: `${'a'.repeat(195)}@b.test` }).success, false);
  assert.equal(contactSchema.safeParse({ ...valid, name: '   ' }).success, false);
});

test('chat input rules', () => {
  assert.equal(chatSchema.parse({ message: 'hi' }).partner, 'robot');
  assert.equal(chatSchema.parse({ message: 'hi' }).speaker, undefined);
  assert.equal(chatSchema.parse({ message: 'hi', speaker: 'frieren' }).speaker, 'frieren');
  assert.equal(chatSchema.safeParse({ message: 'hi', speaker: 'god' }).success, false);
  assert.equal(defaultSpeaker('robot'), 'visitor');
  assert.equal(defaultSpeaker('fern'), 'frieren');
  assert.equal(defaultSpeaker('stark'), 'frieren');
  assert.equal(chatSchema.safeParse({ message: '' }).success, false);
  assert.equal(chatSchema.safeParse({ message: 'x'.repeat(2001) }).success, false);
  assert.equal(chatSchema.safeParse({ message: 'hi', partner: 'frieren' }).success, false);
  const history = Array.from({ length: 21 }, () => ({ role: 'user', content: 'x' }));
  assert.equal(chatSchema.safeParse({ message: 'hi', history }).success, false);
  assert.equal(chatSchema.safeParse({ message: 'hi', history: [{ role: 'system', content: 'x' }] }).success, false);
  assert.equal(chatSchema.safeParse({ message: 'hi', history: [{ role: 'user', content: 'x'.repeat(4001) }] }).success, false);
});

test('reorder rules', () => {
  assert.ok(reorderSchema.safeParse({ entity: 'educations', ids: ['a', 'b'] }).success);
  assert.equal(reorderSchema.safeParse({ entity: 'users', ids: ['a'] }).success, false);
  assert.equal(reorderSchema.safeParse({ entity: 'skills', ids: ['a', 'a'] }).success, false);
  assert.equal(reorderSchema.safeParse({ entity: 'skills', ids: [] }).success, false);
});

test('upload magic-byte detection', () => {
  const bytes = (...parts: (number[] | string)[]) =>
    new Uint8Array(parts.flatMap((p) => (typeof p === 'string' ? Array.from(p, (c) => c.charCodeAt(0)) : p)));

  assert.equal(detectFileType(bytes([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]))?.ext, 'png');
  assert.equal(detectFileType(bytes([0xff, 0xd8, 0xff, 0xe0]))?.ext, 'jpg');
  assert.equal(detectFileType(bytes('GIF89a', [0, 0]))?.ext, 'gif');
  assert.equal(detectFileType(bytes('RIFF', [0, 0, 0, 0], 'WEBPVP8 '))?.ext, 'webp');
  const pdf = detectFileType(bytes('%PDF-1.7\n'));
  assert.equal(pdf?.ext, 'pdf');
  assert.equal(pdf?.kind, 'document');

  assert.equal(detectFileType(bytes('<svg xmlns="http://www.w3.org/2000/svg">')), null);
  assert.equal(detectFileType(bytes('<html><script>')), null);
  assert.equal(detectFileType(bytes('RIFF', [0, 0, 0, 0], 'WAVE')), null);
  assert.equal(detectFileType(bytes([0x89, 0x50])), null);
  assert.equal(detectFileType(new Uint8Array()), null);
});

test('upload names: strict pattern, no traversal', () => {
  assert.ok(resolveUploadPath('123e4567-e89b-12d3-a456-426614174000.pdf'));
  assert.equal(resolveUploadPath('../123e4567-e89b-12d3-a456-426614174000.pdf'), null);
  assert.equal(resolveUploadPath('123e4567-e89b-12d3-a456-426614174000.png/../../x'), null);
  assert.equal(resolveUploadPath('123E4567-E89B-12D3-A456-426614174000.png'), null);
  assert.equal(resolveUploadPath('evil.html'), null);
});
