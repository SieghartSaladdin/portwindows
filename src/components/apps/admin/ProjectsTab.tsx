'use client';

import React, { useState } from 'react';
import { useOSStore } from '@/lib/store';
import type { Project } from '@/lib/types';
import { Badge, Field, Input, Textarea } from '@/components/ui/primitives';
import { DoodleFolderIcon } from '@/components/ui/DoodleIcons';
import { ChipInput, EntityTab, Meta, Switch, type EntityFormProps } from './AdminShared';
import { ImageUploader } from './ImageUploader';
import { LINK_ERROR, isValidLink, nullable, type FieldErrors } from './useAdminApi';

function ProjectForm({ formId, initial, errors, setErrors, onSubmit }: EntityFormProps<Project>) {
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    tags: initial?.tags ?? [],
    role: initial?.role ?? '',
    period: initial?.period ?? '',
    githubUrl: initial?.githubUrl ?? '',
    liveUrl: initial?.liveUrl ?? '',
    featured: initial?.featured ?? false,
    images: initial?.images ?? [],
  });

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((f) => ({ ...f, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: FieldErrors = {};
    if (!form.title.trim()) next.title = 'Title is required.';
    if (!form.description.trim()) next.description = 'Description is required.';
    if (form.githubUrl.trim() && !isValidLink(form.githubUrl)) next.githubUrl = LINK_ERROR;
    if (form.liveUrl.trim() && !isValidLink(form.liveUrl)) next.liveUrl = LINK_ERROR;
    setErrors(next);
    if (Object.keys(next).length) return;

    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      tags: form.tags,
      role: nullable(form.role),
      period: nullable(form.period),
      githubUrl: nullable(form.githubUrl),
      liveUrl: nullable(form.liveUrl),
      featured: form.featured,
      images: form.images,
    });
  };

  const f = (name: string) => `${formId}-${name}`;

  return (
    <form id={formId} onSubmit={submit} noValidate className="flex flex-col gap-4">
      <Field label="Title" htmlFor={f('title')} required error={errors.title}>
        <Input id={f('title')} value={form.title} onChange={(e) => set('title', e.target.value)} aria-invalid={!!errors.title || undefined} maxLength={120} />
      </Field>

      <Field label="Description" htmlFor={f('description')} required error={errors.description}>
        <Textarea
          id={f('description')}
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          aria-invalid={!!errors.description || undefined}
          rows={4}
        />
      </Field>

      <Field label="Tags" htmlFor={f('tags')} hint="Press Enter or type a comma to add a tag." error={errors.tags}>
        <ChipInput id={f('tags')} value={form.tags} onChange={(tags) => set('tags', tags)} placeholder="React, TypeScript, Prisma" invalid={!!errors.tags} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Role" htmlFor={f('role')} hint="e.g. Full-stack developer" error={errors.role}>
          <Input id={f('role')} value={form.role} onChange={(e) => set('role', e.target.value)} aria-invalid={!!errors.role || undefined} />
        </Field>
        <Field label="Period" htmlFor={f('period')} hint="e.g. Jan 2024 – Mar 2024" error={errors.period}>
          <Input id={f('period')} value={form.period} onChange={(e) => set('period', e.target.value)} aria-invalid={!!errors.period || undefined} />
        </Field>
        <Field label="Source code URL" htmlFor={f('githubUrl')} error={errors.githubUrl}>
          <Input
            id={f('githubUrl')}
            type="url"
            inputMode="url"
            placeholder="https://github.com/you/repo"
            value={form.githubUrl}
            onChange={(e) => set('githubUrl', e.target.value)}
            aria-invalid={!!errors.githubUrl || undefined}
          />
        </Field>
        <Field label="Live URL" htmlFor={f('liveUrl')} error={errors.liveUrl}>
          <Input
            id={f('liveUrl')}
            type="url"
            inputMode="url"
            placeholder="https://your-demo.app"
            value={form.liveUrl}
            onChange={(e) => set('liveUrl', e.target.value)}
            aria-invalid={!!errors.liveUrl || undefined}
          />
        </Field>
      </div>

      <Switch
        id={f('featured')}
        checked={form.featured}
        onChange={(v) => set('featured', v)}
        label="Featured project"
        description="Featured projects are highlighted in the showcase."
      />

      <Field label="Images" htmlFor={f('images')} hint="The first image is used as the cover." error={errors.images}>
        <ImageUploader
          id={f('images')}
          value={form.images}
          onChange={(updater) => setForm((prev) => ({ ...prev, images: updater(prev.images) }))}
          showCover
          invalid={!!errors.images}
        />
      </Field>
    </form>
  );
}

export function ProjectsTab() {
  const projects = useOSStore((s) => s.projects);
  const setProjects = useOSStore((s) => s.setProjects);

  return (
    <EntityTab<Project>
      title="Projects"
      description="Project cards shown in the Projects app and the projector."
      icon={<DoodleFolderIcon className="w-6 h-6" />}
      noun="project"
      basePath="/api/projects"
      entity="projects"
      items={projects}
      setItems={setProjects}
      getLabel={(p) => p.title || 'Untitled project'}
      emptyMessage="Add your first project so it shows up in the Projects app."
      modalSize="lg"
      Form={ProjectForm}
      renderSummary={(p) => (
        <div className="flex gap-3 min-w-0">
          {p.images?.[0] && (
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-provided URLs
            <img
              src={p.images[0]}
              alt=""
              className="hidden @md:block w-20 h-14 shrink-0 rounded-lg border-2 border-line object-cover bg-surface-3"
              loading="lazy"
            />
          )}
          <div className="min-w-0 flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="text-sm font-bold text-fg truncate">{p.title}</h3>
              {p.featured && <Badge tone="highlight">Featured</Badge>}
            </div>
            {(p.role || p.period) && <Meta>{[p.role, p.period].filter(Boolean).join(' · ')}</Meta>}
            <p className="text-xs text-fg-muted line-clamp-2">{p.description}</p>
            {(p.tags.length > 0 || (p.images?.length ?? 0) > 0) && (
              <div className="flex flex-wrap gap-1 mt-0.5">
                {p.tags.map((t) => (
                  <Badge key={t}>{t}</Badge>
                ))}
                {(p.images?.length ?? 0) > 0 && (
                  <Badge tone="sky">
                    {p.images!.length} image{p.images!.length === 1 ? '' : 's'}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    />
  );
}
