'use client';

import React, { useState } from 'react';
import { 
  Folder, 
  ArrowLeft, 
  ArrowRight, 
  RefreshCw, 
  Search,
  ExternalLink,
  HardDrive,
  FileCode,
  LayoutGrid,
  Menu,
  ChevronRight
} from 'lucide-react';
import { Project } from '@/lib/data';
import { useOSStore } from '@/lib/store';

const GitHubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={props.className}>
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

export function ProjectsApp() {
  const { projects } = useOSStore();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tags.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex h-full bg-zinc-950/40 text-slate-100 select-none">
      {/* Explorer Sidebar */}
      <div className="w-48 bg-black/30 border-r border-white/5 p-2 hidden sm:flex flex-col gap-1 text-xs">
        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold px-2 mb-1.5">
          Quick Access
        </span>
        <button className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/10 rounded-md text-left transition text-slate-200">
          <HardDrive className="w-3.5 h-3.5 text-blue-400" />
          <span>This PC</span>
        </button>
        <button className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/10 rounded-md text-left transition text-slate-200 bg-white/5">
          <Folder className="w-3.5 h-3.5 text-amber-400" />
          <span>Projects</span>
        </button>
        <button className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/10 rounded-md text-left transition text-slate-400 hover:text-slate-200">
          <FileCode className="w-3.5 h-3.5" />
          <span>Documents</span>
        </button>

        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold px-2 mt-4 mb-1.5">
          Network
        </span>
        <button className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/10 rounded-md text-left transition text-slate-400 hover:text-slate-200">
          <GlobeIcon className="w-3.5 h-3.5" />
          <span>GitHub Cloud</span>
        </button>
      </div>

      {/* Main Explorer Shell */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navigation / Address Bar */}
        <div className="flex items-center justify-between gap-3 p-2 bg-black/10 border-b border-white/5 text-xs">
          <div className="flex items-center gap-2">
            <button className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition">
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition">
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition">
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          {/* Path bar */}
          <div className="flex-1 max-w-xl flex items-center gap-1.5 px-3 py-1 bg-black/30 border border-white/5 rounded-md text-[11px] text-slate-300">
            <span>This PC</span>
            <ChevronRight className="w-3 h-3 text-slate-500" />
            <span>Documents</span>
            <ChevronRight className="w-3 h-3 text-slate-500" />
            <span className="text-white font-medium">Projects</span>
          </div>

          {/* Search Bar */}
          <div className="relative flex items-center w-36 sm:w-48">
            <Search className="absolute left-2.5 w-3 h-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search Projects"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7.5 pr-2 py-1 rounded bg-black/35 border border-white/5 text-[11px] text-white focus:outline-none focus:border-win-accent-light"
            />
          </div>
        </div>

        {/* View Layout Selector Bar */}
        <div className="flex items-center justify-between px-4 py-1.5 bg-black/5 border-b border-white/5 text-[11px] text-slate-400">
          <div>{filteredProjects.length} items</div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 cursor-default hover:text-white transition">
              <LayoutGrid className="w-3 h-3" /> Grid View
            </span>
          </div>
        </div>

        {/* Folder / File Contents */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Main items grid */}
          <div className="flex-1 p-4 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-4 auto-rows-max">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className={`
                  flex flex-col items-center p-3 rounded-lg border text-center transition cursor-default
                  ${selectedProject?.id === project.id 
                    ? 'bg-win-accent/20 border-win-accent-light' 
                    : 'bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/10'
                  }
                `}
              >
                <Folder className="w-10 h-10 text-amber-400 mb-2 transform active:scale-95 transition-transform" />
                <span className="text-xs font-medium text-slate-200 truncate w-full">
                  {project.title}
                </span>
                <span className="text-[9px] text-slate-400 mt-1 truncate w-full">
                  Folder
                </span>
              </div>
            ))}
          </div>

          {/* Details Sidebar Panel */}
          {selectedProject && (
            <div className="w-full md:w-64 bg-black/35 border-t md:border-t-0 md:border-l border-white/5 p-4 flex flex-col justify-between overflow-y-auto text-xs">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Folder className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-sm text-slate-100">{selectedProject.title}</h3>
                </div>
                <p className="text-slate-300 leading-relaxed mb-4">
                  {selectedProject.description}
                </p>

                {/* Tech tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {selectedProject.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/5">
                {selectedProject.githubUrl && (
                  <a
                    href={selectedProject.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 hover:text-white rounded-md text-center transition"
                  >
                    <GitHubIcon className="w-3.5 h-3.5" />
                    <span>View Repository</span>
                  </a>
                )}
                {selectedProject.liveUrl && (
                  <a
                    href={selectedProject.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-1.5 bg-win-accent hover:bg-win-accent/80 text-white rounded-md text-center transition font-semibold"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Visit Live Site</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Small helper inline component
function GlobeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}
