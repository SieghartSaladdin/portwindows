'use client';

import React from 'react';
import { Badge, IconButton, Button, cx } from '@/components/ui/primitives';
import { DoodleAdminIcon, DoodleBioIcon, DoodleFolderIcon, DoodleHomeIcon } from '@/components/ui/DoodleIcons';
import { ButtonSpinner } from './AdminShared';
import {
  DoodleBadgeIcon,
  DoodleBriefcaseIcon,
  DoodleGradCapIcon,
  DoodleMailIcon,
  DoodleSparkIcon,
  IconLogout,
  IconRefresh,
} from './AdminIcons';

export type AdminTab =
  | 'overview'
  | 'profile'
  | 'projects'
  | 'skills'
  | 'experiences'
  | 'educations'
  | 'certifications'
  | 'messages';

export const ADMIN_TABS: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <DoodleHomeIcon className="w-5 h-5" /> },
  { id: 'profile', label: 'Profile', icon: <DoodleBioIcon className="w-5 h-5" /> },
  { id: 'projects', label: 'Projects', icon: <DoodleFolderIcon className="w-5 h-5" /> },
  { id: 'skills', label: 'Skills', icon: <DoodleSparkIcon className="w-5 h-5" /> },
  { id: 'experiences', label: 'Experience', icon: <DoodleBriefcaseIcon className="w-5 h-5" /> },
  { id: 'educations', label: 'Education', icon: <DoodleGradCapIcon className="w-5 h-5" /> },
  { id: 'certifications', label: 'Certifications', icon: <DoodleBadgeIcon className="w-5 h-5" /> },
  { id: 'messages', label: 'Messages', icon: <DoodleMailIcon className="w-5 h-5" /> },
];

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelect: (tab: AdminTab) => void;
  counts: Partial<Record<AdminTab, number>>;
  unreadMessages: number;
  syncing: boolean;
  onSync: () => void;
  onSignOut: () => void;
}

/**
 * Wide containers (>= 48rem): vertical sidebar.
 * Narrow containers: header row + horizontally scrollable tab strip.
 */
export function AdminSidebar({ activeTab, onSelect, counts, unreadMessages, syncing, onSync, onSignOut }: AdminSidebarProps) {
  return (
    <aside className="shrink-0 flex flex-col bg-surface-2 border-b-[2.5px] border-line @3xl:w-56 @3xl:border-b-0 @3xl:border-r-[2.5px]">
      <div className="flex items-center gap-2 px-3 py-2 @3xl:px-4 @3xl:py-3 border-b-2 border-dashed border-line">
        <DoodleAdminIcon className="w-6 h-6 shrink-0" />
        <span className="font-doodle font-bold text-sm text-fg flex-1 truncate">Developer Hub</span>
        <div className="flex gap-1.5 @3xl:hidden">
          <IconButton size="sm" label="Reload data" onClick={onSync} disabled={syncing}>
            {syncing ? <ButtonSpinner /> : <IconRefresh className="w-3.5 h-3.5" />}
          </IconButton>
          <IconButton size="sm" label="Sign out" onClick={onSignOut}>
            <IconLogout className="w-3.5 h-3.5" />
          </IconButton>
        </div>
      </div>

      <nav aria-label="Admin sections" className="flex gap-1.5 p-2 overflow-x-auto @3xl:flex-col @3xl:flex-1 @3xl:overflow-x-visible @3xl:overflow-y-auto @3xl:p-3">
        {ADMIN_TABS.map((tab) => {
          const active = tab.id === activeTab;
          const count = tab.id === 'messages' ? unreadMessages : counts[tab.id];
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelect(tab.id)}
              aria-current={active ? 'page' : undefined}
              className={cx(
                'shrink-0 flex items-center gap-2 h-9 px-2.5 rounded-xl border-2 text-xs font-bold font-doodle whitespace-nowrap cursor-pointer transition-all',
                active
                  ? 'bg-highlight text-ink border-ink shadow-doodle-sm'
                  : 'bg-transparent text-fg border-transparent hover:bg-surface-3 hover:border-line',
              )}
            >
              {tab.icon}
              <span className="@3xl:flex-1 text-left">{tab.label}</span>
              {tab.id === 'messages'
                ? count
                  ? <Badge tone="rose" aria-label={`${count} unread`}>{count}</Badge>
                  : null
                : typeof count === 'number' && (
                    <span className={cx('text-2xs tabular-nums', active ? 'text-ink' : 'text-fg-muted')}>{count}</span>
                  )}
            </button>
          );
        })}
      </nav>

      <div className="hidden @3xl:flex flex-col gap-2 p-3 border-t-2 border-dashed border-line">
        <Button onClick={onSync} disabled={syncing} icon={syncing ? <ButtonSpinner /> : <IconRefresh className="w-3.5 h-3.5" />}>
          Reload data
        </Button>
        <Button variant="danger" onClick={onSignOut} icon={<IconLogout className="w-3.5 h-3.5" />}>
          Sign out
        </Button>
      </div>
    </aside>
  );
}
