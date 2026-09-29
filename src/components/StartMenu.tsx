'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Power, Lock, ChevronLeft, ChevronRight, Sparkles, Wrench, Palette, Volume2, Link2 } from 'lucide-react';

import { useOSStore } from '@/lib/store';
import { OS_VERSION } from '@/lib/data';
import { APP_BY_ID, LAUNCHER_APPS } from '@/hooks/appRegistry';
import { useDismiss } from '@/hooks/useDismiss';
import { getProfileLinks, isPlaceholderProfile, openExternal } from '@/hooks/useProfileLinks';
import { Badge, EmptyState, IconButton, cx } from '@/components/ui/primitives';
import { DoodleSearchIcon, DoodleFolderIcon, DoodleLinkIcon } from '@/components/ui/DoodleIcons';

type ResultGroup = 'Apps' | 'Projects' | 'Skills' | 'Settings' | 'Links';

interface SearchResult {
  key: string;
  group: ResultGroup;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  action: () => void;
}

const GROUP_ORDER: ResultGroup[] = ['Apps', 'Projects', 'Skills', 'Settings', 'Links'];
const MAX_PER_GROUP = 6;

const tileClass =
  'border-2 border-line bg-surface hover:bg-surface-3 rounded-2xl shadow-doodle-sm transition cursor-pointer font-doodle text-fg ' +
  'hover:-translate-y-0.5 active:translate-y-0 focus-visible:shadow-doodle';

export function StartMenu() {
  const startMenuOpen = useOSStore((s) => s.startMenuOpen);
  const closeStartMenu = useOSStore((s) => s.closeStartMenu);

  return <AnimatePresence>{startMenuOpen && <StartMenuPanel onClose={closeStartMenu} />}</AnimatePresence>;
}

function StartMenuPanel({ onClose }: { onClose: () => void }) {
  const openWindow = useOSStore((s) => s.openWindow);
  const recentlyOpened = useOSStore((s) => s.recentlyOpened);
  const startMenuSearchFocused = useOSStore((s) => s.startMenuSearchFocused);
  const setStartMenuSearchFocused = useOSStore((s) => s.setStartMenuSearchFocused);
  const profile = useOSStore((s) => s.profile);
  const projects = useOSStore((s) => s.projects);
  const skills = useOSStore((s) => s.skills);
  const dataStatus = useOSStore((s) => s.dataStatus);
  const showConfirm = useOSStore((s) => s.showConfirm);
  const lockScreen = useOSStore((s) => s.lockScreen);
  const setSelectedProjectId = useOSStore((s) => s.setSelectedProjectId);

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'pinned' | 'allApps'>('pinned');

  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  useDismiss(menuRef, true, onClose, '[data-trigger="start"]');

  // Focus the search box on open (and again when the taskbar search button is used)
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (startMenuSearchFocused) {
      inputRef.current?.focus();
      setStartMenuSearchFocused(false);
    }
  }, [startMenuSearchFocused, setStartMenuSearchFocused]);

  const openApp = useCallback(
    (id: string) => {
      openWindow(id, APP_BY_ID[id]?.title);
      onClose();
    },
    [openWindow, onClose],
  );

  const links = useMemo(() => getProfileLinks(profile), [profile]);
  const placeholder = isPlaceholderProfile(profile);

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const has = (...fields: Array<string | null | undefined>) => fields.some((f) => f?.toLowerCase().includes(q));
    const out: SearchResult[] = [];

    LAUNCHER_APPS.filter((a) => has(a.title, a.desc, a.id)).forEach((a) =>
      out.push({ key: `app-${a.id}`, group: 'Apps', title: a.title, subtitle: a.desc, icon: <a.Icon className="w-5 h-5" />, action: () => openApp(a.id) }),
    );

    projects
      .filter((p) => has(p.title, ...(p.tags ?? [])))
      .slice(0, MAX_PER_GROUP)
      .forEach((p) =>
        out.push({
          key: `project-${p.id}`,
          group: 'Projects',
          title: p.title,
          subtitle: p.tags?.length ? p.tags.join(' · ') : p.description,
          icon: <DoodleFolderIcon className="w-5 h-5" />,
          action: () => {
            setSelectedProjectId(p.id);
            openApp('projects');
          },
        }),
      );

    const skillHits: SearchResult[] = [];
    skills.forEach((g) => {
      const categoryHit = has(g.category);
      g.skills.forEach((skill) => {
        if (categoryHit || has(skill)) {
          skillHits.push({
            key: `skill-${g.category}-${skill}`,
            group: 'Skills',
            title: skill,
            subtitle: `${g.category} · shown in Bio.txt`,
            icon: <Wrench className="w-4 h-4" aria-hidden />,
            action: () => openApp('bio'),
          });
        }
      });
    });
    out.push(...skillHits.slice(0, MAX_PER_GROUP));

    const settings: Array<Omit<SearchResult, 'group'> & { terms: string }> = [
      { key: 'set-wallpaper', title: 'Change wallpaper', subtitle: 'Settings → Personalization', terms: 'wallpaper background theme dark light mode', icon: <Palette className="w-4 h-4" aria-hidden />, action: () => openApp('settings') },
      { key: 'set-volume', title: 'Companion speech volume', subtitle: 'Settings → Companions', terms: 'sound volume speech audio mute', icon: <Volume2 className="w-4 h-4" aria-hidden />, action: () => openApp('settings') },
      { key: 'set-pets', title: 'Companion pets', subtitle: 'Spawn, size and speed in Frieren.exe', terms: 'pet pets companion frieren fern stark spawn', icon: <Sparkles className="w-4 h-4" aria-hidden />, action: () => openApp('frieren') },
      { key: 'set-lock', title: 'Lock screen', subtitle: 'Show the lock screen', terms: 'lock screen sign out', icon: <Lock className="w-4 h-4" aria-hidden />, action: () => { onClose(); lockScreen(); } },
    ];
    settings.filter((s) => has(s.title, s.subtitle, s.terms)).forEach((s) => out.push({ key: s.key, group: 'Settings', title: s.title, subtitle: s.subtitle, icon: s.icon, action: s.action }));

    links.filter((l) => has(l.label, l.url)).forEach((l) =>
      out.push({
        key: `link-${l.id}`,
        group: 'Links',
        title: l.label,
        subtitle: l.url,
        icon: <DoodleLinkIcon className="w-5 h-5" />,
        action: () => {
          openExternal(l.url);
          onClose();
        },
      }),
    );

    return GROUP_ORDER.flatMap((g) => out.filter((r) => r.group === g));
  }, [query, projects, skills, links, openApp, setSelectedProjectId, lockScreen, onClose]);

  const safeIndex = Math.min(selectedIndex, Math.max(0, results.length - 1));
  const selected = results[safeIndex];

  // Keep the highlighted result visible while navigating with the keyboard
  useEffect(() => {
    if (!selected) return;
    listRef.current?.querySelector<HTMLElement>(`[data-result-key="${CSS.escape(selected.key)}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && results.length) {
      e.preventDefault();
      setSelectedIndex((safeIndex + 1) % results.length);
    } else if (e.key === 'ArrowUp' && results.length) {
      e.preventDefault();
      setSelectedIndex((safeIndex - 1 + results.length) % results.length);
    } else if (e.key === 'Enter' && selected) {
      e.preventDefault();
      selected.action();
    } else if (e.key === 'Escape' && query) {
      // First Escape clears the query; the second one (handled by useDismiss) closes the menu
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
      setQuery('');
    }
  };

  const recentItems = recentlyOpened.map((id) => APP_BY_ID[id]).filter((a) => a && a.launcher).slice(0, 4);
  const allApps = [...LAUNCHER_APPS].sort((a, b) => a.title.localeCompare(b.title));

  const confirmRestart = () =>
    showConfirm('Restart Aura OS?', 'The page will reload and any unsaved changes in open windows will be lost.', () => window.location.reload(), {
      confirmLabel: 'Restart',
      tone: 'danger',
    });

  return (
    <motion.div
      ref={menuRef}
      role="dialog"
      aria-label="Start menu"
      initial={{ opacity: 0, y: 60, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 60, scale: 0.96 }}
      transition={{ type: 'spring', damping: 24, stiffness: 240 }}
      onClick={(e) => e.stopPropagation()}
      className="fixed left-1/2 -translate-x-1/2 bottom-[calc(var(--spacing-taskbar)+0.5rem)] z-[9000] w-[calc(100vw-1rem)] sm:w-[610px] h-[min(620px,calc(100dvh-var(--spacing-taskbar)-1.5rem))] bg-surface text-fg border-[2.5px] border-line rounded-2xl shadow-doodle-lg p-3 sm:p-4 flex flex-col gap-3 overflow-hidden select-none font-doodle"
    >
      {/* Search */}
      <div className="relative flex items-center shrink-0">
        <DoodleSearchIcon className="absolute left-3 w-5 h-5 pointer-events-none" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={!!query}
          aria-controls={listboxId}
          aria-activedescendant={selected ? `${listboxId}-${safeIndex}` : undefined}
          aria-label="Search apps, projects, skills and settings"
          placeholder="Search apps, projects, skills..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(0);
          }}
          onKeyDown={onSearchKeyDown}
          className="w-full h-11 pl-10 pr-4 rounded-xl border-2 border-line bg-surface-2 text-sm text-fg font-mono placeholder:text-fg-muted/70 shadow-doodle-sm outline-none focus:bg-surface focus:shadow-doodle transition"
        />
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 flex flex-col">
        {query ? (
          results.length > 0 ? (
            <div className="flex gap-3 h-full min-h-0">
              <div ref={listRef} id={listboxId} role="listbox" aria-label="Search results" className="flex-1 min-w-0 overflow-y-auto pr-1 flex flex-col gap-1.5">
                {GROUP_ORDER.map((group) => {
                  const items = results.map((r, i) => ({ r, i })).filter(({ r }) => r.group === group);
                  if (items.length === 0) return null;
                  return (
                    <div key={group} role="group" aria-label={group} className="flex flex-col gap-1.5">
                      <div className="text-2xs font-bold uppercase tracking-wider text-fg-muted px-1 pt-1">{group}</div>
                      {items.map(({ r, i }) => (
                        <div
                          key={r.key}
                          id={`${listboxId}-${i}`}
                          data-result-key={r.key}
                          role="option"
                          aria-selected={i === safeIndex}
                          onMouseEnter={() => setSelectedIndex(i)}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={r.action}
                          className={cx(
                            'w-full flex items-center gap-3 p-2.5 rounded-xl border-2 cursor-pointer text-left transition',
                            i === safeIndex ? 'bg-highlight text-ink border-ink shadow-doodle-sm' : 'bg-surface-2 text-fg border-line hover:bg-surface-3',
                          )}
                        >
                          <span className="shrink-0 w-8 h-8 rounded-lg border-2 border-line bg-surface flex items-center justify-center text-fg">{r.icon}</span>
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm font-bold truncate">{r.title}</span>
                            <span className={cx('block text-2xs truncate', i === safeIndex ? 'text-ink/75' : 'text-fg-muted')}>{r.subtitle}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>

              {selected && (
                <aside className="w-[200px] hidden sm:flex flex-col justify-between gap-3 p-4 rounded-2xl border-2 border-line bg-surface-2 shadow-doodle-sm">
                  <div className="flex flex-col items-center text-center gap-2.5 min-h-0">
                    <span className="w-14 h-14 rounded-2xl border-2 border-line bg-surface flex items-center justify-center shadow-doodle-xs [&>svg]:w-7 [&>svg]:h-7">{selected.icon}</span>
                    <h4 className="text-sm font-bold break-words">{selected.title}</h4>
                    <Badge tone="highlight">{selected.group}</Badge>
                    <p className="text-xs text-fg-muted leading-relaxed overflow-y-auto pt-2 border-t-2 border-dashed border-line/40 w-full break-words">{selected.subtitle}</p>
                  </div>
                  <button
                    type="button"
                    onClick={selected.action}
                    className="w-full h-9 rounded-xl border-2 border-ink bg-highlight hover:bg-highlight-strong text-ink text-xs font-bold shadow-doodle-sm cursor-pointer"
                  >
                    {selected.group === 'Links' ? 'Open link' : selected.group === 'Projects' ? 'View project' : 'Open'}
                  </button>
                </aside>
              )}
            </div>
          ) : (
            <EmptyState
              icon={<DoodleSearchIcon className="w-8 h-8" />}
              title={`No matches for "${query}"`}
              message={dataStatus === 'loading' ? 'Portfolio data is still loading...' : 'Try an app name, a project, a technology or a setting.'}
            />
          )
        ) : viewMode === 'allApps' ? (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex justify-between items-center mb-3">
              <button
                type="button"
                onClick={() => setViewMode('pinned')}
                className="flex items-center gap-1 text-xs font-bold text-fg hover:underline cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden />
                Back
              </button>
              <span className="text-xs font-bold uppercase tracking-wider text-fg-muted">All apps</span>
            </div>
            <div role="menu" aria-label="All apps" className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5 content-start">
              {allApps.map((app) => (
                <button key={app.id} type="button" role="menuitem" onClick={() => openApp(app.id)} className={cx(tileClass, 'flex items-center gap-3 p-2.5 text-left')}>
                  <app.Icon className="w-6 h-6 shrink-0" />
                  <span className="min-w-0">
                    <span className="block text-xs font-bold truncate">{app.title}</span>
                    <span className="block text-2xs text-fg-muted line-clamp-2">{app.desc}</span>
                  </span>
                </button>
              ))}
              {links.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  role="menuitem"
                  aria-label={`${l.label} (opens in a new tab)`}
                  onClick={() => {
                    openExternal(l.url);
                    onClose();
                  }}
                  className={cx(tileClass, 'flex items-center gap-3 p-2.5 text-left')}
                >
                  <DoodleLinkIcon className="w-6 h-6 shrink-0" />
                  <span className="min-w-0">
                    <span className="block text-xs font-bold truncate">{l.label}</span>
                    <span className="block text-2xs text-fg-muted truncate">{l.url}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto pr-1">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-bold">Pinned</h2>
              <button
                type="button"
                onClick={() => setViewMode('allApps')}
                className="inline-flex items-center gap-1 h-7 px-2.5 rounded-xl border-2 border-line bg-surface-2 hover:bg-surface-3 text-2xs font-bold shadow-doodle-xs cursor-pointer"
              >
                All apps <ChevronRight className="w-3.5 h-3.5" aria-hidden />
              </button>
            </div>

            <div role="menu" aria-label="Pinned apps" className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {LAUNCHER_APPS.map((app) => (
                <button
                  key={app.id}
                  type="button"
                  role="menuitem"
                  onClick={() => openApp(app.id)}
                  title={app.desc}
                  className={cx(tileClass, 'p-2.5 flex flex-col items-center gap-2 min-w-0')}
                >
                  <app.Icon className="w-8 h-8" />
                  <span className="text-2xs font-bold truncate w-full text-center">{app.title}</span>
                </button>
              ))}
            </div>

            {links.length > 0 && (
              <div className="mt-4">
                <h2 className="text-xs font-bold mb-2 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5" aria-hidden /> Links
                </h2>
                <div role="menu" aria-label="Profile links" className="flex flex-wrap gap-2">
                  {links.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      role="menuitem"
                      aria-label={`${l.label} (opens in a new tab)`}
                      onClick={() => {
                        openExternal(l.url);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl border-2 border-line bg-surface-2 hover:bg-surface-3 text-xs font-bold shadow-doodle-xs cursor-pointer"
                    >
                      <DoodleLinkIcon className="w-4 h-4" />
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 border-t-2 border-dashed border-line/40 pt-3">
              <h2 className="text-xs font-bold mb-2">Recently opened</h2>
              {recentItems.length > 0 ? (
                <div role="menu" aria-label="Recently opened" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {recentItems.map((app) => (
                    <button key={app.id} type="button" role="menuitem" onClick={() => openApp(app.id)} className={cx(tileClass, 'flex items-center gap-3 p-2.5 text-left')}>
                      <app.Icon className="w-6 h-6 shrink-0" />
                      <span className="min-w-0">
                        <span className="block text-xs font-bold truncate">{app.title}</span>
                        <span className="block text-2xs text-fg-muted truncate">{app.desc}</span>
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-fg-muted">Nothing opened yet.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer: profile + power */}
      <div className="shrink-0 h-14 px-3 rounded-2xl border-2 border-line bg-surface-2 flex justify-between items-center gap-2 shadow-doodle-sm">
        <button
          type="button"
          onClick={() => openApp(placeholder ? 'admin' : 'bio')}
          className="flex items-center gap-2.5 min-w-0 text-left rounded-xl px-1 py-1 hover:bg-surface-3 cursor-pointer"
          aria-label={placeholder ? 'Open Developer Hub' : `Open ${profile.name}'s bio`}
        >
          {!placeholder && profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatarUrl} alt="" className="w-9 h-9 rounded-full border-2 border-line object-cover bg-surface" />
          ) : (
            <span aria-hidden className="w-9 h-9 rounded-full border-2 border-ink bg-highlight text-ink flex items-center justify-center text-sm font-bold">
              {placeholder ? 'A' : profile.name.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="leading-tight min-w-0">
            <span className="block text-xs font-bold truncate">{placeholder ? 'Aura OS' : profile.name}</span>
            <span className="block text-2xs text-fg-muted truncate">{placeholder ? `Version ${OS_VERSION}` : profile.title}</span>
          </span>
        </button>

        <div className="flex items-center gap-2 shrink-0">
          <IconButton
            label="Lock screen"
            size="sm"
            onClick={() => {
              onClose();
              lockScreen();
            }}
          >
            <Lock className="w-3.5 h-3.5" />
          </IconButton>
          <IconButton label="Restart Aura OS" size="sm" variant="danger" onClick={confirmRestart}>
            <Power className="w-3.5 h-3.5" />
          </IconButton>
        </div>
      </div>
    </motion.div>
  );
}
