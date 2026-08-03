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
import { ProjectorApp } from '@/components/apps/ProjectorApp';

// Desktop components
import { FrierenPet } from '@/components/ui/FrierenPet';
import { FernPet } from '@/components/ui/FernPet';
import { StarkPet } from '@/components/ui/StarkPet';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { RobotPet } from '@/components/ui/RobotPet';

// Decorative Hand-Drawn Doodles for Bright Wallpaper
const BackgroundDoodles = () => (
  <div className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-30">
    {/* Floating Paper Plane Doodle */}
    <div className="absolute top-12 right-24 animate-pulse">
      <svg className="w-16 h-16 text-[#2d2a26]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 2L11 13" />
        <path d="M22 2L15 22L11 13L2 9L22 2Z" fill="#fef08a" />
      </svg>
    </div>

    {/* Sparkle Doodles */}
    <div className="absolute top-1/4 left-1/3 text-2xl text-amber-700 font-doodle">✨</div>
    <div className="absolute top-2/3 right-1/4 text-3xl text-amber-600 font-doodle">✦</div>
    <div className="absolute bottom-28 left-1/4 text-xl text-sky-700 font-doodle">★</div>
    <div className="absolute top-20 left-1/2 text-2xl text-rose-600 font-doodle">✏️</div>

    {/* Hand-Written OS Motto */}
    <div className="absolute bottom-20 right-8 font-doodle text-sm text-[#2d2a26]/70 tracking-widest font-extrabold rotate-[-2deg]">
      ~ AuraOS • Handcrafted Doodle Edition ~
    </div>

    {/* Coffee Stain Ring Accent */}
    <div className="absolute bottom-1/3 left-12 w-32 h-32 rounded-full border-4 border-amber-900/15 rotate-12" />
  </div>
);

export function Desktop() {
  const { profile, wallpaper, themeMode, closeStartMenu, setIsChatInputOpen, fetchDatabaseData } = useOSStore();

  React.useEffect(() => {
    fetchDatabaseData();
  }, [fetchDatabaseData]);

  // Dynamically update document title from database profile state
  React.useEffect(() => {
    if (profile?.name) {
      document.title = `${profile.name} | ${profile.title || 'Interactive Portfolio'} - Aura OS`;
    }
  }, [profile]);

  const { isOpen, position, handleContextMenu, closeMenu } = useContextMenu();

  // Map wallpaper ids to Doodle Paper Wallpaper themes based on themeMode
  const getWallpaperClass = () => {
    if (themeMode === 'dark') {
      switch (wallpaper) {
        case 'sunset':
          return 'bg-[#2a1215] bg-doodle-paper-dark text-slate-100';
        case 'emerald':
          return 'bg-[#092017] bg-doodle-paper-dark text-slate-100';
        case 'cyberpunk':
          return 'bg-[#22102b] bg-doodle-paper-dark text-slate-100';
        case 'default':
        default:
          return 'bg-[#181716] bg-doodle-paper-dark text-slate-100';
      }
    } else {
      switch (wallpaper) {
        case 'sunset':
          return 'bg-[#fff1f2] bg-doodle-paper-light text-[#2d2a26]';
        case 'emerald':
          return 'bg-[#ecfdf5] bg-doodle-paper-light text-[#2d2a26]';
        case 'cyberpunk':
          return 'bg-[#f5f3ff] bg-doodle-paper-light text-[#2d2a26]';
        case 'default':
        default:
          return 'bg-[#fefce8] bg-doodle-paper-light text-[#2d2a26]';
      }
    }
  };

  const handleDesktopClick = (e: React.MouseEvent) => {
    closeStartMenu();
    closeMenu();
    setIsChatInputOpen(false);
  };

  return (
    <div
      onContextMenu={(e) => handleContextMenu(e.nativeEvent)}
      onClick={handleDesktopClick}
      className={`
        relative w-screen h-screen overflow-hidden select-none transition-all duration-500 ease-in-out font-doodle
        ${getWallpaperClass()}
      `}
    >
      {/* Decorative Background Doodles */}
      <BackgroundDoodles />

      {/* Desktop Application Icons Grid */}
      <div className="absolute inset-0 p-6 pt-8 flex flex-col flex-wrap content-start items-start gap-4 h-[calc(100vh-56px)] z-10">
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
      {/* Helper Robot Desktop Pet */}
      <RobotPet />

      {/* Draggable Active Windows Containers */}
      <WindowContainer
        id="bio"
        title="Bio.txt"
        defaultWidth={820}
        defaultHeight={580}
      >
        <BioApp />
      </WindowContainer>

      <WindowContainer
        id="projects"
        title="Projects"
        defaultWidth={1150}
        defaultHeight={700}
      >
        <ProjectsApp />
      </WindowContainer>

      <WindowContainer
        id="terminal"
        title="Aura Terminal"
        defaultWidth={880}
        defaultHeight={540}
      >
        <TerminalApp />
      </WindowContainer>

      <WindowContainer
        id="settings"
        title="Settings"
        defaultWidth={880}
        defaultHeight={600}
      >
        <SettingsApp />
      </WindowContainer>

      <WindowContainer
        id="frieren"
        title="Frieren.exe"
        defaultWidth={720}
        defaultHeight={520}
      >
        <FrierenApp />
      </WindowContainer>

      <WindowContainer
        id="admin"
        title="Developer Hub"
        defaultWidth={1050}
        defaultHeight={660}
      >
        <AdminApp />
      </WindowContainer>

      <WindowContainer
        id="projector"
        title="Projector Cinema"
        defaultWidth={1020}
        defaultHeight={620}
      >
        <ProjectorApp />
      </WindowContainer>

      {/* Taskbar & Navigation Overlays */}
      <Taskbar />
      <StartMenu />
      <DesktopChatInput />
      <TaskView />
      <QuickSettings />
      <WidgetsPanel />
      <LockScreen />
      <ConfirmDialog />

      {/* Custom Context Menu */}
      {isOpen && (
        <ContextMenu
          isOpen={isOpen}
          position={position}
          onClose={closeMenu}
        />
      )}
    </div>
  );
}
