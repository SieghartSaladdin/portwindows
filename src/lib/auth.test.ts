import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getAuthUser, signToken, verifyToken } from './auth';

process.env.JWT_SECRET = 'test-secret-for-unit-tests-only-0123456789';

const b64 = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');

test('signToken produces a token that verifyToken accepts', () => {
  const token = signToken({ username: 'owner' });
  const payload = verifyToken(token);
  assert.ok(payload);
  assert.equal(payload.username, 'owner');
  assert.ok(payload.exp > Math.floor(Date.now() / 1000));
});

test('tampered payload is rejected', () => {
  const [header, , signature] = signToken({ username: 'owner' }).split('.');
  const forgedBody = b64({ username: 'attacker', iat: 0, exp: Math.floor(Date.now() / 1000) + 3600 });
  assert.equal(verifyToken(`${header}.${forgedBody}.${signature}`), null);
});

test('tampered or truncated signature is rejected', () => {
  const token = signToken({ username: 'owner' });
  const flipped = token.slice(0, -1) + (token.endsWith('A') ? 'B' : 'A');
  assert.equal(verifyToken(flipped), null);
  assert.equal(verifyToken(token.slice(0, -5)), null);
  assert.equal(verifyToken('not-a-token'), null);
  assert.equal(verifyToken(''), null);
});

test('token signed with a different secret is rejected', () => {
  const token = signToken({ username: 'owner' });
  process.env.JWT_SECRET = 'a-completely-different-secret-value-xyz';
  try {
    assert.equal(verifyToken(token), null);
  } finally {
    process.env.JWT_SECRET = 'test-secret-for-unit-tests-only-0123456789';
  }
});

test('expired token is rejected', () => {
  const token = signToken({ username: 'owner' }, -10);
  assert.equal(verifyToken(token), null);
});

test('alg=none header is rejected', () => {
  const body = b64({ username: 'owner', iat: 0, exp: Math.floor(Date.now() / 1000) + 3600 });
  assert.equal(verifyToken(`${b64({ alg: 'none', typ: 'JWT' })}.${body}.`), null);
});

test('getAuthUser reads the Bearer header', () => {
  const token = signToken({ username: 'owner' });
  const ok = new Request('http://localhost/api', { headers: { Authorization: `Bearer ${token}` } });
  assert.equal(getAuthUser(ok)?.username, 'owner');
  const missing = new Request('http://localhost/api');
  assert.equal(getAuthUser(missing), null);
  const wrongScheme = new Request('http://localhost/api', { headers: { Authorization: `Basic ${token}` } });
  assert.equal(getAuthUser(wrongScheme), null);
});

test('production without JWT_SECRET denies everything', () => {
  const token = signToken({ username: 'owner' });
  const env = process.env as Record<string, string | undefined>;
  const saved = { secret: env.JWT_SECRET, nodeEnv: env.NODE_ENV };
  delete env.JWT_SECRET;
  env.NODE_ENV = 'production';
  try {
    assert.throws(() => signToken({ username: 'owner' }), /JWT_SECRET/);
    assert.equal(verifyToken(token), null);
  } finally {
    env.JWT_SECRET = saved.secret;
    env.NODE_ENV = saved.nodeEnv;
  }
});
