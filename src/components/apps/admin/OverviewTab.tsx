'use client';

import React from 'react';
import { Folder, Wrench, Briefcase, User } from 'lucide-react';

interface OverviewTabProps {
  isDark: boolean;
  projectsCount: number;
  skillsCount: number;
  experiencesCount: number;
  profileName: string;
}

export function OverviewTab({
  isDark,
  projectsCount,
  skillsCount,
  experiencesCount,
  profileName,
}: OverviewTabProps) {
  return (
    <div className="flex flex-col gap-6 font-mono">
      <div className="pb-3 border-b-2 border-[#2d2a26] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-amber-500 text-lg font-bold">✏</span>
          <div>
            <h1 className={`text-base font-extrabold uppercase tracking-wider ${isDark ? 'text-white' : 'text-[#2d2a26]'}`}>Database Control Panel</h1>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-zinc-600'}`}>Live metrics and health check of your portfolio database.</p>
          </div>
        </div>

        {/* Pastel Yellow Badge */}
        <span className="bg-[#fef08a] text-[#2d2a26] border-2 border-[#2d2a26] shadow-[2px_2px_0px_0px_#2d2a26] font-extrabold rounded-full px-3 py-1 text-xs">
          ✦ PostgreSQL Online
        </span>
      </div>

      {/* Stats Grid with Bold Outlines & Shadows */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className={`p-5 border-[2.5px] border-[#2d2a26] rounded-2xl flex items-center gap-4 shadow-[4px_4px_0px_0px_#2d2a26] ${
          isDark ? 'bg-zinc-900/90 text-white' : 'bg-[#fcf9f2] text-[#2d2a26]'
        }`}>
          <div className="w-10 h-10 rounded-xl bg-[#fef08a] border-2 border-[#2d2a26] flex items-center justify-center text-[#2d2a26] shadow-[2px_2px_0px_0px_#2d2a26]">
            <Folder className="w-5 h-5" />
          </div>
          <div>
            <div className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-[#2d2a26]'}`}>{projectsCount}</div>
            <div className={`text-[10px] uppercase font-extrabold tracking-wider ${isDark ? 'text-[#fef08a]' : 'text-amber-900'}`}>Projects</div>
          </div>
        </div>

        <div className={`p-5 border-[2.5px] border-[#2d2a26] rounded-2xl flex items-center gap-4 shadow-[4px_4px_0px_0px_#2d2a26] ${
          isDark ? 'bg-zinc-900/90 text-white' : 'bg-[#fcf9f2] text-[#2d2a26]'
        }`}>
          <div className="w-10 h-10 rounded-xl bg-[#fef08a] border-2 border-[#2d2a26] flex items-center justify-center text-[#2d2a26] shadow-[2px_2px_0px_0px_#2d2a26]">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-[#2d2a26]'}`}>{skillsCount}</div>
            <div className={`text-[10px] uppercase font-extrabold tracking-wider ${isDark ? 'text-[#fef08a]' : 'text-amber-900'}`}>Skill Groups</div>
          </div>
        </div>

        <div className={`p-5 border-[2.5px] border-[#2d2a26] rounded-2xl flex items-center gap-4 shadow-[4px_4px_0px_0px_#2d2a26] ${
          isDark ? 'bg-zinc-900/90 text-white' : 'bg-[#fcf9f2] text-[#2d2a26]'
        }`}>
          <div className="w-10 h-10 rounded-xl bg-[#fef08a] border-2 border-[#2d2a26] flex items-center justify-center text-[#2d2a26] shadow-[2px_2px_0px_0px_#2d2a26]">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-[#2d2a26]'}`}>{experiencesCount}</div>
            <div className={`text-[10px] uppercase font-extrabold tracking-wider ${isDark ? 'text-[#fef08a]' : 'text-amber-900'}`}>Experiences</div>
          </div>
        </div>

        <div className={`p-5 border-[2.5px] border-[#2d2a26] rounded-2xl flex items-center gap-4 shadow-[4px_4px_0px_0px_#2d2a26] ${
          isDark ? 'bg-zinc-900/90 text-white' : 'bg-[#fcf9f2] text-[#2d2a26]'
        }`}>
          <div className="w-10 h-10 rounded-xl bg-[#fef08a] border-2 border-[#2d2a26] flex items-center justify-center text-[#2d2a26] shadow-[2px_2px_0px_0px_#2d2a26]">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className={`text-xs font-extrabold truncate max-w-[110px] ${isDark ? 'text-white' : 'text-[#2d2a26]'}`}>{profileName || 'Admin'}</div>
            <div className={`text-[10px] uppercase font-extrabold tracking-wider ${isDark ? 'text-[#fef08a]' : 'text-amber-900'}`}>Profile</div>
          </div>
        </div>
      </div>

      {/* Database diagnostics status */}
      <div className={`border-[2.5px] border-[#2d2a26] rounded-2xl p-5 flex flex-col gap-4 shadow-[4px_4px_0px_0px_#2d2a26] ${
        isDark ? 'bg-zinc-900/90 text-white' : 'bg-[#fcf9f2] text-[#2d2a26]'
      }`}>
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#2d2a26]">
          <span className={`text-xs font-extrabold flex items-center gap-2 uppercase tracking-wider ${isDark ? 'text-[#fef08a]' : 'text-amber-900'}`}>
            <span>✏</span> Diagnostics Check
          </span>
          <span className="bg-[#fef08a] text-[#2d2a26] border border-[#2d2a26] text-[10px] font-extrabold px-3 py-0.5 rounded-full shadow-[2px_2px_0px_0px_#2d2a26]">
            ONLINE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-xs font-mono">
          <div className="flex justify-between py-2 border-b-2 border-[#2d2a26]">
            <span className={isDark ? 'text-slate-400' : 'text-zinc-600'}>Database Engine</span>
            <span className={`font-extrabold ${isDark ? 'text-slate-200' : 'text-[#2d2a26]'}`}>PostgreSQL (portfolio_db)</span>
          </div>
          <div className="flex justify-between py-2 border-b-2 border-[#2d2a26]">
            <span className={isDark ? 'text-slate-400' : 'text-zinc-600'}>ORM Manager</span>
            <span className={`font-extrabold ${isDark ? 'text-slate-200' : 'text-[#2d2a26]'}`}>Prisma Client</span>
          </div>
          <div className="flex justify-between py-2 border-b-2 border-[#2d2a26]">
            <span className={isDark ? 'text-slate-400' : 'text-zinc-600'}>Profile Config</span>
            <span className={`font-extrabold ${isDark ? 'text-slate-200' : 'text-[#2d2a26]'}`}>Upsert Active</span>
          </div>
          <div className="flex justify-between py-2 border-b-2 border-[#2d2a26]">
            <span className={isDark ? 'text-slate-400' : 'text-zinc-600'}>Workspace Sync</span>
            <span className={`font-extrabold ${isDark ? 'text-slate-200' : 'text-[#2d2a26]'}`}>React Linked</span>
          </div>
        </div>
      </div>
    </div>
  );
}
