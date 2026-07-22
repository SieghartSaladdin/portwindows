'use client';

import React, { useState } from 'react';
import { 
  Folder, 
  HardDrive, 
  Monitor, 
  FileText, 
  ArrowLeft, 
  Search, 
  Grid, 
  List, 
  Terminal
} from 'lucide-react';
import { useOSStore } from '@/lib/store';
import { ProjectDetailView } from './projects/ProjectDetailView';

// Big Hand-Drawn SVG Folder Icon
const DoodleFolderIcon = ({ className = "w-14 h-14" }: { className?: string }) => (
  <svg className={`${className} text-amber-400 flex-shrink-0 filter drop-shadow-[2.5px_2.5px_0px_#2d2a26]`} viewBox="0 0 24 24" fill="none" stroke="#2d2a26" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 8 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2z" fill="#fef08a" />
    <path d="M2 10h20" stroke="#2d2a26" strokeWidth="2" />
  </svg>
);

// Hand-Drawn SVG Hard Drive Icon
const DoodleDriveIcon = ({ className = "w-14 h-14" }: { className?: string }) => (
  <svg className={`${className} text-sky-400 flex-shrink-0 filter drop-shadow-[2.5px_2.5px_0px_#2d2a26]`} viewBox="0 0 24 24" fill="none" stroke="#2d2a26" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="3" fill="#bae6fd" />
    <path d="M6 12h.01" stroke="#2d2a26" strokeWidth="3" strokeLinecap="round" />
    <path d="M10 12h.01" stroke="#2d2a26" strokeWidth="3" strokeLinecap="round" />
    <path d="M18 12h2" stroke="#2d2a26" strokeWidth="2.5" />
  </svg>
);

type NavigationPath = 'this-pc' | 'drive-c' | 'projects-d' | 'project-detail';

export function ProjectsApp() {
  const { projects, openWindow, themeMode } = useOSStore();
  const isDark = themeMode === 'dark';
  
  const [currentPath, setCurrentPath] = useState<NavigationPath>('projects-d');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(filterQuery.toLowerCase()) ||
    p.tags.some((t: string) => t.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  const handleOpenFolder = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentPath('project-detail');
  };

  const navigateTo = (path: NavigationPath) => {
    setCurrentPath(path);
    if (path !== 'project-detail') {
      setSelectedProjectId(null);
    }
  };

  return (
    <div className={`flex h-full font-doodle select-none overflow-hidden ${
      isDark ? 'bg-[#181716] text-slate-100' : 'bg-[#fdfbf7] text-[#2d2a26]'
    }`}>
      
      {/* Left Sidebar Navigation (This PC / Quick Access Tree) */}
      <div className={`w-52 sm:w-56 border-r-[2.5px] border-[#2d2a26] p-3 flex flex-col justify-between shrink-0 shadow-[4px_0px_0px_0px_#2d2a26] ${
        isDark ? 'bg-[#262422] text-slate-100' : 'bg-[#fcf9f2] text-[#2d2a26]'
      }`}>
        <div>
          {/* Quick Access Section */}
          <div className="mb-4">
            <div className={`text-[10.5px] font-extrabold uppercase tracking-wider mb-2 px-2 flex items-center gap-1.5 ${
              isDark ? 'text-amber-300' : 'text-amber-900'
            }`}>
              <span>⭐</span> Quick Access
            </div>

            <div className="flex flex-col gap-1">
              <button
                onClick={() => navigateTo('projects-d')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-[#2d2a26] text-xs font-bold transition cursor-pointer ${
                  currentPath === 'projects-d' || currentPath === 'project-detail'
                    ? 'bg-[#fef08a] text-[#2d2a26] shadow-[2px_2px_0px_0px_#2d2a26]'
                    : isDark ? 'bg-[#1e1c1a] text-slate-300 hover:bg-[#322f2c]' : 'bg-[#fffdfa] text-[#2d2a26] hover:bg-[#f5efe2]'
                }`}
              >
                <Folder className="w-4 h-4 text-amber-500" />
                <span className="truncate">Projects (D:)</span>
              </button>

              <button
                onClick={() => openWindow('bio')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-[#2d2a26] text-xs font-bold transition cursor-pointer ${
                  isDark ? 'bg-[#1e1c1a] text-slate-300 hover:bg-[#322f2c]' : 'bg-[#fffdfa] text-[#2d2a26] hover:bg-[#f5efe2]'
                }`}
              >
                <FileText className="w-4 h-4 text-sky-500" />
                <span className="truncate">Bio.txt</span>
              </button>

              <button
                onClick={() => openWindow('terminal')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-[#2d2a26] text-xs font-bold transition cursor-pointer ${
                  isDark ? 'bg-[#1e1c1a] text-slate-300 hover:bg-[#322f2c]' : 'bg-[#fffdfa] text-[#2d2a26] hover:bg-[#f5efe2]'
                }`}
              >
                <Terminal className="w-4 h-4 text-emerald-500" />
                <span className="truncate">Aura Terminal</span>
              </button>
            </div>
          </div>

          {/* This PC Directory Tree */}
          <div>
            <div className={`text-[10.5px] font-extrabold uppercase tracking-wider mb-2 px-2 flex items-center gap-1.5 ${
              isDark ? 'text-amber-300' : 'text-amber-900'
            }`}>
              <span>🖥️</span> This PC
            </div>

            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => navigateTo('this-pc')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-[#2d2a26] text-xs font-bold transition cursor-pointer ${
                  currentPath === 'this-pc'
                    ? 'bg-[#fef08a] text-[#2d2a26] shadow-[2px_2px_0px_0px_#2d2a26]'
                    : isDark ? 'bg-[#1e1c1a] text-slate-300 hover:bg-[#322f2c]' : 'bg-[#fffdfa] text-[#2d2a26] hover:bg-[#f5efe2]'
                }`}
              >
                <Monitor className="w-4 h-4 text-purple-500" />
                <span>This PC</span>
              </button>

              <button
                onClick={() => navigateTo('drive-c')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-[#2d2a26] text-xs font-bold transition cursor-pointer ml-3 ${
                  currentPath === 'drive-c'
                    ? 'bg-[#fef08a] text-[#2d2a26] shadow-[2px_2px_0px_0px_#2d2a26]'
                    : isDark ? 'bg-[#1e1c1a] text-slate-300 hover:bg-[#322f2c]' : 'bg-[#fffdfa] text-[#2d2a26] hover:bg-[#f5efe2]'
                }`}
              >
                <HardDrive className="w-4 h-4 text-sky-500" />
                <span>Local Disk (C:)</span>
              </button>

              <button
                onClick={() => navigateTo('projects-d')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-[#2d2a26] text-xs font-bold transition cursor-pointer ml-3 ${
                  currentPath === 'projects-d' || currentPath === 'project-detail'
                    ? 'bg-[#fef08a] text-[#2d2a26] shadow-[2px_2px_0px_0px_#2d2a26]'
                    : isDark ? 'bg-[#1e1c1a] text-slate-300 hover:bg-[#322f2c]' : 'bg-[#fffdfa] text-[#2d2a26] hover:bg-[#f5efe2]'
                }`}
              >
                <Folder className="w-4 h-4 text-amber-500" />
                <span>Projects (D:)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Footer Info */}
        <div className="pt-3 border-t-2 border-[#2d2a26] text-[10.5px] font-bold flex items-center justify-between">
          <span>💾 Storage Status</span>
          <span className="bg-[#fef08a] text-[#2d2a26] border border-[#2d2a26] px-1.5 py-0.5 rounded font-extrabold">Online</span>
        </div>
      </div>

      {/* Main File Explorer Panel */}
      <div className={`flex-1 flex flex-col min-w-0 ${isDark ? 'bg-[#1e1c1a]' : 'bg-[#fdfbf7]'}`}>
        
        {/* Top Address Bar & Toolbar */}
        <div className={`border-b-[2.5px] border-[#2d2a26] p-3 flex flex-wrap items-center justify-between gap-3 shadow-[0px_3px_0px_0px_#2d2a26] shrink-0 z-10 ${
          isDark ? 'bg-[#262422] text-slate-100' : 'bg-[#fcf9f2] text-[#2d2a26]'
        }`}>
          
          {/* Navigation Controls & Path Input Bar */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <button
              onClick={() => {
                if (currentPath === 'project-detail') navigateTo('projects-d');
                else navigateTo('this-pc');
              }}
              className="p-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-[#2d2a26] border-2 border-[#2d2a26] shadow-[2px_2px_0px_0px_#2d2a26] transition cursor-pointer shrink-0"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            {/* Address Bar Path */}
            <div className="flex items-center gap-1.5 bg-[#fffdfa] text-[#2d2a26] border-[2.5px] border-[#2d2a26] shadow-[3px_3px_0px_0px_#2d2a26] px-3 py-1 rounded-xl text-xs font-bold flex-1 truncate">
              <span>🖥️</span>
              <span>This PC</span>
              <span>&gt;</span>
              {currentPath === 'this-pc' && <span className="text-purple-900 font-extrabold">Root Directory</span>}
              {currentPath === 'drive-c' && <span className="text-sky-900 font-extrabold">Local Disk (C:)</span>}
              {(currentPath === 'projects-d' || currentPath === 'project-detail') && (
                <span className="text-amber-900 font-extrabold">Projects (D:)</span>
              )}
              {currentPath === 'project-detail' && selectedProject && (
                <>
                  <span>&gt;</span>
                  <span className="text-emerald-900 font-extrabold truncate">{selectedProject.title}</span>
                </>
              )}
            </div>
          </div>

          {/* Search & View Mode Toggle */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-3 text-zinc-500" />
              <input
                type="text"
                placeholder="Search files..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="pl-8 pr-3 py-1 bg-[#fffdfa] text-[#2d2a26] border-[2px] border-[#2d2a26] rounded-xl text-xs placeholder-zinc-500 focus:outline-none shadow-[2px_2px_0px_0px_#2d2a26] w-36 sm:w-44 font-bold"
              />
            </div>

            <div className="flex items-center bg-[#f5efe2] border-[2px] border-[#2d2a26] rounded-xl p-0.5 shadow-[2px_2px_0px_0px_#2d2a26]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded-lg transition cursor-pointer ${
                  viewMode === 'grid' ? 'bg-[#fef08a] text-[#2d2a26] font-bold border border-[#2d2a26]' : 'text-zinc-700 hover:text-black'
                }`}
                title="Grid View"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 rounded-lg transition cursor-pointer ${
                  viewMode === 'list' ? 'bg-[#fef08a] text-[#2d2a26] font-bold border border-[#2d2a26]' : 'text-zinc-700 hover:text-black'
                }`}
                title="List View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Directory Contents Panel */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-doodle-grid">
          
          {/* VIEW 1: THIS PC (Drives View) */}
          {currentPath === 'this-pc' && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className={`text-sm font-extrabold uppercase tracking-wider mb-3 flex items-center gap-2 ${
                  isDark ? 'text-amber-300' : 'text-amber-900'
                }`}>
                  <span>💾</span> Drives and Devices ({2})
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Local Disk (C:) Card */}
                  <div
                    onClick={() => navigateTo('drive-c')}
                    className={`group border-[2.5px] border-[#2d2a26] rounded-2xl p-4 shadow-[5px_5px_0px_0px_#2d2a26] hover:shadow-[7px_7px_0px_0px_#2d2a26] hover:-translate-y-1 transition duration-200 cursor-pointer flex items-center gap-4 ${
                      isDark ? 'bg-[#262422] hover:bg-[#322f2c] text-slate-100' : 'bg-[#fcf9f2] hover:bg-[#f5efe2] text-[#2d2a26]'
                    }`}
                  >
                    <DoodleDriveIcon className="w-14 h-14" />
                    <div className="flex-1">
                      <h3 className="font-extrabold text-sm group-hover:text-amber-700 transition">
                        Local Disk (C:)
                      </h3>
                      <div className="w-full bg-[#181716] border border-[#2d2a26] rounded-full h-2.5 mt-2 overflow-hidden">
                        <div className="bg-sky-400 h-full w-[45%]" />
                      </div>
                      <p className={`text-[10.5px] font-bold mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        128 GB free of 256 GB
                      </p>
                    </div>
                  </div>

                  {/* Projects (D:) Card */}
                  <div
                    onClick={() => navigateTo('projects-d')}
                    className={`group border-[2.5px] border-[#2d2a26] rounded-2xl p-4 shadow-[5px_5px_0px_0px_#2d2a26] hover:shadow-[7px_7px_0px_0px_#2d2a26] hover:-translate-y-1 transition duration-200 cursor-pointer flex items-center gap-4 ${
                      isDark ? 'bg-[#262422] hover:bg-[#322f2c] text-slate-100' : 'bg-[#fcf9f2] hover:bg-[#f5efe2] text-[#2d2a26]'
                    }`}
                  >
                    <DoodleFolderIcon className="w-14 h-14" />
                    <div className="flex-1">
                      <h3 className="font-extrabold text-sm group-hover:text-amber-700 transition">
                        Projects (D:)
                      </h3>
                      <div className="w-full bg-[#181716] border border-[#2d2a26] rounded-full h-2.5 mt-2 overflow-hidden">
                        <div className="bg-[#fef08a] h-full w-[65%]" />
                      </div>
                      <p className={`text-[10.5px] font-bold mt-1 ${isDark ? 'text-amber-300' : 'text-amber-900'}`}>
                        {projects.length} Proyek Portofolio Terdaftar
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: LOCAL DISK (C:) View */}
          {currentPath === 'drive-c' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b-2 border-[#2d2a26] pb-3 mb-2">
                <h2 className="text-base font-extrabold flex items-center gap-2">
                  <span>💾</span> Local Disk (C:) System Folders
                </h2>
                <button
                  onClick={() => navigateTo('this-pc')}
                  className="bg-amber-200 border-2 border-[#2d2a26] px-3 py-1 rounded-xl text-xs font-bold text-[#2d2a26]"
                >
                  Kembali ke This PC ➔
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div 
                  onClick={() => openWindow('bio')}
                  className={`border-[2px] border-[#2d2a26] rounded-xl p-3 flex flex-col items-center justify-center text-center gap-2 cursor-pointer shadow-[3px_3px_0px_0px_#2d2a26] ${
                    isDark ? 'bg-[#262422] hover:bg-[#322f2c] text-slate-100' : 'bg-[#fcf9f2] hover:bg-[#f5efe2] text-[#2d2a26]'
                  }`}
                >
                  <FileText className="w-10 h-10 text-sky-500" />
                  <span className="text-xs font-bold">Documents / Bio.txt</span>
                </div>

                <div 
                  onClick={() => openWindow('terminal')}
                  className={`border-[2px] border-[#2d2a26] rounded-xl p-3 flex flex-col items-center justify-center text-center gap-2 cursor-pointer shadow-[3px_3px_0px_0px_#2d2a26] ${
                    isDark ? 'bg-[#262422] hover:bg-[#322f2c] text-slate-100' : 'bg-[#fcf9f2] hover:bg-[#f5efe2] text-[#2d2a26]'
                  }`}
                >
                  <Terminal className="w-10 h-10 text-emerald-500" />
                  <span className="text-xs font-bold">System / Terminal</span>
                </div>

                <div 
                  onClick={() => navigateTo('projects-d')}
                  className={`border-[2px] border-[#2d2a26] rounded-xl p-3 flex flex-col items-center justify-center text-center gap-2 cursor-pointer shadow-[3px_3px_0px_0px_#2d2a26] ${
                    isDark ? 'bg-[#262422] hover:bg-[#322f2c] text-slate-100' : 'bg-[#fcf9f2] hover:bg-[#f5efe2] text-[#2d2a26]'
                  }`}
                >
                  <DoodleFolderIcon className="w-10 h-10" />
                  <span className="text-xs font-bold">Projects Directory</span>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 3: PROJECTS (D:) Directory View */}
          {currentPath === 'projects-d' && (
            <div>
              <div className="flex items-center justify-between mb-5 px-1">
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold flex items-center gap-2">
                    <span>📂</span> Projects (D:) Directory ({filteredProjects.length})
                  </h2>
                  <p className={`text-xs font-bold mt-0.5 ${isDark ? 'text-amber-300' : 'text-amber-900'}`}>
                    Klik pada ikon folder proyek di bawah untuk membuka detail & tautan langsung.
                  </p>
                </div>
              </div>

              {/* Grid View */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredProjects.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleOpenFolder(p.id)}
                      className={`group flex flex-col items-center justify-between p-4 border-[2.5px] border-[#2d2a26] rounded-2xl shadow-[5px_5px_0px_0px_#2d2a26] hover:shadow-[7px_7px_0px_0px_#2d2a26] hover:-translate-y-1 transition-all duration-200 cursor-pointer font-doodle text-center min-h-[170px] relative ${
                        isDark ? 'bg-[#262422] hover:bg-[#322f2c] text-slate-100' : 'bg-[#fcf9f2] hover:bg-[#f5efe2] text-[#2d2a26]'
                      }`}
                    >
                      {p.featured && (
                        <span className="absolute top-2 right-2 bg-[#fef08a] text-[#2d2a26] border border-[#2d2a26] text-[9px] font-extrabold px-1.5 py-0.5 rounded-full shadow-[1px_1px_0px_0px_#2d2a26]">
                          ⭐ Featured
                        </span>
                      )}

                      <div className="mt-2 group-hover:scale-110 transition-transform">
                        <DoodleFolderIcon className="w-16 h-16" />
                      </div>

                      <div className="w-full mt-2">
                        <h3 className="font-extrabold text-xs sm:text-sm truncate px-1">
                          {p.title}
                        </h3>
                        <div className={`text-[10px] font-bold mt-0.5 ${isDark ? 'text-amber-300' : 'text-amber-900'}`}>
                          {p.tags.length} File / Tech Stack
                        </div>
                      </div>

                      <div className="mt-2 w-full pt-2 border-t-2 border-[#2d2a26]/60 flex items-center justify-center">
                        <span className="text-[10.5px] bg-[#fef08a] text-[#2d2a26] border border-[#2d2a26] px-2.5 py-0.5 rounded-lg font-extrabold shadow-[1.5px_1.5px_0px_0px_#2d2a26]">
                          Buka Folder ➔
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* List View */
                <div className="flex flex-col gap-3">
                  {filteredProjects.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleOpenFolder(p.id)}
                      className={`border-[2.5px] border-[#2d2a26] rounded-2xl p-3.5 shadow-[4px_4px_0px_0px_#2d2a26] hover:shadow-[6px_6px_0px_0px_#2d2a26] transition-all cursor-pointer flex items-center justify-between gap-4 font-doodle ${
                        isDark ? 'bg-[#262422] hover:bg-[#322f2c] text-slate-100' : 'bg-[#fcf9f2] hover:bg-[#f5efe2] text-[#2d2a26]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 overflow-hidden">
                        <DoodleFolderIcon className="w-10 h-10" />
                        <div>
                          <h3 className="font-extrabold text-sm leading-tight flex items-center gap-2">
                            <span>{p.title}</span>
                            {p.featured && (
                              <span className="bg-[#fef08a] text-[#2d2a26] border border-[#2d2a26] text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                                ⭐ Featured
                              </span>
                            )}
                          </h3>
                          <p className={`text-xs truncate max-w-lg mt-0.5 font-bold ${isDark ? 'text-slate-300' : 'text-zinc-700'}`}>
                            {p.description}
                          </p>
                        </div>
                      </div>

                      <button className="bg-[#fef08a] text-[#2d2a26] border-2 border-[#2d2a26] px-3.5 py-1 rounded-xl text-xs font-extrabold shadow-[2px_2px_0px_0px_#2d2a26] shrink-0">
                        Buka Folder ➔
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW 4: INSIDE SPECIFIC PROJECT FOLDER */}
          {currentPath === 'project-detail' && selectedProject && (
            <ProjectDetailView
              isDark={isDark}
              selectedProject={selectedProject}
              onBack={() => navigateTo('projects-d')}
              DoodleFolderIcon={DoodleFolderIcon}
            />
          )}
        </div>
      </div>
    </div>
  );
}
