'use client';

import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Folder, 
  Terminal, 
  Settings, 
  Globe,
  ExternalLink,
  Gamepad2
} from 'lucide-react';
import { useOSStore } from '@/lib/store';
import { DesktopIcon } from '@/lib/data';

interface AppIconProps {
  icon: DesktopIcon;
}

export function AppIcon({ icon }: AppIconProps) {
  const openWindow = useOSStore((state) => state.openWindow);
  const [isSelected, setIsSelected] = useState(false);

  const getIcon = () => {
    const className = "w-9 h-9 transition-transform group-hover:scale-[1.03] select-none";
    switch (icon.iconType) {
      case 'notepad':
        return <FileText className={`${className} text-emerald-400`} />;
      case 'folder':
        return <Folder className={`${className} text-amber-400`} />;
      case 'terminal':
        return <Terminal className={`${className} text-indigo-400`} />;
      case 'settings':
        return <Settings className={`${className} text-blue-400`} />;
      case 'game':
        return <Gamepad2 className={`${className} text-rose-400`} />;
      case 'browser':
      default:
        return <Globe className={`${className} text-sky-400`} />;
    }
  };

  const handleAction = () => {
    if (icon.action === 'openApp' && icon.appId) {
      openWindow(icon.appId, icon.title);
    } else if (icon.action === 'openLink' && icon.url) {
      window.open(icon.url, '_blank');
    }
  };

  // For touch devices, single tap is sufficient. For desktop, double click is windows-authentic.
  // We can track last click time to simulate double click.
  const lastClickTimeRef = useRef(0);
  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsSelected(true);
    
    // Clear selection on other items by letting document click handle it
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
        flex flex-col items-center justify-center w-18 h-18 rounded-md p-1.5 border border-transparent cursor-default select-none group
        ${isSelected 
          ? 'bg-white/10 border-white/20 shadow-md' 
          : 'hover:bg-white/5 hover:border-white/5'
        }
        transition-all duration-150
      `}
    >
      <div className="relative">
        {getIcon()}
        {icon.action === 'openLink' && (
          <ExternalLink className="absolute bottom-0 right-0 w-3 h-3 text-slate-300 bg-black/60 rounded-full p-[1px] border border-white/10" />
        )}
      </div>
      <span className="text-[10px] text-slate-100 text-center truncate w-full mt-1.5 drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.8)] font-medium">
        {icon.title}
      </span>
    </div>
  );
}
