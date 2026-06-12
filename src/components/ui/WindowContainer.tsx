'use client';

import React, { useRef } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { Minus, Square, Copy, X } from 'lucide-react';
import { useOSStore } from '@/lib/store';

interface WindowContainerProps {
  id: string;
  title: string;
  children: React.ReactNode;
  defaultWidth?: number;
  defaultHeight?: number;
  icon?: React.ReactNode;
}

export function WindowContainer({
  id,
  title,
  children,
  defaultWidth = 800,
  defaultHeight = 550,
  icon,
}: WindowContainerProps) {
  const windowRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  
  const { windows, focusedWindowId, focusWindow, minimizeWindow, maximizeWindow, closeWindow } = useOSStore();
  
  const windowState = windows[id];

  if (!windowState || !windowState.isOpen) return null;
  
  const isFocused = focusedWindowId === id;
  const { isMaximized, isMinimized, zIndex } = windowState;

  const handleMouseDown = () => {
    focusWindow(id);
  };

  const handleHeaderPointerDown = (e: React.PointerEvent) => {
    // Only drag on left click/pointer down and not on buttons
    if ((e.target as HTMLElement).closest('.win-control-btn')) return;
    dragControls.start(e);
    focusWindow(id);
  };

  const variants = {
    open: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: 'spring', damping: 25, stiffness: 250 }
    },
    minimized: {
      opacity: 0,
      scale: 0.8,
      y: 100,
      transition: { duration: 0.2, ease: 'easeOut' }
    },
    closed: {
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.15 }
    }
  } as const;

  return (
    <motion.div
      ref={windowRef}
      initial="closed"
      animate={isMinimized ? 'minimized' : 'open'}
      variants={variants}
      drag={!isMaximized}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={{
        left: 0,
        top: 0,
        right: typeof window !== 'undefined' ? window.innerWidth - 150 : 800,
        bottom: typeof window !== 'undefined' ? window.innerHeight - 150 : 600,
      }}
      onMouseDown={handleMouseDown}
      style={{
        zIndex,
        position: 'absolute',
        width: isMaximized ? '100vw' : defaultWidth,
        height: isMaximized ? 'calc(100vh - 48px)' : defaultHeight, // Taskbar is 48px
        left: isMaximized ? 0 : '15%',
        top: isMaximized ? 0 : '10%',
      }}
      className={`
        flex flex-col overflow-hidden select-none rounded-xl border
        ${isFocused 
          ? 'win-mica-dark border-white/15 shadow-2xl ring-1 ring-white/5' 
          : 'bg-zinc-900/80 backdrop-blur-md border-white/5 shadow-lg opacity-90'
        }
        transition-all duration-300 ease-out
      `}
    >
      {/* Window Title Bar / Header */}
      <div
        onPointerDown={handleHeaderPointerDown}
        className="flex items-center justify-between h-10 px-3 bg-black/20 border-b border-white/5 cursor-default select-none touch-none"
      >
        {/* Title Info */}
        <div className="flex items-center gap-2 text-xs font-normal text-slate-300">
          {icon && <span className="w-4 h-4 flex items-center justify-center">{icon}</span>}
          <span className="truncate max-w-[200px] sm:max-w-[400px]">{title}</span>
        </div>

        {/* Window Controls */}
        <div className="flex items-center h-full">
          {/* Minimize */}
          <button
            onClick={() => minimizeWindow(id)}
            className="win-control-btn flex items-center justify-center w-11 h-10 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* Maximize / Restore */}
          <button
            onClick={() => maximizeWindow(id)}
            className="win-control-btn flex items-center justify-center w-11 h-10 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            title={isMaximized ? 'Restore Down' : 'Maximize'}
          >
            {isMaximized ? (
              <Copy className="w-3 h-3 rotate-180" />
            ) : (
              <Square className="w-3 h-3" />
            )}
          </button>

          {/* Close */}
          <button
            onClick={() => closeWindow(id)}
            className="win-control-btn flex items-center justify-center w-11 h-10 text-slate-400 hover:bg-red-600 hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Window Body */}
      <div className="flex-1 overflow-auto bg-zinc-950/40 text-slate-200">
        {children}
      </div>
    </motion.div>
  );
}
