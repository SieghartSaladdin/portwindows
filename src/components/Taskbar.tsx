'use client';

import React from 'react';
import { Volume2, VolumeX, Sun, Moon, MessageSquare, LayoutGrid } from 'lucide-react';
import { useOSStore } from '@/lib/store';
import { useDateTime } from '@/hooks/useDateTime';
import { APPS } from '@/hooks/appRegistry';
import { cx } from '@/components/ui/primitives';
import { DoodleHomeIcon, DoodleSearchIcon, DoodleWidgetsIcon } from '@/components/ui/DoodleIcons';

const trayButton =
  'shrink-0 inline-flex items-center justify-center gap-1.5 h-9 rounded-xl border-2 shadow-doodle-sm transition-all cursor-pointer font-doodle text-xs font-bold ' +
  'active:translate-x-[1px] active:translate-y-[1px] active:shadow-doodle-xs';

const idle = 'bg-surface text-fg border-line hover:bg-surface-3';
const pressed = 'bg-highlight text-ink border-ink';

export function Taskbar() {
  const windows = useOSStore((s) => s.windows);
  const focusedWindowId = useOSStore((s) => s.focusedWindowId);
  const startMenuOpen = useOSStore((s) => s.startMenuOpen);
  const taskViewOpen = useOSStore((s) => s.taskViewOpen);
  const isQuickSettingsOpen = useOSStore((s) => s.isQuickSettingsOpen);
  const isWidgetsOpen = useOSStore((s) => s.isWidgetsOpen);
  const isNotificationCenterOpen = useOSStore((s) => s.isNotificationCenterOpen);
  const unreadNotificationsCount = useOSStore((s) => s.unreadNotificationsCount);
  const isChatInputOpen = useOSStore((s) => s.isChatInputOpen);
  const themeMode = useOSStore((s) => s.themeMode);
  const speechVolume = useOSStore((s) => s.frierenConfig.speechVolume);

  const { time, date, fullDate } = useDateTime();

  const closePanels = () => {
    const s = useOSStore.getState();
    s.closeQuickSettings();
    s.closeWidgets();
    s.closeNotificationCenter();
  };

  const handleAppClick = (id: string, title: string) => {
    const s = useOSStore.getState();
    const w = s.windows[id];
    if (!w || !w.isOpen) s.openWindow(id, title);
    else if (w.isMinimized) s.focusWindow(id);
    else if (s.focusedWindowId === id) s.minimizeWindow(id);
    else s.focusWindow(id);
  };

  // Launcher apps are always shown; other apps (e.g. the projector) appear while open.
  const taskbarApps = APPS.filter((a) => a.launcher || windows[a.id]?.isOpen);
  const isMuted = (speechVolume ?? 0) === 0;
  const badge = unreadNotificationsCount > 9 ? '9+' : String(unreadNotificationsCount);

  return (
    <nav
      data-taskbar
      aria-label="Taskbar"
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className="fixed bottom-0 inset-x-0 z-[9000] h-taskbar border-t-[2.5px] border-line bg-surface-2 text-fg flex items-center gap-2 px-2 sm:px-3 select-none font-doodle"
    >
      {/* Left: widgets */}
      <button
        type="button"
        data-trigger="widgets"
        onClick={() => useOSStore.getState().toggleWidgets()}
        aria-label="Widgets"
        aria-expanded={isWidgetsOpen}
        title="Widgets"
        className={cx(trayButton, 'w-9 lg:w-auto lg:px-3', isWidgetsOpen ? pressed : idle)}
      >
        <DoodleWidgetsIcon className="w-5 h-5" />
        <span className="hidden lg:inline">Widgets</span>
      </button>

      {/* Center: start, search, task view, apps (scrolls horizontally on small screens) */}
      <div className="flex-1 min-w-0 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex items-center gap-2 w-max mx-auto py-1 px-0.5">
          <button
            type="button"
            data-trigger="start"
            onClick={() => {
              closePanels();
              useOSStore.getState().toggleStartMenu();
            }}
            aria-label="Start"
            aria-expanded={startMenuOpen}
            aria-haspopup="menu"
            title="Start"
            className={cx(trayButton, 'w-10 h-10 border-[2.5px]', startMenuOpen ? pressed : idle)}
          >
            <DoodleHomeIcon className="w-6 h-6" />
          </button>

          <button
            type="button"
            data-trigger="start"
            onClick={() => {
              const s = useOSStore.getState();
              closePanels();
              if (!s.startMenuOpen) s.toggleStartMenu();
              s.setStartMenuSearchFocused(true);
            }}
            aria-label="Search apps, projects and skills"
            title="Search"
            className={cx(trayButton, 'w-9', idle)}
          >
            <DoodleSearchIcon className="w-5 h-5" />
          </button>

          <button
            type="button"
            data-trigger="task-view"
            onClick={() => {
              const s = useOSStore.getState();
              closePanels();
              s.closeStartMenu();
              s.toggleTaskView();
            }}
            aria-label="Task view"
            aria-pressed={taskViewOpen}
            title="Task view"
            className={cx(trayButton, 'w-9', taskViewOpen ? pressed : idle)}
          >
            <LayoutGrid className="w-4 h-4" aria-hidden />
          </button>

          <span aria-hidden className="w-0 h-6 border-r-2 border-dashed border-line/60 mx-0.5 shrink-0" />

          {taskbarApps.map((app) => {
            const w = windows[app.id];
            const isOpen = !!w?.isOpen;
            const isFocused = isOpen && !w.isMinimized && focusedWindowId === app.id;
            const Glyph = app.Icon;
            return (
              <button
                key={app.id}
                type="button"
                onClick={() => handleAppClick(app.id, app.title)}
                aria-label={isOpen ? `${app.title}${isFocused ? ' (active)' : w.isMinimized ? ' (minimized)' : ' (open)'}` : `Open ${app.title}`}
                aria-pressed={isFocused}
                title={app.title}
                className={cx(
                  trayButton,
                  'px-2',
                  isFocused ? 'bg-sky text-ink border-ink' : isOpen ? 'bg-mint text-ink border-ink' : idle,
                )}
              >
                <Glyph className="w-5 h-5" />
                {isOpen && <span className="hidden md:inline truncate max-w-[88px]">{app.title}</span>}
                {isOpen && <span aria-hidden className={cx('w-1.5 h-1.5 rounded-full bg-ink', isFocused && 'motion-safe:animate-pulse')} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right tray */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <button
          type="button"
          onClick={() => {
            const s = useOSStore.getState();
            closePanels();
            s.closeStartMenu();
            if (s.isChatInputOpen && s.activeChatPartner === 'robot') {
              s.setIsChatInputOpen(false);
            } else {
              s.setActiveChatPartner('robot');
              s.setIsChatInputOpen(true);
            }
          }}
          aria-label="Chat with HelperBot"
          aria-pressed={isChatInputOpen}
          title="Chat with HelperBot"
          className={cx(trayButton, 'w-9', isChatInputOpen ? pressed : idle)}
        >
          <MessageSquare className="w-4 h-4" aria-hidden />
        </button>

        <button
          type="button"
          data-trigger="quick-settings"
          onClick={() => useOSStore.getState().toggleQuickSettings()}
          aria-label="Quick settings"
          aria-expanded={isQuickSettingsOpen}
          title="Quick settings"
          className={cx(trayButton, 'px-2.5', isQuickSettingsOpen ? pressed : idle)}
        >
          {themeMode === 'dark' ? <Moon className="w-4 h-4" aria-hidden /> : <Sun className="w-4 h-4" aria-hidden />}
          {isMuted ? <VolumeX className="w-4 h-4" aria-hidden /> : <Volume2 className="w-4 h-4" aria-hidden />}
        </button>

        <button
          type="button"
          data-trigger="notifications"
          onClick={() => useOSStore.getState().toggleNotificationCenter()}
          aria-label={`${fullDate || 'Clock'}. Notifications${unreadNotificationsCount ? `: ${unreadNotificationsCount} unread` : ''}`}
          aria-expanded={isNotificationCenterOpen}
          title={fullDate}
          className={cx(trayButton, 'relative px-2.5', isNotificationCenterOpen ? pressed : idle)}
        >
          <span className="tabular-nums">{time || ' '}</span>
          {date && <span className="hidden sm:inline border-l-2 border-dashed border-current/40 pl-1.5 font-normal">{date}</span>}
          {unreadNotificationsCount > 0 && (
            <span aria-hidden className="absolute -top-2 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full border-2 border-ink bg-rose text-ink text-3xs font-bold flex items-center justify-center">
              {badge}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}

