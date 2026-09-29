'use client';

import React from 'react';
import { ArrowLeft, Calendar, ExternalLink, Film, Star, UserRound } from 'lucide-react';
import { Badge, Button, Card, cx } from '@/components/ui/primitives';
import { DoodleFolderIcon } from '@/components/ui/DoodleIcons';
import { useOSStore } from '@/lib/store';
import type { Project } from '@/lib/types';
import { GitHubIcon, safeHref } from '../bio/links';
import { SafeImage } from './SafeImage';

interface ProjectDetailViewProps {
  project: Project;
  onBack: () => void;
}

const linkBase =
  'inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-xl border-2 text-xs font-bold font-doodle shadow-doodle-sm transition-all ' +
  'active:translate-x-[1px] active:translate-y-[1px] active:shadow-doodle-xs';

export function ProjectDetailView({ project, onBack }: ProjectDetailViewProps) {
  const setSelectedProjectId = useOSStore((s) => s.setSelectedProjectId);
  const openWindow = useOSStore((s) => s.openWindow);
  const images = (project.images || []).filter(Boolean);
  const [active, setActive] = React.useState(0);
  const current = images[Math.min(active, images.length - 1)];

  const liveHref = safeHref(project.liveUrl);
  const githubHref = safeHref(project.githubUrl);

  const openProjector = () => {
    setSelectedProjectId(project.id);
    openWindow('projector', `Projector - ${project.title}`);
  };

  return (
    <article className="flex flex-col gap-4 max-w-4xl mx-auto font-doodle" aria-labelledby={`project-${project.id}-title`}>
      {/* Header */}
      <Card className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <DoodleFolderIcon className="w-12 h-12 shrink-0" aria-hidden />
          <div className="min-w-0">
            <h1 id={`project-${project.id}-title`} className="text-lg sm:text-xl font-bold break-words leading-tight">
              {project.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-fg-muted">
              {project.role && (
                <span className="inline-flex items-center gap-1">
                  <UserRound className="w-3.5 h-3.5" aria-hidden />
                  {project.role}
                </span>
              )}
              {project.period && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" aria-hidden />
                  {project.period}
                </span>
              )}
              {project.featured && (
                <Badge tone="highlight">
                  <Star className="w-3 h-3" aria-hidden /> Featured
                </Badge>
              )}
            </div>
          </div>
        </div>
        <Button size="sm" onClick={onBack} icon={<ArrowLeft className="w-3.5 h-3.5" aria-hidden />} className="self-start sm:self-auto">
          Back to projects
        </Button>
      </Card>

      {/* Screenshots */}
      {images.length > 0 && (
        <Card className="p-3 flex flex-col gap-3">
          <div className="rounded-xl border-2 border-line overflow-hidden bg-surface-2 aspect-video">
            <SafeImage src={current} alt={`${project.title} screenshot ${active + 1} of ${images.length}`} className="w-full h-full" fit="contain" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Screenshots">
              {images.map((src, i) => (
                <button
                  key={`${src}-${i}`}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Show screenshot ${i + 1}`}
                  aria-pressed={i === active}
                  className={cx(
                    'shrink-0 w-20 h-14 rounded-lg border-2 overflow-hidden cursor-pointer transition',
                    i === active ? 'border-ink shadow-doodle-sm ring-2 ring-highlight' : 'border-line opacity-70 hover:opacity-100',
                  )}
                >
                  <SafeImage src={src} alt="" className="w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Description */}
        <Card className="md:col-span-2 p-5 flex flex-col gap-4">
          <h2 className="text-sm font-bold uppercase tracking-wider border-b-2 border-dashed border-line pb-2">About this project</h2>
          <p data-selectable className="text-sm leading-relaxed whitespace-pre-line break-words select-text">
            {project.description || 'No description yet.'}
          </p>

          {project.tags.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-fg-muted mb-2">Tech stack</h3>
              <ul className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <li key={tag}>
                    <Badge tone="highlight">{tag}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        {/* Links */}
        <Card className="p-5 flex flex-col gap-3">
          <h2 className="text-sm font-bold uppercase tracking-wider border-b-2 border-dashed border-line pb-2">Links</h2>
          {liveHref && (
            <a href={liveHref} target="_blank" rel="noopener noreferrer" className={cx(linkBase, 'bg-highlight text-ink border-ink hover:bg-highlight-strong')}>
              <ExternalLink className="w-4 h-4" aria-hidden />
              Open live demo
            </a>
          )}
          {githubHref && (
            <a href={githubHref} target="_blank" rel="noopener noreferrer" className={cx(linkBase, 'bg-surface text-fg border-line hover:bg-surface-3')}>
              <GitHubIcon className="w-4 h-4" />
              View source on GitHub
            </a>
          )}
          {!liveHref && !githubHref && <p className="text-xs text-fg-muted">No public links for this project.</p>}
          <Button onClick={openProjector} icon={<Film className="w-4 h-4" aria-hidden />}>
            Show in Projector
          </Button>
        </Card>
      </div>
    </article>
  );
}
