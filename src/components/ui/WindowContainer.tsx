'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  defaultWidth = 920,
  defaultHeight = 620,
  icon,
}: WindowContainerProps) {
  const windowRef = useRef<HTMLDivElement>(null);
  
  const { 
    windows, 
    focusedWindowId, 
    focusWindow, 
    minimizeWindow, 
    maximizeWindow, 
    closeWindow,
    updateWindowPosition,
    updateWindowSize,
    setWindowSnap,
    themeMode
  } = useOSStore();
  
  const windowState = windows[id];

  const [size, setSize] = useState({ width: defaultWidth, height: defaultHeight });
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [prevNormalSize, setPrevNormalSize] = useState({ width: defaultWidth, height: defaultHeight });
  const [prevNormalPos, setPrevNormalPos] = useState({ x: 100, y: 100 });
  const [isSnapped, setIsSnapped] = useState<'left' | 'right' | 'top' | null>(null);
  const [snapPreview, setSnapPreview] = useState<'left' | 'right' | 'top' | null>(null);
  const [isResizingOrDragging, setIsResizingOrDragging] = useState(false);

  // Sync with Zustand store windowState when modified externally or internally
  useEffect(() => {
    if (windowState) {
      if (windowState.width && windowState.height) {
        setSize({ width: windowState.width, height: windowState.height });
      }
      if (windowState.x !== undefined && windowState.y !== undefined) {
        setPosition({ x: windowState.x, y: windowState.y });
      }
      if (windowState.isSnapped !== undefined) {
        setIsSnapped(windowState.isSnapped ? (windowState.snapPosition as any) : null);
      }
    }
  }, [windowState?.width, windowState?.height, windowState?.x, windowState?.y, windowState?.isSnapped, windowState?.snapPosition]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const offsetX = id === 'projects' ? 25 : id === 'terminal' ? 45 : id === 'settings' ? 65 : 0;
      const initialX = Math.max(20, Math.min((window.innerWidth - defaultWidth) / 2 + offsetX, window.innerWidth - defaultWidth - 20));
      const initialY = Math.max(20, Math.min((window.innerHeight - defaultHeight) / 2 - 20 + offsetX, window.innerHeight - defaultHeight - 60));
      setPosition({ x: initialX, y: initialY });
      setPrevNormalPos({ x: initialX, y: initialY });
    }
  }, [id, defaultWidth, defaultHeight]);


  if (!windowState || !windowState.isOpen) return null;
  
  const isFocused = focusedWindowId === id;
  const { isMaximized, isMinimized, zIndex } = windowState;

  const handleMouseDown = () => {
    focusWindow(id);
  };

  const handleResizeStart = (e: React.PointerEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    focusWindow(id);
    
    if (isMaximized) return;

    setIsResizingOrDragging(true);

    const startX = position.x;
    const startY = position.y;
    const startWidth = size.width;
    const startHeight = size.height;
    const startPointerX = e.clientX;
    const startPointerY = e.clientY;
    
    setIsSnapped(null); // Resizing unsnaps the window

    let finalWidth = startWidth;
    let finalHeight = startHeight;
    let finalX = startX;
    let finalY = startY;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startPointerX;
      const dy = moveEvent.clientY - startPointerY;
      
      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startX;
      let newY = startY;
      
      const minWidth = 300;
      const minHeight = 200;
      
      // Horizontal resizing
      if (handle.includes('right')) {
        newWidth = Math.max(minWidth, startWidth + dx);
      } else if (handle.includes('left')) {
        const calculatedWidth = startWidth - dx;
        if (calculatedWidth >= minWidth) {
          newWidth = calculatedWidth;
          newX = startX + dx;
        } else {
          newWidth = minWidth;
          newX = startX + (startWidth - minWidth);
        }
      }
      
      // Vertical resizing
      if (handle.includes('bottom')) {
        newHeight = Math.max(minHeight, startHeight + dy);
      } else if (handle.includes('top')) {
        const calculatedHeight = startHeight - dy;
        if (calculatedHeight >= minHeight) {
          newHeight = calculatedHeight;
          newY = startY + dy;
        } else {
          newHeight = minHeight;
          newY = startY + (startHeight - minHeight);
        }
      }
      
      finalWidth = newWidth;
      finalHeight = newHeight;
      finalX = newX;
      finalY = newY;

      setSize({ width: newWidth, height: newHeight });
      setPosition({ x: newX, y: newY });
    };
    
    const handlePointerUp = () => {
      setIsResizingOrDragging(false);
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      
      updateWindowSize(id, finalWidth, finalHeight);
      updateWindowPosition(id, finalX, finalY);
    };
    
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };


  const handleHeaderPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('.win-control-btn')) return;
    e.preventDefault();
    focusWindow(id);
    
    setIsResizingOrDragging(true);

    const wasMaximized = isMaximized;
    const activeSnapped = isSnapped;
    
    const restoreWidth = wasMaximized || activeSnapped ? prevNormalSize.width : size.width;
    
    const startX = wasMaximized || activeSnapped ? prevNormalPos.x : position.x;
    const startY = wasMaximized || activeSnapped ? prevNormalPos.y : position.y;
    const startPointerX = e.clientX;
    const startPointerY = e.clientY;
    
    let relativeClickX = 0.5;
    if (windowRef.current) {
      const rect = windowRef.current.getBoundingClientRect();
      relativeClickX = (e.clientX - rect.left) / rect.width;
    }
    
    let currentX = wasMaximized || activeSnapped ? prevNormalPos.x : position.x;
    let currentY = wasMaximized || activeSnapped ? prevNormalPos.y : position.y;
    let isDraggingRestored = false;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startPointerX;
      const dy = moveEvent.clientY - startPointerY;
      
      let nextX = startX + dx;
      let nextY = startY + dy;
      
      if ((wasMaximized || activeSnapped) && !isDraggingRestored && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
        isDraggingRestored = true;
        if (wasMaximized) {
          maximizeWindow(id);
        }
        setIsSnapped(null);
        setWindowSnap(id, false, null);
        
        const newX = moveEvent.clientX - (restoreWidth * relativeClickX);
        const newY = moveEvent.clientY - 20;
        
        nextX = newX;
        nextY = newY;
      }
      
      if (!wasMaximized && !activeSnapped || isDraggingRestored) {
        currentX = nextX;
        currentY = nextY;
        setPosition({ x: nextX, y: nextY });
      }
      
      const px = moveEvent.clientX;
      const py = moveEvent.clientY;
      let activeSnapZone: 'left' | 'right' | 'top' | null = null;
      
      if (py < 25) {
        activeSnapZone = 'top';
      } else if (px < 25) {
        activeSnapZone = 'left';
      } else if (px > window.innerWidth - 25) {
        activeSnapZone = 'right';
      }
      
      setSnapPreview(activeSnapZone);
    };
    
    const handlePointerUp = (upEvent: PointerEvent) => {
      setIsResizingOrDragging(false);
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      
      const px = upEvent.clientX;
      const py = upEvent.clientY;
      let finalSnapZone: 'left' | 'right' | 'top' | null = null;
      
      if (py < 25) {
        finalSnapZone = 'top';
      } else if (px < 25) {
        finalSnapZone = 'left';
      } else if (px > window.innerWidth - 25) {
        finalSnapZone = 'right';
      }
      
      setSnapPreview(null);
      
      if (finalSnapZone) {
        if (!isSnapped && !isMaximized) {
          setPrevNormalSize({ width: size.width, height: size.height });
          setPrevNormalPos({ x: currentX, y: currentY });
        }
        
        setIsSnapped(finalSnapZone);
        const height = window.innerHeight - 48;
        
        let newWidth = window.innerWidth / 2;
        let newHeight = height;
        let newX = 0;
        let newY = 0;

        if (finalSnapZone === 'left') {
          newX = 0;
          newY = 0;
          newWidth = window.innerWidth / 2;
        } else if (finalSnapZone === 'right') {
          newX = window.innerWidth / 2;
          newY = 0;
          newWidth = window.innerWidth / 2;
        } else if (finalSnapZone === 'top') {
          newX = 0;
          newY = 0;
          newWidth = window.innerWidth;
        }

        setPosition({ x: newX, y: newY });
        setSize({ width: newWidth, height: newHeight });

        setWindowSnap(id, true, finalSnapZone);
        updateWindowSize(id, newWidth, newHeight);
        updateWindowPosition(id, newX, newY);
      } else {
        setIsSnapped(null);
        setWindowSnap(id, false, null);
        updateWindowPosition(id, currentX, currentY);
      }
    };
    
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };


  const handleHeaderDoubleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.win-control-btn')) return;
    if (!isMaximized) {
      setPrevNormalSize({ width: size.width, height: size.height });
      setPrevNormalPos({ x: position.x, y: position.y });
    }
    maximizeWindow(id);
    setIsSnapped(null);
    setWindowSnap(id, false, null);
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
    <>
      {/* Snap Assist Translucent Glass Overlay */}
      {snapPreview && (
        <div
          className="fixed pointer-events-none z-[9999] transition-all duration-200 ease-out bg-sky-500/10 border border-sky-400/30 rounded-lg shadow-[0_0_30px_rgba(14,165,233,0.15)] backdrop-blur-[1px]"
          style={{
            top: 6,
            bottom: 54, // Taskbar is 48px + 6px spacing
            left: snapPreview === 'left' ? 6 : snapPreview === 'right' ? 'calc(50vw + 3px)' : 6,
            right: snapPreview === 'right' ? 6 : snapPreview === 'left' ? 'calc(50vw + 3px)' : 6,
            width: snapPreview === 'left' || snapPreview === 'right' ? 'calc(50vw - 9px)' : 'calc(100vw - 12px)',
            height: 'calc(100vh - 60px)',
          }}
        />
      )}

      <motion.div
        ref={windowRef}
        initial="closed"
        animate={isMinimized ? 'minimized' : 'open'}
        variants={variants}
        onMouseDown={handleMouseDown}
        style={{
          zIndex,
          position: 'absolute',
          width: isMaximized ? '100vw' : size.width,
          height: isMaximized ? 'calc(100vh - 48px)' : size.height, // Taskbar is 48px
          left: isMaximized ? 0 : position.x,
          top: isMaximized ? 0 : position.y,
        }}
        className={`
          flex flex-col overflow-hidden select-none rounded-2xl border-[2.5px] border-[#2d2a26] bg-zinc-950 shadow-[6px_6px_0px_0px_#2d2a26]
          ${isFocused 
            ? 'ring-1 ring-[#2d2a26]/40 shadow-[8px_8px_0px_0px_#2d2a26]' 
            : 'opacity-95'
          }
          ${isResizingOrDragging ? '' : 'transition-all duration-300 ease-out'}
        `}
      >
        {/* Resize Handles */}
        {!isMaximized && (
          <>
            {/* Top */}
            <div
              onPointerDown={(e) => handleResizeStart(e, 'top')}
              className="absolute top-0 left-2 right-2 h-1 cursor-n-resize -translate-y-1/2 z-50 touch-none"
            />
            {/* Bottom */}
            <div
              onPointerDown={(e) => handleResizeStart(e, 'bottom')}
              className="absolute bottom-0 left-2 right-2 h-1 cursor-s-resize translate-y-1/2 z-50 touch-none"
            />
            {/* Left */}
            <div
              onPointerDown={(e) => handleResizeStart(e, 'left')}
              className="absolute left-0 top-2 bottom-2 w-1 cursor-w-resize -translate-x-1/2 z-50 touch-none"
            />
            {/* Right */}
            <div
              onPointerDown={(e) => handleResizeStart(e, 'right')}
              className="absolute right-0 top-2 bottom-2 w-1 cursor-e-resize translate-x-1/2 z-50 touch-none"
            />
            {/* Top-Left */}
            <div
              onPointerDown={(e) => handleResizeStart(e, 'top-left')}
              className="absolute top-0 left-0 w-2.5 h-2.5 cursor-nw-resize -translate-x-1/2 -translate-y-1/2 z-50 touch-none"
            />
            {/* Top-Right */}
            <div
              onPointerDown={(e) => handleResizeStart(e, 'top-right')}
              className="absolute top-0 right-0 w-2.5 h-2.5 cursor-ne-resize translate-x-1/2 -translate-y-1/2 z-50 touch-none"
            />
            {/* Bottom-Left */}
            <div
              onPointerDown={(e) => handleResizeStart(e, 'bottom-left')}
              className="absolute bottom-0 left-0 w-2.5 h-2.5 cursor-sw-resize -translate-x-1/2 translate-y-1/2 z-50 touch-none"
            />
            {/* Bottom-Right */}
            <div
              onPointerDown={(e) => handleResizeStart(e, 'bottom-right')}
              className="absolute bottom-0 right-0 w-2.5 h-2.5 cursor-se-resize translate-x-1/2 translate-y-1/2 z-50 touch-none"
            />
          </>
        )}

        {/* Window Title Bar / Header */}
        <div
          onPointerDown={handleHeaderPointerDown}
          onDoubleClick={handleHeaderDoubleClick}
          className={`flex items-center justify-between h-11 px-4 border-b-[2.5px] border-[#2d2a26] cursor-default select-none touch-none ${
            themeMode === 'dark' ? 'bg-[#262422]' : 'bg-[#fcf9f2]'
          }`}
        >
          {/* Title Info */}
          <div className="flex items-center gap-2.5 text-sm font-doodle text-[#fcf9f2]">
            {icon ? (
              <span className="w-6 h-6 flex items-center justify-center p-0.5 border-2 border-[#2d2a26] rounded-lg bg-[#fef08a] text-[#2d2a26] shadow-[1.5px_1.5px_0px_0px_#2d2a26]">
                {icon}
              </span>
            ) : (
              <span className="w-3.5 h-3.5 rounded-full border-2 border-[#2d2a26] bg-[#fef08a] shadow-[1px_1px_0px_0px_#2d2a26]" />
            )}
            <span className={`truncate max-w-[200px] sm:max-w-[400px] font-bold tracking-wide font-doodle ${
              themeMode === 'dark' ? 'text-[#fcf9f2]' : 'text-[#2d2a26]'
            }`}>{title}</span>
          </div>

          {/* Window Controls */}
          <div className="flex items-center gap-2 h-full">
            {/* Minimize */}
            <button
              onClick={() => minimizeWindow(id)}
              className="win-control-btn flex items-center justify-center w-7 h-7 bg-amber-300 border-2 border-[#2d2a26] text-[#2d2a26] rounded-xl font-bold hover:scale-105 active:scale-95 transition-all"
              title="Minimize"
            >
              <Minus className="w-4 h-4 stroke-[3]" />
            </button>

            {/* Maximize / Restore */}
            <button
              onClick={() => {
                if (!isMaximized) {
                  setPrevNormalSize({ width: size.width, height: size.height });
                  setPrevNormalPos({ x: position.x, y: position.y });
                }
                maximizeWindow(id);
                setIsSnapped(null);
              }}
              className="win-control-btn flex items-center justify-center w-7 h-7 bg-sky-300 border-2 border-[#2d2a26] text-[#2d2a26] rounded-xl font-bold hover:scale-105 active:scale-95 transition-all"
              title={isMaximized ? 'Restore Down' : 'Maximize'}
            >
              {isMaximized ? (
                <Copy className="w-3.5 h-3.5 stroke-[3] rotate-180" />
              ) : (
                <Square className="w-3.5 h-3.5 stroke-[3]" />
              )}
            </button>

            {/* Close */}
            <button
              onClick={() => closeWindow(id)}
              className="win-control-btn flex items-center justify-center w-7 h-7 bg-rose-400 border-2 border-[#2d2a26] text-white rounded-full font-bold hover:scale-105 active:scale-95 transition-all"
              title="Close"
            >
              <X className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* Window Body */}
        <div className={`flex-1 overflow-auto ${
          themeMode === 'dark' ? 'bg-zinc-950 bg-doodle-grid text-slate-200' : 'bg-[#fdfbf7] bg-doodle-grid text-[#2d2a26]'
        }`}>
          {children}
        </div>
      </motion.div>
    </>
  );
}
