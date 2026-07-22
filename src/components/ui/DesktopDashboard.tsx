'use client';

import React from 'react';
import { useOSStore } from '@/lib/store';
import { 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  FolderGit2, 
  Terminal, 
  User, 
  Gamepad2, 
  Settings, 
  ExternalLink,
  ChevronRight,
  X
} from 'lucide-react';

export function DesktopDashboard() {
  const { profile, projects, windows, frierenConfig, openWindow } = useOSStore();

  const [isTourDismissed, setIsTourDismissed] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsTourDismissed(localStorage.getItem('portfolio_tour_dismissed') === 'true');
    }
  }, []);

  const handleDismissTour = () => {
    setIsTourDismissed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('portfolio_tour_dismissed', 'true');
    }
  };

  // Find the featured/recommended project or fall back to the first project
  const featuredProject = projects.find((p) => p.featured) || projects[0];

  // Checklist items based on window/system states
  const checklist = [
    {
      id: 'bio',
      label: 'Read Biography (Bio.txt)',
      isCompleted: !!windows.bio?.isOpen,
      icon: <User className="w-3.5 h-3.5 text-emerald-400" />,
      action: () => openWindow('bio'),
    },
    {
      id: 'projects',
      label: 'Explore Projects (File Explorer)',
      isCompleted: !!windows.projects?.isOpen,
      icon: <FolderGit2 className="w-3.5 h-3.5 text-amber-400" />,
      action: () => openWindow('projects'),
    },
    {
      id: 'terminal',
      label: 'Try Terminal Command Prompt',
      isCompleted: !!windows.terminal?.isOpen,
      icon: <Terminal className="w-3.5 h-3.5 text-indigo-400" />,
      action: () => openWindow('terminal'),
    },
    {
      id: 'frieren',
      label: 'Spawn Desktop Pets (Frieren.exe)',
      isCompleted: !!frierenConfig?.isSpawned && !!windows.frieren?.isOpen,
      icon: <Gamepad2 className="w-3.5 h-3.5 text-rose-400" />,
      action: () => openWindow('frieren'),
    },
    {
      id: 'settings',
      label: 'Adjust Wallpaper & Theme Settings',
      isCompleted: !!windows.settings?.isOpen,
      icon: <Settings className="w-3.5 h-3.5 text-blue-400" />,
      action: () => openWindow('settings'),
    },
  ];

  return (
    <div className="absolute top-6 right-6 w-90 max-w-sm hidden lg:flex flex-col gap-4 z-10 pointer-events-auto">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-white/10 bg-zinc-950/40 backdrop-blur-md p-4 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
          <h2 className="text-sm font-bold tracking-wide">Welcome to My Portfolio</h2>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          Hello! I am <span className="text-win-accent-light font-semibold">{profile?.name || 'Alex Mercer'}</span>, a <span className="text-slate-100">{profile?.title}</span> based in {profile?.location}. Explore my work using this interactive environment!
        </p>
      </div>

      {/* Recommended Project Banner */}
      {featuredProject && (
        <div className="rounded-2xl border border-white/10 bg-zinc-950/40 backdrop-blur-md overflow-hidden text-white shadow-xl flex flex-col">
          {featuredProject.images && featuredProject.images.length > 0 ? (
            <div className="w-full h-32 relative bg-black/30">
              <img 
                src={featuredProject.images[0]} 
                alt={featuredProject.title} 
                className="w-full h-full object-cover opacity-85 hover:opacity-100 transition-opacity duration-300"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-win-accent text-[9px] font-bold uppercase tracking-wider shadow">
                Recommended
              </div>
            </div>
          ) : (
            <div className="w-full h-24 bg-gradient-to-r from-win-accent/20 to-indigo-950/40 flex items-center justify-center p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-win-accent-light">
                ★ Recommended Project
              </span>
            </div>
          )}
          
          <div className="p-4 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-100 mb-1">{featuredProject.title}</h3>
              <p className="text-[10px] text-slate-300 leading-relaxed mb-3 line-clamp-2">
                {featuredProject.description}
              </p>
              
              <div className="flex flex-wrap gap-1 mb-4">
                {featuredProject.tags.slice(0, 3).map((tag: string) => (
                  <span 
                    key={tag}
                    className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-[8px] text-slate-400"
                  >
                    {tag}
                  </span>
                ))}
                {featuredProject.tags.length > 3 && (
                  <span className="text-[8px] text-slate-500 self-center">
                    +{featuredProject.tags.length - 3} more
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => {
                  openWindow('projects');
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-win-accent hover:bg-win-accent/80 text-[10px] font-bold text-white transition cursor-default"
              >
                <span>Explore Project</span>
                <ChevronRight className="w-3 h-3" />
              </button>
              
              {featuredProject.liveUrl && (
                <a 
                  href={featuredProject.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition cursor-default"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Guided Tour Checklist */}
      {!isTourDismissed && (
        <div className="rounded-2xl border border-white/10 bg-zinc-950/40 backdrop-blur-md p-4 text-white shadow-xl relative group/tour">
          {/* Close button */}
          <button
            onClick={handleDismissTour}
            className="absolute top-3.5 right-3.5 text-slate-400 hover:text-white transition opacity-60 hover:opacity-100 p-0.5 rounded hover:bg-white/10 cursor-default"
            title="Dismiss Tour"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <h3 className="text-xs font-bold tracking-wide mb-3 flex items-center gap-1.5 pr-6">
            <span>Guided Tour Checklist</span>
            <span className="text-[9px] font-medium text-slate-400 bg-white/5 px-1.5 py-0.5 rounded-full">
              {checklist.filter(c => c.isCompleted).length}/{checklist.length}
            </span>
          </h3>
          
          <div className="flex flex-col gap-2.5">
            {checklist.map((item) => (
              <button
                key={item.id}
                onClick={item.action}
                className="flex items-start gap-2.5 text-left w-full hover:bg-white/5 p-1 -m-1 rounded-lg transition group cursor-default"
              >
                <div className="mt-0.5 flex-shrink-0">
                  {item.isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-win-accent-light fill-win-accent/20" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-500 group-hover:text-slate-400" />
                  )}
                </div>
                
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span className={`text-[10px] truncate leading-tight ${item.isCompleted ? 'text-slate-400 line-through' : 'text-slate-200 group-hover:text-white'}`}>
                    {item.label}
                  </span>
                  <span className="flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity ml-1.5">
                    {item.icon}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Celebratory Completion Banner */}
          {checklist.every(c => c.isCompleted) && (
            <div className="mt-4 pt-3 border-t border-white/5 flex flex-col gap-2 items-center text-center">
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 animate-bounce">
                🎉 Tour Completed!
              </span>
              <button
                onClick={handleDismissTour}
                className="w-full py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/20 rounded-lg text-[9px] font-bold cursor-default transition uppercase tracking-wider"
              >
                Hide Checklist
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
