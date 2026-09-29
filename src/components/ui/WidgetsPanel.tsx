'use client';

import React, { useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Lightbulb, Link2, Mail, FileDown, MapPin, Star, X } from 'lucide-react';
import { useOSStore } from '@/lib/store';
import { useDateTime } from '@/hooks/useDateTime';
import { useDismiss } from '@/hooks/useDismiss';
import { getProfileLinks, isPlaceholderProfile, openExternal } from '@/hooks/useProfileLinks';
import { Badge, Button, Card, EmptyState, IconButton, Spinner, cx } from '@/components/ui/primitives';
import { DoodleFolderIcon, DoodleBioIcon, DoodleAdminIcon } from '@/components/ui/DoodleIcons';

const WEEK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function useCalendar() {
  // Recomputed on each open; accurate enough for a month grid.
  return useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();
    let offset = new Date(year, month, 1).getDay() - 1; // Monday first
    if (offset < 0) offset = 6;
    const total = new Date(year, month + 1, 0).getDate();
    const cells = offset + total > 35 ? 42 : 35;
    const days = Array.from({ length: cells }, (_, i) => {
      const n = i - offset + 1;
      return n > 0 && n <= total ? { n, today: n === today } : { n: null, today: false };
    });
    return { days, monthLabel: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) };
  }, []);
}

function WidgetTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 text-2xs font-bold uppercase tracking-wider text-fg-muted mb-3">
      <span aria-hidden>{icon}</span>
      {children}
    </h3>
  );
}

function WidgetsContent() {
  const profile = useOSStore((s) => s.profile);
  const projects = useOSStore((s) => s.projects);
  const skills = useOSStore((s) => s.skills);
  const experiences = useOSStore((s) => s.experiences);
  const certifications = useOSStore((s) => s.certifications);
  const dataStatus = useOSStore((s) => s.dataStatus);
  const openWindow = useOSStore((s) => s.openWindow);
  const setSelectedProjectId = useOSStore((s) => s.setSelectedProjectId);
  const closeWidgets = useOSStore((s) => s.closeWidgets);
  const setActiveChatPartner = useOSStore((s) => s.setActiveChatPartner);
  const setIsChatInputOpen = useOSStore((s) => s.setIsChatInputOpen);
  const { time, fullDate } = useDateTime();
  const { days, monthLabel } = useCalendar();

  const placeholder = isPlaceholderProfile(profile);
  const links = getProfileLinks(profile);
  const featured = projects.find((p) => p.featured) ?? projects[0];
  const skillCount = skills.reduce((sum, g) => sum + (g.skills?.length ?? 0), 0);

  const open = (id: string, title: string) => {
    openWindow(id, title);
    closeWidgets();
  };

  const stats = [
    { label: 'Projects', value: projects.length, app: 'projects', title: 'Projects' },
    { label: 'Skills', value: skillCount, app: 'bio', title: 'Bio.txt' },
    { label: 'Roles', value: experiences.length, app: 'bio', title: 'Bio.txt' },
    { label: 'Certificates', value: certifications.length, app: 'bio', title: 'Bio.txt' },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Profile */}
      <Card shadow="sm" className="p-4">
        {dataStatus === 'loading' ? (
          <div className="flex items-center gap-3 text-xs text-fg-muted">
            <Spinner /> Loading profile...
          </div>
        ) : placeholder ? (
          <EmptyState
            icon={<DoodleAdminIcon className="w-8 h-8" />}
            title="Profile not set up yet"
            message={dataStatus === 'error' ? 'The portfolio server could not be reached.' : 'Sign in to the Developer Hub to add your name, bio and links.'}
            action={
              <Button size="sm" variant="primary" onClick={() => open('admin', 'Developer Hub')}>
                Open Developer Hub
              </Button>
            }
          />
        ) : (
          <div className="flex items-start gap-3">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatarUrl} alt="" className="w-14 h-14 rounded-xl border-2 border-line object-cover shadow-doodle-sm bg-surface-2" />
            ) : (
              <span aria-hidden className="w-14 h-14 rounded-xl border-2 border-ink bg-highlight text-ink flex items-center justify-center text-xl font-bold shadow-doodle-sm">
                {profile.name.charAt(0).toUpperCase()}
              </span>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{profile.name}</p>
              {profile.title && <p className="text-xs text-fg-muted truncate">{profile.title}</p>}
              {profile.location && (
                <p className="text-2xs text-fg-muted flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" aria-hidden /> {profile.location}
                </p>
              )}
              <Button size="sm" variant="secondary" className="mt-2" icon={<DoodleBioIcon className="w-4 h-4" />} onClick={() => open('bio', 'Bio.txt')}>
                Read bio
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Date & calendar */}
      <Card shadow="sm" className="p-4">
        <WidgetTitle icon={<CalendarIcon className="w-4 h-4" />}>Today</WidgetTitle>
        <p className="text-3xl font-bold tracking-tight">{time || ' '}</p>
        <p className="text-xs text-fg-muted mb-3">{fullDate}</p>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold">{monthLabel}</span>
        </div>
        <div className="grid grid-cols-7 text-center text-2xs font-bold text-fg-muted mb-1" aria-hidden>
          {WEEK_DAYS.map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs" aria-label={`Calendar for ${monthLabel}`}>
          {days.map((d, i) => (
            <span
              key={i}
              aria-current={d.today ? 'date' : undefined}
              className={cx(
                'h-7 w-7 mx-auto flex items-center justify-center rounded-lg border-2',
                !d.today && 'border-transparent text-fg',
                d.today && 'bg-highlight text-ink border-ink font-bold shadow-doodle-xs',
              )}
            >
              {d.n ?? ''}
            </span>
          ))}
        </div>
      </Card>

      {/* Featured project */}
      <Card shadow="sm" className="p-4">
        <WidgetTitle icon={<Star className="w-4 h-4" />}>{featured?.featured ? 'Featured project' : 'Latest project'}</WidgetTitle>
        {dataStatus === 'loading' ? (
          <div className="flex items-center gap-3 text-xs text-fg-muted">
            <Spinner /> Loading projects...
          </div>
        ) : featured ? (
          <button
            type="button"
            onClick={() => {
              setSelectedProjectId(featured.id);
              open('projects', 'Projects');
            }}
            className="w-full text-left rounded-xl border-2 border-line bg-surface-2 hover:bg-surface-3 p-3 shadow-doodle-xs cursor-pointer transition"
          >
            {featured.images?.[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={featured.images[0]} alt="" className="w-full h-28 object-cover rounded-lg border-2 border-line mb-2.5" />
            )}
            <p className="text-sm font-bold">{featured.title}</p>
            <p className="text-xs text-fg-muted line-clamp-2 mt-0.5">{featured.description}</p>
            {featured.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {featured.tags.slice(0, 4).map((t) => (
                  <Badge key={t}>{t}</Badge>
                ))}
              </div>
            )}
          </button>
        ) : (
          <EmptyState icon={<DoodleFolderIcon className="w-8 h-8" />} title="No projects yet" message="Projects added in the Developer Hub will appear here." />
        )}
      </Card>

      {/* Counts */}
      <div className="grid grid-cols-2 gap-2.5">
        {stats.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => open(s.app, s.title)}
            aria-label={`${s.value} ${s.label}. Open ${s.title}`}
            className="rounded-xl border-2 border-line bg-surface p-3 text-left shadow-doodle-sm hover:bg-surface-3 cursor-pointer transition"
          >
            <span className="block text-2xl font-bold leading-none">{dataStatus === 'loading' ? '–' : s.value}</span>
            <span className="block text-2xs font-bold uppercase tracking-wider text-fg-muted mt-1">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Quick links (only those present in the profile) */}
      {(links.length > 0 || profile.email || profile.resumeUrl) && !placeholder && (
        <Card shadow="sm" className="p-4">
          <WidgetTitle icon={<Link2 className="w-4 h-4" />}>Quick links</WidgetTitle>
          <div className="flex flex-wrap gap-2">
            {links.map((l) => (
              <Button key={l.id} size="sm" variant="secondary" onClick={() => openExternal(l.url)} aria-label={`${l.label} (opens in a new tab)`}>
                {l.label}
              </Button>
            ))}
            {profile.email && (
              <Button size="sm" variant="secondary" icon={<Mail className="w-3.5 h-3.5" aria-hidden />} onClick={() => window.location.assign(`mailto:${profile.email}`)}>
                Email
              </Button>
            )}
            {profile.resumeUrl && (
              <Button size="sm" variant="primary" icon={<FileDown className="w-3.5 h-3.5" aria-hidden />} onClick={() => openExternal(profile.resumeUrl as string)}>
                Download CV
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Tips */}
      <Card shadow="sm" tone="highlight" className="p-4">
        <h3 className="flex items-center gap-2 text-2xs font-bold uppercase tracking-wider mb-2">
          <Lightbulb className="w-4 h-4" aria-hidden /> Try this
        </h3>
        <ul className="text-xs leading-relaxed flex flex-col gap-1.5 list-disc pl-4">
          <li>
            Type <code className="font-mono bg-surface-2 text-fg px-1 rounded">help</code> in the{' '}
            <button type="button" className="underline decoration-dashed font-bold cursor-pointer" onClick={() => open('terminal', 'Aura Terminal')}>
              Terminal
            </button>
            .
          </li>
          <li>
            <button
              type="button"
              className="underline decoration-dashed font-bold cursor-pointer"
              onClick={() => {
                closeWidgets();
                setActiveChatPartner('robot');
                setIsChatInputOpen(true);
              }}
            >
              Chat with the robot
            </button>{' '}
            and ask about projects or skills.
          </li>
          <li>Right-click the desktop to change the icon size.</li>
        </ul>
      </Card>
    </div>
  );
}

export function WidgetsPanel() {
  const isWidgetsOpen = useOSStore((s) => s.isWidgetsOpen);
  const closeWidgets = useOSStore((s) => s.closeWidgets);
  const panelRef = useRef<HTMLDivElement>(null);

  useDismiss(panelRef, isWidgetsOpen, closeWidgets, '[data-trigger="widgets"]');

  return (
    <AnimatePresence>
      {isWidgetsOpen && (
        <motion.aside
          ref={panelRef}
          role="dialog"
          aria-label="Widgets"
          initial={{ x: '-105%' }}
          animate={{ x: 0 }}
          exit={{ x: '-105%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 240 }}
          onClick={(e) => e.stopPropagation()}
          className="fixed top-0 left-0 bottom-taskbar w-full sm:w-[400px] sm:rounded-r-2xl border-r-[2.5px] border-y-[2.5px] sm:border-t-0 border-line bg-surface-2 text-fg shadow-doodle-lg z-[9000] flex flex-col font-doodle select-none"
        >
          <header className="flex items-center justify-between px-5 py-3.5 border-b-2 border-line bg-surface">
            <h2 className="text-base font-bold">Widgets</h2>
            <IconButton label="Close widgets" size="sm" onClick={closeWidgets}>
              <X className="w-3.5 h-3.5" />
            </IconButton>
          </header>
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5">
            <WidgetsContent />
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
