'use client';

import React from 'react';
import { useOSStore } from '@/lib/store';
import { useDateTime } from '@/hooks/useDateTime';
import { 
  Wifi, 
  Volume2, 
  Battery, 
  MessageSquare,
  Search,
  FileText,
  Folder,
  Terminal,
  Settings,
  Tv,
  Gamepad2
} from 'lucide-react';

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
    taskViewOpen
  } = useOSStore();

  const { time, date, fullDate } = useDateTime();

  const appIcons = [
    { id: 'bio', title: 'Bio.txt', icon: <FileText className="w-5 h-5 text-emerald-400" /> },
    { id: 'projects', title: 'Projects', icon: <Folder className="w-5 h-5 text-amber-400" /> },
    { id: 'terminal', title: 'Terminal', icon: <Terminal className="w-5 h-5 text-indigo-400" /> },
    { id: 'settings', title: 'Settings', icon: <Settings className="w-5 h-5 text-blue-400" /> },
    { id: 'frieren', title: 'Frieren.exe', icon: <Gamepad2 className="w-5 h-5 text-rose-400" /> },
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
    <div className="fixed bottom-0 left-0 right-0 h-12 z-50 flex items-center justify-between px-3 select-none border-t border-white/5 win-mica-dark bg-black/30 text-white">
      {/* Invisible spacer for left aligning */}
      <div className="w-[180px] hidden sm:flex items-center gap-3">
        {/* Left indicators (e.g. Widgets) */}
        <div className="text-xs text-slate-300 hover:bg-white/10 px-2 py-1 rounded cursor-default transition">
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
            <span>Cloudy 68°F</span>
          </div>
        </div>
      </div>

      {/* Centered Taskbar Icons */}
      <div className="flex items-center gap-1 mx-auto">
        {/* Windows Start Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleStartMenu();
          }}
          className={`win-start-btn flex items-center justify-center w-10 h-10 rounded-[4px] hover:bg-white/10 transition-colors group cursor-default ${
            startMenuOpen ? 'bg-white/10' : ''
          }`}
          title="Start"
        >
          <div className="grid grid-cols-2 gap-[2px] w-[15px] h-[15px] transform group-active:scale-90 transition-transform">
            <div className="bg-sky-400 group-hover:bg-sky-300 rounded-[1px] transition-colors"></div>
            <div className="bg-sky-400 group-hover:bg-sky-300 rounded-[1px] transition-colors"></div>
            <div className="bg-sky-400 group-hover:bg-sky-300 rounded-[1px] transition-colors"></div>
            <div className="bg-sky-400 group-hover:bg-sky-300 rounded-[1px] transition-colors"></div>
          </div>
        </button>

        {/* Windows Search Shortcut */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!startMenuOpen) {
              toggleStartMenu();
            }
            setStartMenuSearchFocused(true);
          }}
          className="win-search-btn flex items-center justify-center w-10 h-10 rounded-[4px] hover:bg-white/10 transition-colors cursor-default text-slate-300 hover:text-white"
          title="Search"
        >
          <Search className="w-[18px] h-[18px] transform active:scale-90 transition-transform" />
        </button>

        {/* Task View Shortcut */}
        <button
          onClick={toggleTaskView}
          className={`hidden sm:flex items-center justify-center w-10 h-10 rounded-[4px] hover:bg-white/10 transition-colors cursor-default text-slate-300 hover:text-white ${
            taskViewOpen ? 'bg-white/10 text-white' : ''
          }`}
          title="Task View"
        >
          <Tv className="w-[18px] h-[18px] transform active:scale-90 transition-transform" />
        </button>

        {/* Vertical divider */}
        <div className="w-[1px] h-6 bg-white/10 mx-1"></div>

        {/* Taskbar Apps */}
        {appIcons.map((app) => {
          const wState = windows[app.id];
          const isOpen = wState?.isOpen;
          const isFocused = focusedWindowId === app.id && isOpen && !wState.isMinimized;

          return (
            <div key={app.id} className="relative flex flex-col items-center group">
              <button
                onClick={() => handleAppClick(app.id, app.title)}
                className={`
                  flex items-center justify-center w-10 h-10 rounded-[4px] transition-all cursor-default
                  ${isFocused ? 'bg-white/10 text-white' : 'hover:bg-white/10 text-slate-300 hover:text-white'}
                `}
                title={app.title}
              >
                <div className="transform active:scale-80 transition-transform">
                  {app.icon}
                </div>
              </button>

              {/* Indicator Pill under icons */}
              {isOpen && (
                <span
                  className={`
                    absolute bottom-[2px] h-[3px] rounded-full transition-all duration-300
                    ${isFocused 
                      ? 'w-[16px] bg-win-accent-light' 
                      : wState.isMinimized 
                        ? 'w-[4px] bg-slate-500' 
                        : 'w-[8px] bg-slate-400 group-hover:w-[12px]'
                    }
                  `}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* System Tray (Right Aligned) */}
      <div className="w-[180px] flex items-center justify-end gap-1">
        {/* Status Indicators */}
        <div 
          className="flex items-center gap-2.5 px-2.5 py-1 rounded-[4px] hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-default"
          title="Network, Volume, and Battery status"
        >
          <Wifi className="w-3.5 h-3.5" />
          <Volume2 className="w-3.5 h-3.5" />
          <Battery className="w-3.5 h-3.5" />
        </div>

        {/* Date and Time */}
        <button
          className="flex flex-col items-end px-2.5 py-1.5 rounded-[4px] hover:bg-white/10 hover:text-white text-slate-300 transition-colors cursor-default text-right leading-none"
          title={fullDate}
        >
          <span className="text-[11px] font-medium">{time || '12:00 PM'}</span>
          <span className="text-[10px] text-slate-400 mt-[2px]">{date || '6/11/2026'}</span>
        </button>

        {/* Action Center Widget */}
        <button
          className="flex items-center justify-center w-8 h-10 rounded-[4px] hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-default relative"
          title="Notification Center"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-win-accent-light rounded-full" />
        </button>

        {/* Show Desktop Sliver */}
        <div 
          onClick={() => {
            // Close or minimize all open windows
            appIcons.forEach(app => minimizeWindow(app.id));
          }}
          className="w-1.5 h-full hover:bg-white/5 border-l border-white/5 ml-1 cursor-default transition-colors"
          title="Show Desktop"
        />
      </div>
    </div>
  );
}
