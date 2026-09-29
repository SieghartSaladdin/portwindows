'use client';

import React, { useId, useState } from 'react';
import { Button, Card, Field, Input } from '@/components/ui/primitives';
import { ButtonSpinner, FormError } from './AdminShared';
import { DoodleLockIcon } from './AdminIcons';

interface AdminLoginProps {
  /** Shown above the form, e.g. after an expired session. */
  notice?: string | null;
  onLoggedIn: (token: string) => void;
}

export function AdminLogin({ notice, onLoggedIn }: AdminLoginProps) {
  const uid = useId();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Enter your username and password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data: { token?: string; error?: string } = await res.json().catch(() => ({}));
      if (!res.ok || !data.token) {
        if (res.status === 429) throw new Error(data.error || 'Too many sign-in attempts. Please wait a moment and try again.');
        if (res.status === 401) throw new Error(data.error || 'Incorrect username or password.');
        throw new Error(data.error || 'Sign-in failed. Please try again.');
      }
      setPassword('');
      onLoggedIn(data.token);
    } catch (err) {
      setError(err instanceof TypeError ? 'Network error. Check your connection and try again.' : (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full items-center justify-center p-4 bg-surface text-fg font-doodle overflow-y-auto">
      <Card shadow="md" className="w-full max-w-sm p-6 flex flex-col gap-5">
        <div className="flex flex-col items-center text-center gap-2">
          <span className="w-16 h-16 rounded-2xl border-2 border-ink bg-highlight shadow-doodle-sm flex items-center justify-center">
            <DoodleLockIcon className="w-9 h-9" />
          </span>
          <h2 className="text-lg font-bold">Developer Hub</h2>
          <p className="text-xs text-fg-muted">Sign in with the admin credentials configured on the server.</p>
        </div>

        {notice && !error && (
          <div role="status" className="rounded-xl border-2 border-ink bg-peach text-ink px-3 py-2 text-xs font-bold">
            {notice}
          </div>
        )}

        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <FormError message={error} />
          <Field label="Username" htmlFor={`${uid}-user`} required>
            <Input
              id={`${uid}-user`}
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </Field>
          <Field label="Password" htmlFor={`${uid}-pass`} required>
            <Input
              id={`${uid}-pass`}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <Button type="submit" variant="primary" size="lg" disabled={loading} icon={loading ? <ButtonSpinner /> : undefined} className="w-full mt-1">
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
