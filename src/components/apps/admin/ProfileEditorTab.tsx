'use client';

import React, { useId, useState } from 'react';
import { useOSStore } from '@/lib/store';
import type { Profile } from '@/lib/types';
import { Button, Card, Field, Input, Spinner, Textarea } from '@/components/ui/primitives';
import { DoodleBioIcon } from '@/components/ui/DoodleIcons';
import { ButtonSpinner, FormError, SectionHeader } from './AdminShared';
import { DocumentUploader, ImageUploader } from './ImageUploader';
import { LINK_ERROR, errorMessage, isValidEmail, isValidLink, nullable, useAdminApi, type FieldErrors } from './useAdminApi';

type ProfileForm = {
  name: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  bio: string;
  githubUrl: string;
  linkedinUrl: string;
  websiteUrl: string;
  avatarUrl: string;
  resumeUrl: string;
};

const URL_FIELDS = ['githubUrl', 'linkedinUrl', 'websiteUrl', 'avatarUrl', 'resumeUrl'] as const;

function toForm(p: Profile): ProfileForm {
  return {
    name: p.name ?? '',
    title: p.title ?? '',
    location: p.location ?? '',
    email: p.email ?? '',
    phone: p.phone ?? '',
    bio: p.bio ?? '',
    githubUrl: p.githubUrl ?? '',
    linkedinUrl: p.linkedinUrl ?? '',
    websiteUrl: p.websiteUrl ?? '',
    avatarUrl: p.avatarUrl ?? '',
    resumeUrl: p.resumeUrl ?? '',
  };
}

function validate(form: ProfileForm): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.name.trim()) errors.name = 'Name is required.';
  if (!form.title.trim()) errors.title = 'Title is required.';
  if (form.email.trim() && !isValidEmail(form.email)) errors.email = 'Enter a valid email address.';
  if (form.phone.trim() && !/^[+()\d\s.-]{5,30}$/.test(form.phone.trim())) errors.phone = 'Use digits, spaces and + ( ) - only.';
  for (const key of URL_FIELDS) {
    if (form[key].trim() && !isValidLink(form[key])) errors[key] = LINK_ERROR;
  }
  return errors;
}

function ProfileFormView({ profile }: { profile: Profile }) {
  const { api, notify, refreshPortfolio } = useAdminApi();
  const uid = useId();
  const [form, setForm] = useState<ProfileForm>(() => toForm(profile));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const id = (name: keyof ProfileForm) => `${uid}-${name}`;
  const set = (key: keyof ProfileForm, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };
  const invalid = (key: keyof ProfileForm) => (errors[key] ? true : undefined);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clientErrors = validate(form);
    setErrors(clientErrors);
    setFormError(null);
    if (Object.keys(clientErrors).length) {
      setFormError('Please fix the highlighted fields.');
      return;
    }

    setSaving(true);
    try {
      await api.request('/api/profile', {
        method: 'PUT',
        body: {
          name: form.name.trim(),
          title: form.title.trim(),
          location: form.location.trim(),
          email: form.email.trim(),
          bio: form.bio.trim(),
          phone: nullable(form.phone),
          githubUrl: nullable(form.githubUrl),
          linkedinUrl: nullable(form.linkedinUrl),
          websiteUrl: nullable(form.websiteUrl),
          avatarUrl: nullable(form.avatarUrl),
          resumeUrl: nullable(form.resumeUrl),
        },
      });
      notify('Profile saved.');
      await refreshPortfolio();
    } catch (err) {
      const details = err && typeof err === 'object' && 'details' in err ? (err as { details: FieldErrors }).details : {};
      setErrors(details);
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const textField = (key: keyof ProfileForm, label: string, opts: { required?: boolean; hint?: string; type?: string; placeholder?: string } = {}) => (
    <Field label={label} htmlFor={id(key)} required={opts.required} hint={opts.hint} error={errors[key]}>
      <Input
        id={id(key)}
        type={opts.type ?? 'text'}
        inputMode={opts.type === 'url' ? 'url' : undefined}
        placeholder={opts.placeholder}
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
        aria-invalid={invalid(key)}
      />
    </Field>
  );

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5 max-w-3xl">
      <FormError message={formError} />

      <Card shadow="sm" className="p-4 @lg:p-5 flex flex-col gap-4">
        <h2 className="text-sm font-bold text-fg">Basics</h2>
        <div className="grid gap-4 @xl:grid-cols-2">
          {textField('name', 'Full name', { required: true })}
          {textField('title', 'Title', { required: true, hint: 'e.g. Full-stack developer' })}
          {textField('location', 'Location', { placeholder: 'City, Country' })}
          {textField('email', 'Email', { type: 'email', hint: 'Shown publicly and used for replies.' })}
          {textField('phone', 'Phone', { type: 'tel', hint: 'Optional. Leave empty to keep it private.' })}
        </div>
        <Field label="Bio" htmlFor={id('bio')} error={errors.bio} hint="A few sentences about you.">
          <Textarea id={id('bio')} rows={5} value={form.bio} onChange={(e) => set('bio', e.target.value)} aria-invalid={invalid('bio')} />
        </Field>
      </Card>

      <Card shadow="sm" className="p-4 @lg:p-5 flex flex-col gap-4">
        <h2 className="text-sm font-bold text-fg">Links</h2>
        <div className="grid gap-4 @xl:grid-cols-2">
          {textField('githubUrl', 'GitHub URL', { type: 'url', placeholder: 'https://github.com/username' })}
          {textField('linkedinUrl', 'LinkedIn URL', { type: 'url', placeholder: 'https://linkedin.com/in/username' })}
          {textField('websiteUrl', 'Website URL', { type: 'url', placeholder: 'https://your-site.dev' })}
        </div>
      </Card>

      <Card shadow="sm" className="p-4 @lg:p-5 flex flex-col gap-4">
        <h2 className="text-sm font-bold text-fg">Avatar and CV</h2>
        <Field label="Avatar" htmlFor={id('avatarUrl')} error={errors.avatarUrl} hint="Square images look best.">
          <ImageUploader
            id={id('avatarUrl')}
            max={1}
            value={form.avatarUrl ? [form.avatarUrl] : []}
            onChange={(updater) =>
              setForm((f) => ({ ...f, avatarUrl: updater(f.avatarUrl ? [f.avatarUrl] : [])[0] ?? '' }))
            }
            invalid={!!errors.avatarUrl}
          />
        </Field>
        <Field label="CV / résumé" htmlFor={id('resumeUrl')} error={errors.resumeUrl} hint="Upload a PDF (up to 10 MB) or paste a link.">
          <DocumentUploader id={id('resumeUrl')} value={form.resumeUrl} onChange={(v) => set('resumeUrl', v)} invalid={!!errors.resumeUrl} />
        </Field>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="primary" size="lg" disabled={saving} icon={saving ? <ButtonSpinner /> : undefined}>
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
        <Button
          variant="ghost"
          disabled={saving}
          onClick={() => {
            setForm(toForm(profile));
            setErrors({});
            setFormError(null);
          }}
        >
          Discard changes
        </Button>
      </div>
    </form>
  );
}

export function ProfileEditorTab() {
  const profile = useOSStore((s) => s.profile);
  const dataStatus = useOSStore((s) => s.dataStatus);
  const hasProfile = Boolean(profile.id || profile.name);

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        title="Profile"
        description="Your public details, links, avatar and CV."
        icon={<DoodleBioIcon className="w-6 h-6" />}
      />
      {dataStatus === 'loading' && !hasProfile ? (
        <div className="flex items-center gap-2 py-12 justify-center text-xs text-fg-muted">
          <Spinner /> Loading profile…
        </div>
      ) : (
        <>
          {dataStatus === 'error' && (
            <FormError message="Could not load the saved profile. Saving now will overwrite it with what you enter here." />
          )}
          {/* Remount when the stored profile changes (e.g. after a save + refresh). */}
          <ProfileFormView key={JSON.stringify(profile)} profile={profile} />
        </>
      )}
    </div>
  );
}
