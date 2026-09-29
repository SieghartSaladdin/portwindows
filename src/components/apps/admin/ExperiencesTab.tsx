'use client';

import React, { useState } from 'react';
import { useOSStore } from '@/lib/store';
import type { Experience } from '@/lib/types';
import { Field, Input, Textarea } from '@/components/ui/primitives';
import { EntityTab, Meta, type EntityFormProps } from './AdminShared';
import { DoodleBriefcaseIcon } from './AdminIcons';
import type { FieldErrors } from './useAdminApi';

function ExperienceForm({ formId, initial, errors, setErrors, onSubmit }: EntityFormProps<Experience>) {
  const [form, setForm] = useState({
    role: initial?.role ?? '',
    company: initial?.company ?? '',
    duration: initial?.duration ?? '',
    description: (initial?.description ?? []).join('\n'),
  });
  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const id = (name: string) => `${formId}-${name}`;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: FieldErrors = {};
    if (!form.role.trim()) next.role = 'Role is required.';
    if (!form.company.trim()) next.company = 'Company is required.';
    if (!form.duration.trim()) next.duration = 'Duration is required.';
    setErrors(next);
    if (Object.keys(next).length) return;
    onSubmit({
      role: form.role.trim(),
      company: form.company.trim(),
      duration: form.duration.trim(),
      description: form.description
        .split('\n')
        .map((line) => line.replace(/^\s*[-*•]\s*/, '').trim())
        .filter(Boolean),
    });
  };

  return (
    <form id={formId} onSubmit={submit} noValidate className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Role" htmlFor={id('role')} required error={errors.role}>
          <Input id={id('role')} value={form.role} onChange={(e) => set('role', e.target.value)} aria-invalid={!!errors.role || undefined} />
        </Field>
        <Field label="Company" htmlFor={id('company')} required error={errors.company}>
          <Input id={id('company')} value={form.company} onChange={(e) => set('company', e.target.value)} aria-invalid={!!errors.company || undefined} />
        </Field>
      </div>
      <Field label="Duration" htmlFor={id('duration')} required error={errors.duration} hint="e.g. Jan 2023 – Present">
        <Input id={id('duration')} value={form.duration} onChange={(e) => set('duration', e.target.value)} aria-invalid={!!errors.duration || undefined} />
      </Field>
      <Field label="Highlights" htmlFor={id('description')} error={errors.description} hint="One bullet point per line.">
        <Textarea
          id={id('description')}
          rows={6}
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          aria-invalid={!!errors.description || undefined}
          placeholder={'Built the design system\nLed the migration to Next.js'}
        />
      </Field>
    </form>
  );
}

export function ExperiencesTab() {
  const experiences = useOSStore((s) => s.experiences);
  const setExperiences = useOSStore((s) => s.setExperiences);

  return (
    <EntityTab<Experience>
      title="Experience"
      description="Work history shown in the Bio app."
      icon={<DoodleBriefcaseIcon className="w-6 h-6" />}
      noun="experience"
      basePath="/api/experiences"
      entity="experiences"
      items={experiences}
      setItems={setExperiences}
      getLabel={(x) => [x.role, x.company].filter(Boolean).join(' at ') || 'Untitled experience'}
      emptyMessage="Add a role you have held so visitors can see your work history."
      modalSize="lg"
      Form={ExperienceForm}
      renderSummary={(x) => (
        <div className="flex flex-col gap-1 min-w-0">
          <h3 className="text-sm font-bold text-fg">
            {x.role} <span className="text-fg-muted font-normal">at</span> {x.company}
          </h3>
          <Meta>{x.duration}</Meta>
          {x.description.length > 0 && (
            <ul className="mt-0.5 list-disc pl-4 text-xs text-fg-muted space-y-0.5">
              {x.description.slice(0, 2).map((line, i) => (
                <li key={i} className="line-clamp-1">{line}</li>
              ))}
              {x.description.length > 2 && <li className="list-none -ml-4 text-2xs">+{x.description.length - 2} more</li>}
            </ul>
          )}
        </div>
      )}
    />
  );
}
