'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  Sparkles
} from 'lucide-react';
import { useOSStore } from '@/lib/store';
import { 
  DoodleWidgetsIcon,
  DoodleEditPencilIcon,
  DoodleHomeIcon,
  DoodleFolderIcon,
  DoodleTerminalIcon,
  DoodleSettingsIcon,
  DoodlePetIcon
} from '@/components/ui/DoodleIcons';

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
        initial={{ opacity: 0, scale: 0.9, y: -5 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -5 }}
        transition={{ duration: 0.12, ease: 'easeOut' }}
        style={{ top: position.y, left: position.x }}
        className="fixed z-50 w-64 rounded-2xl border-[2.5px] border-[#2d2a26] bg-[#fffdfa] p-2.5 font-doodle text-xs text-[#2d2a26] shadow-[4px_4px_0px_0px_#2d2a26] backdrop-blur-xl select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Badge */}
        <div className="px-3 py-1 font-doodle text-[11px] text-[#2d2a26] font-bold uppercase tracking-wider flex items-center justify-between border-b-2 border-dashed border-[#2d2a26]/30 mb-1.5 bg-amber-100/60 rounded-lg">
          <span>Notebook Desktop</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
        </div>

        {/* View Options */}
        <div className="flex items-center justify-between px-3 py-1.5 border-[2px] border-transparent hover:border-[#2d2a26] hover:bg-sky-100/70 rounded-xl cursor-pointer group transition font-doodle">
          <div className="flex items-center gap-2.5">
            <DoodleWidgetsIcon className="w-4 h-4" />
            <span className="font-doodle text-xs font-bold">View Options</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-[#2d2a26]" />
        </div>

        {/* Sort Options */}
        <div className="flex items-center justify-between px-3 py-1.5 border-[2px] border-transparent hover:border-[#2d2a26] hover:bg-amber-100/70 rounded-xl cursor-pointer group transition font-doodle">
          <div className="flex items-center gap-2.5">
            <DoodleEditPencilIcon className="w-4 h-4" />
            <span className="font-doodle text-xs font-bold">Sort by</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-[#2d2a26]" />
        </div>

        {/* Refresh */}
        <button
          onClick={handleRefresh}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 border-[2px] border-transparent hover:border-[#2d2a26] hover:bg-emerald-100/70 rounded-xl text-left cursor-pointer transition font-doodle font-bold"
        >
          <DoodleHomeIcon className="w-4 h-4" />
          <span>Refresh Desktop</span>
        </button>

        <hr className="my-1.5 border-t-2 border-dashed border-[#2d2a26]/30" />

        {/* New Item */}
        <div className="flex items-center justify-between px-3 py-1.5 border-[2px] border-transparent hover:border-[#2d2a26] hover:bg-purple-100/70 rounded-xl cursor-pointer transition font-doodle font-bold">
          <div className="flex items-center gap-2.5">
            <DoodleFolderIcon className="w-4 h-4" />
            <span>New Item</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-[#2d2a26]" />
        </div>

        <hr className="my-1.5 border-t-2 border-dashed border-[#2d2a26]/30" />

        {/* Terminal */}
        <button
          onClick={() => handleOpenApp('terminal', 'Aura Terminal')}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 border-[2px] border-transparent hover:border-[#2d2a26] hover:bg-indigo-100/70 rounded-xl text-left cursor-pointer transition font-doodle font-bold"
        >
          <DoodleTerminalIcon className="w-4 h-4" />
          <span>Open in Terminal</span>
        </button>

        {/* Display Settings */}
        <button
          onClick={() => handleOpenApp('settings', 'Settings')}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 border-[2px] border-transparent hover:border-[#2d2a26] hover:bg-blue-100/70 rounded-xl text-left cursor-pointer transition font-doodle font-bold"
        >
          <DoodleSettingsIcon className="w-4 h-4" />
          <span>Display Settings</span>
        </button>

        {/* Personalize */}
        <button
          onClick={() => handleOpenApp('settings', 'Settings')}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 border-[2px] border-transparent hover:border-[#2d2a26] hover:bg-rose-100/70 rounded-xl text-left cursor-pointer transition font-doodle font-bold"
        >
          <DoodlePetIcon className="w-4 h-4" />
          <span>Personalize Themes</span>
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
