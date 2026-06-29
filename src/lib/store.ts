import { create } from 'zustand';
import { PROFILE, PROJECTS, SKILLS, EXPERIENCES } from './data';

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
  thinkingLogs: string | null;
  isThinking: boolean;
  isChatInputOpen: boolean;
  activeChatPartner: 'fern' | 'stark' | null;
  recentlyOpened: string[];
  startMenuSearchFocused: boolean;
  taskViewOpen: boolean;
  
  // Dynamic Data States
  profile: { name: string; title: string; location: string; email: string; bio: string; githubUrl?: string; linkedinUrl?: string };
  projects: any[];
  skills: any[];
  experiences: any[];
  
  // System Toggles
  isLocked: boolean;
  isWidgetsOpen: boolean;
  isQuickSettingsOpen: boolean;
  
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
  setThinkingLogs: (logs: string | null) => void;
  setIsThinking: (thinking: boolean) => void;
  setIsChatInputOpen: (open: boolean) => void;
  setActiveChatPartner: (partner: 'fern' | 'stark' | null) => void;
  setStartMenuSearchFocused: (focused: boolean) => void;
  toggleTaskView: () => void;
  closeTaskView: () => void;
  
  // Dynamic Data Actions
  fetchDatabaseData: () => Promise<void>;
  setProfile: (profile: any) => void;
  setProjects: (projects: any[]) => void;
  setSkills: (skills: any[]) => void;
  setExperiences: (experiences: any[]) => void;
  
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
  terminal: { id: 'terminal', title: 'Command Prompt', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1 },
  settings: { id: 'settings', title: 'Settings', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1 },
  frieren: { id: 'frieren', title: 'Frieren.exe', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1 },
  admin: { id: 'admin', title: 'Admin Dashboard', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1 },
};

export const useOSStore = create<OSStore>((set, get) => ({
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
  thinkingLogs: null,
  isThinking: false,
  isChatInputOpen: false,
  activeChatPartner: null,
  recentlyOpened: ['bio', 'projects', 'terminal'],
  startMenuSearchFocused: false,
  taskViewOpen: false,

  // Initial Dynamic Data
  profile: PROFILE,
  projects: PROJECTS,
  skills: SKILLS,
  experiences: EXPERIENCES,

  // System toggles initial state
  isLocked: true,
  isWidgetsOpen: false,
  isQuickSettingsOpen: false,

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
    try {
      const res = await fetch('/api/portfolio');
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      if (!data || (!data.profile && !data.projects?.length)) {
        throw new Error('API returned empty portfolio');
      }
      set({
        profile: data.profile || PROFILE,
        projects: data.projects || PROJECTS,
        skills: data.skills || SKILLS,
        experiences: data.experiences || EXPERIENCES,
      });
    } catch (error) {
      console.warn('Failed to fetch dynamic portfolio, using static fallback:', error);
      set({
        profile: PROFILE,
        projects: PROJECTS,
        skills: SKILLS,
        experiences: EXPERIENCES,
      });
    }
  },
  setProfile: (profile) => set({ profile }),
  setProjects: (projects) => set({ projects }),
  setSkills: (skills) => set({ skills }),
  setExperiences: (experiences) => set({ experiences }),

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

  toggleQuickSettings: () => {
    set((state) => ({ 
      isQuickSettingsOpen: !state.isQuickSettingsOpen,
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
}));
