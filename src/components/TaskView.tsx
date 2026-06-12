'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOSStore } from '@/lib/store';
import { FileText, Folder, Terminal, Settings, Gamepad2, X } from 'lucide-react';

export function TaskView() {
  const { 
    windows, 
    taskViewOpen, 
    closeTaskView, 
    focusWindow, 
    closeWindow 
  } = useOSStore();

  // Handle ESC key to close Task View
  useEffect(() => {
    if (!taskViewOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeTaskView();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [taskViewOpen, closeTaskView]);

  if (!taskViewOpen) return null;

  const openWindows = Object.values(windows).filter((w) => w.isOpen);

  const appIcons: Record<string, { title: string; icon: React.ReactNode }> = {
    bio: { title: 'Bio.txt - Notepad', icon: <FileText className="w-4 h-4 text-emerald-400" /> },
    projects: { title: 'Projects', icon: <Folder className="w-4 h-4 text-amber-400" /> },
    terminal: { title: 'Command Prompt', icon: <Terminal className="w-4 h-4 text-indigo-400" /> },
    settings: { title: 'Settings', icon: <Settings className="w-4 h-4 text-blue-400" /> },
    frieren: { title: 'Frieren.exe', icon: <Gamepad2 className="w-4 h-4 text-rose-400" /> },
  };

  const getAppPreview = (id: string) => {
    switch (id) {
      case 'bio':
        return (
          <div className="w-full h-full bg-zinc-900 p-3.5 flex flex-col gap-2 font-mono text-[8px] text-slate-300 leading-normal select-none overflow-hidden">
            <div className="border-b border-zinc-800 pb-1 text-slate-500">Bio.txt - Notepad</div>
            <div className="flex flex-col gap-1 mt-1">
              <div className="w-2/3 h-1.5 bg-emerald-500/20 rounded"></div>
              <div className="w-5/6 h-1.5 bg-zinc-700/30 rounded"></div>
              <div className="w-1/2 h-1.5 bg-zinc-700/30 rounded"></div>
              <div className="w-3/4 h-1.5 bg-zinc-700/30 rounded"></div>
            </div>
          </div>
        );
      case 'projects':
        return (
          <div className="w-full h-full bg-zinc-950 p-3.5 flex flex-col gap-2.5 select-none overflow-hidden">
            <div className="text-[9px] font-bold text-slate-300">Projects Explorer</div>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded border border-white/5">
                <Folder className="w-3 h-3 text-amber-400" />
                <span className="text-[7.5px] text-slate-300 truncate">FrierenApp</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded border border-white/5">
                <Folder className="w-3 h-3 text-amber-400" />
                <span className="text-[7.5px] text-slate-300 truncate">WebAudio</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded border border-white/5">
                <Folder className="w-3 h-3 text-amber-400" />
                <span className="text-[7.5px] text-slate-300 truncate">Portfolio</span>
              </div>
            </div>
          </div>
        );
      case 'terminal':
        return (
          <div className="w-full h-full bg-black p-3.5 flex flex-col gap-1 font-mono text-[7px] text-slate-300 select-none overflow-hidden">
            <div className="text-zinc-500">Microsoft Windows [Version 10.0.22631]</div>
            <div className="text-zinc-500">C:\Users\Fafnir&gt; npm run dev</div>
            <div className="text-emerald-400 mt-1">&gt; Compiled successfully</div>
            <div className="text-slate-400">Ready on http://localhost:3000</div>
          </div>
        );
      case 'settings':
        return (
          <div className="w-full h-full bg-zinc-900 p-3.5 flex gap-2 select-none overflow-hidden">
            <div className="w-10 border-r border-zinc-800 flex flex-col gap-1 pr-1.5">
              <div className="w-full h-2 bg-blue-500/20 rounded"></div>
              <div className="w-3/4 h-1.5 bg-zinc-800 rounded"></div>
              <div className="w-2/3 h-1.5 bg-zinc-800 rounded"></div>
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <div className="w-1/3 h-2 bg-slate-300/30 rounded mb-1"></div>
              <div className="h-6 bg-white/5 rounded border border-white/5 p-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-blue-500"></span>
                <span className="w-12 h-1.5 bg-zinc-700/40 rounded"></span>
              </div>
            </div>
          </div>
        );
      case 'frieren':
        return (
          <div className="w-full h-full bg-zinc-950 p-3.5 flex flex-col gap-2 select-none overflow-hidden">
            <div className="flex justify-between items-center pb-1 border-b border-zinc-900">
              <span className="text-[8px] font-bold text-rose-300">Frieren.exe Dashboard</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center bg-white/5 p-1 rounded">
                <span className="text-[7px] text-slate-300">Spawn Character</span>
                <span className="w-4 h-2 rounded-full bg-rose-500"></span>
              </div>
              <div className="flex flex-col gap-0.5 mt-0.5">
                <span className="text-[6px] text-slate-500">Character Size (64px)</span>
                <div className="w-full h-1 bg-zinc-800 rounded-full relative">
                  <div className="absolute left-0 top-0 bottom-0 bg-rose-500 w-1/2 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-xs text-slate-500 select-none">
            Application Preview
          </div>
        );
    }
  };

  return (
    <div
      onClick={closeTaskView}
      className="fixed inset-0 z-45 flex flex-col items-center justify-center p-6 sm:p-12 backdrop-blur-xl bg-slate-950/70 select-none"
    >
      {/* Centered open windows view */}
      <div className="flex-1 w-full max-w-5xl flex flex-col justify-center min-h-0 py-8">
        <h2 className="text-sm font-semibold text-slate-300 mb-6 text-center tracking-wide uppercase">
          Open Windows
        </h2>

        {openWindows.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 overflow-y-auto max-h-[360px] p-2">
            {openWindows.map((w) => {
              const meta = appIcons[w.id] || { title: w.title, icon: null };
              return (
                <div
                  key={w.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    focusWindow(w.id);
                  }}
                  className="flex flex-col rounded-xl border border-white/5 bg-zinc-900/40 hover:bg-zinc-800/50 hover:border-white/10 hover:shadow-2xl transition duration-200 group relative aspect-[16/10] overflow-hidden"
                >
                  {/* Card Title Bar */}
                  <div className="flex items-center justify-between p-2.5 bg-black/30 border-b border-white/5 z-10">
                    <div className="flex items-center gap-2 min-w-0">
                      {meta.icon}
                      <span className="text-[10px] font-bold text-slate-200 truncate pr-4">
                        {meta.title}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        closeWindow(w.id);
                      }}
                      className="p-1 rounded-md hover:bg-red-500/20 text-slate-400 hover:text-red-200 transition"
                      title="Close Window"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Card Content Preview Area */}
                  <div className="flex-1 min-h-0 relative bg-black/10">
                    {getAppPreview(w.id)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-2">
            <span className="text-xl">🔲</span>
            <div className="text-xs">No active windows open on this desktop.</div>
          </div>
        )}
      </div>

      {/* Desktops bar at the bottom */}
      <div className="flex items-center gap-4 mt-auto pt-6 border-t border-white/5 w-full max-w-5xl justify-center z-10">
        <div className="flex flex-col items-center gap-1.5 p-2 px-6 rounded-xl bg-white/10 border border-white/10 shadow-md">
          <span className="text-[10px] font-extrabold text-white tracking-wide uppercase">Desktop 1</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            alert("Multiple virtual desktops are simulated in Desktop 1.");
          }}
          className="flex flex-col items-center gap-1.5 p-2 px-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-[10px] font-bold tracking-wide uppercase transition cursor-default"
        >
          <span>+ New Desktop</span>
        </button>
      </div>
    </div>
  );
}
