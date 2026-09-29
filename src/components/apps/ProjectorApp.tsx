'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Film, ImageOff } from 'lucide-react';
import { useOSStore } from '@/lib/store';
import type { Project } from '@/lib/types';
import { Badge, Button, EmptyState, IconButton, Select, Spinner, cx } from '@/components/ui/primitives';
import { DoodleProjectorIcon } from '@/components/ui/DoodleIcons';
import { GitHubIcon, safeHref } from './bio/links';
import { SafeImage } from './projects/SafeImage';

const linkBase =
  'flex-1 inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl border-2 text-xs font-bold font-doodle shadow-doodle-sm transition-all ' +
  'active:translate-x-[1px] active:translate-y-[1px] active:shadow-doodle-xs';

export function ProjectorApp() {
  const projects = useOSStore((s) => s.projects);
  const selectedProjectId = useOSStore((s) => s.selectedProjectId);
  const setSelectedProjectId = useOSStore((s) => s.setSelectedProjectId);
  const dataStatus = useOSStore((s) => s.dataStatus);
  const fetchDatabaseData = useOSStore((s) => s.fetchDatabaseData);
  const openWindow = useOSStore((s) => s.openWindow);

  const project = projects.find((p) => p.id === selectedProjectId) || projects[0];

  if (dataStatus === 'loading') {
    return (
      <div className="h-full flex items-center justify-center gap-3 bg-surface text-fg-muted font-doodle text-sm">
        <Spinner label="Loading projects" />
        <span>Loading projects…</span>
      </div>
    );
  }

  if (dataStatus === 'error') {
    return (
      <div className="h-full flex items-center justify-center bg-surface font-doodle">
        <EmptyState
          title="Couldn't load projects"
          message="The portfolio server didn't respond."
          action={
            <Button variant="primary" onClick={() => fetchDatabaseData()}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-full flex items-center justify-center bg-surface font-doodle">
        <EmptyState
          icon={<DoodleProjectorIcon className="w-12 h-12" aria-hidden />}
          title="Nothing to project yet"
          message="There are no projects to show. Check back once some work has been published."
          action={<Button onClick={() => openWindow('projects')}>Open Projects</Button>}
        />
      </div>
    );
  }

  return (
    <ProjectorStage key={project.id} project={project} projects={projects} onPick={(id) => setSelectedProjectId(id)} />
  );
}

/** Keyed by project so the slide index resets when the project changes. */
function ProjectorStage({ project, projects, onPick }: { project: Project; projects: Project[]; onPick: (id: string) => void }) {
  const images = (project.images || []).filter(Boolean);
  const [index, setIndex] = React.useState(0);
  const current = images[Math.min(index, Math.max(0, images.length - 1))];

  const prev = () => setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  const liveHref = safeHref(project.liveUrl);
  const githubHref = safeHref(project.githubUrl);

  return (
    <div
      className="h-full flex flex-col md:flex-row gap-4 p-3 sm:p-4 bg-surface text-fg font-doodle overflow-y-auto md:overflow-hidden"
      onKeyDown={(e) => {
        if (images.length < 2) return;
        if (e.key === 'ArrowLeft') prev();
        if (e.key === 'ArrowRight') next();
      }}
    >
      {/* Screen */}
      <section
        aria-label="Projector screen"
        aria-roledescription="carousel"
        className="relative flex-1 min-h-[220px] rounded-2xl border-[2.5px] border-line bg-surface-2 shadow-doodle-md overflow-hidden flex items-center justify-center"
      >
        {images.length > 0 ? (
          <>
            <SafeImage
              src={current}
              alt={`${project.title} screenshot ${index + 1} of ${images.length}`}
              className="w-full h-full"
              fit="contain"
            />
            <Badge tone="highlight" className="absolute top-3 left-3">
              <Film className="w-3 h-3" aria-hidden />
              {index + 1} / {images.length}
            </Badge>
            {images.length > 1 && (
              <>
                <IconButton label="Previous screenshot" variant="primary" onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2">
                  <ChevronLeft className="w-5 h-5" />
                </IconButton>
                <IconButton label="Next screenshot" variant="primary" onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <ChevronRight className="w-5 h-5" />
                </IconButton>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 px-2.5 py-1.5 rounded-full border-2 border-line bg-surface shadow-doodle-xs">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setIndex(i)}
                      aria-label={`Show screenshot ${i + 1}`}
                      aria-current={i === index}
                      className={cx(
                        'w-2.5 h-2.5 rounded-full border border-line cursor-pointer transition',
                        i === index ? 'bg-highlight scale-125' : 'bg-surface-3 hover:bg-fg-muted',
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <EmptyState
            icon={<ImageOff className="w-10 h-10" aria-hidden />}
            title="No screenshots for this project"
            message="Images will be shown here once they're uploaded."
          />
        )}
      </section>

      {/* Details */}
      <aside className="w-full md:w-80 shrink-0 flex flex-col gap-4 p-4 rounded-2xl border-[2.5px] border-line bg-surface shadow-doodle-md md:overflow-y-auto">
        {projects.length > 1 && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="projector-project" className="text-2xs font-bold uppercase tracking-wider text-fg-muted">
              Now showing
            </label>
            <Select id="projector-project" value={project.id} onChange={(e) => onPick(e.target.value)} className="font-doodle">
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </Select>
          </div>
        )}

        <div>
          <h2 className="text-base font-bold leading-tight break-words">{project.title}</h2>
          {(project.role || project.period) && (
            <p className="text-xs text-fg-muted mt-1">{[project.role, project.period].filter(Boolean).join(' · ')}</p>
          )}
        </div>

        {project.description && (
          <p data-selectable className="text-xs leading-relaxed whitespace-pre-line break-words select-text">
            {project.description}
          </p>
        )}

        {project.tags.length > 0 && (
          <div>
            <h3 className="text-2xs font-bold uppercase tracking-wider text-fg-muted mb-2">Tech stack</h3>
            <ul className="flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <li key={tag}>
                  <Badge tone="highlight">{tag}</Badge>
                </li>
              ))}
            </ul>
          </div>
        )}

        {(githubHref || liveHref) && (
          <div className="mt-auto flex gap-2.5 pt-3 border-t-2 border-dashed border-line">
            {githubHref && (
              <a href={githubHref} target="_blank" rel="noopener noreferrer" className={cx(linkBase, 'bg-surface text-fg border-line hover:bg-surface-3')}>
                <GitHubIcon className="w-3.5 h-3.5" />
                Source
              </a>
            )}
            {liveHref && (
              <a href={liveHref} target="_blank" rel="noopener noreferrer" className={cx(linkBase, 'bg-highlight text-ink border-ink hover:bg-highlight-strong')}>
                <ExternalLink className="w-3.5 h-3.5" aria-hidden />
                Live demo
              </a>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
