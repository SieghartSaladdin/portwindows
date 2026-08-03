'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Folder, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight, 
  Cpu, 
  GitBranch, 
  Activity, 
  Eye
} from 'lucide-react';
import { useOSStore } from '@/lib/store';

const GitHubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={props.className}>
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

export function ProjectProjector() {
  const { projects, openWindow, setSelectedProjectId, windows } = useOSStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flicker, setFlicker] = useState(false);

  // Sync index boundaries
  useEffect(() => {
    if (currentIndex >= projects.length) {
      setCurrentIndex(0);
    }
  }, [projects, currentIndex]);

  // Subtle holographic flicker effect
  useEffect(() => {
    const interval = setInterval(() => {
      setFlicker(true);
      setTimeout(() => setFlicker(false), 80);
    }, 5000 + Math.random() * 4000);

    return () => clearInterval(interval);
  }, []);

  if (!projects || projects.length === 0) return null;

  const project = projects[currentIndex];

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % projects.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
  };

  const handleExploreProject = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProjectId(project.id);
    openWindow('projects', 'Projects');
  };

  // Keep screen clean if any window is maximized
  const isAnyWindowMaximized = Object.values(windows).some(
    (w) => w.isOpen && w.isMaximized && !w.isMinimized
  );

  if (isAnyWindowMaximized) return null;

  return (
    <div className="absolute top-[46%] left-[50%] -translate-x-[50%] -translate-y-[50%] z-[2] w-full max-w-[760px] px-4 pointer-events-auto flex flex-col items-center select-none">
      
      {/* Floating Holographic Projected Screen */}
      <motion.div
        animate={{ 
          y: [-6, 6, -6],
          rotateX: [-0.5, 0.5, -0.5],
          rotateY: [-1, 1, -1]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 7, 
          ease: 'easeInOut' 
        }}
        style={{ perspective: 1200 }}
        className={`
          w-full relative rounded-2xl border border-cyan-500/30 bg-zinc-950/65 backdrop-blur-lg p-5
          shadow-[0_0_40px_rgba(6,182,212,0.2)] flex flex-col gap-4 transition-all duration-300
          hover:border-cyan-400/50 hover:shadow-[0_0_50px_rgba(6,182,212,0.3)]
          ${flicker ? 'opacity-80 translate-x-[1px]' : 'opacity-100'}
        `}
      >
        {/* Sci-Fi Corner Brackets */}
        <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg pointer-events-none" />
        <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-cyan-400 rounded-br-lg pointer-events-none" />

        {/* Futuristic Scanline / Grid Overlay */}
        <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden z-20">
          <div className="w-full h-0.5 bg-cyan-400/10 shadow-[0_0_8px_rgba(34,211,238,0.5)] animate-scanline absolute top-0 left-0" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[length:100%_4px]" />
        </div>

        {/* Header Ribbon / Navigation */}
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2.5 relative z-10 font-mono">
          <div className="flex items-center gap-2 text-cyan-400">
            <Cpu className="w-4 h-4 animate-spin-slow text-cyan-400" />
            <span className="text-[10px] tracking-widest uppercase font-bold">AURA PROJECTOR // SYSTEM: ACTIVE</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-[8.5px] text-cyan-500/60 uppercase font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Telemetry online</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400 text-[10px]">
              <span>[</span>
              <span className="text-cyan-400 font-bold">{currentIndex + 1}</span>
              <span>/</span>
              <span>{projects.length}</span>
              <span>]</span>
            </div>
          </div>
        </div>

        {/* Floating Screenshot Display */}
        <div className="relative w-full h-64 rounded-lg overflow-hidden border border-cyan-500/20 group bg-cyan-950/20 select-none">
          
          {/* Target Reticle Crosshair overlay */}
          <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center opacity-40">
            <div className="w-6 h-6 border border-cyan-400/40 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
            </div>
            <div className="absolute w-12 h-[1px] bg-cyan-400/20"></div>
            <div className="absolute h-12 w-[1px] bg-cyan-400/20"></div>
            {/* Corner ticks inside scanner display */}
            <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-cyan-400/40" />
            <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-cyan-400/40" />
            <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-cyan-400/40" />
            <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-cyan-400/40" />
          </div>

          {project.images && project.images.length > 0 ? (
            <>
              {/* Cyan Holographic Tint layer (fades to clean color on hover) */}
              <div className="absolute inset-0 bg-cyan-500/20 group-hover:bg-cyan-500/0 mix-blend-color transition-colors duration-300 pointer-events-none z-10" />
              <img 
                src={project.images[0]} 
                alt={project.title} 
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.04]"
              />
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-cyan-400/50 gap-1 font-mono">
              <Folder className="w-12 h-12" />
              <span className="text-[10px]">No previews projected</span>
            </div>
          )}

          {/* Project Featured Tag */}
          {project.featured && (
            <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-cyan-600/95 text-[8.5px] font-mono font-bold uppercase tracking-widest text-white border border-cyan-400/40 z-20 shadow-lg">
              ★ FEATURED
            </div>
          )}

          {/* Navigation Overlay Arrows */}
          <button 
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-zinc-950/80 border border-cyan-500/25 hover:border-cyan-400 text-cyan-400 hover:text-white transition z-20 hover:scale-105 active:scale-95 cursor-default shadow-lg"
            title="Previous Project"
          >
            <ChevronLeft className="w-4.5 h-4.5" />
          </button>
          <button 
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-zinc-950/80 border border-cyan-500/25 hover:border-cyan-400 text-cyan-400 hover:text-white transition z-20 hover:scale-105 active:scale-95 cursor-default shadow-lg"
            title="Next Project"
          >
            <ChevronRight className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Project Details */}
        <div className="flex flex-col gap-1.5 relative z-10 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_6px_#22d3ee]"></span>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">
              {project.title}
            </h3>
            <span className="text-[8px] px-1.5 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 uppercase font-semibold">
              CORE_MODULE
            </span>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed font-sans line-clamp-2 h-9">
            {project.description}
          </p>

          {/* Tech stack tags */}
          <div className="flex flex-wrap gap-1.5 mt-1">
            {project.tags.map((tag: string) => (
              <span 
                key={tag}
                className="text-[8.5px] text-cyan-400 font-bold uppercase tracking-wider bg-cyan-950/20 border border-cyan-500/10 px-2 py-0.5 rounded"
              >
                [{tag}]
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3.5 mt-2 relative z-10 font-mono text-[10px]">
          {/* Explore */}
          <button 
            onClick={handleExploreProject}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded border border-cyan-400/40 bg-cyan-950/30 hover:bg-cyan-950/50 text-cyan-300 hover:text-cyan-100 font-bold tracking-wider transition cursor-default shadow-lg hover:shadow-cyan-500/10"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>EXPLORE</span>
          </button>

          {/* Repository */}
          {project.githubUrl ? (
            <a 
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2.5 rounded bg-zinc-950/60 hover:bg-zinc-900 border border-white/5 hover:border-cyan-500/30 text-slate-300 hover:text-white transition cursor-default shadow-md"
            >
              <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
              <span>SOURCE_CODE</span>
            </a>
          ) : (
            <div className="opacity-35 flex items-center justify-center py-2.5 border border-transparent text-slate-600 cursor-not-allowed">
              <span>NO_CODE</span>
            </div>
          )}

          {/* Live Link */}
          {project.liveUrl ? (
            <a 
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2.5 rounded bg-cyan-600 hover:bg-cyan-500 border border-cyan-400/30 text-white font-bold transition cursor-default shadow-lg shadow-cyan-600/15"
            >
              <Activity className="w-3.5 h-3.5 text-cyan-100 animate-pulse" />
              <span>LIVE_DEMO</span>
            </a>
          ) : (
            <div className="opacity-35 flex items-center justify-center py-2.5 border border-transparent text-slate-600 cursor-not-allowed">
              <span>INTERNAL</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Hologram Projector Light Beam (Wide focal beam converging down) */}
      <div className="w-full h-48 relative overflow-hidden pointer-events-none mt-[-10px] flex items-center justify-center">
        {/* Core high-intensity beam center line */}
        <div 
          className="absolute h-full w-[220px] bg-gradient-to-t from-cyan-400/45 via-cyan-400/10 to-cyan-400/0 opacity-70"
          style={{
            clipPath: 'polygon(15% 0%, 85% 0%, 50% 100%)'
          }}
        />
        {/* Ambient wider trapezoid light glow */}
        <div 
          className="absolute inset-0 opacity-75 animate-pulse"
          style={{
            clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)',
            backgroundImage: 'radial-gradient(ellipse at 50% 100%, rgba(34, 211, 238, 0.45) 0%, rgba(34, 211, 238, 0.2) 65%, rgba(34, 211, 238, 0) 100%)'
          }}
        />
        {/* Light beam particles restricted to cone */}
        <div 
          className="absolute inset-0 mix-blend-screen opacity-45 bg-size-custom"
          style={{
            clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)'
          }}
        />
        
        {/* Expanding concentric light ripples radiating from emitter lens */}
        <div className="absolute bottom-[2px] w-24 h-4 rounded-full border border-cyan-400/20 animate-[ping_3s_infinite] opacity-35" />
        <div className="absolute bottom-[2px] w-14 h-2.5 rounded-full border border-cyan-400/35 animate-[ping_2s_infinite] opacity-50" />
      </div>

      {/* Hologram Projector Console Device (Pedestal hardware design) */}
      <div className="w-32 h-6 bg-gradient-to-b from-zinc-800 via-zinc-900 to-zinc-950 border border-zinc-700/80 rounded-t-lg flex flex-col items-center justify-between p-1 relative shadow-2xl mt-[-24px] z-10 border-b-0">
        
        {/* Emitter grid detail panel */}
        <div className="w-full flex justify-between items-center px-2 text-[6px] font-mono text-zinc-500 leading-none">
          <span>PORT_B_L</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/75 animate-ping"></span>
          <span>PORT_B_R</span>
        </div>

        {/* Central Emitting Lens Lens */}
        <div className="w-16 h-2 bg-cyan-400/90 rounded-full shadow-[0_0_14px_#22d3ee] animate-pulse flex items-center justify-center">
          <div className="w-6 h-0.5 bg-white rounded-full opacity-70"></div>
        </div>
      </div>

    </div>
  );
}
