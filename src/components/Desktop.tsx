'use client';

import React from 'react';
import { useOSStore } from '@/lib/store';
import { useContextMenu } from '@/hooks/useContextMenu';
import { DESKTOP_ICONS } from '@/lib/data';
import { AppIcon } from '@/components/ui/AppIcon';
import { WindowContainer } from '@/components/ui/WindowContainer';
import { ContextMenu } from '@/components/ui/ContextMenu';
import { StartMenu } from '@/components/StartMenu';
import { Taskbar } from '@/components/Taskbar';
import { DesktopChatInput } from '@/components/ui/DesktopChatInput';
import { TaskView } from '@/components/TaskView';
import { QuickSettings } from '@/components/ui/QuickSettings';
import { WidgetsPanel } from '@/components/ui/WidgetsPanel';
import { LockScreen } from '@/components/ui/LockScreen';

// Apps imports
import { BioApp } from '@/components/apps/BioApp';
import { ProjectsApp } from '@/components/apps/ProjectsApp';
import { TerminalApp } from '@/components/apps/TerminalApp';
import { SettingsApp } from '@/components/apps/SettingsApp';
import { FrierenApp } from '@/components/apps/FrierenApp';
import { AdminApp } from './apps/AdminApp';

// Desktop components
import { FrierenPet } from '@/components/ui/FrierenPet';
import { FernPet } from '@/components/ui/FernPet';
import { StarkPet } from '@/components/ui/StarkPet';

import { FileText, Folder, Terminal, Settings, Gamepad2, ShieldAlert } from 'lucide-react';

export function Desktop() {
  const { wallpaper, closeStartMenu, setIsChatInputOpen, fetchDatabaseData } = useOSStore();

  React.useEffect(() => {
    fetchDatabaseData();
  }, [fetchDatabaseData]);

  const { isOpen, position, handleContextMenu, closeMenu } = useContextMenu();

  // Map wallpaper ids to Tailwind background gradient styles
  const getWallpaperClass = () => {
    switch (wallpaper) {
      case 'sunset':
        return 'bg-gradient-to-tr from-zinc-950 via-neutral-900 to-rose-950';
      case 'emerald':
        return 'bg-gradient-to-tr from-stone-950 via-zinc-900 to-emerald-950';
      case 'cyberpunk':
        return 'bg-gradient-to-tr from-slate-950 via-slate-900 to-fuchsia-950';
      case 'default':
      default:
        return 'bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950';
    }
  };

  const handleDesktopClick = (e: React.MouseEvent) => {
    // Left clicking desktop closes menus
    closeStartMenu();
    closeMenu();
    setIsChatInputOpen(false);
  };

  return (
    <div
      onContextMenu={(e) => handleContextMenu(e.nativeEvent)}
      onClick={handleDesktopClick}
      className={`
        relative w-screen h-screen overflow-hidden select-none transition-all duration-500 ease-in-out
        ${getWallpaperClass()}
      `}
    >
      {/* Desktop Application Icons Grid */}
      <div className="absolute inset-0 p-4 pt-6 flex flex-col flex-wrap content-start items-start gap-4 h-[calc(100vh-48px)]">
        {DESKTOP_ICONS.map((icon) => (
          <AppIcon key={icon.id} icon={icon} />
        ))}
      </div>

      {/* Frieren Desktop Pet */}
      <FrierenPet />
      {/* Fern NPC Desktop Pet */}
      <FernPet />
      {/* Stark NPC Desktop Pet */}
      <StarkPet />

      {/* Draggable Active Windows Containers */}
      <WindowContainer
        id="bio"
        title="Bio.txt - Notepad"
        icon={<FileText className="w-4 h-4 text-emerald-400" />}
      >
        <BioApp />
      </WindowContainer>

      <WindowContainer
        id="projects"
        title="Projects"
        defaultWidth={850}
        defaultHeight={600}
        icon={<Folder className="w-4 h-4 text-amber-400" />}
      >
        <ProjectsApp />
      </WindowContainer>

      <WindowContainer
        id="terminal"
        title="Command Prompt"
        defaultWidth={700}
        defaultHeight={450}
        icon={<Terminal className="w-4 h-4 text-indigo-400" />}
      >
        <TerminalApp />
      </WindowContainer>

      <WindowContainer
        id="settings"
        title="Settings"
        defaultWidth={800}
        defaultHeight={550}
        icon={<Settings className="w-4 h-4 text-blue-400" />}
      >
        <SettingsApp />
      </WindowContainer>

      <WindowContainer
        id="frieren"
        title="Frieren.exe"
        defaultWidth={650}
        defaultHeight={420}
        icon={<Gamepad2 className="w-4 h-4 text-rose-400" />}
      >
        <FrierenApp />
      </WindowContainer>

      <WindowContainer
        id="admin"
        title="Admin Dashboard"
        defaultWidth={900}
        defaultHeight={600}
        icon={<ShieldAlert className="w-4 h-4 text-red-400" />}
      >
        <AdminApp />
      </WindowContainer>

      {/* Frieren speech typing input bar */}
      <DesktopChatInput />

      {/* Start Menu Overlay */}
      <StartMenu />

      {/* Right-click Context Menu */}
      <ContextMenu isOpen={isOpen} position={position} onClose={closeMenu} />

      {/* Task View Overlay */}
      <TaskView />

      {/* System Taskbar */}
      <Taskbar />

      {/* Quick Settings Panel Popover */}
      <QuickSettings />

      {/* Left-sliding Widgets Panel */}
      <WidgetsPanel />

      {/* Lock Screen Full-screen Sign-in Overlay */}
      <LockScreen />
    </div>
  );
}
