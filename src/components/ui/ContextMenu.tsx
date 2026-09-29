'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, ArrowDownAZ, RotateCcw, Check } from 'lucide-react';
import { useOSStore, type DesktopIconSize } from '@/lib/store';
import { cx } from '@/components/ui/primitives';
import { DoodleTerminalIcon, DoodleSettingsIcon, DoodleWidgetsIcon } from '@/components/ui/DoodleIcons';

interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  /** Re-fetch portfolio data and show visual feedback on the desktop */
  onRefresh: () => void;
}

const ICON_SIZES: Array<{ id: DesktopIconSize; label: string }> = [
  { id: 'small', label: 'Small' },
  { id: 'medium', label: 'Medium' },
  { id: 'large', label: 'Large' },
];

const itemClass =
  'w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl border-2 border-transparent text-left text-xs font-bold cursor-pointer transition ' +
  'text-fg hover:border-line hover:bg-surface-3 focus-visible:border-line focus-visible:bg-surface-3 outline-none';

export function ContextMenu({ isOpen, position, onClose, onRefresh }: ContextMenuProps) {
  const openWindow = useOSStore((s) => s.openWindow);
  const desktopIconSize = useOSStore((s) => s.desktopIconSize);
  const desktopIconSort = useOSStore((s) => s.desktopIconSort);
  const setDesktopIconSize = useOSStore((s) => s.setDesktopIconSize);
  const setDesktopIconSort = useOSStore((s) => s.setDesktopIconSort);
  const menuRef = useRef<HTMLDivElement>(null);

  // Focus the first item so the menu is keyboard-usable immediately
  useEffect(() => {
    if (isOpen) menuRef.current?.querySelector<HTMLElement>('[role^="menuitem"]')?.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  const run = (fn: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    fn();
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Home' && e.key !== 'End') return;
    e.preventDefault();
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role^="menuitem"]') ?? []);
    if (items.length === 0) return;
    const current = items.indexOf(document.activeElement as HTMLElement);
    let next = 0;
    if (e.key === 'ArrowDown') next = (current + 1) % items.length;
    if (e.key === 'ArrowUp') next = (current - 1 + items.length) % items.length;
    if (e.key === 'End') next = items.length - 1;
    items[next]?.focus();
  };

  return (
    <motion.div
      ref={menuRef}
      role="menu"
      aria-label="Desktop menu"
      initial={{ opacity: 0, scale: 0.95, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.12, ease: 'easeOut' }}
      style={{ top: position.y, left: position.x }}
      className="fixed z-[9000] w-64 max-h-[calc(100dvh-16px)] overflow-y-auto rounded-2xl border-[2.5px] border-line bg-surface p-2 font-doodle text-xs text-fg shadow-doodle-md select-none"
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onKeyDown={handleKeyDown}
    >
      <button type="button" role="menuitem" onClick={run(onRefresh)} className={itemClass}>
        <RefreshCw className="w-4 h-4" aria-hidden />
        <span>Refresh</span>
      </button>

      <hr className="my-1.5 border-t-2 border-dashed border-line/40" />

      <div className="px-3 pt-1 pb-1 text-2xs font-bold uppercase tracking-wider text-fg-muted flex items-center gap-1.5" aria-hidden>
        <DoodleWidgetsIcon className="w-3.5 h-3.5" />
        View: icon size
      </div>
      <div role="group" aria-label="Icon size" className="flex gap-1.5 px-2 pb-1.5">
        {ICON_SIZES.map((s) => {
          const active = desktopIconSize === s.id;
          return (
            <button
              key={s.id}
              type="button"
              role="menuitemradio"
              aria-checked={active}
              onClick={run(() => setDesktopIconSize(s.id))}
              className={cx(
                'flex-1 h-7 rounded-xl border-2 text-2xs font-bold cursor-pointer transition outline-none focus-visible:shadow-doodle-sm',
                active ? 'bg-highlight text-ink border-ink shadow-doodle-xs' : 'bg-surface-2 text-fg border-line hover:bg-surface-3',
              )}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        role="menuitemradio"
        aria-checked={desktopIconSort === 'name'}
        onClick={run(() => setDesktopIconSort('name'))}
        className={itemClass}
      >
        <ArrowDownAZ className="w-4 h-4" aria-hidden />
        <span className="flex-1">Sort icons by name</span>
        {desktopIconSort === 'name' && <Check className="w-3.5 h-3.5" aria-hidden />}
      </button>
      <button
        type="button"
        role="menuitemradio"
        aria-checked={desktopIconSort === 'default'}
        onClick={run(() => setDesktopIconSort('default'))}
        className={itemClass}
      >
        <RotateCcw className="w-4 h-4" aria-hidden />
        <span className="flex-1">Reset icon order</span>
        {desktopIconSort === 'default' && <Check className="w-3.5 h-3.5" aria-hidden />}
      </button>

      <hr className="my-1.5 border-t-2 border-dashed border-line/40" />

      <button type="button" role="menuitem" onClick={run(() => openWindow('terminal', 'Aura Terminal'))} className={itemClass}>
        <DoodleTerminalIcon className="w-4 h-4" />
        <span>Open Terminal</span>
      </button>
      <button type="button" role="menuitem" onClick={run(() => openWindow('settings', 'Settings'))} className={itemClass}>
        <DoodleSettingsIcon className="w-4 h-4" />
        <span>Personalize</span>
      </button>
    </motion.div>
  );
}
