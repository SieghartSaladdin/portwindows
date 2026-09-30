import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { EMPTY_PROFILE } from './data';
import { pickGreeting } from './greetings';
import type { Profile, Project, SkillGroup, Experience, Education, Certification, PortfolioData } from './types';

export interface OSNotification {
  id: string;
  title: string;
  message: string;
  createdAt: number;
  /** Optional app to open when the notification is clicked */
  appId?: string;
}

export type DataStatus = 'loading' | 'ready' | 'error';

export type DesktopIconSize = 'small' | 'medium' | 'large';
export type DesktopIconSort = 'default' | 'name';

export interface ConfirmOptions {
  confirmLabel?: string;
  cancelLabel?: string;
  /** 'danger' renders the confirm button in the rose/danger style */
  tone?: 'default' | 'danger';
}

export interface WindowState {
  id: string;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  isSnapped?: boolean;
  snapPosition?: 'left' | 'right' | 'top' | 'bottom' | null;
}

export type ChatMode = 'frieren' | 'user';

interface OSStore {
  windows: Record<string, WindowState>;
  focusedWindowId: string | null;
  zIndexCounter: number;
  startMenuOpen: boolean;
  wallpaper: string;
  frierenConfig: {
    isSpawned: boolean;
    spawnFern: boolean;
    spawnStark: boolean;
    scale: number;
    speed: number;
    speechVolume: number;
  };
  frierenSpeech: string | null;
  fernSpeech: string | null;
  starkSpeech: string | null;
  robotSpeech: string | null;
  thinkingLogs: string | null;
  isThinking: boolean;
  isChatInputOpen: boolean;
  activeChatPartner: 'fern' | 'stark' | 'robot' | null;
  /** 'frieren': the visitor plays Frieren (started with E). 'user': plain chat from a click, no Frieren involved. */
  chatMode: ChatMode;
  recentlyOpened: string[];
  startMenuSearchFocused: boolean;
  taskViewOpen: boolean;
  selectedProjectId: string | null;
  themeMode: 'light' | 'dark';
  setThemeMode: (mode: 'light' | 'dark') => void;
  toggleThemeMode: () => void;
  
  // Dynamic Data States
  profile: Profile;
  projects: Project[];
  skills: SkillGroup[];
  experiences: Experience[];
  educations: Education[];
  certifications: Certification[];
  dataStatus: DataStatus;
  setSelectedProjectId: (id: string | null) => void;
  
  isLocked: boolean;
  isWidgetsOpen: boolean;
  isQuickSettingsOpen: boolean;
  isNotificationCenterOpen: boolean;
  notifications: OSNotification[];
  unreadNotificationsCount: number;
  toggleNotificationCenter: () => void;
  closeNotificationCenter: () => void;
  clearNotificationsBadge: () => void;
  pushNotification: (n: Omit<OSNotification, 'id' | 'createdAt'>) => void;
  dismissNotification: (id: string) => void;
  clearNotifications: () => void;
  confirmDialog: {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: (() => void) | null;
    confirmLabel?: string;
    cancelLabel?: string;
    tone?: 'default' | 'danger';
  } | null;

  // Desktop icon preferences (persisted)
  desktopIconSize: DesktopIconSize;
  desktopIconSort: DesktopIconSort;
  setDesktopIconSize: (size: DesktopIconSize) => void;
  setDesktopIconSort: (sort: DesktopIconSort) => void;
  
  // Actions
  openWindow: (id: string, title?: string) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  toggleStartMenu: () => void;
  closeStartMenu: () => void;
  setWallpaper: (wp: string) => void;
  updateFrierenConfig: (config: Partial<{ isSpawned: boolean; spawnFern: boolean; spawnStark: boolean; scale: number; speed: number; speechVolume: number }>) => void;
  setFrierenSpeech: (speech: string | null) => void;
  setFernSpeech: (speech: string | null) => void;
  setStarkSpeech: (speech: string | null) => void;
  setRobotSpeech: (speech: string | null) => void;
  setThinkingLogs: (logs: string | null) => void;
  setIsThinking: (thinking: boolean) => void;
  setIsChatInputOpen: (open: boolean) => void;
  setActiveChatPartner: (partner: 'fern' | 'stark' | 'robot' | null) => void;
  openChat: (partner: 'fern' | 'stark' | 'robot', mode: ChatMode) => void;
  setStartMenuSearchFocused: (focused: boolean) => void;
  toggleTaskView: () => void;
  closeTaskView: () => void;
  showConfirm: (title: string, message: string, onConfirm: () => void, options?: ConfirmOptions) => void;
  closeConfirm: () => void;
  
  // Dynamic Data Actions
  fetchDatabaseData: () => Promise<void>;
  setProfile: (profile: Profile) => void;
  setProjects: (projects: Project[]) => void;
  setSkills: (skills: SkillGroup[]) => void;
  setExperiences: (experiences: Experience[]) => void;
  setEducations: (educations: Education[]) => void;
  setCertifications: (certifications: Certification[]) => void;
  
  // Window geometry actions
  updateWindowPosition: (id: string, x: number, y: number) => void;
  updateWindowSize: (id: string, width: number, height: number) => void;
  setWindowSnap: (id: string, snapped: boolean, snapPosition?: 'left' | 'right' | 'top' | 'bottom' | null) => void;
  
  // System toggle setters/actions
  setIsLocked: (locked: boolean) => void;
  setIsWidgetsOpen: (open: boolean) => void;
  setIsQuickSettingsOpen: (open: boolean) => void;
  toggleQuickSettings: () => void;
  closeQuickSettings: () => void;
  toggleWidgets: () => void;
  closeWidgets: () => void;
  lockScreen: () => void;
  unlockScreen: () => void;
}

const initialWindows: Record<string, WindowState> = {
  bio: { id: 'bio', title: 'Bio.txt', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1 },
  projects: { id: 'projects', title: 'Projects', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1 },
  terminal: { id: 'terminal', title: 'Aura Terminal', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1 },
  settings: { id: 'settings', title: 'Settings', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1 },
  frieren: { id: 'frieren', title: 'Frieren.exe', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1 },
  admin: { id: 'admin', title: 'Developer Hub', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1 },
  projector: { id: 'projector', title: 'Projector Screen', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1 },
};

export const useOSStore = create<OSStore>()(persist((set, get) => ({
  windows: initialWindows,
  focusedWindowId: null,
  zIndexCounter: 10,
  startMenuOpen: false,
  wallpaper: 'default',
  frierenConfig: {
    isSpawned: true,
    spawnFern: true,
    spawnStark: true,
    scale: 64,
    speed: 5,
    speechVolume: 0.5,
  },
  frierenSpeech: null,
  fernSpeech: null,
  starkSpeech: null,
  robotSpeech: null,
  thinkingLogs: null,
  isThinking: false,
  isChatInputOpen: false,
  activeChatPartner: null,
  chatMode: 'user',
  recentlyOpened: ['bio', 'projects', 'terminal'],
  startMenuSearchFocused: false,
  taskViewOpen: false,
  selectedProjectId: null,
  themeMode: 'light',

  setThemeMode: (mode) => {
    set({ themeMode: mode });
  },

  toggleThemeMode: () => {
    set((state) => ({ themeMode: state.themeMode === 'light' ? 'dark' : 'light' }));
  },

  // Initial Dynamic Data (filled by fetchDatabaseData)
  profile: EMPTY_PROFILE,
  projects: [],
  skills: [],
  experiences: [],
  educations: [],
  certifications: [],
  dataStatus: 'loading',

  // System toggles initial state
  isLocked: true,
  isWidgetsOpen: false,
  isQuickSettingsOpen: false,
  confirmDialog: null,

  desktopIconSize: 'medium',
  desktopIconSort: 'default',
  setDesktopIconSize: (size) => set({ desktopIconSize: size }),
  setDesktopIconSort: (sort) => set({ desktopIconSort: sort }),

  openWindow: (id, title) => {
    const nextZIndex = get().zIndexCounter + 1;
    set((state) => {
      const targetWindow = state.windows[id] || {
        id,
        title: title || id.charAt(0).toUpperCase() + id.slice(1),
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        zIndex: 1,
      };
      
      const updatedRecently = [id, ...state.recentlyOpened.filter((item) => item !== id)].slice(0, 6);

      return {
        windows: {
          ...state.windows,
          [id]: {
            ...targetWindow,
            isOpen: true,
            isMinimized: false,
            zIndex: nextZIndex,
          },
        },
        focusedWindowId: id,
        zIndexCounter: nextZIndex,
        startMenuOpen: false,
        recentlyOpened: updatedRecently,
        taskViewOpen: false,
      };
    });
  },

  closeWindow: (id) => {
    set((state) => {
      const updatedWindows = { ...state.windows };
      if (updatedWindows[id]) {
        updatedWindows[id] = {
          ...updatedWindows[id],
          isOpen: false,
          isMinimized: false,
          isMaximized: false,
        };
      }
      
      let nextFocused: string | null = null;
      const openActiveWindows = Object.values(updatedWindows)
        .filter((w) => w.isOpen && !w.isMinimized)
        .sort((a, b) => b.zIndex - a.zIndex);
        
      if (openActiveWindows.length > 0) {
        nextFocused = openActiveWindows[0].id;
      }

      return {
        windows: updatedWindows,
        focusedWindowId: nextFocused,
      };
    });
  },

  minimizeWindow: (id) => {
    set((state) => {
      const updatedWindows = { ...state.windows };
      if (updatedWindows[id]) {
        updatedWindows[id] = {
          ...updatedWindows[id],
          isMinimized: true,
        };
      }

      let nextFocused: string | null = null;
      const openActiveWindows = Object.values(updatedWindows)
        .filter((w) => w.isOpen && !w.isMinimized && w.id !== id)
        .sort((a, b) => b.zIndex - a.zIndex);

      if (openActiveWindows.length > 0) {
        nextFocused = openActiveWindows[0].id;
      }

      return {
        windows: updatedWindows,
        focusedWindowId: nextFocused,
      };
    });
  },

  maximizeWindow: (id) => {
    set((state) => {
      const updatedWindows = { ...state.windows };
      if (updatedWindows[id]) {
        updatedWindows[id] = {
          ...updatedWindows[id],
          isMaximized: !updatedWindows[id].isMaximized,
        };
      }
      
      const nextZIndex = state.zIndexCounter + 1;
      if (updatedWindows[id]) {
        updatedWindows[id].zIndex = nextZIndex;
      }

      return {
        windows: updatedWindows,
        focusedWindowId: id,
        zIndexCounter: nextZIndex,
      };
    });
  },

  focusWindow: (id) => {
    const { focusedWindowId, zIndexCounter } = get();
    if (focusedWindowId === id) {
      set({ taskViewOpen: false });
      return;
    }

    const nextZIndex = zIndexCounter + 1;
    set((state) => {
      const updatedWindows = { ...state.windows };
      if (updatedWindows[id]) {
        updatedWindows[id] = {
          ...updatedWindows[id],
          isOpen: true,
          isMinimized: false,
          zIndex: nextZIndex,
        };
      }

      return {
        windows: updatedWindows,
        focusedWindowId: id,
        zIndexCounter: nextZIndex,
        taskViewOpen: false,
      };
    });
  },

  toggleStartMenu: () => {
    set((state) => ({ startMenuOpen: !state.startMenuOpen }));
  },

  closeStartMenu: () => {
    set({ startMenuOpen: false });
  },
  setWallpaper: (wp: string) => {
    set({ wallpaper: wp });
  },
  updateFrierenConfig: (config) => {
    set((state) => ({
      frierenConfig: {
        ...state.frierenConfig,
        ...config,
      },
    }));
  },
  setFrierenSpeech: (speech) => {
    set({ frierenSpeech: speech });
  },
  setFernSpeech: (speech) => {
    set({ fernSpeech: speech });
  },
  setStarkSpeech: (speech) => {
    set({ starkSpeech: speech });
  },
  setRobotSpeech: (speech) => {
    set({ robotSpeech: speech });
  },
  setThinkingLogs: (logs) => {
    set({ thinkingLogs: logs });
  },
  setIsThinking: (thinking) => {
    set({ isThinking: thinking });
  },
  setIsChatInputOpen: (open) => {
    set({ isChatInputOpen: open });
  },
  setActiveChatPartner: (partner) => {
    set({ activeChatPartner: partner });
  },
  openChat: (partner, mode) => {
    const alreadyOpen = get().isChatInputOpen && get().activeChatPartner === partner;
    set({ activeChatPartner: partner, chatMode: mode, isChatInputOpen: true });
    // Pressing E puts the visitor in Frieren's shoes, so the partner opens with a greeting
    if (mode === 'frieren' && !alreadyOpen) {
      const greeting = pickGreeting(partner);
      if (partner === 'fern') set({ fernSpeech: greeting });
      else if (partner === 'stark') set({ starkSpeech: greeting });
      else set({ robotSpeech: greeting });
    }
  },
  setStartMenuSearchFocused: (focused) => {
    set({ startMenuSearchFocused: focused });
  },
  toggleTaskView: () => {
    set((state) => ({ taskViewOpen: !state.taskViewOpen }));
  },
  closeTaskView: () => {
    set({ taskViewOpen: false });
  },

  // Dynamic Data Actions Implementation
  fetchDatabaseData: async () => {
    set({ dataStatus: 'loading' });
    try {
      const res = await fetch('/api/portfolio', { cache: 'no-store' });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data: PortfolioData = await res.json();
      set({
        profile: data.profile || EMPTY_PROFILE,
        projects: data.projects || [],
        skills: data.skills || [],
        experiences: data.experiences || [],
        educations: data.educations || [],
        certifications: data.certifications || [],
        dataStatus: 'ready',
      });
    } catch (error) {
      console.warn('Failed to load portfolio data:', error);
      set({ dataStatus: 'error' });
    }
  },
  setProfile: (profile) => set({ profile }),
  setProjects: (projects) => set({ projects }),
  setSkills: (skills) => set({ skills }),
  setExperiences: (experiences) => set({ experiences }),
  setEducations: (educations) => set({ educations }),
  setCertifications: (certifications) => set({ certifications }),
  setSelectedProjectId: (id) => set({ selectedProjectId: id }),

  // Window geometry action implementations
  updateWindowPosition: (id, x, y) => {
    set((state) => {
      const w = state.windows[id];
      if (!w) return state;
      return {
        windows: {
          ...state.windows,
          [id]: { ...w, x, y }
        }
      };
    });
  },
  updateWindowSize: (id, width, height) => {
    set((state) => {
      const w = state.windows[id];
      if (!w) return state;
      return {
        windows: {
          ...state.windows,
          [id]: { ...w, width, height }
        }
      };
    });
  },
  setWindowSnap: (id, snapped, snapPosition = null) => {
    set((state) => {
      const w = state.windows[id];
      if (!w) return state;
      return {
        windows: {
          ...state.windows,
          [id]: { ...w, isSnapped: snapped, snapPosition }
        }
      };
    });
  },

  // System toggle setters implementation
  setIsLocked: (locked) => set({ isLocked: locked }),
  setIsWidgetsOpen: (open) => set({ isWidgetsOpen: open }),
  setIsQuickSettingsOpen: (open) => set({ isQuickSettingsOpen: open }),

  isNotificationCenterOpen: false,
  notifications: [],
  unreadNotificationsCount: 0,
  toggleNotificationCenter: () => {
    set((state) => ({
      isNotificationCenterOpen: !state.isNotificationCenterOpen,
      unreadNotificationsCount: 0,
      isQuickSettingsOpen: false,
      startMenuOpen: false,
      taskViewOpen: false,
      isWidgetsOpen: false,
    }));
  },
  closeNotificationCenter: () => {
    set({ isNotificationCenterOpen: false });
  },
  clearNotificationsBadge: () => {
    set({ unreadNotificationsCount: 0 });
  },
  pushNotification: (n) => {
    const notification: OSNotification = {
      ...n,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: Date.now(),
    };
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 20),
      unreadNotificationsCount: state.isNotificationCenterOpen ? state.unreadNotificationsCount : state.unreadNotificationsCount + 1,
    }));
  },
  dismissNotification: (id) => {
    set((state) => ({ notifications: state.notifications.filter((n) => n.id !== id) }));
  },
  clearNotifications: () => {
    set({ notifications: [], unreadNotificationsCount: 0 });
  },

  toggleQuickSettings: () => {
    set((state) => ({ 
      isQuickSettingsOpen: !state.isQuickSettingsOpen,
      isNotificationCenterOpen: false,
      startMenuOpen: false,
      taskViewOpen: false,
      isWidgetsOpen: false
    }));
  },
  closeQuickSettings: () => {
    set({ isQuickSettingsOpen: false });
  },
  toggleWidgets: () => {
    set((state) => ({ 
      isWidgetsOpen: !state.isWidgetsOpen,
      startMenuOpen: false,
      taskViewOpen: false,
      isQuickSettingsOpen: false
    }));
  },
  closeWidgets: () => {
    set({ isWidgetsOpen: false });
  },
  lockScreen: () => {
    set({ isLocked: true });
  },
  unlockScreen: () => {
    set({ isLocked: false });
  },
  showConfirm: (title, message, onConfirm, options) => {
    set({
      confirmDialog: {
        isOpen: true,
        title,
        message,
        onConfirm,
        ...options,
      }
    });
  },
  closeConfirm: () => {
    set({ confirmDialog: null });
  },
}), {
  name: 'aura-os-settings',
  version: 1,
  storage: createJSONStorage(() => localStorage),
  // Only user preferences survive a reload; window/session state always starts fresh.
  partialize: (state) => ({
    themeMode: state.themeMode,
    wallpaper: state.wallpaper,
    frierenConfig: state.frierenConfig,
    desktopIconSize: state.desktopIconSize,
    desktopIconSort: state.desktopIconSort,
  }),
  // Rehydrated manually in ThemeSync after mount to avoid SSR hydration mismatches.
  skipHydration: true,
}));
