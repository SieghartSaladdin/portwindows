'use client';

import React, { useState } from 'react';
import { useOSStore } from '@/lib/store';
import type { Certification } from '@/lib/types';
import { Field, Input } from '@/components/ui/primitives';
import { DoodleLinkIcon } from '@/components/ui/DoodleIcons';
import { EntityTab, Meta, type EntityFormProps } from './AdminShared';
import { DoodleBadgeIcon } from './AdminIcons';
import { LINK_ERROR, isValidLink, nullable, type FieldErrors } from './useAdminApi';

function CertificationForm({ formId, initial, errors, setErrors, onSubmit }: EntityFormProps<Certification>) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    issuer: initial?.issuer ?? '',
    date: initial?.date ?? '',
    credentialUrl: initial?.credentialUrl ?? '',
  });
  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const id = (name: string) => `${formId}-${name}`;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: FieldErrors = {};
    if (!form.name.trim()) next.name = 'Name is required.';
    if (!form.issuer.trim()) next.issuer = 'Issuer is required.';
    if (!form.date.trim()) next.date = 'Date is required.';
    if (form.credentialUrl.trim() && !isValidLink(form.credentialUrl)) next.credentialUrl = LINK_ERROR;
    setErrors(next);
    if (Object.keys(next).length) return;
    onSubmit({
      name: form.name.trim(),
      issuer: form.issuer.trim(),
      date: form.date.trim(),
      credentialUrl: nullable(form.credentialUrl),
    });
  };

  return (
    <form id={formId} onSubmit={submit} noValidate className="flex flex-col gap-4">
      <Field label="Name" htmlFor={id('name')} required error={errors.name} hint="e.g. AWS Certified Cloud Practitioner">
        <Input id={id('name')} value={form.name} onChange={(e) => set('name', e.target.value)} aria-invalid={!!errors.name || undefined} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Issuer" htmlFor={id('issuer')} required error={errors.issuer}>
          <Input id={id('issuer')} value={form.issuer} onChange={(e) => set('issuer', e.target.value)} aria-invalid={!!errors.issuer || undefined} />
        </Field>
        <Field label="Date" htmlFor={id('date')} required error={errors.date} hint="e.g. May 2024">
          <Input id={id('date')} value={form.date} onChange={(e) => set('date', e.target.value)} aria-invalid={!!errors.date || undefined} />
        </Field>
      </div>
      <Field label="Credential URL" htmlFor={id('credentialUrl')} error={errors.credentialUrl}>
        <Input
          id={id('credentialUrl')}
          type="url"
          inputMode="url"
          placeholder="https://…"
          value={form.credentialUrl}
          onChange={(e) => set('credentialUrl', e.target.value)}
          aria-invalid={!!errors.credentialUrl || undefined}
        />
      </Field>
    </form>
  );
}

export function CertificationsTab() {
  const certifications = useOSStore((s) => s.certifications);
  const setCertifications = useOSStore((s) => s.setCertifications);

  return (
    <EntityTab<Certification>
      title="Certifications"
      description="Certificates and credentials shown in the Bio app."
      icon={<DoodleBadgeIcon className="w-6 h-6" />}
      noun="certification"
      basePath="/api/certifications"
      entity="certifications"
      items={certifications}
      setItems={setCertifications}
      getLabel={(x) => x.name || 'Untitled certification'}
      emptyMessage="Add a certificate or credential you have earned."
      Form={CertificationForm}
      renderSummary={(x) => (
        <div className="flex flex-col gap-1 min-w-0">
          <h3 className="text-sm font-bold text-fg">{x.name}</h3>
          <Meta>
            {x.issuer} · {x.date}
          </Meta>
          {x.credentialUrl && (
            <a
              href={x.credentialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 self-start text-2xs font-bold text-fg underline decoration-dashed underline-offset-2 hover:text-fg-muted"
            >
              <DoodleLinkIcon className="w-3.5 h-3.5" /> View credential
            </a>
          )}
        </div>
      )}
    />
  );
}
