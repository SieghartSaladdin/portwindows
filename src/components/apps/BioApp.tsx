'use client';

import React from 'react';
import { PROFILE } from '@/lib/data';

export function BioApp() {
  return (
    <div className="flex flex-col h-full bg-zinc-950/60 text-slate-100 font-mono text-sm leading-relaxed select-text select-none">
      {/* Mock Editor Menu */}
      <div className="flex gap-4 px-3 py-1 bg-black/10 border-b border-white/5 text-xs text-slate-400 select-none">
        <span className="hover:text-white cursor-default transition">File</span>
        <span className="hover:text-white cursor-default transition">Edit</span>
        <span className="hover:text-white cursor-default transition">Format</span>
        <span className="hover:text-white cursor-default transition">View</span>
        <span className="hover:text-white cursor-default transition">Help</span>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 p-4 overflow-auto bg-transparent focus:outline-none">
        <div className="mb-6 border-b border-white/5 pb-4">
          <h1 className="text-xl font-bold text-emerald-400 font-sans tracking-wide">
            {PROFILE.name}
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-1">
            {PROFILE.title} | {PROFILE.location}
          </p>
        </div>
        <textarea
          readOnly
          value={PROFILE.bio}
          className="w-full h-[80%] bg-transparent resize-none border-none outline-none focus:ring-0 leading-relaxed font-mono select-text"
        />
      </div>

      {/* Status Bar */}
      <div className="flex justify-between items-center px-4 py-1.5 bg-black/20 border-t border-white/5 text-[11px] text-slate-400 select-none">
        <div>Ln 1, Col 1</div>
        <div className="flex gap-4">
          <span>100%</span>
          <span>Windows (CRLF)</span>
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  );
}
