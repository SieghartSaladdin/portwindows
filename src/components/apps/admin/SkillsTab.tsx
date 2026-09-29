'use client';

import React, { useState } from 'react';
import { useOSStore } from '@/lib/store';
import type { SkillGroup } from '@/lib/types';
import { Badge, Field, Input } from '@/components/ui/primitives';
import { ChipInput, EntityTab, type EntityFormProps } from './AdminShared';
import { DoodleSparkIcon } from './AdminIcons';
import type { FieldErrors } from './useAdminApi';

function SkillForm({ formId, initial, errors, setErrors, onSubmit }: EntityFormProps<SkillGroup>) {
  const [category, setCategory] = useState(initial?.category ?? '');
  const [skills, setSkills] = useState<string[]>(initial?.skills ?? []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: FieldErrors = {};
    if (!category.trim()) next.category = 'Category is required.';
    setErrors(next);
    if (Object.keys(next).length) return;
    onSubmit({ category: category.trim(), skills });
  };

  return (
    <form id={formId} onSubmit={submit} noValidate className="flex flex-col gap-4">
      <Field label="Category" htmlFor={`${formId}-category`} required error={errors.category} hint="e.g. Frontend, Backend, Tools">
        <Input
          id={`${formId}-category`}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-invalid={!!errors.category || undefined}
          maxLength={80}
        />
      </Field>
      <Field label="Skills" htmlFor={`${formId}-skills`} error={errors.skills} hint="Press Enter or type a comma to add a skill.">
        <ChipInput id={`${formId}-skills`} value={skills} onChange={setSkills} placeholder="React, Next.js, Tailwind" invalid={!!errors.skills} />
      </Field>
    </form>
  );
}

export function SkillsTab() {
  const skills = useOSStore((s) => s.skills);
  const setSkills = useOSStore((s) => s.setSkills);

  return (
    <EntityTab<SkillGroup>
      title="Skills"
      description="Skill groups listed in the Bio app."
      icon={<DoodleSparkIcon className="w-6 h-6" />}
      noun="skill group"
      basePath="/api/skills"
      entity="skills"
      items={skills}
      setItems={setSkills}
      getLabel={(s) => s.category || 'Untitled group'}
      emptyMessage="Group your skills by category, e.g. Frontend or Tools."
      Form={SkillForm}
      renderSummary={(s) => (
        <div className="flex flex-col gap-1.5 min-w-0">
          <h3 className="text-sm font-bold text-fg">{s.category}</h3>
          {s.skills.length ? (
            <div className="flex flex-wrap gap-1">
              {s.skills.map((skill) => (
                <Badge key={skill}>{skill}</Badge>
              ))}
            </div>
          ) : (
            <p className="text-2xs text-fg-muted">No skills in this group yet.</p>
          )}
        </div>
      )}
    />
  );
}
