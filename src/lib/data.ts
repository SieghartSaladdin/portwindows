import type { Profile } from './types';

export type { Profile, Project, Experience, SkillGroup, Education, Certification, ContactMessage, PortfolioData } from './types';

export interface DesktopIcon {
  id: string;
  title: string;
  iconType: 'settings' | 'notepad' | 'folder' | 'terminal' | 'browser' | 'game';
  action: 'openApp' | 'openLink';
  appId?: string;
  /** For openLink icons: which profile field holds the URL. Icons whose field is empty are hidden. */
  profileLink?: 'githubUrl' | 'linkedinUrl' | 'websiteUrl';
}

export const DESKTOP_ICONS: DesktopIcon[] = [
  { id: 'bio', title: 'Bio.txt', iconType: 'notepad', action: 'openApp', appId: 'bio' },
  { id: 'projects', title: 'Projects', iconType: 'folder', action: 'openApp', appId: 'projects' },
  { id: 'terminal', title: 'Terminal', iconType: 'terminal', action: 'openApp', appId: 'terminal' },
  { id: 'frieren', title: 'Frieren.exe', iconType: 'game', action: 'openApp', appId: 'frieren' },
  { id: 'settings', title: 'Settings', iconType: 'settings', action: 'openApp', appId: 'settings' },
  { id: 'github', title: 'GitHub', iconType: 'browser', action: 'openLink', profileLink: 'githubUrl' },
  { id: 'linkedin', title: 'LinkedIn', iconType: 'browser', action: 'openLink', profileLink: 'linkedinUrl' },
];

/** Neutral profile used before the database responds (and as the seed row). Never shown as real content. */
export const EMPTY_PROFILE: Profile = {
  name: 'Portfolio Owner',
  title: 'Developer',
  location: '',
  email: '',
  bio: 'This bio has not been written yet. Sign in to the Developer Hub to add your story.',
  githubUrl: null,
  linkedinUrl: null,
  websiteUrl: null,
  phone: null,
  avatarUrl: null,
  resumeUrl: null,
};

/** Desktop wallpapers. The id is written to <html data-wallpaper> and tints --paper in globals.css. */
export const WALLPAPERS = [
  { id: 'default', name: 'Lemon Paper', swatchLight: '#fefce8', swatchDark: '#181716' },
  { id: 'sunset', name: 'Sunset Rose', swatchLight: '#fff1f2', swatchDark: '#2a1215' },
  { id: 'emerald', name: 'Mint Garden', swatchLight: '#ecfdf5', swatchDark: '#092017' },
  { id: 'cyberpunk', name: 'Lilac Night', swatchLight: '#f5f3ff', swatchDark: '#22102b' },
] as const;

export type WallpaperId = (typeof WALLPAPERS)[number]['id'];

/** Single source of truth for the OS version string shown across the UI. */
export const OS_VERSION = '1.0.0';

