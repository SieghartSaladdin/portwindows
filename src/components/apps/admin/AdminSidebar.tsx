'use client';

import React from 'react';
import { Database, User, Folder, Wrench, Briefcase, RefreshCw, LogOut } from 'lucide-react';

interface AdminSidebarProps {
  isDark: boolean;
  activeTab: 'overview' | 'profile' | 'projects' | 'skills' | 'experiences';
  setActiveTab: (tab: 'overview' | 'profile' | 'projects' | 'skills' | 'experiences') => void;
  projectsCount: number;
  skillsCount: number;
  experiencesCount: number;
  loading: boolean;
  onDbRefresh: () => void;
  onLockSession: () => void;
}

export function AdminSidebar({
  isDark,
  activeTab,
  setActiveTab,
  projectsCount,
  skillsCount,
  experiencesCount,
  loading,
  onDbRefresh,
  onLockSession,
}: AdminSidebarProps) {
  return (
    <div className={`w-56 border-r-2 border-[#2d2a26] flex flex-col justify-between p-4 shrink-0 shadow-[4px_0px_0px_0px_#2d2a26] ${
      isDark ? 'bg-zinc-950/90 text-slate-100' : 'bg-[#fcf9f2] text-[#2d2a26]'
    }`}>
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2.5 px-3 py-2 mb-3 border-b-2 border-[#2d2a26]">
          <span className="text-amber-500">✏</span>
          <Database className="w-4 h-4 text-amber-500" />
          <span className={`font-extrabold text-xs uppercase tracking-wider ${isDark ? 'text-slate-100' : 'text-[#2d2a26]'}`}>Admin Control</span>
        </div>

        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full border-2 border-[#2d2a26] text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'overview' 
              ? 'bg-[#fef08a] text-[#2d2a26] shadow-[2px_2px_0px_0px_#2d2a26]' 
              : isDark ? 'bg-zinc-900/80 text-slate-300 hover:bg-zinc-800 shadow-[2px_2px_0px_0px_#2d2a26]' : 'bg-[#fffdfa] text-[#2d2a26] hover:bg-[#f5efe2] shadow-[2px_2px_0px_0px_#2d2a26]'
          }`}
        >
          <Database className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Overview & Stats</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full border-2 border-[#2d2a26] text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'profile' 
              ? 'bg-[#fef08a] text-[#2d2a26] shadow-[2px_2px_0px_0px_#2d2a26]' 
              : isDark ? 'bg-zinc-900/80 text-slate-300 hover:bg-zinc-800 shadow-[2px_2px_0px_0px_#2d2a26]' : 'bg-[#fffdfa] text-[#2d2a26] hover:bg-[#f5efe2] shadow-[2px_2px_0px_0px_#2d2a26]'
          }`}
        >
          <User className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Profile Editor</span>
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full border-2 border-[#2d2a26] text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'projects' 
              ? 'bg-[#fef08a] text-[#2d2a26] shadow-[2px_2px_0px_0px_#2d2a26]' 
              : isDark ? 'bg-zinc-900/80 text-slate-300 hover:bg-zinc-800 shadow-[2px_2px_0px_0px_#2d2a26]' : 'bg-[#fffdfa] text-[#2d2a26] hover:bg-[#f5efe2] shadow-[2px_2px_0px_0px_#2d2a26]'
          }`}
        >
          <Folder className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Projects ({projectsCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('skills')}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full border-2 border-[#2d2a26] text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'skills' 
              ? 'bg-[#fef08a] text-[#2d2a26] shadow-[2px_2px_0px_0px_#2d2a26]' 
              : isDark ? 'bg-zinc-900/80 text-slate-300 hover:bg-zinc-800 shadow-[2px_2px_0px_0px_#2d2a26]' : 'bg-[#fffdfa] text-[#2d2a26] hover:bg-[#f5efe2] shadow-[2px_2px_0px_0px_#2d2a26]'
          }`}
        >
          <Wrench className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Skills ({skillsCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('experiences')}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full border-2 border-[#2d2a26] text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'experiences' 
              ? 'bg-[#fef08a] text-[#2d2a26] shadow-[2px_2px_0px_0px_#2d2a26]' 
              : isDark ? 'bg-zinc-900/80 text-slate-300 hover:bg-zinc-800 shadow-[2px_2px_0px_0px_#2d2a26]' : 'bg-[#fffdfa] text-[#2d2a26] hover:bg-[#f5efe2] shadow-[2px_2px_0px_0px_#2d2a26]'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Experiences ({experiencesCount})</span>
        </button>
      </div>

      {/* Footer actions */}
      <div className="flex flex-col gap-2 pt-3 border-t-2 border-[#2d2a26]">
        <button
          onClick={onDbRefresh}
          disabled={loading}
          className={`flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl border-2 border-[#2d2a26] transition disabled:opacity-50 cursor-pointer font-mono font-bold shadow-[2px_2px_0px_0px_#2d2a26] ${
            isDark ? 'bg-zinc-900 hover:bg-zinc-800 text-slate-200' : 'bg-[#fffdfa] hover:bg-[#f5efe2] text-[#2d2a26]'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-500 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync DB</span>
        </button>

        <button
          onClick={onLockSession}
          className={`flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl border-2 border-[#2d2a26] transition cursor-pointer font-mono font-extrabold shadow-[2px_2px_0px_0px_#2d2a26] ${
            isDark ? 'bg-rose-500/20 hover:bg-rose-950/40 text-rose-400' : 'bg-rose-100 hover:bg-rose-200 text-rose-800'
          }`}
        >
          <LogOut className="w-3.5 h-3.5 text-rose-600" />
          <span>Lock Session</span>
        </button>
      </div>
    </div>
  );
}
