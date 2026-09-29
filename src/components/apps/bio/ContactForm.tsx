'use client';

import React from 'react';
import { Mail, Phone, Send, CheckCircle2, TriangleAlert } from 'lucide-react';
import { Button, Field, Input, Textarea } from '@/components/ui/primitives';
import type { Profile } from '@/lib/types';
import { SectionTitle } from './sections';

type FieldName = 'name' | 'email' | 'message';
type Errors = Partial<Record<FieldName, string>>;
type Status = 'idle' | 'sending' | 'sent' | 'error';

const LIMITS = { name: 100, email: 200, messageMin: 10, messageMax: 5000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: Record<FieldName, string>): Errors {
  const errors: Errors = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const message = values.message.trim();
  if (!name) errors.name = 'Please tell me your name.';
  else if (name.length > LIMITS.name) errors.name = `Name must be ${LIMITS.name} characters or fewer.`;
  if (!email) errors.email = 'An email address is needed so I can reply.';
  else if (email.length > LIMITS.email || !EMAIL_RE.test(email)) errors.email = 'Please enter a valid email address.';
  if (message.length < LIMITS.messageMin) errors.message = `Message must be at least ${LIMITS.messageMin} characters.`;
  else if (message.length > LIMITS.messageMax) errors.message = `Message must be ${LIMITS.messageMax} characters or fewer.`;
  return errors;
}

export function ContactSection({ profile }: { profile: Profile }) {
  const [values, setValues] = React.useState<Record<FieldName, string>>({ name: '', email: '', message: '' });
  const [honeypot, setHoneypot] = React.useState('');
  const [errors, setErrors] = React.useState<Errors>({});
  const [status, setStatus] = React.useState<Status>('idle');
  const [serverError, setServerError] = React.useState<string | null>(null);
  const idBase = React.useId();

  const update = (field: FieldName) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    setServerError(null);
    if (Object.keys(found).length > 0) {
      const first = (['name', 'email', 'message'] as FieldName[]).find((f) => found[f]);
      if (first) document.getElementById(`${idBase}-${first}`)?.focus();
      return;
    }

    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          message: values.message.trim(),
          website: honeypot,
        }),
      });
      if (res.ok) {
        setStatus('sent');
        setValues({ name: '', email: '', message: '' });
        return;
      }
      let body: { error?: string; details?: Record<string, string> } = {};
      try {
        body = await res.json();
      } catch {
        /* non-JSON error */
      }
      if (body.details) {
        const d = body.details;
        setErrors({ name: d.name, email: d.email, message: d.message });
      }
      setServerError(
        res.status === 429
          ? 'Too many messages sent from this connection. Please try again in a little while.'
          : body.error || `Something went wrong (HTTP ${res.status}). Please try again.`,
      );
      setStatus('error');
    } catch {
      setServerError('Could not reach the server. Check your connection and try again.');
      setStatus('error');
    }
  };

  const phoneHref = profile.phone ? `tel:${profile.phone.replace(/[^\d+]/g, '')}` : null;
  const remaining = LIMITS.messageMax - values.message.length;

  return (
    <section>
      <SectionTitle icon={<Mail className="w-4 h-4" />}>Contact</SectionTitle>

      {(profile.email || profile.phone) && (
        <div className="mb-5 flex flex-wrap gap-2 text-xs">
          {profile.email && (
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex items-center gap-1.5 rounded-xl border-2 border-line bg-surface-2 px-3 py-1.5 font-bold text-fg shadow-doodle-xs hover:bg-surface-3 break-all"
            >
              <Mail className="w-3.5 h-3.5 shrink-0" aria-hidden />
              {profile.email}
            </a>
          )}
          {profile.phone && phoneHref && (
            <a
              href={phoneHref}
              className="inline-flex items-center gap-1.5 rounded-xl border-2 border-line bg-surface-2 px-3 py-1.5 font-bold text-fg shadow-doodle-xs hover:bg-surface-3"
            >
              <Phone className="w-3.5 h-3.5 shrink-0" aria-hidden />
              {profile.phone}
            </a>
          )}
        </div>
      )}

      {status === 'sent' ? (
        <div role="status" className="flex flex-col items-center gap-3 rounded-2xl border-[2.5px] border-ink bg-mint text-ink p-6 text-center shadow-doodle-sm">
          <CheckCircle2 className="w-8 h-8" aria-hidden />
          <p className="text-sm font-bold">Thanks! Your message is on its way.</p>
          <p className="text-xs">I&apos;ll get back to you by email as soon as I can.</p>
          <Button size="sm" onClick={() => setStatus('idle')}>
            Send another message
          </Button>
        </div>
      ) : (
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4 max-w-xl" aria-describedby={serverError ? `${idBase}-server` : undefined}>
          <p className="text-xs text-fg-muted">Leave a note and I&apos;ll reply by email.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Your name" htmlFor={`${idBase}-name`} error={errors.name} required>
              <Input
                id={`${idBase}-name`}
                name="name"
                autoComplete="name"
                maxLength={LIMITS.name}
                value={values.name}
                onChange={update('name')}
                aria-invalid={!!errors.name}
                aria-required
              />
            </Field>
            <Field label="Email" htmlFor={`${idBase}-email`} error={errors.email} required>
              <Input
                id={`${idBase}-email`}
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                maxLength={LIMITS.email}
                value={values.email}
                onChange={update('email')}
                aria-invalid={!!errors.email}
                aria-required
              />
            </Field>
          </div>

          <Field
            label="Message"
            htmlFor={`${idBase}-message`}
            error={errors.message}
            hint={`${LIMITS.messageMin}–${LIMITS.messageMax} characters · ${remaining} left`}
            required
          >
            <Textarea
              id={`${idBase}-message`}
              name="message"
              rows={6}
              maxLength={LIMITS.messageMax}
              value={values.message}
              onChange={update('message')}
              aria-invalid={!!errors.message}
              aria-required
            />
          </Field>

          {/* Honeypot: invisible to people, tempting to bots. Must stay empty. */}
          <div aria-hidden className="absolute -left-[9999px] w-px h-px overflow-hidden">
            <label htmlFor={`${idBase}-website`}>Website</label>
            <input
              id={`${idBase}-website`}
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          {serverError && (
            <p id={`${idBase}-server`} role="alert" className="flex items-start gap-2 rounded-xl border-2 border-ink bg-rose text-ink px-3 py-2 text-xs font-bold">
              <TriangleAlert className="w-4 h-4 shrink-0" aria-hidden />
              <span>{serverError}</span>
            </p>
          )}

          <div>
            <Button type="submit" variant="primary" disabled={status === 'sending'} icon={<Send className="w-3.5 h-3.5" aria-hidden />}>
              {status === 'sending' ? 'Sending…' : 'Send message'}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
