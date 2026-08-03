'use client';

import React from 'react';
import { ExternalLink, Code2 } from 'lucide-react';

interface ProjectDetailViewProps {
  isDark: boolean;
  selectedProject: any;
  onBack: () => void;
  DoodleFolderIcon: React.ComponentType<{ className?: string }>;
}

export function ProjectDetailView({
  isDark,
  selectedProject,
  onBack,
  DoodleFolderIcon,
}: ProjectDetailViewProps) {
  return (
    <div className="flex flex-col gap-4 max-w-4xl mx-auto font-doodle">
      <div className="flex items-center justify-between bg-[#fcf9f2] text-[#2d2a26] border-[2.5px] border-[#2d2a26] rounded-2xl p-4 shadow-[5px_5px_0px_0px_#2d2a26]">
        <div className="flex items-center gap-3">
          <DoodleFolderIcon className="w-12 h-12" />
          <div>
            <h1 className="text-xl font-extrabold tracking-wide">{selectedProject.title}</h1>
            <p className="text-xs text-zinc-600 font-bold mt-0.5">Isi Folder Proyek</p>
          </div>
        </div>

        <button
          onClick={onBack}
          className="bg-amber-200 hover:bg-amber-300 border-2 border-[#2d2a26] px-3 py-1 rounded-xl text-xs font-bold shadow-[2px_2px_0px_0px_#2d2a26] cursor-pointer text-[#2d2a26]"
        >
          Kembali ke Projects (D:) 📂
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`md:col-span-2 border-[2.5px] border-[#2d2a26] rounded-2xl p-5 shadow-[5px_5px_0px_0px_#2d2a26] flex flex-col gap-4 ${
          isDark ? 'bg-[#262422] text-slate-100' : 'bg-[#fcf9f2] text-[#2d2a26]'
        }`}>
          <h3 className={`text-sm font-extrabold uppercase tracking-wider flex items-center gap-2 border-b-2 border-[#2d2a26] pb-2 ${
            isDark ? 'text-[#fef08a]' : 'text-amber-900'
          }`}>
            <span>📝</span> Deskripsi Proyek
          </h3>
          <p className={`text-xs leading-relaxed font-bold ${isDark ? 'text-slate-200' : 'text-zinc-800'}`}>
            {selectedProject.description}
          </p>

          <div className="mt-2">
            <h4 className={`text-xs font-bold uppercase mb-2 ${isDark ? 'text-amber-300' : 'text-amber-900'}`}>Tech Stack & Frameworks:</h4>
            <div className="flex flex-wrap gap-2">
              {selectedProject.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="bg-[#fef08a] text-[#2d2a26] border-2 border-[#2d2a26] rounded-full px-3 py-0.5 text-xs font-bold shadow-[2px_2px_0px_0px_#2d2a26]"
                >
                  ✦ {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className={`border-[2.5px] border-[#2d2a26] rounded-2xl p-5 shadow-[5px_5px_0px_0px_#2d2a26] flex flex-col justify-between gap-4 ${
          isDark ? 'bg-[#262422] text-slate-100' : 'bg-[#fcf9f2] text-[#2d2a26]'
        }`}>
          <div>
            <h3 className={`text-sm font-extrabold uppercase tracking-wider border-b-2 border-[#2d2a26] pb-2 mb-3 ${
              isDark ? 'text-[#fef08a]' : 'text-amber-900'
            }`}>
              <span>⚡</span> Tautan Langsung
            </h3>

            <div className="flex flex-col gap-2.5">
              {selectedProject.liveUrl && (
                <a
                  href={selectedProject.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#fef08a] hover:bg-yellow-300 text-[#2d2a26] border-2 border-[#2d2a26] rounded-xl px-3.5 py-2 text-xs font-extrabold shadow-[3px_3px_0px_0px_#2d2a26] flex items-center justify-between transition"
                >
                  <span>🔗 Buka Live Demo</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              {selectedProject.githubUrl && (
                <a
                  href={selectedProject.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#fffdfa] hover:bg-amber-100 text-[#2d2a26] border-2 border-[#2d2a26] rounded-xl px-3.5 py-2 text-xs font-extrabold shadow-[3px_3px_0px_0px_#2d2a26] flex items-center justify-between transition"
                >
                  <span>💻 Repositori GitHub</span>
                  <Code2 className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          <div className={`pt-3 border-t-2 border-[#2d2a26] text-[11px] font-bold text-center ${
            isDark ? 'text-amber-200' : 'text-amber-900'
          }`}>
            ✦ Folder Proyek Portofolio
          </div>
        </div>
      </div>
    </div>
  );
}
