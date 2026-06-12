'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Power, 
  Settings, 
  FileText, 
  Folder, 
  Terminal, 
  FileCode2,
  User,
  ExternalLink,
  Gamepad2
} from 'lucide-react';
import { useOSStore } from '@/lib/store';
import { PROFILE } from '@/lib/data';

// Custom Brand Icons
const GitHubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={props.className}>
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

const LinkedInIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={props.className}>
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

export function StartMenu() {
  const { 
    startMenuOpen, 
    toggleStartMenu, 
    openWindow,
    recentlyOpened,
    startMenuSearchFocused,
    setStartMenuSearchFocused
  } = useOSStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSearchIndex, setSelectedSearchIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset selected search index when search query changes
  useEffect(() => {
    setSelectedSearchIndex(0);
  }, [searchQuery]);

  // Focus the input when startMenuSearchFocused is triggered
  useEffect(() => {
    if (startMenuOpen && startMenuSearchFocused && inputRef.current) {
      inputRef.current.focus();
      setStartMenuSearchFocused(false);
    }
  }, [startMenuOpen, startMenuSearchFocused, setStartMenuSearchFocused]);

  // General autoFocus helper on Start Menu open to wait for open animation
  useEffect(() => {
    if (startMenuOpen && inputRef.current) {
      const t = setTimeout(() => {
        inputRef.current?.focus();
      }, 85);
      return () => clearTimeout(t);
    }
  }, [startMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (startMenuOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        // We need to make sure we don't close it if we clicked the start button or search button itself
        const target = event.target as HTMLElement;
        if (!target.closest('.win-start-btn') && !target.closest('.win-search-btn')) {
          toggleStartMenu();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [startMenuOpen, toggleStartMenu]);

  if (!startMenuOpen) return null;

  const handleOpenApp = (id: string, title: string) => {
    openWindow(id, title);
    toggleStartMenu(); // Close start menu
  };

  const pinnedApps = [
    { id: 'bio', title: 'Bio', icon: <FileText className="w-6 h-6 text-emerald-400" />, action: () => handleOpenApp('bio', 'Bio.txt') },
    { id: 'projects', title: 'Projects', icon: <Folder className="w-6 h-6 text-amber-400" />, action: () => handleOpenApp('projects', 'Projects') },
    { id: 'terminal', title: 'Terminal', icon: <Terminal className="w-6 h-6 text-indigo-400" />, action: () => handleOpenApp('terminal', 'Command Prompt') },
    { id: 'settings', title: 'Settings', icon: <Settings className="w-6 h-6 text-blue-400" />, action: () => handleOpenApp('settings', 'Settings') },
    { id: 'frieren', title: 'Frieren.exe', icon: <Gamepad2 className="w-6 h-6 text-rose-400" />, action: () => handleOpenApp('frieren', 'Frieren.exe') },
    { id: 'github', title: 'GitHub', icon: <GitHubIcon className="w-6 h-6 text-slate-300" />, action: () => window.open('https://github.com', '_blank') },
    { id: 'linkedin', title: 'LinkedIn', icon: <LinkedInIcon className="w-6 h-6 text-sky-400" />, action: () => window.open('https://linkedin.com', '_blank') },
  ];

  // Map app IDs to visual metadata for dynamic recently opened list
  const appMap: Record<string, { title: string; desc: string; icon: React.ReactNode; action: () => void }> = {
    bio: { title: 'Bio.txt', desc: 'Notepad Document', icon: <FileText className="w-5 h-5 text-emerald-400" />, action: () => handleOpenApp('bio', 'Bio.txt') },
    projects: { title: 'Projects', desc: 'System Folder', icon: <Folder className="w-5 h-5 text-amber-400" />, action: () => handleOpenApp('projects', 'Projects') },
    terminal: { title: 'Command Prompt', desc: 'System Command Prompt', icon: <Terminal className="w-5 h-5 text-indigo-400" />, action: () => handleOpenApp('terminal', 'Command Prompt') },
    settings: { title: 'Settings', desc: 'System Settings App', icon: <Settings className="w-5 h-5 text-blue-400" />, action: () => handleOpenApp('settings', 'Settings') },
    frieren: { title: 'Frieren.exe', desc: 'Character Control App', icon: <Gamepad2 className="w-5 h-5 text-rose-400" />, action: () => handleOpenApp('frieren', 'Frieren.exe') },
  };

  const recentItems = recentlyOpened
    .map((id) => appMap[id])
    .filter(Boolean)
    .slice(0, 4);

  // Search catalog with keywords, categories, and detailed descriptions
  const allSearchableItems = [
    { id: 'bio', title: 'Bio.txt', desc: 'Read Frieren\'s personal bio, background, and developer profile information.', category: 'Apps', icon: <FileText className="w-5 h-5 text-emerald-400" />, action: () => handleOpenApp('bio', 'Bio.txt') },
    { id: 'projects', title: 'Projects Folder', desc: 'Browse developed developer projects, repositories, and technical skills.', category: 'Apps', icon: <Folder className="w-5 h-5 text-amber-400" />, action: () => handleOpenApp('projects', 'Projects') },
    { id: 'terminal', title: 'Command Prompt (Terminal)', desc: 'Run OS terminal commands, file utilities, and system commands.', category: 'Apps', icon: <Terminal className="w-5 h-5 text-indigo-400" />, action: () => handleOpenApp('terminal', 'Command Prompt') },
    { id: 'settings', title: 'Settings Manager', desc: 'Customize simulated desktop wallpapers, themes, and audio features.', category: 'Apps', icon: <Settings className="w-5 h-5 text-blue-400" />, action: () => handleOpenApp('settings', 'Settings') },
    { id: 'frieren', title: 'Frieren.exe Control Panel', desc: 'Configure playable character sizes, walking speeds, speech volume, and memory limits.', category: 'Apps', icon: <Gamepad2 className="w-5 h-5 text-rose-400" />, action: () => handleOpenApp('frieren', 'Frieren.exe') },
    
    { id: 'settings-wp', title: 'Change Desktop Wallpaper', desc: 'Configure Settings manager to switch desktop background gradients.', category: 'Settings', icon: <Settings className="w-5 h-5 text-indigo-400" />, action: () => handleOpenApp('settings', 'Settings') },
    { id: 'settings-volume', title: 'Adjust Character Scroll Volume', desc: 'Modify typing blip sound volume and toggle sound limits.', category: 'Settings', icon: <Settings className="w-5 h-5 text-rose-400" />, action: () => handleOpenApp('settings', 'Settings') },
    { id: 'frieren-spawn', title: 'Toggle Character Spawn Status', desc: 'Enable or disable desktop pet animations in Frieren.exe.', category: 'Settings', icon: <Gamepad2 className="w-5 h-5 text-emerald-400" />, action: () => handleOpenApp('frieren', 'Frieren.exe') },

    { id: 'github', title: 'GitHub Profile Link', desc: 'Launch browser to view Frieren\'s software development repositories on github.com.', category: 'Web', icon: <GitHubIcon className="w-5 h-5 text-slate-300" />, action: () => window.open('https://github.com', '_blank') },
    { id: 'linkedin', title: 'LinkedIn Profile Link', desc: 'Launch browser to view Frieren\'s professional networking profile on linkedin.com.', category: 'Web', icon: <LinkedInIcon className="w-5 h-5 text-sky-400" />, action: () => window.open('https://linkedin.com', '_blank') },
  ];

  const searchResults = allSearchableItems.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, y: 100, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.96 }}
        transition={{ type: 'spring', damping: 22, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
        className="fixed bottom-14 left-1/2 -translate-x-1/2 z-40 w-[95vw] sm:w-[580px] h-[600px] rounded-2xl win-mica-dark border border-white/10 shadow-2xl flex flex-col justify-between overflow-hidden"
      >
        {/* Search Input Bar */}
        <div className="p-8 pb-4">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-4 h-4 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Type here to search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-11 pr-4 rounded-full bg-black/45 border-b border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-win-accent-light focus:bg-black/60 transition"
            />
          </div>
        </div>

        {/* Search Results / Pinned Apps */}
        <div className="flex-1 px-8 py-2 overflow-y-auto min-h-0 flex flex-col">
          {searchQuery ? (
            // Search Results Layout
            searchResults.length > 0 ? (
              <div className="flex gap-4 h-full min-h-0">
                {/* Left Column: Results List */}
                <div className="flex-1 flex flex-col gap-1 overflow-y-auto pr-2">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1.5">
                    Best Match & Search Results
                  </div>
                  {searchResults.map((item, idx) => (
                    <button
                      key={item.id}
                      onMouseEnter={() => setSelectedSearchIndex(idx)}
                      onClick={item.action}
                      className={`
                        w-full flex items-center justify-between p-2.5 rounded-xl text-left transition cursor-default
                        ${selectedSearchIndex === idx 
                          ? 'bg-white/10 text-white' 
                          : 'hover:bg-white/5 text-slate-300'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-1.5 rounded-lg bg-black/20">
                          {item.icon}
                        </div>
                        <span className="text-xs font-semibold truncate">{item.title}</span>
                      </div>
                      <span className="text-[9px] text-slate-400 bg-white/5 px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                        {item.category}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Right Column: Details Preview Pane */}
                <div className="w-[200px] hidden sm:flex flex-col items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5 h-full">
                  {searchResults[selectedSearchIndex] ? (
                    (() => {
                      const sel = searchResults[selectedSearchIndex];
                      return (
                        <>
                          <div className="flex flex-col items-center text-center gap-3 w-full">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg">
                              <div className="transform scale-125">
                                {sel.icon}
                              </div>
                            </div>
                            <div className="w-full">
                              <h4 className="text-xs font-bold text-slate-100 truncate">{sel.title}</h4>
                              <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">
                                {sel.category}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-normal max-h-[160px] overflow-y-auto pt-1 border-t border-white/5 w-full">
                              {sel.desc}
                            </p>
                          </div>
                          <button
                            onClick={sel.action}
                            className="w-full py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition cursor-default text-center"
                          >
                            {sel.category === 'Web' ? 'Open Link' : 'Open App'}
                          </button>
                        </>
                      );
                    })()
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 gap-2">
                <span className="text-2xl">🔍</span>
                <div className="text-xs">No results found for "{searchQuery}"</div>
                <div className="text-[10px] text-slate-500">Try searching for other apps or settings.</div>
              </div>
            )
          ) : (
            // Default Start Menu (Pinned & Recently Opened)
            <>
              <div className="flex justify-between items-center mb-4 text-xs font-semibold text-slate-200">
                <span>Pinned</span>
                <button className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] text-slate-300 transition">
                  All apps
                </button>
              </div>
              
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-y-4">
                {pinnedApps.map((app) => (
                  <button
                    key={app.id}
                    onClick={app.action}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-white/10 text-center transition group cursor-default"
                  >
                    <div className="transform group-active:scale-90 transition-transform">
                      {app.icon}
                    </div>
                    <span className="text-[11px] text-slate-300 group-hover:text-white truncate w-16">
                      {app.title}
                    </span>
                  </button>
                ))}
              </div>

              {/* Recently Opened Apps */}
              <div className="mt-8 border-t border-white/5 pt-6">
                <div className="text-xs font-semibold text-slate-200 mb-4">Recently Opened</div>
                {recentItems.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                    {recentItems.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={item.action}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 text-left transition cursor-default group"
                      >
                        <div className="p-1.5 rounded bg-black/35 group-active:scale-95 transition-transform">
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-slate-200 font-medium truncate">{item.title}</div>
                          <div className="text-[10px] text-slate-400 truncate">{item.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-500 py-2">
                    No recently opened applications.
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer Settings & Power */}
        <div className="h-16 px-8 bg-black/25 flex justify-between items-center border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-win-accent flex items-center justify-center text-white text-xs font-bold ring-1 ring-white/10">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="leading-tight">
              <div className="text-xs font-medium text-slate-200">{PROFILE.name}</div>
              <div className="text-[10px] text-slate-400">{PROFILE.title}</div>
            </div>
          </div>

          <button
            onClick={() => {
              if (confirm('Shut down simulated environment? (This will reload the page)')) {
                window.location.reload();
              }
            }}
            className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition cursor-default"
            title="Sign out / Power Options"
          >
            <Power className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
