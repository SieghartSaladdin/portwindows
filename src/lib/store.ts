import { create } from 'zustand';

export interface WindowState {
  id: string;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
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
}

const initialWindows: Record<string, WindowState> = {
  bio: { id: 'bio', title: 'Bio.txt', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1 },
  projects: { id: 'projects', title: 'Projects', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1 },
  terminal: { id: 'terminal', title: 'Command Prompt', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1 },
  settings: { id: 'settings', title: 'Settings', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1 },
  frieren: { id: 'frieren', title: 'Frieren.exe', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1 },
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
        startMenuOpen: false, // Close start menu on app opening
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
      
      // Calculate new focused window if needed
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

      // Find next window to focus
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
      
      // Maximize also focuses the window
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
}));
