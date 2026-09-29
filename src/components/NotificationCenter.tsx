'use client';

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { useOSStore } from '@/lib/store';
import { useDateTime } from '@/hooks/useDateTime';
import { useDismiss } from '@/hooks/useDismiss';
import { APP_BY_ID } from '@/hooks/appRegistry';
import { Button, EmptyState, IconButton } from '@/components/ui/primitives';

function timeAgo(ts: number) {
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 45) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  return new Date(ts).toLocaleDateString();
}

export function NotificationCenter() {
  const open = useOSStore((s) => s.isNotificationCenterOpen);
  const notifications = useOSStore((s) => s.notifications);
  const close = useOSStore((s) => s.closeNotificationCenter);
  const dismiss = useOSStore((s) => s.dismissNotification);
  const clearAll = useOSStore((s) => s.clearNotifications);
  const openWindow = useOSStore((s) => s.openWindow);
  const { fullDate } = useDateTime();
  const panelRef = useRef<HTMLDivElement>(null);

  useDismiss(panelRef, open, close, '[data-trigger="notifications"]');

  return (
    <AnimatePresence>
      {open && (
        <motion.section
          ref={panelRef}
          role="dialog"
          aria-label="Notifications"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
          className="fixed right-2 sm:right-3 bottom-[calc(var(--spacing-taskbar)+0.5rem)] z-[9000] w-[calc(100vw-1rem)] sm:w-[360px] max-h-[calc(100dvh-var(--spacing-taskbar)-1.5rem)] flex flex-col rounded-2xl border-[2.5px] border-line bg-surface text-fg shadow-doodle-lg font-doodle select-none"
        >
          <header className="flex items-center gap-2 px-4 py-3 border-b-2 border-line">
            <span className="w-8 h-8 rounded-lg border-2 border-ink bg-highlight text-ink flex items-center justify-center shadow-doodle-xs">
              <Bell className="w-4 h-4" aria-hidden />
            </span>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold">Notifications</h2>
              {fullDate && <p className="text-2xs text-fg-muted truncate">{fullDate}</p>}
            </div>
            {notifications.length > 0 && (
              <Button size="sm" variant="ghost" onClick={clearAll}>
                Clear all
              </Button>
            )}
            <IconButton label="Close notifications" size="sm" onClick={close}>
              <X className="w-3.5 h-3.5" />
            </IconButton>
          </header>

          <div className="flex-1 min-h-0 overflow-y-auto p-3">
            {notifications.length === 0 ? (
              <EmptyState
                icon={<Bell className="w-8 h-8" aria-hidden />}
                title="You're all caught up"
                message="New notifications from Aura OS and the companions will show up here."
              />
            ) : (
              <ul className="flex flex-col gap-2.5">
                {notifications.map((n) => {
                  const app = n.appId ? APP_BY_ID[n.appId] : undefined;
                  const AppGlyph = app?.Icon;
                  const body = (
                    <>
                      <span className="shrink-0 w-8 h-8 rounded-lg border-2 border-line bg-surface-2 flex items-center justify-center">
                        {AppGlyph ? <AppGlyph className="w-5 h-5" /> : <Bell className="w-4 h-4" aria-hidden />}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="flex items-baseline gap-2">
                          <span className="text-xs font-bold truncate flex-1">{n.title}</span>
                          <span className="text-3xs text-fg-muted shrink-0">{timeAgo(n.createdAt)}</span>
                        </span>
                        <span className="block text-xs text-fg-muted leading-relaxed mt-0.5">{n.message}</span>
                        {app && <span className="block text-2xs font-bold mt-1 underline decoration-dashed">Open {app.title}</span>}
                      </span>
                    </>
                  );
                  return (
                    <li key={n.id} className="relative group">
                      {app ? (
                        <button
                          type="button"
                          onClick={() => {
                            openWindow(app.id, app.title);
                            dismiss(n.id);
                            close();
                          }}
                          className="w-full flex items-start gap-2.5 p-3 pr-9 rounded-xl border-2 border-line bg-surface-2 hover:bg-surface-3 shadow-doodle-sm text-left cursor-pointer transition"
                        >
                          {body}
                        </button>
                      ) : (
                        <div className="w-full flex items-start gap-2.5 p-3 pr-9 rounded-xl border-2 border-line bg-surface-2 shadow-doodle-sm">
                          {body}
                        </div>
                      )}
                      <button
                        type="button"
                        aria-label={`Dismiss notification: ${n.title}`}
                        title="Dismiss"
                        onClick={() => dismiss(n.id)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-lg border-2 border-transparent hover:border-line hover:bg-rose hover:text-ink flex items-center justify-center cursor-pointer text-fg-muted"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
