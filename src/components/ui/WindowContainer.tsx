'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Minus, Square, Copy, X } from 'lucide-react';
import { useOSStore } from '@/lib/store';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { cx } from '@/components/ui/primitives';

interface WindowContainerProps {
  id: string;
  title: string;
  children: React.ReactNode;
  defaultWidth?: number;
  defaultHeight?: number;
  icon?: React.ReactNode;
}

type SnapZone = 'left' | 'right' | 'top';

/** Must match --spacing-taskbar in globals.css */
const TASKBAR_HEIGHT = 52;
const EDGE = 12;
const MIN_WIDTH = 300;
const MIN_HEIGHT = 200;
/** Windows sit above desktop icons (10) and pets (40); the store's zIndex counter is added on top. */
const WINDOW_LAYER_BASE = 100;

function workArea() {
  return { width: window.innerWidth, height: window.innerHeight - TASKBAR_HEIGHT };
}

/** Clamp a requested size to the visible work area (viewport minus taskbar). */
function clampSize(width: number, height: number) {
  const area = workArea();
  return {
    width: Math.max(Math.min(MIN_WIDTH, area.width - EDGE * 2), Math.min(width, area.width - EDGE * 2)),
    height: Math.max(Math.min(MIN_HEIGHT, area.height - EDGE * 2), Math.min(height, area.height - EDGE * 2)),
  };
}

function snapZoneAt(px: number, py: number): SnapZone | null {
  if (py < 25) return 'top';
  if (px < 25) return 'left';
  if (px > window.innerWidth - 25) return 'right';
  return null;
}

const controlBtn =
  'win-control-btn flex items-center justify-center w-7 h-7 rounded-xl border-2 border-ink text-ink shadow-doodle-xs ' +
  'hover:-translate-y-px active:translate-y-px active:shadow-none transition-all cursor-pointer';

export function WindowContainer(props: WindowContainerProps) {
  const isOpen = useOSStore((s) => !!s.windows[props.id]?.isOpen);
  // The frame mounts on open, so its geometry is (re)computed for the current viewport every time.
  return isOpen ? <WindowFrame {...props} /> : null;
}

/** Initial geometry: the stored one (clamped) if the window was moved before, otherwise centered and fitted. */
function initialGeometry(id: string, defaultWidth: number, defaultHeight: number) {
  if (typeof window === 'undefined') return { size: { width: defaultWidth, height: defaultHeight }, pos: { x: 100, y: 60 } };
  const stored = useOSStore.getState().windows[id];
  const area = workArea();
  if (stored?.x !== undefined && stored?.y !== undefined && stored?.width && stored?.height) {
    const size = clampSize(stored.width, stored.height);
    return {
      size,
      pos: { x: Math.max(0, Math.min(stored.x, area.width - 80)), y: Math.max(0, Math.min(stored.y, area.height - 44)) },
    };
  }
  const size = clampSize(defaultWidth, defaultHeight);
  const offset = id === 'projects' ? 24 : id === 'terminal' ? 44 : id === 'settings' ? 64 : 0;
  const x = Math.max(EDGE, Math.min((area.width - size.width) / 2 + offset, area.width - size.width - EDGE));
  const y = Math.max(EDGE, Math.min((area.height - size.height) / 2 - 10 + offset, area.height - size.height - EDGE));
  return { size, pos: { x, y } };
}

function WindowFrame({ id, title, children, defaultWidth = 920, defaultHeight = 620, icon }: WindowContainerProps) {
  const windowRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const windowState = useOSStore((s) => s.windows[id]);
  const focusedWindowId = useOSStore((s) => s.focusedWindowId);
  const focusWindow = useOSStore((s) => s.focusWindow);
  const minimizeWindow = useOSStore((s) => s.minimizeWindow);
  const maximizeWindow = useOSStore((s) => s.maximizeWindow);
  const closeWindow = useOSStore((s) => s.closeWindow);
  const updateWindowPosition = useOSStore((s) => s.updateWindowPosition);
  const updateWindowSize = useOSStore((s) => s.updateWindowSize);
  const setWindowSnap = useOSStore((s) => s.setWindowSnap);

  const [initial] = useState(() => initialGeometry(id, defaultWidth, defaultHeight));
  const [size, setSize] = useState(initial.size);
  const [position, setPosition] = useState(initial.pos);
  const [prevNormalSize, setPrevNormalSize] = useState(initial.size);
  const [prevNormalPos, setPrevNormalPos] = useState(initial.pos);
  const [isSnapped, setIsSnapped] = useState<SnapZone | null>(() => {
    const zone = windowState?.isSnapped ? windowState.snapPosition : null;
    return zone === 'left' || zone === 'right' || zone === 'top' ? zone : null;
  });
  const [snapPreview, setSnapPreview] = useState<SnapZone | null>(null);
  const [isResizingOrDragging, setIsResizingOrDragging] = useState(false);

  // Keep desktop windows inside the viewport when the browser is resized
  useEffect(() => {
    if (isMobile) return;
    const onResize = () => {
      setSize((s) => clampSize(s.width, s.height));
      setPosition((p) => {
        const area = workArea();
        return { x: Math.max(0, Math.min(p.x, area.width - 80)), y: Math.max(0, Math.min(p.y, area.height - 44)) };
      });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isMobile]);

  if (!windowState) return null;

  const isFocused = focusedWindowId === id;
  const { isMaximized, isMinimized, zIndex } = windowState;
  const fullScreen = isMobile || isMaximized;

  const handleResizeStart = (e: React.PointerEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    focusWindow(id);
    if (fullScreen) return;

    setIsResizingOrDragging(true);
    const startX = position.x;
    const startY = position.y;
    const startWidth = size.width;
    const startHeight = size.height;
    const startPointerX = e.clientX;
    const startPointerY = e.clientY;
    setIsSnapped(null);

    let final = { width: startWidth, height: startHeight, x: startX, y: startY };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startPointerX;
      const dy = moveEvent.clientY - startPointerY;
      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startX;
      let newY = startY;

      if (handle.includes('right')) {
        newWidth = Math.max(MIN_WIDTH, startWidth + dx);
      } else if (handle.includes('left')) {
        newWidth = Math.max(MIN_WIDTH, startWidth - dx);
        newX = startX + (startWidth - newWidth);
      }
      if (handle.includes('bottom')) {
        newHeight = Math.max(MIN_HEIGHT, startHeight + dy);
      } else if (handle.includes('top')) {
        newHeight = Math.max(MIN_HEIGHT, startHeight - dy);
        newY = startY + (startHeight - newHeight);
      }

      final = { width: newWidth, height: newHeight, x: newX, y: newY };
      setSize({ width: newWidth, height: newHeight });
      setPosition({ x: newX, y: newY });
    };

    const handlePointerUp = () => {
      setIsResizingOrDragging(false);
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      updateWindowSize(id, final.width, final.height);
      updateWindowPosition(id, final.x, final.y);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  const handleHeaderPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('.win-control-btn')) return;
    focusWindow(id);
    if (isMobile) return; // Mobile windows are fixed full-screen
    e.preventDefault();

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

    let currentX = startX;
    let currentY = startY;
    let isDraggingRestored = false;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startPointerX;
      const dy = moveEvent.clientY - startPointerY;
      let nextX = startX + dx;
      let nextY = startY + dy;

      if ((wasMaximized || activeSnapped) && !isDraggingRestored && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
        isDraggingRestored = true;
        if (wasMaximized) maximizeWindow(id);
        setIsSnapped(null);
        setWindowSnap(id, false, null);
        setSize(prevNormalSize);
        nextX = moveEvent.clientX - restoreWidth * relativeClickX;
        nextY = moveEvent.clientY - 20;
      }

      if ((!wasMaximized && !activeSnapped) || isDraggingRestored) {
        // Keep the title bar reachable: never above the top edge or below the taskbar
        currentX = nextX;
        currentY = Math.max(0, Math.min(nextY, workArea().height - 44));
        setPosition({ x: currentX, y: currentY });
      }

      setSnapPreview(snapZoneAt(moveEvent.clientX, moveEvent.clientY));
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      setIsResizingOrDragging(false);
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);

      const zone = snapZoneAt(upEvent.clientX, upEvent.clientY);
      setSnapPreview(null);

      if (zone) {
        if (!isSnapped && !isMaximized) {
          setPrevNormalSize({ width: size.width, height: size.height });
          setPrevNormalPos({ x: currentX, y: currentY });
        }
        setIsSnapped(zone);
        const area = workArea();
        const newWidth = zone === 'top' ? area.width : area.width / 2;
        const newHeight = area.height;
        const newX = zone === 'right' ? area.width / 2 : 0;
        const newY = 0;

        setPosition({ x: newX, y: newY });
        setSize({ width: newWidth, height: newHeight });
        setWindowSnap(id, true, zone);
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

  const toggleMaximize = () => {
    if (!isMaximized) {
      setPrevNormalSize({ width: size.width, height: size.height });
      setPrevNormalPos({ x: position.x, y: position.y });
    }
    maximizeWindow(id);
    setIsSnapped(null);
    setWindowSnap(id, false, null);
  };

  const handleHeaderDoubleClick = (e: React.MouseEvent) => {
    if (isMobile || (e.target as HTMLElement).closest('.win-control-btn')) return;
    toggleMaximize();
  };

  const variants = {
    open: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 250 } },
    minimized: { opacity: 0, scale: 0.8, y: 100, transition: { duration: 0.2, ease: 'easeOut' } },
    closed: { opacity: 0, scale: 0.9, transition: { duration: 0.15 } },
  } as const;

  const geometry: React.CSSProperties = fullScreen
    ? { left: 0, top: 0, width: '100vw', height: 'calc(100dvh - var(--spacing-taskbar))' }
    : { left: position.x, top: position.y, width: size.width, height: size.height };

  return (
    <>
      {/* Snap assist preview */}
      {snapPreview && (
        <div
          aria-hidden
          className="fixed pointer-events-none z-[8999] rounded-2xl border-[2.5px] border-dashed border-line bg-highlight/25 transition-all duration-200 ease-out"
          style={{
            top: 6,
            bottom: `calc(var(--spacing-taskbar) + 6px)`,
            left: snapPreview === 'right' ? 'calc(50vw + 3px)' : 6,
            right: snapPreview === 'left' ? 'calc(50vw + 3px)' : 6,
          }}
        />
      )}

      <motion.div
        ref={windowRef}
        role="region"
        aria-label={title}
        aria-hidden={isMinimized || undefined}
        initial="closed"
        animate={isMinimized ? 'minimized' : 'open'}
        variants={variants}
        onPointerDown={() => focusWindow(id)}
        style={{
          ...geometry,
          zIndex: WINDOW_LAYER_BASE + zIndex,
          position: 'absolute',
          pointerEvents: isMinimized ? 'none' : undefined,
        }}
        className={cx(
          'flex flex-col overflow-hidden select-none border-line bg-surface text-fg font-doodle',
          fullScreen ? 'border-b-[2.5px]' : 'rounded-2xl border-[2.5px]',
          !fullScreen && (isFocused ? 'shadow-doodle-lg' : 'shadow-doodle-md'),
          !isFocused && !fullScreen && 'opacity-95',
          !isResizingOrDragging && 'transition-[width,height,left,top,box-shadow,opacity] duration-300 ease-out',
        )}
      >
        {/* Resize handles (desktop only) */}
        {!fullScreen && (
          <>
            <div onPointerDown={(e) => handleResizeStart(e, 'top')} className="absolute top-0 left-2 right-2 h-1.5 cursor-n-resize -translate-y-1/2 z-50 touch-none" />
            <div onPointerDown={(e) => handleResizeStart(e, 'bottom')} className="absolute bottom-0 left-2 right-2 h-1.5 cursor-s-resize translate-y-1/2 z-50 touch-none" />
            <div onPointerDown={(e) => handleResizeStart(e, 'left')} className="absolute left-0 top-2 bottom-2 w-1.5 cursor-w-resize -translate-x-1/2 z-50 touch-none" />
            <div onPointerDown={(e) => handleResizeStart(e, 'right')} className="absolute right-0 top-2 bottom-2 w-1.5 cursor-e-resize translate-x-1/2 z-50 touch-none" />
            <div onPointerDown={(e) => handleResizeStart(e, 'top-left')} className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize -translate-x-1/2 -translate-y-1/2 z-50 touch-none" />
            <div onPointerDown={(e) => handleResizeStart(e, 'top-right')} className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize translate-x-1/2 -translate-y-1/2 z-50 touch-none" />
            <div onPointerDown={(e) => handleResizeStart(e, 'bottom-left')} className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize -translate-x-1/2 translate-y-1/2 z-50 touch-none" />
            <div onPointerDown={(e) => handleResizeStart(e, 'bottom-right')} className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize translate-x-1/2 translate-y-1/2 z-50 touch-none" />
          </>
        )}

        {/* Title bar */}
        <div
          onPointerDown={handleHeaderPointerDown}
          onDoubleClick={handleHeaderDoubleClick}
          className={cx(
            'flex items-center justify-between gap-3 h-11 px-3 sm:px-4 shrink-0 border-b-[2.5px] border-line select-none',
            isFocused ? 'bg-surface-2' : 'bg-surface-3',
            !isMobile && 'touch-none cursor-default',
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0 text-sm">
            {icon ? (
              <span className="w-6 h-6 flex items-center justify-center p-0.5 border-2 border-ink rounded-lg bg-highlight text-ink shadow-doodle-xs">{icon}</span>
            ) : (
              <span aria-hidden className="w-3.5 h-3.5 shrink-0 rounded-full border-2 border-ink bg-highlight shadow-doodle-xs" />
            )}
            <h2 className="truncate font-bold tracking-wide text-fg">{title}</h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button type="button" onClick={() => minimizeWindow(id)} className={cx(controlBtn, 'bg-highlight')} aria-label={`Minimize ${title}`} title="Minimize">
              <Minus className="w-4 h-4 stroke-[3]" aria-hidden />
            </button>
            {!isMobile && (
              <button
                type="button"
                onClick={toggleMaximize}
                className={cx(controlBtn, 'bg-sky')}
                aria-label={isMaximized ? `Restore ${title}` : `Maximize ${title}`}
                title={isMaximized ? 'Restore' : 'Maximize'}
              >
                {isMaximized ? <Copy className="w-3.5 h-3.5 stroke-[3] rotate-180" aria-hidden /> : <Square className="w-3.5 h-3.5 stroke-[3]" aria-hidden />}
              </button>
            )}
            <button type="button" onClick={() => closeWindow(id)} className={cx(controlBtn, 'bg-rose')} aria-label={`Close ${title}`} title="Close">
              <X className="w-4 h-4 stroke-[3]" aria-hidden />
            </button>
          </div>
        </div>

        {/* Window body */}
        <div className="flex-1 min-h-0 overflow-auto bg-surface text-fg select-text">{children}</div>
      </motion.div>
    </>
  );
}
