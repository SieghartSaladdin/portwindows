'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useOSStore, type WindowState } from '@/lib/store';
import { APP_BY_ID } from '@/hooks/appRegistry';
import { EmptyState, IconButton } from '@/components/ui/primitives';
import { DoodleWidgetsIcon } from '@/components/ui/DoodleIcons';

/** Abstract doodle "sketch" of an app window, drawn with tokens so it works in both themes. */
function AppPreview({ id }: { id: string }) {
  const line = 'h-1.5 rounded-full bg-line/30';
  switch (id) {
    case 'terminal':
      return (
        <div className="w-full h-full p-3 flex flex-col gap-1.5 font-mono text-3xs text-fg-muted">
          <span>visitor@aura-os:~$ help</span>
          <span className="w-2/3 h-1.5 rounded-full bg-mint" />
          <span className="w-1/2 h-1.5 rounded-full bg-line/30" />
          <span className="w-3/4 h-1.5 rounded-full bg-line/30" />
        </div>
      );
    case 'projects':
      return (
        <div className="w-full h-full p-3 grid grid-cols-3 gap-2 content-start">
          {['bg-sky', 'bg-peach', 'bg-mint', 'bg-lilac', 'bg-rose', 'bg-highlight'].map((c) => (
            <span key={c} className={`h-8 rounded-lg border-2 border-line ${c}`} />
          ))}
        </div>
      );
    case 'settings':
    case 'admin':
      return (
        <div className="w-full h-full p-3 flex gap-2">
          <div className="w-1/4 flex flex-col gap-1.5 border-r-2 border-dashed border-line/40 pr-2">
            <span className="h-2 rounded-full bg-highlight" />
            <span className={line} />
            <span className={line} />
            <span className={line} />
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            <span className="w-1/3 h-2 rounded-full bg-line/40" />
            <span className="h-6 rounded-lg border-2 border-line bg-surface-2" />
            <span className="h-6 rounded-lg border-2 border-line bg-surface-2" />
          </div>
        </div>
      );
    case 'projector':
      return (
        <div className="w-full h-full p-3 flex items-center justify-center">
          <span className="w-3/4 h-3/4 rounded-lg border-2 border-line bg-sky/60" />
        </div>
      );
    case 'bio':
    case 'frieren':
    default:
      return (
        <div className="w-full h-full p-3 flex flex-col gap-1.5">
          <span className="w-10 h-10 rounded-full border-2 border-line bg-peach mb-1" />
          <span className="w-2/3 h-2 rounded-full bg-line/40" />
          <span className={`w-5/6 ${line}`} />
          <span className={`w-1/2 ${line}`} />
        </div>
      );
  }
}

export function TaskView() {
  const windows = useOSStore((s) => s.windows);
  const taskViewOpen = useOSStore((s) => s.taskViewOpen);
  const closeTaskView = useOSStore((s) => s.closeTaskView);
  const focusWindow = useOSStore((s) => s.focusWindow);
  const closeWindow = useOSStore((s) => s.closeWindow);
  const focusedWindowId = useOSStore((s) => s.focusedWindowId);

  useEffect(() => {
    if (!taskViewOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeTaskView();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [taskViewOpen, closeTaskView]);

  // Every open window in the store (admin, projector and any future app included)
  const openWindows: WindowState[] = Object.values(windows)
    .filter((w) => w.isOpen)
    .sort((a, b) => b.zIndex - a.zIndex);

  return (
    <AnimatePresence>
      {taskViewOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Task view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={(e) => {
            e.stopPropagation();
            closeTaskView();
          }}
          className="fixed inset-x-0 top-0 bottom-taskbar z-[8990] bg-doodle-paper text-fg flex flex-col items-center p-4 sm:p-10 select-none font-doodle overflow-y-auto"
        >
          <div className="w-full max-w-5xl flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <DoodleWidgetsIcon className="w-6 h-6" />
              Open windows
              <span className="text-xs text-fg-muted font-bold">({openWindows.length})</span>
            </h2>
            <IconButton
              label="Close task view"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                closeTaskView();
              }}
            >
              <X className="w-3.5 h-3.5" />
            </IconButton>
          </div>

          {openWindows.length > 0 ? (
            <ul className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {openWindows.map((w) => {
                const meta = APP_BY_ID[w.id];
                const title = meta?.title ?? w.title;
                const Glyph = meta?.Icon;
                const isFocused = focusedWindowId === w.id && !w.isMinimized;
                return (
                  <li key={w.id} className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        focusWindow(w.id);
                        closeTaskView();
                      }}
                      aria-label={`Switch to ${title}${w.isMinimized ? ' (minimized)' : ''}`}
                      className={`w-full flex flex-col rounded-2xl border-[2.5px] bg-surface overflow-hidden text-left cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-doodle-lg aspect-[16/10] ${
                        isFocused ? 'border-ink shadow-doodle-md ring-0' : 'border-line shadow-doodle-sm'
                      }`}
                    >
                      <span className={`flex items-center gap-2 px-3 py-2 pr-10 border-b-2 border-line ${isFocused ? 'bg-highlight text-ink' : 'bg-surface-2 text-fg'}`}>
                        {Glyph && <Glyph className="w-4 h-4 shrink-0" />}
                        <span className="text-xs font-bold truncate">{title}</span>
                        {w.isMinimized && <span className="text-3xs uppercase tracking-wider font-bold opacity-70 shrink-0">minimized</span>}
                      </span>
                      <span className="flex-1 min-h-0 block">
                        <AppPreview id={w.id} />
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        closeWindow(w.id);
                      }}
                      aria-label={`Close ${title}`}
                      title="Close window"
                      className="absolute top-1.5 right-2 w-6 h-6 rounded-lg border-2 border-line bg-surface hover:bg-rose hover:text-ink hover:border-ink flex items-center justify-center cursor-pointer text-fg"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="w-full max-w-md rounded-2xl border-[2.5px] border-line bg-surface shadow-doodle-md">
              <EmptyState
                icon={<DoodleWidgetsIcon className="w-8 h-8" />}
                title="No open windows"
                message="Open an app from the desktop, the taskbar or the Start menu and it will show up here."
              />
            </div>
          )}

          <p className="mt-6 text-2xs text-fg-muted">Press Escape or click the background to go back.</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
