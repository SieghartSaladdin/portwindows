'use client';

import React, { useState } from 'react';
import { useOSStore } from '@/lib/store';
import type { Education } from '@/lib/types';
import { Field, Input, Textarea } from '@/components/ui/primitives';
import { EntityTab, Meta, type EntityFormProps } from './AdminShared';
import { DoodleGradCapIcon } from './AdminIcons';
import { nullable, type FieldErrors } from './useAdminApi';

function EducationForm({ formId, initial, errors, setErrors, onSubmit }: EntityFormProps<Education>) {
  const [form, setForm] = useState({
    institution: initial?.institution ?? '',
    degree: initial?.degree ?? '',
    field: initial?.field ?? '',
    period: initial?.period ?? '',
    description: initial?.description ?? '',
  });
  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const id = (name: string) => `${formId}-${name}`;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: FieldErrors = {};
    if (!form.institution.trim()) next.institution = 'Institution is required.';
    if (!form.degree.trim()) next.degree = 'Degree is required.';
    if (!form.period.trim()) next.period = 'Period is required.';
    setErrors(next);
    if (Object.keys(next).length) return;
    onSubmit({
      institution: form.institution.trim(),
      degree: form.degree.trim(),
      field: nullable(form.field),
      period: form.period.trim(),
      description: nullable(form.description),
    });
  };

  return (
    <form id={formId} onSubmit={submit} noValidate className="flex flex-col gap-4">
      <Field label="Institution" htmlFor={id('institution')} required error={errors.institution}>
        <Input id={id('institution')} value={form.institution} onChange={(e) => set('institution', e.target.value)} aria-invalid={!!errors.institution || undefined} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Degree" htmlFor={id('degree')} required error={errors.degree} hint="e.g. Bachelor of Science">
          <Input id={id('degree')} value={form.degree} onChange={(e) => set('degree', e.target.value)} aria-invalid={!!errors.degree || undefined} />
        </Field>
        <Field label="Field of study" htmlFor={id('field')} error={errors.field} hint="e.g. Computer Science">
          <Input id={id('field')} value={form.field} onChange={(e) => set('field', e.target.value)} aria-invalid={!!errors.field || undefined} />
        </Field>
      </div>
      <Field label="Period" htmlFor={id('period')} required error={errors.period} hint="e.g. 2019 – 2023">
        <Input id={id('period')} value={form.period} onChange={(e) => set('period', e.target.value)} aria-invalid={!!errors.period || undefined} />
      </Field>
      <Field label="Description" htmlFor={id('description')} error={errors.description}>
        <Textarea id={id('description')} rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} aria-invalid={!!errors.description || undefined} />
      </Field>
    </form>
  );
}

export function EducationTab() {
  const educations = useOSStore((s) => s.educations);
  const setEducations = useOSStore((s) => s.setEducations);

  return (
    <EntityTab<Education>
      title="Education"
      description="Degrees and schools shown in the Bio app."
      icon={<DoodleGradCapIcon className="w-6 h-6" />}
      noun="education entry"
      nounPlural="education entries"
      basePath="/api/educations"
      entity="educations"
      items={educations}
      setItems={setEducations}
      getLabel={(x) => [x.degree, x.institution].filter(Boolean).join(', ') || 'Untitled entry'}
      emptyMessage="Add a degree, course or school you attended."
      Form={EducationForm}
      renderSummary={(x) => (
        <div className="flex flex-col gap-1 min-w-0">
          <h3 className="text-sm font-bold text-fg">
            {x.degree}
            {x.field ? <span className="text-fg-muted font-normal">, {x.field}</span> : null}
          </h3>
          <Meta>
            {x.institution} · {x.period}
          </Meta>
          {x.description && <p className="text-xs text-fg-muted line-clamp-2">{x.description}</p>}
        </div>
      )}
    />
  );
}
