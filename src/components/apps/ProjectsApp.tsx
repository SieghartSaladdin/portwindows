'use client';

import React from 'react';
import { ArrowLeft, ChevronRight, LayoutGrid, List, Monitor, RefreshCw, Search, Star, X } from 'lucide-react';
import { useOSStore } from '@/lib/store';
import type { Project } from '@/lib/types';
import { Badge, Button, Card, EmptyState, IconButton, Input, Spinner, cx } from '@/components/ui/primitives';
import { DoodleBioIcon, DoodleFolderIcon, DoodleSettingsIcon, DoodleTerminalIcon } from '@/components/ui/DoodleIcons';
import { ProjectDetailView } from './projects/ProjectDetailView';
import { SafeImage } from './projects/SafeImage';
import { OPEN_PROJECT_EVENT, clearPendingProject, peekPendingProject } from './projects/navigation';

type View = 'this-pc' | 'projects' | 'detail';
type Filter = 'all' | 'featured';

function matches(p: Project, q: string) {
  if (!q) return true;
  const needle = q.toLowerCase();
  return (
    p.title.toLowerCase().includes(needle) ||
    (p.description || '').toLowerCase().includes(needle) ||
    (p.role || '').toLowerCase().includes(needle) ||
    p.tags.some((t) => t.toLowerCase().includes(needle))
  );
}

/** Sidebar / mobile strip entry. */
function NavItem({ active, onClick, icon, children }: { active?: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cx(
        'flex items-center gap-2 shrink-0 whitespace-nowrap rounded-xl border-2 px-3 py-1.5 text-xs font-bold font-doodle transition cursor-pointer text-left',
        active ? 'bg-highlight text-ink border-ink shadow-doodle-sm' : 'bg-surface text-fg border-line hover:bg-surface-3',
      )}
    >
      <span className="w-4 h-4 flex items-center justify-center shrink-0" aria-hidden>
        {icon}
      </span>
      <span className="truncate">{children}</span>
    </button>
  );
}

function TagList({ tags, max = 3 }: { tags: string[]; max?: number }) {
  if (tags.length === 0) return null;
  const shown = tags.slice(0, max);
  const rest = tags.length - shown.length;
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Tech stack">
      {shown.map((t) => (
        <li key={t}>
          <Badge className="text-3xs">{t}</Badge>
        </li>
      ))}
      {rest > 0 && (
        <li>
          <Badge className="text-3xs" title={tags.slice(max).join(', ')}>
            +{rest}
          </Badge>
        </li>
      )}
    </ul>
  );
}

function Thumb({ project, className }: { project: Project; className?: string }) {
  const first = (project.images || []).find(Boolean);
  const folder = (
    <div className={cx('flex items-center justify-center bg-surface-2', className)}>
      <DoodleFolderIcon className="w-14 h-14" aria-hidden />
    </div>
  );
  if (!first) return folder;
  return <SafeImage src={first} alt="" className={className} fallback={folder} />;
}

export function ProjectsApp() {
  const projects = useOSStore((s) => s.projects);
  const dataStatus = useOSStore((s) => s.dataStatus);
  const fetchDatabaseData = useOSStore((s) => s.fetchDatabaseData);
  const openWindow = useOSStore((s) => s.openWindow);

  // A project requested (e.g. by the Terminal) before this window mounted opens straight away.
  const [view, setView] = React.useState<View>(() => (peekPendingProject() ? 'detail' : 'projects'));
  const [projectId, setProjectId] = React.useState<string | null>(() => peekPendingProject());
  const [filter, setFilter] = React.useState<Filter>('all');
  const [query, setQuery] = React.useState('');
  const [layout, setLayout] = React.useState<'grid' | 'list'>('grid');

  React.useEffect(() => {
    clearPendingProject();
    const onOpen = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      clearPendingProject();
      setProjectId(id);
      setView('detail');
    };
    window.addEventListener(OPEN_PROJECT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_PROJECT_EVENT, onOpen);
  }, []);

  const selected = projects.find((p) => p.id === projectId) || null;
  const featuredCount = projects.filter((p) => p.featured).length;
  const scoped = filter === 'featured' ? projects.filter((p) => p.featured) : projects;
  const visible = scoped.filter((p) => matches(p, query.trim()));

  const goProjects = (f: Filter = 'all') => {
    setFilter(f);
    setView('projects');
    setProjectId(null);
  };
  const openProject = (id: string) => {
    setProjectId(id);
    setView('detail');
  };
  const goBack = () => {
    if (view === 'detail') goProjects(filter);
    else if (view === 'projects') setView('this-pc');
  };

  const folderLabel = filter === 'featured' ? 'Featured' : 'Projects (D:)';

  let body: React.ReactNode;
  if (dataStatus === 'loading') {
    body = (
      <div className="flex items-center justify-center gap-3 py-20 text-sm text-fg-muted">
        <Spinner label="Loading projects" />
        <span>Loading projects…</span>
      </div>
    );
  } else if (dataStatus === 'error') {
    body = (
      <EmptyState
        title="Couldn't load projects"
        message="The portfolio server didn't respond. Check your connection and try again."
        action={
          <Button variant="primary" onClick={() => fetchDatabaseData()} icon={<RefreshCw className="w-3.5 h-3.5" aria-hidden />}>
            Retry
          </Button>
        }
      />
    );
  } else if (view === 'this-pc') {
    body = (
      <div className="flex flex-col gap-6">
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-fg-muted mb-3">Drives</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card interactive shadow="sm" className="p-0">
              <button type="button" onClick={() => goProjects('all')} className="w-full flex items-center gap-4 p-4 text-left cursor-pointer rounded-2xl">
                <DoodleFolderIcon className="w-14 h-14 shrink-0" aria-hidden />
                <span className="min-w-0">
                  <span className="block text-sm font-bold">Projects (D:)</span>
                  <span className="block text-xs text-fg-muted mt-0.5">
                    {projects.length === 1 ? '1 project' : `${projects.length} projects`}
                    {featuredCount > 0 && ` · ${featuredCount} featured`}
                  </span>
                </span>
              </button>
            </Card>
          </div>
        </section>
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-fg-muted mb-3">Shortcuts</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { id: 'bio', label: 'About me', icon: <DoodleBioIcon className="w-10 h-10" aria-hidden /> },
              { id: 'terminal', label: 'Terminal', icon: <DoodleTerminalIcon className="w-10 h-10" aria-hidden /> },
              { id: 'settings', label: 'Settings', icon: <DoodleSettingsIcon className="w-10 h-10" aria-hidden /> },
            ].map((s) => (
              <Card key={s.id} interactive shadow="sm" className="p-0">
                <button type="button" onClick={() => openWindow(s.id)} className="w-full flex flex-col items-center gap-2 p-4 cursor-pointer rounded-2xl">
                  {s.icon}
                  <span className="text-xs font-bold">{s.label}</span>
                </button>
              </Card>
            ))}
          </div>
        </section>
      </div>
    );
  } else if (view === 'detail' && selected) {
    body = <ProjectDetailView key={selected.id} project={selected} onBack={() => goProjects(filter)} />;
  } else if (projects.length === 0) {
    body = (
      <EmptyState
        icon={<DoodleFolderIcon className="w-14 h-14" aria-hidden />}
        title="No projects yet"
        message="This folder is empty for now. New work will appear here as soon as it's published."
      />
    );
  } else if (visible.length === 0) {
    body = (
      <EmptyState
        icon={<Search className="w-8 h-8" aria-hidden />}
        title={query ? `No projects match “${query}”` : 'No featured projects yet'}
        action={
          query ? (
            <Button size="sm" onClick={() => setQuery('')}>
              Clear search
            </Button>
          ) : (
            <Button size="sm" onClick={() => goProjects('all')}>
              Show all projects
            </Button>
          )
        }
      />
    );
  } else if (layout === 'grid') {
    body = (
      <ul className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {visible.map((p) => (
          <li key={p.id}>
            <Card interactive shadow="sm" className="h-full p-0 overflow-hidden">
              <button type="button" onClick={() => openProject(p.id)} className="w-full h-full flex flex-col text-left cursor-pointer">
                <div className="relative border-b-2 border-line">
                  <Thumb project={p} className="w-full aspect-video" />
                  {p.featured && (
                    <Badge tone="highlight" className="absolute top-2 right-2">
                      <Star className="w-3 h-3" aria-hidden /> Featured
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col gap-1.5 p-3 flex-1">
                  <h3 className="text-sm font-bold leading-tight break-words">{p.title}</h3>
                  {(p.role || p.period) && <p className="text-2xs text-fg-muted">{[p.role, p.period].filter(Boolean).join(' · ')}</p>}
                  {p.description && <p className="text-xs text-fg-muted leading-relaxed line-clamp-2">{p.description}</p>}
                  <div className="mt-auto pt-1.5">
                    <TagList tags={p.tags} />
                  </div>
                </div>
              </button>
            </Card>
          </li>
        ))}
      </ul>
    );
  } else {
    body = (
      <ul className="flex flex-col gap-3">
        {visible.map((p) => (
          <li key={p.id}>
            <Card interactive shadow="sm" className="p-0">
              <button type="button" onClick={() => openProject(p.id)} className="w-full flex items-center gap-3 p-3 text-left cursor-pointer rounded-2xl">
                <Thumb project={p} className="w-16 h-12 sm:w-20 sm:h-14 rounded-lg border-2 border-line shrink-0 overflow-hidden" />
                <span className="flex-1 min-w-0 flex flex-col gap-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold break-words">{p.title}</span>
                    {p.featured && (
                      <Badge tone="highlight">
                        <Star className="w-3 h-3" aria-hidden /> Featured
                      </Badge>
                    )}
                  </span>
                  {(p.role || p.period) && <span className="text-2xs text-fg-muted">{[p.role, p.period].filter(Boolean).join(' · ')}</span>}
                  {p.description && <span className="text-xs text-fg-muted line-clamp-1">{p.description}</span>}
                  <TagList tags={p.tags} max={4} />
                </span>
                <ChevronRight className="w-4 h-4 shrink-0 text-fg-muted" aria-hidden />
              </button>
            </Card>
          </li>
        ))}
      </ul>
    );
  }

  const statusText =
    dataStatus !== 'ready'
      ? ''
      : view === 'this-pc'
        ? '1 drive · 3 shortcuts'
        : view === 'detail' && selected
          ? `${selected.images?.length || 0} image(s) · ${selected.tags.length} tag(s)`
          : query || filter === 'featured'
            ? `Showing ${visible.length} of ${projects.length}`
            : `${projects.length} item${projects.length === 1 ? '' : 's'}`;

  return (
    <div className="flex flex-col sm:flex-row h-full bg-surface text-fg font-doodle overflow-hidden">
      {/* Sidebar (vertical on sm+, horizontal strip on phones) */}
      <nav
        aria-label="Explorer locations"
        className="flex sm:flex-col gap-1.5 p-2 sm:p-3 sm:w-52 shrink-0 overflow-x-auto sm:overflow-y-auto border-b-2 sm:border-b-0 sm:border-r-2 border-line bg-surface-2"
      >
        <p className="hidden sm:block text-2xs font-bold uppercase tracking-wider text-fg-muted px-1 pt-1">Locations</p>
        <NavItem active={view === 'this-pc'} onClick={() => setView('this-pc')} icon={<Monitor className="w-4 h-4" />}>
          This PC
        </NavItem>
        <NavItem active={view !== 'this-pc' && filter === 'all'} onClick={() => goProjects('all')} icon={<DoodleFolderIcon className="w-4 h-4" />}>
          Projects (D:)
        </NavItem>
        {featuredCount > 0 && (
          <NavItem active={view !== 'this-pc' && filter === 'featured'} onClick={() => goProjects('featured')} icon={<Star className="w-4 h-4" />}>
            Featured
          </NavItem>
        )}
        <p className="hidden sm:block text-2xs font-bold uppercase tracking-wider text-fg-muted px-1 pt-3">Shortcuts</p>
        <NavItem onClick={() => openWindow('bio')} icon={<DoodleBioIcon className="w-4 h-4" />}>
          About me
        </NavItem>
        <NavItem onClick={() => openWindow('terminal')} icon={<DoodleTerminalIcon className="w-4 h-4" />}>
          Terminal
        </NavItem>
      </nav>

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 p-2 sm:p-3 border-b-2 border-line bg-surface shrink-0">
          <IconButton label="Back" size="sm" onClick={goBack} disabled={view === 'this-pc'}>
            <ArrowLeft className="w-4 h-4" />
          </IconButton>

          <nav aria-label="Breadcrumb" className="flex-1 min-w-[10rem] flex items-center gap-1 h-8 px-2.5 rounded-xl border-2 border-line bg-surface-2 text-xs font-bold overflow-hidden">
            <button type="button" onClick={() => setView('this-pc')} className="shrink-0 hover:underline cursor-pointer">
              This PC
            </button>
            {view !== 'this-pc' && (
              <>
                <ChevronRight className="w-3 h-3 shrink-0 text-fg-muted" aria-hidden />
                <button type="button" onClick={() => goProjects(filter)} className="shrink-0 hover:underline cursor-pointer">
                  {folderLabel}
                </button>
              </>
            )}
            {view === 'detail' && selected && (
              <>
                <ChevronRight className="w-3 h-3 shrink-0 text-fg-muted" aria-hidden />
                <span className="truncate" aria-current="page">
                  {selected.title}
                </span>
              </>
            )}
          </nav>

          <div className="flex items-center gap-2 w-full min-[520px]:w-auto">
            <div className="relative flex-1 min-[520px]:flex-none">
              <label htmlFor="projects-search" className="sr-only">
                Search projects
              </label>
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-fg-muted pointer-events-none" aria-hidden />
              <Input
                id="projects-search"
                type="search"
                placeholder="Search projects…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (view !== 'projects') setView('projects');
                }}
                className="h-8 pl-8 pr-7 min-[520px]:w-48"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md flex items-center justify-center text-fg-muted hover:text-fg hover:bg-surface-3 cursor-pointer"
                >
                  <X className="w-3 h-3" aria-hidden />
                </button>
              )}
            </div>

            <div role="group" aria-label="Layout" className="flex items-center gap-0.5 p-0.5 rounded-xl border-2 border-line bg-surface-2 shrink-0">
              {(['grid', 'list'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setLayout(mode);
                    if (view === 'this-pc') setView('projects');
                  }}
                  aria-pressed={layout === mode}
                  aria-label={mode === 'grid' ? 'Grid view' : 'List view'}
                  title={mode === 'grid' ? 'Grid view' : 'List view'}
                  className={cx(
                    'w-7 h-6 rounded-lg flex items-center justify-center cursor-pointer transition border',
                    layout === mode ? 'bg-highlight text-ink border-ink' : 'border-transparent text-fg-muted hover:text-fg',
                  )}
                >
                  {mode === 'grid' ? <LayoutGrid className="w-3.5 h-3.5" aria-hidden /> : <List className="w-3.5 h-3.5" aria-hidden />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-5 bg-surface">
          {view === 'projects' && dataStatus === 'ready' && projects.length > 0 && (
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
              {folderLabel}
              <span className="text-xs text-fg-muted font-normal">({visible.length})</span>
            </h2>
          )}
          {body}
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between gap-3 px-3 py-1 border-t-2 border-line bg-surface-2 text-2xs text-fg-muted shrink-0" aria-live="polite">
          <span>{statusText}</span>
          <span className="hidden sm:inline">{layout === 'grid' ? 'Grid view' : 'List view'}</span>
        </div>
      </div>
    </div>
  );
}
