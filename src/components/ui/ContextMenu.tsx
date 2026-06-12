'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Monitor, 
  Paintbrush, 
  Terminal, 
  RefreshCw, 
  Grid, 
  SortAsc, 
  ChevronRight, 
  FolderPlus
} from 'lucide-react';
import { useOSStore } from '@/lib/store';

interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
}

export function ContextMenu({ isOpen, position, onClose }: ContextMenuProps) {
  const openWindow = useOSStore((state) => state.openWindow);

  if (!isOpen) return null;

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
    // Simulate desktop refresh
    const body = document.body;
    body.style.opacity = '0.5';
    setTimeout(() => {
      body.style.opacity = '1';
    }, 150);
  };

  const handleOpenApp = (id: string, title: string) => {
    openWindow(id, title);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.1, ease: 'easeOut' }}
        style={{ top: position.y, left: position.x }}
        className="fixed z-50 w-60 rounded-xl win-mica-dark p-1.5 text-xs text-slate-200 border border-white/10 select-none shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* View Options */}
        <div className="flex items-center justify-between px-3 py-1.5 hover:bg-white/10 rounded-md cursor-default group transition">
          <div className="flex items-center gap-2.5">
            <Grid className="w-4 h-4 text-slate-400" />
            <span>View</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </div>

        {/* Sort Options */}
        <div className="flex items-center justify-between px-3 py-1.5 hover:bg-white/10 rounded-md cursor-default group transition">
          <div className="flex items-center gap-2.5">
            <SortAsc className="w-4 h-4 text-slate-400" />
            <span>Sort by</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </div>

        {/* Refresh */}
        <button
          onClick={handleRefresh}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-white/10 rounded-md text-left cursor-default transition"
        >
          <RefreshCw className="w-4 h-4 text-slate-400" />
          <span>Refresh</span>
        </button>

        <hr className="my-1 border-white/10" />

        {/* New Item */}
        <div className="flex items-center justify-between px-3 py-1.5 hover:bg-white/10 rounded-md cursor-default transition">
          <div className="flex items-center gap-2.5">
            <FolderPlus className="w-4 h-4 text-slate-400" />
            <span>New</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </div>

        <hr className="my-1 border-white/10" />

        {/* Terminal */}
        <button
          onClick={() => handleOpenApp('terminal', 'Command Prompt')}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-white/10 rounded-md text-left cursor-default transition"
        >
          <Terminal className="w-4 h-4 text-slate-400" />
          <span>Open in Terminal</span>
        </button>

        {/* Display Settings */}
        <button
          onClick={() => handleOpenApp('settings', 'Settings')}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-white/10 rounded-md text-left cursor-default transition"
        >
          <Monitor className="w-4 h-4 text-slate-400" />
          <span>Display settings</span>
        </button>

        {/* Personalize */}
        <button
          onClick={() => handleOpenApp('settings', 'Settings')}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-white/10 rounded-md text-left cursor-default transition"
        >
          <Paintbrush className="w-4 h-4 text-slate-400" />
          <span>Personalize</span>
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
