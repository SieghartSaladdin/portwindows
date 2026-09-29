'use client';

import React from 'react';
import { useOSStore } from '@/lib/store';
import { useContextMenu } from '@/hooks/useContextMenu';
import { DESKTOP_ICONS } from '@/lib/data';
import { APPS } from '@/hooks/appRegistry';
import { isPlaceholderProfile, profileLinkUrl } from '@/hooks/useProfileLinks';
import { AppIcon } from '@/components/ui/AppIcon';
import { WindowContainer } from '@/components/ui/WindowContainer';
import { ContextMenu } from '@/components/ui/ContextMenu';
import { StartMenu } from '@/components/StartMenu';
import { Taskbar } from '@/components/Taskbar';
import { DesktopChatInput } from '@/components/ui/DesktopChatInput';
import { SketchSky } from '@/components/SketchSky';
import { SketchSignature } from '@/components/SketchSignature';
import { TaskView } from '@/components/TaskView';
import { NotificationCenter } from '@/components/NotificationCenter';
import { QuickSettings } from '@/components/ui/QuickSettings';
import { WidgetsPanel } from '@/components/ui/WidgetsPanel';
import { LockScreen } from '@/components/ui/LockScreen';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Spinner, cx } from '@/components/ui/primitives';

// Apps
import { BioApp } from '@/components/apps/BioApp';
import { ProjectsApp } from '@/components/apps/ProjectsApp';
import { TerminalApp } from '@/components/apps/TerminalApp';
import { SettingsApp } from '@/components/apps/SettingsApp';
import { FrierenApp } from '@/components/apps/FrierenApp';
import { AdminApp } from '@/components/apps/AdminApp';
import { ProjectorApp } from '@/components/apps/ProjectorApp';

// Desktop companions
import { FrierenPet } from '@/components/ui/FrierenPet';
import { FernPet } from '@/components/ui/FernPet';
import { StarkPet } from '@/components/ui/StarkPet';
import { RobotPet } from '@/components/ui/RobotPet';

const APP_COMPONENTS: Record<string, React.ComponentType> = {
  bio: BioApp,
  projects: ProjectsApp,
  terminal: TerminalApp,
  settings: SettingsApp,
  frieren: FrierenApp,
  admin: AdminApp,
  projector: ProjectorApp,
};

const DEFAULT_TITLE = 'Aura OS | Interactive Doodle Portfolio';
const WELCOME_FLAG = 'aura_welcome_shown';

/** Hand-drawn sky (canvas, line-boil animated). */
const BackgroundDoodles = () => (
  <div aria-hidden className="absolute inset-0 pointer-events-none select-none overflow-hidden">
    <SketchSky />
  </div>
);

export function Desktop() {
  const profile = useOSStore((s) => s.profile);
  const dataStatus = useOSStore((s) => s.dataStatus);
  const isLocked = useOSStore((s) => s.isLocked);
  const desktopIconSize = useOSStore((s) => s.desktopIconSize);
  const desktopIconSort = useOSStore((s) => s.desktopIconSort);
  const fetchDatabaseData = useOSStore((s) => s.fetchDatabaseData);

  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const { isOpen, position, handleContextMenu, closeMenu } = useContextMenu();
  const gridRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    fetchDatabaseData();
  }, [fetchDatabaseData]);

  // Document title follows the real profile; the placeholder profile keeps the generic title
  React.useEffect(() => {
    if (dataStatus === 'ready' && !isPlaceholderProfile(profile)) {
      document.title = profile.title ? `${profile.name} · ${profile.title} | Aura OS` : `${profile.name} | Aura OS`;
    } else {
      document.title = DEFAULT_TITLE;
    }
  }, [profile, dataStatus]);

  // Welcome notifications on the first unlock of each browser session (pushed oldest-first, so the welcome ends on top)
  React.useEffect(() => {
    if (isLocked) return;
    try {
      if (sessionStorage.getItem(WELCOME_FLAG)) return;
      sessionStorage.setItem(WELCOME_FLAG, '1');
    } catch {
      return;
    }
    const { pushNotification } = useOSStore.getState();
    pushNotification({
      title: 'Tip: try the Terminal',
      message: 'Type `help` to list every command, or click the robot to chat with the AI companion.',
      appId: 'terminal',
    });
    pushNotification({
      title: 'Welcome to Aura OS',
      message: 'Double-click an icon (tap on mobile) to open it. Use Start to search apps, projects and skills.',
      appId: 'bio',
    });
  }, [isLocked]);

  // Tell the visitor when the portfolio API is unreachable (instead of silently showing nothing)
  const prevStatus = React.useRef(dataStatus);
  React.useEffect(() => {
    if (dataStatus === 'error' && prevStatus.current !== 'error') {
      useOSStore.getState().pushNotification({
        title: 'Portfolio data unavailable',
        message: 'The server could not be reached. Right-click the desktop and choose Refresh to try again.',
      });
    }
    prevStatus.current = dataStatus;
  }, [dataStatus]);

  const handleRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    const started = Date.now();
    await fetchDatabaseData();
    // Keep the feedback visible long enough to notice
    const remaining = 450 - (Date.now() - started);
    if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));
    setIsRefreshing(false);
  }, [fetchDatabaseData]);

  // Link icons are only shown when the matching profile field has a URL
  const icons = React.useMemo(() => {
    const visible = DESKTOP_ICONS.filter((icon) => icon.action !== 'openLink' || (icon.profileLink && profileLinkUrl(profile, icon.profileLink)));
    return desktopIconSort === 'name' ? [...visible].sort((a, b) => a.title.localeCompare(b.title)) : visible;
  }, [profile, desktopIconSort]);

  const handleDesktopClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Taskbar buttons manage their own panels (the Start button must not close the menu it just opened)
    if (target.closest('[data-taskbar]')) return;
    const s = useOSStore.getState();
    s.closeStartMenu();
    // Clicking the empty desktop (not a window) dismisses the chat bar
    if (!target.closest('[role="region"]')) s.setIsChatInputOpen(false);
  };

  // Arrow keys move focus between desktop icons
  const handleGridKeyDown = (e: React.KeyboardEvent) => {
    const keys = ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(e.key)) return;
    const items = Array.from(gridRef.current?.querySelectorAll<HTMLElement>('[data-desktop-icon]') ?? []);
    const current = items.indexOf(document.activeElement as HTMLElement);
    if (current === -1) return;
    e.preventDefault();
    let next = current;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = Math.min(items.length - 1, current + 1);
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = Math.max(0, current - 1);
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = items.length - 1;
    items[next]?.focus();
  };

  return (
    <div
      onContextMenu={(e) => {
        // Inside windows and dialogs keep the browser's own menu (copy text, etc.)
        if ((e.target as HTMLElement).closest('[role="region"], [role="dialog"]')) return;
        handleContextMenu(e.nativeEvent);
      }}
      onClick={handleDesktopClick}
      className="relative w-screen h-dvh overflow-hidden select-none font-doodle bg-doodle-paper text-fg transition-colors duration-500"
    >
      <BackgroundDoodles />

      {/* Desktop icons: columns on desktop, a scrollable grid on phones */}
      <div
        ref={gridRef}
        role="group"
        aria-label="Desktop shortcuts"
        onKeyDown={handleGridKeyDown}
        className={cx(
          'absolute inset-x-0 top-0 bottom-taskbar z-10 p-3 sm:p-6 overflow-y-auto overflow-x-hidden transition-opacity duration-300',
          'grid grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] content-start justify-items-center gap-2',
          'md:flex md:flex-col md:flex-wrap md:content-start md:items-start md:gap-3 md:overflow-hidden',
          isRefreshing && 'opacity-40',
        )}
      >
        {icons.map((icon) => (
          <AppIcon key={icon.id} icon={icon} size={desktopIconSize} />
        ))}
      </div>

      {/* Owner's signature in the page corner (above the icon layer so it can be clicked) */}
      <SketchSignature />

      {isRefreshing && (
        <div role="status" className="absolute top-4 left-1/2 -translate-x-1/2 z-[9000] flex items-center gap-2 px-4 py-2 rounded-full border-2 border-line bg-surface text-fg text-xs font-bold shadow-doodle-sm">
          <Spinner className="w-4 h-4" label="Refreshing" /> Refreshing desktop...
        </div>
      )}

      {/* Companions (z 40: above icons, below windows) */}
      <FrierenPet />
      <FernPet />
      <StarkPet />
      <RobotPet />

      {/* Windows */}
      {APPS.map((app) => {
        const AppComponent = APP_COMPONENTS[app.id];
        if (!AppComponent) return null;
        return (
          <WindowContainer key={app.id} id={app.id} title={app.title} defaultWidth={app.width} defaultHeight={app.height}>
            <AppComponent />
          </WindowContainer>
        );
      })}

      {/* Shell overlays */}
      <Taskbar />
      <StartMenu />
      <DesktopChatInput />
      <TaskView />
      <NotificationCenter />
      <QuickSettings />
      <WidgetsPanel />
      <LockScreen />
      <ConfirmDialog />

      {isOpen && <ContextMenu isOpen={isOpen} position={position} onClose={closeMenu} onRefresh={handleRefresh} />}
    </div>
  );
}
