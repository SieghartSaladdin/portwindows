'use client';

import React, { useState } from 'react';
import { useOSStore } from '@/lib/store';
import { ExternalLink, ChevronLeft, ChevronRight, Image as ImageIcon, Film } from 'lucide-react';

const GitHubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export function ProjectorApp() {
  const { projects, selectedProjectId, themeMode } = useOSStore();
  const isDark = themeMode === 'dark';

  const currentProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const [activeImageIdx, setActiveImageIdx] = useState(0);

  if (!currentProject) {
    return (
      <div className={`h-full flex flex-col items-center justify-center font-mono p-6 text-center select-none ${
        isDark ? 'bg-[#18181b] text-slate-400' : 'bg-[#fdfbf7] text-[#2d2a26]'
      }`}>
        <div className={`border-[2.5px] border-[#2d2a26] rounded-2xl p-8 shadow-[4px_4px_0px_0px_#2d2a26] flex flex-col items-center gap-3 ${
          isDark ? 'bg-zinc-900/90 text-slate-100' : 'bg-[#fcf9f2] text-[#2d2a26]'
        }`}>
          <ImageIcon className="w-12 h-12 text-amber-500 animate-pulse" />
          <p className="text-sm font-extrabold tracking-wide uppercase">Tidak ada data proyek yang dimuat</p>
          <p className="text-xs font-bold">Pilih proyek dari aplikasi Proyek atau jalankan perintah CLI.</p>
        </div>
      </div>
    );
  }

  const images = currentProject.images || [];

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length <= 1) return;
    setActiveImageIdx(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length <= 1) return;
    setActiveImageIdx(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className={`h-full flex flex-col md:flex-row font-mono overflow-hidden select-none p-4 gap-5 ${
      isDark ? 'bg-[#18181b] text-slate-100' : 'bg-[#fdfbf7] text-[#2d2a26]'
    }`}>
      {/* Main Slide Sandbox View */}
      <div className={`flex-1 relative rounded-2xl border-[2.5px] border-[#2d2a26] shadow-[4px_4px_0px_0px_#2d2a26] flex items-center justify-center overflow-hidden group ${
        isDark ? 'bg-zinc-900/90' : 'bg-[#fffdfa]'
      }`}>
        {images.length > 0 ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={images[activeImageIdx]} 
              alt={`${currentProject.title} screenshot`}
              className="w-full h-full object-cover transition-opacity duration-500"
            />

            {/* Notebook grid line overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-400/5 to-transparent bg-[length:100%_8px] pointer-events-none" />
            
            {/* Top Pastel Badge */}
            <div className="absolute top-4 right-4 bg-[#fef08a] text-[#2d2a26] border-2 border-[#2d2a26] px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#2d2a26]">
              <Film className="w-3.5 h-3.5 text-[#2d2a26]" />
              <span>Doodle Projector Screen</span>
            </div>

            {/* Slider Navigation arrows */}
            {images.length > 1 && (
              <>
                <button 
                  onClick={handlePrevImage}
                  className="absolute left-4 p-2.5 rounded-xl bg-[#fef08a] border-2 border-[#2d2a26] text-[#2d2a26] font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer shadow-[2px_2px_0px_0px_#2d2a26] hover:bg-yellow-300"
                >
                  <ChevronLeft className="w-5 h-5 text-[#2d2a26]" />
                </button>
                <button 
                  onClick={handleNextImage}
                  className="absolute right-4 p-2.5 rounded-xl bg-[#fef08a] border-2 border-[#2d2a26] text-[#2d2a26] font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer shadow-[2px_2px_0px_0px_#2d2a26] hover:bg-yellow-300"
                >
                  <ChevronRight className="w-5 h-5 text-[#2d2a26]" />
                </button>

                {/* Dot Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-zinc-950/90 px-3.5 py-1.5 rounded-full border-2 border-[#2d2a26] shadow-[2px_2px_0px_0px_#2d2a26]">
                  {images.map((_: string, idx: number) => (
                    <span 
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all ${
                        idx === activeImageIdx ? 'bg-[#fef08a] scale-110 border border-[#2d2a26]' : 'bg-slate-600 hover:bg-slate-400'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-slate-500 text-center font-mono gap-2">
            <ImageIcon className="w-10 h-10 text-amber-500" />
            <span className="text-xs font-bold">Tidak ada tangkapan layar doodle untuk build ini</span>
          </div>
        )}
      </div>

      {/* Side Details Panel */}
      <div className={`w-full md:w-80 p-5 flex flex-col justify-between border-[2.5px] border-[#2d2a26] rounded-2xl shadow-[4px_4px_0px_0px_#2d2a26] shrink-0 gap-4 ${
        isDark ? 'bg-zinc-900/90 text-slate-100' : 'bg-[#fcf9f2] text-[#2d2a26]'
      }`}>
        <div>
          {/* Header Badge */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-[#2d2a26]">
            <div className="flex items-center gap-2">
              <span className="text-amber-500 font-bold">✏</span>
              <span className={`text-xs font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-[#2d2a26]'}`}>Notebook Showcase</span>
            </div>

            {/* Pastel Yellow Badge */}
            <span className="bg-[#fef08a] text-[#2d2a26] border-2 border-[#2d2a26] shadow-[2px_2px_0px_0px_#2d2a26] font-extrabold rounded-full px-2.5 py-0.5 text-[10px]">
              Active Project
            </span>
          </div>
          
          <h2 className={`text-base font-extrabold tracking-wide ${isDark ? 'text-white' : 'text-[#2d2a26]'}`}>{currentProject.title}</h2>
          
          <div className={`border-2 border-[#2d2a26] rounded-xl p-3 text-xs leading-relaxed font-mono mt-3 max-h-32 overflow-y-auto shadow-[2px_2px_0px_0px_#2d2a26] font-bold ${
            isDark ? 'bg-zinc-950/70 text-slate-300' : 'bg-[#fffdfa] text-[#2d2a26]'
          }`}>
            {currentProject.description}
          </div>

          {/* Tech Stack doodle tags */}
          <div className="mt-4">
            <h4 className={`text-xs font-extrabold uppercase tracking-wider mb-2 flex items-center gap-1 ${
              isDark ? 'text-[#fef08a]' : 'text-amber-900'
            }`}>
              <span>✦</span> Build Tech Stack
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {currentProject.tags.map((tag: string) => (
                <span 
                  key={tag}
                  className={`px-2.5 py-1 rounded-full border-2 border-[#2d2a26] text-[10px] font-mono font-bold shadow-[2px_2px_0px_0px_#2d2a26] flex items-center gap-1 ${
                    isDark ? 'bg-zinc-900 text-amber-300' : 'bg-[#fef08a] text-[#2d2a26]'
                  }`}
                >
                  <span>✦</span> {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-2.5 border-t-2 border-[#2d2a26] pt-4">
          {currentProject.githubUrl && (
            <a 
              href={currentProject.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border-2 border-[#2d2a26] text-xs font-bold rounded-xl transition-all shadow-[2px_2px_0px_0px_#2d2a26] ${
                isDark ? 'bg-zinc-950 hover:bg-zinc-800 text-slate-200' : 'bg-[#fffdfa] hover:bg-[#f5efe2] text-[#2d2a26]'
              }`}
            >
              <GitHubIcon className={`w-3.5 h-3.5 ${isDark ? 'text-[#fef08a]' : 'text-amber-700'}`} />
              Source Code
            </a>
          )}
          {currentProject.liveUrl && (
            <a 
              href={currentProject.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#fef08a] hover:bg-yellow-300 border-2 border-[#2d2a26] text-[#2d2a26] text-xs font-extrabold rounded-xl transition-all shadow-[2px_2px_0px_0px_#2d2a26]"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#2d2a26]" />
              Live Demo
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
