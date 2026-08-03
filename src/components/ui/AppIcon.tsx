'use client';

import React, { useState, useRef } from 'react';
import { ExternalLink } from 'lucide-react';
import { useOSStore } from '@/lib/store';
import { DesktopIcon } from '@/lib/data';
import { 
  DoodleBioIcon, 
  DoodleFolderIcon, 
  DoodleTerminalIcon, 
  DoodleSettingsIcon, 
  DoodlePetIcon, 
  DoodleLinkIcon,
  DoodleAdminIcon
} from '@/components/ui/DoodleIcons';

interface AppIconProps {
  icon: DesktopIcon;
}

export function AppIcon({ icon }: AppIconProps) {
  const { openWindow, profile, themeMode } = useOSStore();
  const [isSelected, setIsSelected] = useState(false);

  const getIcon = () => {
    const className = "w-11 h-11 transition-transform group-hover:scale-110 select-none filter drop-shadow-[2px_3px_0px_rgba(0,0,0,0.5)]";
    switch (icon.iconType) {
      case 'notepad':
        return <DoodleBioIcon className={className} />;
      case 'folder':
        return <DoodleFolderIcon className={className} />;
      case 'terminal':
        return <DoodleTerminalIcon className={className} />;
      case 'settings':
        return <DoodleSettingsIcon className={className} />;
      case 'game':
        return <DoodlePetIcon className={className} />;
      case 'browser':
      default:
        if (icon.id === 'admin') return <DoodleAdminIcon className={className} />;
        return <DoodleLinkIcon className={className} />;
    }
  };

  const handleAction = () => {
    if (icon.action === 'openApp' && icon.appId) {
      openWindow(icon.appId, icon.title);
    } else if (icon.action === 'openLink') {
      let targetUrl = icon.url;
      if (icon.id === 'github' && profile?.githubUrl) {
        targetUrl = profile.githubUrl;
      } else if (icon.id === 'linkedin' && profile?.linkedinUrl) {
        targetUrl = profile.linkedinUrl;
      }
      if (targetUrl) {
        window.open(targetUrl, '_blank');
      }
    }
  };

  const lastClickTimeRef = useRef(0);
  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsSelected(true);
    
    const clearSelection = () => {
      setIsSelected(false);
      document.removeEventListener('pointerdown', clearSelection);
    };
    setTimeout(() => {
      document.addEventListener('pointerdown', clearSelection);
    }, 10);
    
    const currentTime = new Date().getTime();
    const isDoubleClick = (currentTime - lastClickTimeRef.current) < 300;
    
    if (isDoubleClick) {
      handleAction();
      setIsSelected(false);
    }
    
    lastClickTimeRef.current = currentTime;
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      className={`
        flex flex-col items-center justify-center w-23 min-h-[92px] p-2 rounded-2xl cursor-pointer select-none group font-doodle
        transition-all duration-150 relative border-2
        ${isSelected 
          ? 'bg-[#fffdfa]/95 text-[#2d2a26] border-[#2d2a26] shadow-[4px_4px_0px_0px_#2d2a26] scale-105' 
          : 'bg-transparent border-transparent text-white hover:bg-[#fffdfa]/20 hover:backdrop-blur-xs hover:border-dashed hover:border-amber-200/60 hover:scale-105'
        }
      `}
    >
      <div className="relative flex items-center justify-center">
        {getIcon()}
        {icon.action === 'openLink' && (
          <ExternalLink className="absolute -bottom-1 -right-1 w-4 h-4 text-[#2d2a26] bg-amber-200 rounded-full p-[1px] border border-[#2d2a26] shadow-sm" />
        )}
      </div>
      
      <span 
        className={`
          text-[12px] leading-tight text-center font-doodle font-extrabold tracking-tight max-w-full px-2 py-0.5 mt-1.5 rounded-lg truncate transition-all
          ${isSelected 
            ? 'text-[#2d2a26] bg-[#fef08a] border-2 border-[#2d2a26] shadow-[3px_3px_0px_0px_#2d2a26]' 
            : themeMode === 'dark'
              ? 'text-[#fcf9f2] bg-[#262422]/90 border-[2px] border-[#2d2a26] shadow-[2px_2px_0px_0px_#2d2a26] group-hover:bg-[#fef08a] group-hover:text-[#2d2a26]'
              : 'text-[#2d2a26] bg-[#fcf9f2]/95 border-[2px] border-[#2d2a26] shadow-[2px_2px_0px_0px_#2d2a26] group-hover:bg-[#fef08a]'
          }
        `}
      >
        {icon.title}
      </span>
    </div>
  );
}
