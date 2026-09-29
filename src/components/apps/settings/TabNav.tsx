'use client';

import React from 'react';
import { cx } from '@/components/ui/primitives';

export interface TabItem<T extends string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
  /** Optional small count shown next to the label */
  count?: number;
}

interface TabNavProps<T extends string> {
  /** Prefix for tab/panel ids so several tab lists can coexist on the page */
  idPrefix: string;
  label: string;
  items: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
}

export const tabId = (prefix: string, id: string) => `${prefix}-tab-${id}`;
export const panelId = (prefix: string, id: string) => `${prefix}-panel-${id}`;

/**
 * Responsive tab list: a horizontal, scrollable strip under 640px and a vertical
 * side index from `sm` up. Arrow keys / Home / End move between tabs.
 */
export function TabNav<T extends string>({ idPrefix, label, items, value, onChange, className }: TabNavProps<T>) {
  const refs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = -1;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (index + 1) % items.length;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (index - 1 + items.length) % items.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = items.length - 1;
    if (next === -1) return;
    e.preventDefault();
    onChange(items[next].id);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      className={cx(
        'flex gap-1.5 overflow-x-auto sm:overflow-visible sm:flex-col p-2 sm:p-3 shrink-0',
        className,
      )}
    >
      {items.map((item, index) => {
        const selected = item.id === value;
        return (
          <button
            key={item.id}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="tab"
            id={tabId(idPrefix, item.id)}
            aria-selected={selected}
            aria-controls={panelId(idPrefix, item.id)}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.id)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={cx(
              'flex items-center gap-2 shrink-0 whitespace-nowrap rounded-xl border-2 px-3 py-1.5 sm:py-2 text-xs font-bold font-doodle transition-all cursor-pointer text-left',
              selected
                ? 'bg-highlight text-ink border-ink shadow-doodle-sm'
                : 'bg-surface text-fg border-line hover:bg-surface-3',
            )}
          >
            {item.icon && <span className="w-4 h-4 flex items-center justify-center shrink-0" aria-hidden>{item.icon}</span>}
            <span className="flex-1">{item.label}</span>
            {typeof item.count === 'number' && (
              <span className={cx('text-2xs rounded-full border px-1.5', selected ? 'border-ink' : 'border-line text-fg-muted')}>
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
