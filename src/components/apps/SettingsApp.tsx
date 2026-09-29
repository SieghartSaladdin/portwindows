'use client';

import React from 'react';
import { Check, Info, Moon, Palette, PawPrint, RefreshCw, Sun } from 'lucide-react';
import { useOSStore } from '@/lib/store';
import { OS_VERSION, WALLPAPERS } from '@/lib/data';
import { Badge, Button, Card, cx } from '@/components/ui/primitives';
import { DoodleSettingsIcon } from '@/components/ui/DoodleIcons';
import { TabNav, panelId, tabId, type TabItem } from './settings/TabNav';
import { CompanionControls } from './settings/CompanionControls';
import { useClientInfo } from './settings/clientInfo';
import { Avatar } from './bio/Avatar';

type TabId = 'personalization' | 'companions' | 'about';

const TABS: TabItem<TabId>[] = [
  { id: 'personalization', label: 'Personalization', icon: <Palette className="w-4 h-4" /> },
  { id: 'companions', label: 'Companions', icon: <PawPrint className="w-4 h-4" /> },
  { id: 'about', label: 'About', icon: <Info className="w-4 h-4" /> },
];

function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="pb-3 border-b-2 border-dashed border-line">
      <h2 className="text-base font-bold">{title}</h2>
      <p className="text-xs text-fg-muted mt-0.5">{subtitle}</p>
    </header>
  );
}

function Personalization() {
  const themeMode = useOSStore((s) => s.themeMode);
  const setThemeMode = useOSStore((s) => s.setThemeMode);
  const wallpaper = useOSStore((s) => s.wallpaper);
  const setWallpaper = useOSStore((s) => s.setWallpaper);

  const themes = [
    { id: 'light' as const, label: 'Light', icon: <Sun className="w-4 h-4" aria-hidden /> },
    { id: 'dark' as const, label: 'Dark', icon: <Moon className="w-4 h-4" aria-hidden /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Personalization" subtitle="Choose a colour theme and the paper your desktop is drawn on." />

      <section aria-labelledby="settings-theme-heading">
        <h3 id="settings-theme-heading" className="text-sm font-bold mb-3">
          Theme
        </h3>
        <div role="radiogroup" aria-labelledby="settings-theme-heading" className="grid grid-cols-2 gap-3 max-w-md">
          {themes.map((t) => {
            const active = themeMode === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setThemeMode(t.id)}
                className={cx(
                  'flex items-center justify-center gap-2 h-12 rounded-xl border-2 text-sm font-bold cursor-pointer transition shadow-doodle-sm',
                  active ? 'bg-highlight text-ink border-ink' : 'bg-surface text-fg border-line hover:bg-surface-3',
                )}
              >
                {t.icon}
                {t.label}
                {active && <Check className="w-4 h-4" aria-hidden />}
              </button>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="settings-wallpaper-heading">
        <h3 id="settings-wallpaper-heading" className="text-sm font-bold mb-3">
          Wallpaper
        </h3>
        <div role="radiogroup" aria-labelledby="settings-wallpaper-heading" className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-4">
          {WALLPAPERS.map((wp) => {
            const active = wallpaper === wp.id;
            const swatch = themeMode === 'dark' ? wp.swatchDark : wp.swatchLight;
            return (
              <button
                key={wp.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setWallpaper(wp.id)}
                className={cx(
                  'relative flex flex-col gap-2.5 p-3 rounded-2xl border-[2.5px] text-left cursor-pointer transition shadow-doodle-sm',
                  active ? 'bg-highlight text-ink border-ink' : 'bg-surface text-fg border-line hover:bg-surface-3',
                )}
              >
                <span
                  aria-hidden
                  className="block w-full h-20 rounded-xl border-2 border-line"
                  style={{
                    backgroundColor: swatch,
                    backgroundImage:
                      'linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)',
                    backgroundSize: '12px 12px',
                  }}
                />
                <span className="flex items-center justify-between gap-2 text-xs font-bold">
                  {wp.name}
                  {active && (
                    <span className="inline-flex items-center gap-1 text-2xs">
                      <Check className="w-3.5 h-3.5" aria-hidden /> In use
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-2xs text-fg-muted mt-3">Swatches show the {themeMode} version of each paper.</p>
      </section>
    </div>
  );
}

function Companions() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Companions" subtitle="The little characters living on your desktop." />
      <CompanionControls />
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-[420px]:flex-row min-[420px]:items-center justify-between gap-0.5 min-[420px]:gap-4 py-2.5 border-b-2 border-dashed border-line last:border-b-0">
      <dt className="text-xs text-fg-muted">{label}</dt>
      <dd className="text-xs font-bold break-words min-[420px]:text-right">{children}</dd>
    </div>
  );
}

function About() {
  const profile = useOSStore((s) => s.profile);
  const themeMode = useOSStore((s) => s.themeMode);
  const wallpaper = useOSStore((s) => s.wallpaper);
  const dataStatus = useOSStore((s) => s.dataStatus);
  const fetchDatabaseData = useOSStore((s) => s.fetchDatabaseData);
  const counts = {
    projects: useOSStore((s) => s.projects.length),
    skills: useOSStore((s) => s.skills.reduce((n, g) => n + g.skills.length, 0)),
    experiences: useOSStore((s) => s.experiences.length),
    educations: useOSStore((s) => s.educations.length),
    certifications: useOSStore((s) => s.certifications.length),
  };
  const client = useClientInfo();
  const wallpaperName = WALLPAPERS.find((w) => w.id === wallpaper)?.name ?? wallpaper;

  const statusBadge =
    dataStatus === 'ready' ? (
      <Badge tone="mint">Loaded</Badge>
    ) : dataStatus === 'loading' ? (
      <Badge tone="sky">Loading…</Badge>
    ) : (
      <Badge tone="rose">Failed to load</Badge>
    );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="About" subtitle="What this desktop is running on right now." />

      <Card shadow="sm" className="p-4 flex items-center gap-4">
        <DoodleSettingsIcon className="w-12 h-12 shrink-0" aria-hidden />
        <div className="min-w-0">
          <p className="text-sm font-bold">Aura OS</p>
          <p className="text-xs text-fg-muted">Version {OS_VERSION}</p>
        </div>
      </Card>

      <Card shadow="sm" className="p-4 flex items-center gap-4">
        <Avatar name={profile.name} src={profile.avatarUrl} className="w-12 h-12 text-base" />
        <div className="min-w-0">
          <p className="text-xs text-fg-muted">Owner</p>
          <p className="text-sm font-bold break-words">{dataStatus === 'loading' ? 'Loading…' : profile.name}</p>
          {dataStatus !== 'loading' && profile.title && <p className="text-xs text-fg-muted break-words">{profile.title}</p>}
        </div>
      </Card>

      <Card shadow="sm" className="px-4 py-1">
        <dl>
          <Row label="Browser">{client.browser}</Row>
          <Row label="Platform">{client.platform}</Row>
          <Row label="Screen">{client.screen}</Row>
          <Row label="Window">{client.viewport}</Row>
          <Row label="Theme">{themeMode === 'dark' ? 'Dark' : 'Light'}</Row>
          <Row label="Wallpaper">{wallpaperName}</Row>
          <Row label="Portfolio data">
            <span className="inline-flex items-center gap-2">
              {statusBadge}
              {dataStatus === 'error' && (
                <Button size="sm" onClick={() => fetchDatabaseData()} icon={<RefreshCw className="w-3 h-3" aria-hidden />}>
                  Retry
                </Button>
              )}
            </span>
          </Row>
          {dataStatus === 'ready' && (
            <Row label="Content">
              {counts.projects} projects · {counts.experiences} jobs · {counts.educations} education · {counts.certifications} certifications ·{' '}
              {counts.skills} skills
            </Row>
          )}
        </dl>
      </Card>
    </div>
  );
}

export function SettingsApp() {
  const [tab, setTab] = React.useState<TabId>('personalization');

  return (
    <div className="flex flex-col sm:flex-row h-full bg-surface text-fg font-doodle overflow-hidden">
      <div className="shrink-0 sm:w-52 border-b-2 sm:border-b-0 sm:border-r-2 border-line bg-surface-2 flex flex-col">
        <div className="hidden sm:flex items-center gap-2 px-4 pt-4 pb-1">
          <DoodleSettingsIcon className="w-6 h-6" aria-hidden />
          <span className="text-sm font-bold">Settings</span>
        </div>
        <TabNav idPrefix="settings" label="Settings sections" items={TABS} value={tab} onChange={setTab} />
      </div>

      <div
        role="tabpanel"
        id={panelId('settings', tab)}
        aria-labelledby={tabId('settings', tab)}
        className="flex-1 min-w-0 min-h-0 overflow-y-auto p-4 sm:p-6"
      >
        <div className="max-w-2xl">
          {tab === 'personalization' && <Personalization />}
          {tab === 'companions' && <Companions />}
          {tab === 'about' && <About />}
        </div>
      </div>
    </div>
  );
}
