'use client';

import React from 'react';
import { useOSStore } from '@/lib/store';
import { useDateTime } from '@/hooks/useDateTime';
import { 
  Wifi, 
  Volume2, 
  Battery, 
  MessageSquare,
  Bell,
  Tv
} from 'lucide-react';
import { 
  DoodleHomeIcon,
  DoodleSearchIcon,
  DoodleWidgetsIcon,
  DoodleBioIcon,
  DoodleFolderIcon,
  DoodleTerminalIcon,
  DoodleSettingsIcon,
  DoodlePetIcon,
  DoodleAdminIcon
} from '@/components/ui/DoodleIcons';

export function Taskbar() {
  const { 
    windows, 
    focusedWindowId, 
    startMenuOpen, 
    toggleStartMenu, 
    openWindow, 
    minimizeWindow, 
    focusWindow,
    setStartMenuSearchFocused,
    toggleTaskView,
    taskViewOpen,
    isQuickSettingsOpen,
    toggleQuickSettings,
    isWidgetsOpen,
    toggleWidgets,
    themeMode
  } = useOSStore();

  const isDark = themeMode === 'dark';
  const { time, date, fullDate } = useDateTime();

  const appIcons = [
    { id: 'bio', title: 'Bio.txt', icon: <DoodleBioIcon className="w-5 h-5" /> },
    { id: 'projects', title: 'Projects', icon: <DoodleFolderIcon className="w-5 h-5" /> },
    { id: 'terminal', title: 'Aura Terminal', icon: <DoodleTerminalIcon className="w-5 h-5" /> },
    { id: 'settings', title: 'Settings', icon: <DoodleSettingsIcon className="w-5 h-5" /> },
    { id: 'frieren', title: 'Frieren.exe', icon: <DoodlePetIcon className="w-5 h-5" /> },
    { id: 'admin', title: 'Developer Hub', icon: <DoodleAdminIcon className="w-5 h-5" /> },
  ];

  const handleAppClick = (id: string, title: string) => {
    const w = windows[id];
    if (!w || !w.isOpen) {
      openWindow(id, title);
    } else if (w.isMinimized) {
      focusWindow(id);
    } else if (focusedWindowId === id) {
      minimizeWindow(id);
    } else {
      focusWindow(id);
    }
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 w-full h-13 min-h-[52px] border-t-[3px] border-[#2d2a26] shadow-[0px_-4px_0px_0px_#2d2a26] backdrop-blur-xl flex items-center justify-between px-4 select-none ${
      isDark ? 'bg-[#262422]' : 'bg-[#fcf9f2]'
    }`}>
      
      {/* Left indicators (e.g. Widgets / Weather) */}
      <div className="hidden sm:flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWidgets();
          }}
          className={`flex items-center gap-2 px-3 py-1 rounded-xl border-[2px] border-[#2d2a26] shadow-[2px_2px_0px_0px_#2d2a26] transition font-doodle text-xs cursor-pointer ${
            isWidgetsOpen 
              ? 'bg-[#fef08a] text-[#2d2a26]' 
              : isDark ? 'bg-zinc-900/80 hover:bg-zinc-800 text-slate-300' : 'bg-[#fffdfa] hover:bg-[#f5efe2] text-[#2d2a26]'
          }`}
          title="Widgets Board"
        >
          <DoodleWidgetsIcon className="w-4 h-4" />
          <span className="font-doodle text-xs tracking-wide font-bold">Cloudy 68°F</span>
        </button>
      </div>

      {/* Centered Taskbar Controls & Apps */}
      <div className="flex items-center gap-2 mx-auto">
        {/* Doodle Home Start Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleStartMenu();
          }}
          className={`win-start-btn flex items-center justify-center w-10 h-10 rounded-xl border-[2.5px] border-[#2d2a26] transition-all duration-200 cursor-pointer ${
            startMenuOpen 
              ? 'bg-[#fef08a] shadow-[2px_2px_0px_0px_#2d2a26] scale-95' 
              : isDark ? 'bg-zinc-900/80 hover:bg-zinc-800 shadow-[3px_3px_0px_0px_#2d2a26]' : 'bg-[#fffdfa] hover:bg-[#f5efe2] shadow-[3px_3px_0px_0px_#2d2a26]'
          }`}
          title="Start Menu"
        >
          <DoodleHomeIcon className="w-6 h-6" />
        </button>

        {/* Search Shortcut */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!startMenuOpen) {
              toggleStartMenu();
            }
            setStartMenuSearchFocused(true);
          }}
          className={`win-search-btn flex items-center justify-center w-9 h-9 rounded-xl border-[2px] border-[#2d2a26] transition shadow-[2px_2px_0px_0px_#2d2a26] cursor-pointer ${
            isDark ? 'bg-zinc-900/80 hover:bg-zinc-800 text-amber-300' : 'bg-[#fffdfa] hover:bg-[#f5efe2] text-[#2d2a26]'
          }`}
          title="Search"
        >
          <DoodleSearchIcon className="w-5 h-5" />
        </button>

        {/* Sketchy divider */}
        <div className="w-[2px] h-6 border-r-2 border-dashed border-[#2d2a26]/60 mx-1"></div>

        {/* Taskbar Apps with Doodle Badges */}
        {appIcons.map((app) => {
          const wState = windows[app.id];
          const isOpen = wState?.isOpen;
          const isFocused = focusedWindowId === app.id && isOpen && !wState.isMinimized;

          return (
            <div key={app.id} className="relative flex items-center group">
              <button
                onClick={() => handleAppClick(app.id, app.title)}
                className={`
                  flex items-center gap-1.5 px-2.5 py-1 rounded-xl border-[2px] border-[#2d2a26] transition-all duration-200 font-doodle text-xs cursor-pointer
                  ${isFocused 
                    ? 'bg-[#bae6fd] text-[#2d2a26] font-extrabold shadow-[2.5px_2.5px_0px_0px_#2d2a26]' 
                    : isOpen 
                      ? 'bg-[#dcfce7] text-[#2d2a26] font-bold shadow-[2px_2px_0px_0px_#2d2a26]' 
                      : isDark ? 'bg-zinc-900/80 hover:bg-zinc-800 text-slate-300 shadow-[2px_2px_0px_0px_#2d2a26]' : 'bg-[#fffdfa] hover:bg-[#f5efe2] text-[#2d2a26] shadow-[2px_2px_0px_0px_#2d2a26]'
                  }
                `}
                title={app.title}
              >
                <div className="transform active:scale-90 transition-transform">
                  {app.icon}
                </div>
                {isOpen && (
                  <span className="hidden md:inline-block font-doodle text-xs truncate max-w-[80px]">
                    {app.title}
                  </span>
                )}
                {isOpen && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isFocused ? 'bg-sky-600 animate-pulse' : 'bg-emerald-600'}`} />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Right Tray: System Controls & Sketchy Clock Badge */}
      <div className="flex items-center gap-2">
        {/* Quick Settings */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            toggleQuickSettings();
          }}
          className={`flex items-center gap-2 px-2.5 py-1 rounded-xl border-[2px] border-[#2d2a26] shadow-[2px_2px_0px_0px_#2d2a26] transition cursor-pointer ${
            isQuickSettingsOpen 
              ? 'bg-[#fef08a] text-[#2d2a26]' 
              : isDark ? 'text-slate-300 hover:text-white bg-zinc-900/80' : 'text-[#2d2a26] bg-[#fffdfa] hover:bg-[#f5efe2]'
          }`}
          title="Network, Volume, and Battery"
        >
          <Wifi className="w-3.5 h-3.5 text-sky-500" />
          <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
          <Battery className="w-3.5 h-3.5 text-amber-500" />
        </button>

        {/* Clock Sketchy Doodle Badge */}
        <button
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border-[2px] border-[#2d2a26] transition font-doodle shadow-[2px_2px_0px_0px_#2d2a26] cursor-pointer ${
            isDark ? 'bg-zinc-900/90 hover:bg-zinc-800 text-slate-200' : 'bg-[#fffdfa] hover:bg-[#f5efe2] text-[#2d2a26]'
          }`}
          title={fullDate}
        >
          <span className={`font-doodle text-xs font-bold ${isDark ? 'text-amber-300' : 'text-amber-900'}`}>{time || '12:00 PM'}</span>
          <span className={`hidden sm:inline font-doodle text-xs border-l border-dashed border-[#2d2a26] pl-1.5 ${isDark ? 'text-slate-400' : 'text-zinc-600'}`}>{date || '6/11/2026'}</span>
        </button>
      </div>
    </div>
  );
}
