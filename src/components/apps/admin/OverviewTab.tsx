'use client';

import React from 'react';
import { useOSStore, type DataStatus } from '@/lib/store';
import { Badge, Button, Card } from '@/components/ui/primitives';
import { DoodleBioIcon, DoodleFolderIcon, DoodleHomeIcon } from '@/components/ui/DoodleIcons';
import { ButtonSpinner, SectionHeader } from './AdminShared';
import { DoodleBadgeIcon, DoodleBriefcaseIcon, DoodleGradCapIcon, DoodleMailIcon, DoodleSparkIcon, IconCheck } from './AdminIcons';
import { useAdminApi } from './useAdminApi';
import type { AdminTab } from './AdminSidebar';

function StatusBadge({ status, ok, fail }: { status: DataStatus; ok: string; fail: string }) {
  if (status === 'loading') {
    return (
      <span className="inline-flex items-center gap-1.5 text-2xs text-fg-muted">
        <ButtonSpinner /> Checking…
      </span>
    );
  }
  return <Badge tone={status === 'ready' ? 'mint' : 'rose'}>{status === 'ready' ? ok : fail}</Badge>;
}

export function OverviewTab({ onNavigate }: { onNavigate: (tab: AdminTab) => void }) {
  const { username, messages, messagesStatus, reloadMessages } = useAdminApi();
  const profile = useOSStore((s) => s.profile);
  const projects = useOSStore((s) => s.projects);
  const skills = useOSStore((s) => s.skills);
  const experiences = useOSStore((s) => s.experiences);
  const educations = useOSStore((s) => s.educations);
  const certifications = useOSStore((s) => s.certifications);
  const dataStatus = useOSStore((s) => s.dataStatus);
  const fetchDatabaseData = useOSStore((s) => s.fetchDatabaseData);

  const unread = messages.filter((m) => !m.read).length;
  const loadingData = dataStatus === 'loading';

  const stats: { tab: AdminTab; label: string; value: number; icon: React.ReactNode; pending: boolean }[] = [
    { tab: 'projects', label: 'Projects', value: projects.length, icon: <DoodleFolderIcon className="w-7 h-7" />, pending: loadingData },
    { tab: 'skills', label: 'Skill groups', value: skills.length, icon: <DoodleSparkIcon className="w-7 h-7" />, pending: loadingData },
    { tab: 'experiences', label: 'Experiences', value: experiences.length, icon: <DoodleBriefcaseIcon className="w-7 h-7" />, pending: loadingData },
    { tab: 'educations', label: 'Education', value: educations.length, icon: <DoodleGradCapIcon className="w-7 h-7" />, pending: loadingData },
    { tab: 'certifications', label: 'Certifications', value: certifications.length, icon: <DoodleBadgeIcon className="w-7 h-7" />, pending: loadingData },
    { tab: 'messages', label: 'Unread messages', value: unread, icon: <DoodleMailIcon className="w-7 h-7" />, pending: messagesStatus === 'loading' },
  ];

  const checklist: { done: boolean; label: string }[] = [
    { done: Boolean(profile.name?.trim() && profile.title?.trim()), label: 'Name and title' },
    { done: Boolean(profile.bio?.trim()), label: 'Bio' },
    { done: Boolean(profile.email?.trim()), label: 'Contact email' },
    { done: Boolean(profile.avatarUrl), label: 'Avatar' },
    { done: Boolean(profile.resumeUrl), label: 'CV / résumé' },
    { done: Boolean(profile.githubUrl || profile.linkedinUrl || profile.websiteUrl), label: 'At least one link' },
  ];
  const missing = checklist.filter((c) => !c.done).length;

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        title="Overview"
        description={username ? `Signed in as ${username}.` : 'Everything in your portfolio at a glance.'}
        icon={<DoodleHomeIcon className="w-6 h-6" />}
      />

      <div className="grid grid-cols-2 @xl:grid-cols-3 gap-3 @xl:gap-4">
        {stats.map((s) => (
          <button
            key={s.tab}
            type="button"
            onClick={() => onNavigate(s.tab)}
            className="text-left rounded-2xl border-[2.5px] border-line bg-surface text-fg shadow-doodle-sm p-3.5 flex items-center gap-3 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-doodle-md"
          >
            <span className="w-11 h-11 shrink-0 rounded-xl border-2 border-line bg-surface-2 flex items-center justify-center">{s.icon}</span>
            <span className="min-w-0 flex flex-col">
              <span className="text-xl font-bold tabular-nums leading-tight">{s.pending ? <ButtonSpinner /> : s.value}</span>
              <span className="text-2xs font-bold uppercase tracking-wider text-fg-muted truncate">{s.label}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="grid gap-4 @2xl:grid-cols-2">
        <Card shadow="sm" className="p-4 flex flex-col gap-3">
          <h2 className="text-sm font-bold">Status</h2>
          <dl className="flex flex-col gap-2.5 text-xs">
            <div className="flex items-center justify-between gap-3 pb-2 border-b-2 border-dashed border-line">
              <dt className="text-fg-muted">Portfolio data</dt>
              <dd><StatusBadge status={dataStatus} ok="Loaded" fail="Not reachable" /></dd>
            </div>
            <div className="flex items-center justify-between gap-3 pb-2 border-b-2 border-dashed border-line">
              <dt className="text-fg-muted">Messages inbox</dt>
              <dd><StatusBadge status={messagesStatus} ok="Loaded" fail="Not reachable" /></dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-fg-muted">Session</dt>
              <dd><Badge tone="mint">Signed in</Badge></dd>
            </div>
          </dl>
          {(dataStatus === 'error' || messagesStatus === 'error') && (
            <Button
              size="sm"
              className="self-start"
              onClick={() => {
                if (dataStatus === 'error') void fetchDatabaseData();
                if (messagesStatus === 'error') void reloadMessages();
              }}
            >
              Try again
            </Button>
          )}
        </Card>

        <Card shadow="sm" className="p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold">Profile checklist</h2>
            {missing === 0 ? <Badge tone="mint">Complete</Badge> : <Badge tone="peach">{missing} to go</Badge>}
          </div>
          <ul className="flex flex-col gap-1.5 text-xs">
            {checklist.map((c) => (
              <li key={c.label} className="flex items-center gap-2">
                <span
                  className={
                    c.done
                      ? 'w-5 h-5 rounded-md border-2 border-ink bg-mint text-ink flex items-center justify-center'
                      : 'w-5 h-5 rounded-md border-2 border-line bg-surface-2'
                  }
                  aria-hidden
                >
                  {c.done && <IconCheck className="w-3 h-3" />}
                </span>
                <span className={c.done ? 'text-fg' : 'text-fg-muted'}>{c.label}</span>
                <span className="sr-only">{c.done ? '(done)' : '(missing)'}</span>
              </li>
            ))}
          </ul>
          {missing > 0 && (
            <Button size="sm" className="self-start" icon={<DoodleBioIcon className="w-4 h-4" />} onClick={() => onNavigate('profile')}>
              Edit profile
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}
