import React from 'react';
import {
  DoodleBioIcon,
  DoodleFolderIcon,
  DoodleTerminalIcon,
  DoodleSettingsIcon,
  DoodlePetIcon,
  DoodleAdminIcon,
  DoodleProjectorIcon,
} from '@/components/ui/DoodleIcons';

export interface AppMeta {
  id: string;
  title: string;
  /** Short description used by Start menu search / recent list */
  desc: string;
  Icon: (props: { className?: string }) => React.ReactElement;
  /** Default window size on desktop (clamped to the viewport by WindowContainer) */
  width: number;
  height: number;
  /** Shown in the Start menu / taskbar launchers. Projector opens from a project instead. */
  launcher: boolean;
}

/** Single source of truth for app titles, icons and descriptions across the shell. */
export const APPS: AppMeta[] = [
  { id: 'bio', title: 'Bio.txt', desc: 'About me: bio, experience, education, certifications and contact.', Icon: DoodleBioIcon, width: 820, height: 580, launcher: true },
  { id: 'projects', title: 'Projects', desc: 'Browse portfolio projects, tech stacks and links.', Icon: DoodleFolderIcon, width: 1150, height: 700, launcher: true },
  { id: 'terminal', title: 'Aura Terminal', desc: 'Command line for the portfolio. Type `help` to see every command.', Icon: DoodleTerminalIcon, width: 880, height: 540, launcher: true },
  { id: 'settings', title: 'Settings', desc: 'Theme, wallpaper and companions (including speech volume).', Icon: DoodleSettingsIcon, width: 880, height: 600, launcher: true },
  { id: 'frieren', title: 'Frieren.exe', desc: 'Companion pets: spawn, size and walking speed.', Icon: DoodlePetIcon, width: 720, height: 520, launcher: true },
  { id: 'admin', title: 'Developer Hub', desc: 'Admin dashboard. Sign in with your username and password to edit the portfolio content.', Icon: DoodleAdminIcon, width: 1050, height: 660, launcher: true },
  { id: 'projector', title: 'Projector Screen', desc: 'Presentation view for a selected project.', Icon: DoodleProjectorIcon, width: 1020, height: 620, launcher: false },
];

export const APP_BY_ID: Record<string, AppMeta> = Object.fromEntries(APPS.map((a) => [a.id, a]));

export const LAUNCHER_APPS = APPS.filter((a) => a.launcher);
