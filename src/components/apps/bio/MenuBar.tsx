'use client';

import React from 'react';
import { cx } from '@/components/ui/primitives';

export interface MenuItem {
  label: string;
  onSelect: () => void;
  hint?: string;
  disabled?: boolean;
}

export interface MenuDef {
  label: string;
  items: MenuItem[];
}

/**
 * Tiny notepad-style menu bar: one dropdown open at a time, closes on outside
 * click, Escape or after choosing an item. Arrow keys move inside an open menu.
 */
export function MenuBar({ menus, className }: { menus: MenuDef[]; className?: string }) {
  const [open, setOpen] = React.useState<number | null>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (open === null) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const focusItem = (menuIndex: number, itemIndex: number) => {
    const list = rootRef.current?.querySelectorAll<HTMLButtonElement>(`[data-menu="${menuIndex}"] [role="menu"] [role="menuitem"]:not(:disabled)`);
    if (!list || list.length === 0) return;
    const i = (itemIndex + list.length) % list.length;
    list[i]?.focus();
  };

  return (
    <div ref={rootRef} role="menubar" className={cx('flex items-center gap-1.5', className)}>
      {menus.map((menu, mi) => {
        const isOpen = open === mi;
        return (
          <div key={menu.label} className="relative" data-menu={mi}>
            <button
              type="button"
              role="menuitem"
              aria-haspopup="menu"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : mi)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setOpen(mi);
                  requestAnimationFrame(() => focusItem(mi, 0));
                }
              }}
              className={cx(
                'px-2.5 py-1 rounded-lg border-2 text-xs font-bold font-doodle cursor-pointer transition',
                isOpen ? 'bg-highlight text-ink border-ink shadow-doodle-xs' : 'border-transparent text-fg hover:bg-surface-3 hover:border-line',
              )}
            >
              {menu.label}
            </button>
            {isOpen && (
              <div
                role="menu"
                aria-label={menu.label}
                className="absolute left-0 top-full mt-1.5 min-w-44 z-50 py-1.5 flex flex-col rounded-xl border-2 border-line bg-surface text-fg shadow-doodle"
              >
                {menu.items.map((item, ii) => (
                  <button
                    key={item.label}
                    type="button"
                    role="menuitem"
                    disabled={item.disabled}
                    onClick={() => {
                      setOpen(null);
                      item.onSelect();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        focusItem(mi, ii + 1);
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        focusItem(mi, ii - 1);
                      }
                    }}
                    className="flex items-center justify-between gap-4 px-3 py-1.5 text-left text-xs font-bold font-doodle cursor-pointer hover:bg-surface-3 focus-visible:bg-surface-3 disabled:opacity-50 disabled:cursor-default"
                  >
                    <span>{item.label}</span>
                    {item.hint && <span className="text-2xs text-fg-muted font-mono">{item.hint}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
