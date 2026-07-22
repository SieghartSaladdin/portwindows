'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Power, 
  User, 
  ChevronLeft,
  Sparkles
} from 'lucide-react';

import { useOSStore } from '@/lib/store';
import { PROFILE } from '@/lib/data';
import { 
  DoodleHomeIcon,
  DoodleSearchIcon,
  DoodleBioIcon,
  DoodleFolderIcon,
  DoodleTerminalIcon,
  DoodleSettingsIcon,
  DoodlePetIcon,
  DoodleAdminIcon,
  DoodleLinkIcon,
  DoodleWidgetsIcon
} from '@/components/ui/DoodleIcons';

export function StartMenu() {
  const { 
    startMenuOpen, 
    toggleStartMenu, 
    openWindow,
    recentlyOpened,
    startMenuSearchFocused,
    setStartMenuSearchFocused,
    profile,
    showConfirm
  } = useOSStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSearchIndex, setSelectedSearchIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'pinned' | 'allApps'>('pinned');

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

  // General autoFocus helper on Start Menu open
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
    toggleStartMenu();
  };

  const pinnedApps = [
    { id: 'bio', title: 'Bio.txt', icon: <DoodleBioIcon className="w-7 h-7" />, action: () => handleOpenApp('bio', 'Bio.txt') },
    { id: 'projects', title: 'Projects', icon: <DoodleFolderIcon className="w-7 h-7" />, action: () => handleOpenApp('projects', 'Projects') },
    { id: 'terminal', title: 'Aura Terminal', icon: <DoodleTerminalIcon className="w-7 h-7" />, action: () => handleOpenApp('terminal', 'Aura Terminal') },
    { id: 'settings', title: 'Settings', icon: <DoodleSettingsIcon className="w-7 h-7" />, action: () => handleOpenApp('settings', 'Settings') },
    { id: 'admin', title: 'Developer Hub', icon: <DoodleAdminIcon className="w-7 h-7" />, action: () => handleOpenApp('admin', 'Developer Hub') },
    { id: 'frieren', title: 'Frieren.exe', icon: <DoodlePetIcon className="w-7 h-7" />, action: () => handleOpenApp('frieren', 'Frieren.exe') },
  ];

  const allAppsList = [
    { id: 'terminal', title: 'Aura Terminal', icon: <DoodleTerminalIcon className="w-5 h-5" />, action: () => handleOpenApp('terminal', 'Aura Terminal'), letter: 'A' },
    { id: 'bio', title: 'Bio.txt', icon: <DoodleBioIcon className="w-5 h-5" />, action: () => handleOpenApp('bio', 'Bio.txt'), letter: 'B' },
    { id: 'admin', title: 'Developer Hub', icon: <DoodleAdminIcon className="w-5 h-5" />, action: () => handleOpenApp('admin', 'Developer Hub'), letter: 'D' },
    { id: 'frieren', title: 'Frieren.exe', icon: <DoodlePetIcon className="w-5 h-5" />, action: () => handleOpenApp('frieren', 'Frieren.exe'), letter: 'F' },
    { id: 'github', title: 'GitHub', icon: <DoodleLinkIcon className="w-5 h-5" />, action: () => { window.open(profile?.githubUrl || 'https://github.com', '_blank'); toggleStartMenu(); }, letter: 'G' },
    { id: 'linkedin', title: 'LinkedIn', icon: <DoodleLinkIcon className="w-5 h-5" />, action: () => { window.open(profile?.linkedinUrl || 'https://linkedin.com', '_blank'); toggleStartMenu(); }, letter: 'L' },
    { id: 'projects', title: 'Projects', icon: <DoodleFolderIcon className="w-5 h-5" />, action: () => handleOpenApp('projects', 'Projects'), letter: 'P' },
    { id: 'settings', title: 'Settings', icon: <DoodleSettingsIcon className="w-5 h-5" />, action: () => handleOpenApp('settings', 'Settings'), letter: 'S' },
  ];

  const appMap: Record<string, { title: string; desc: string; icon: React.ReactNode; action: () => void }> = {
    bio: { title: 'Bio.txt', desc: 'Notepad Document', icon: <DoodleBioIcon className="w-5 h-5" />, action: () => handleOpenApp('bio', 'Bio.txt') },
    projects: { title: 'Projects', desc: 'System Folder', icon: <DoodleFolderIcon className="w-5 h-5" />, action: () => handleOpenApp('projects', 'Projects') },
    terminal: { title: 'Aura Terminal', desc: 'System Command Terminal', icon: <DoodleTerminalIcon className="w-5 h-5" />, action: () => handleOpenApp('terminal', 'Aura Terminal') },
    settings: { title: 'Settings', desc: 'System Settings App', icon: <DoodleSettingsIcon className="w-5 h-5" />, action: () => handleOpenApp('settings', 'Settings') },
    frieren: { title: 'Frieren.exe', desc: 'Character Control App', icon: <DoodlePetIcon className="w-5 h-5" />, action: () => handleOpenApp('frieren', 'Frieren.exe') },
    admin: { title: 'Developer Hub', desc: 'System Administrator Control', icon: <DoodleAdminIcon className="w-5 h-5" />, action: () => handleOpenApp('admin', 'Developer Hub') },
  };

  const recentItems = recentlyOpened
    .map((id) => appMap[id])
    .filter(Boolean)
    .slice(0, 4);

  const allSearchableItems = [
    { id: 'admin', title: 'Developer Hub', desc: 'CRUD developer dashboard with PIN lock to edit profile details, projects, skills, and work experiences.', category: 'Apps', icon: <DoodleAdminIcon className="w-5 h-5" />, action: () => handleOpenApp('admin', 'Developer Hub') },
    { id: 'bio', title: 'Bio.txt', desc: 'Read personal bio, background, and developer profile information.', category: 'Apps', icon: <DoodleBioIcon className="w-5 h-5" />, action: () => handleOpenApp('bio', 'Bio.txt') },
    { id: 'projects', title: 'Projects Folder', desc: 'Browse developer projects, repositories, and technical skills.', category: 'Apps', icon: <DoodleFolderIcon className="w-5 h-5" />, action: () => handleOpenApp('projects', 'Projects') },
    { id: 'terminal', title: 'Aura Terminal', desc: 'Run OS terminal commands, file utilities, and system commands.', category: 'Apps', icon: <DoodleTerminalIcon className="w-5 h-5" />, action: () => handleOpenApp('terminal', 'Aura Terminal') },
    { id: 'settings', title: 'Settings Manager', desc: 'Customize simulated desktop wallpapers, themes, and audio features.', category: 'Apps', icon: <DoodleSettingsIcon className="w-5 h-5" />, action: () => handleOpenApp('settings', 'Settings') },
    { id: 'frieren', title: 'Frieren.exe Control Panel', desc: 'Configure playable character sizes, walking speeds, speech volume, and memory limits.', category: 'Apps', icon: <DoodlePetIcon className="w-5 h-5" />, action: () => handleOpenApp('frieren', 'Frieren.exe') },
    
    { id: 'settings-wp', title: 'Change Desktop Wallpaper', desc: 'Configure Settings manager to switch desktop background gradients.', category: 'Settings', icon: <DoodleSettingsIcon className="w-5 h-5" />, action: () => handleOpenApp('settings', 'Settings') },
    { id: 'settings-volume', title: 'Adjust Character Scroll Volume', desc: 'Modify typing blip sound volume and toggle sound limits.', category: 'Settings', icon: <DoodleSettingsIcon className="w-5 h-5" />, action: () => handleOpenApp('settings', 'Settings') },
    { id: 'frieren-spawn', title: 'Toggle Character Spawn Status', desc: 'Enable or disable desktop pet animations in Frieren.exe.', category: 'Settings', icon: <DoodlePetIcon className="w-5 h-5" />, action: () => handleOpenApp('frieren', 'Frieren.exe') },

    { id: 'github', title: 'GitHub Profile Link', desc: 'Launch browser to view software development repositories on github.com.', category: 'Web', icon: <DoodleLinkIcon className="w-5 h-5" />, action: () => window.open(profile?.githubUrl || 'https://github.com', '_blank') },
    { id: 'linkedin', title: 'LinkedIn Profile Link', desc: 'Launch browser to view professional networking profile on linkedin.com.', category: 'Web', icon: <DoodleLinkIcon className="w-5 h-5" />, action: () => window.open(profile?.linkedinUrl || 'https://linkedin.com', '_blank') },
  ];

  const searchResults = allSearchableItems.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, y: 80, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 80, scale: 0.94 }}
        transition={{ type: 'spring', damping: 24, stiffness: 220 }}
        onClick={(e) => e.stopPropagation()}
        className="fixed bottom-16 left-1/2 -translate-x-1/2 z-40 w-[95vw] sm:w-[610px] h-[620px] bg-[#fffdfa] border-[2.5px] border-[#2d2a26] rounded-3xl shadow-[6px_6px_0px_0px_#2d2a26] p-4 text-[#2d2a26] backdrop-blur-xl flex flex-col justify-between overflow-hidden select-none font-doodle"
      >
        {/* Top Header & Search Bar */}
        <div className="p-3 pb-2">
          <div className="relative flex items-center">
            <div className="absolute left-3.5 flex items-center justify-center">
              <DoodleSearchIcon className="w-5 h-5" />
            </div>
            <input
              ref={inputRef}
              type="text"
              placeholder="✨ Search notebook apps, files, settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-11 pr-4 border-[2.5px] border-[#2d2a26] rounded-2xl bg-amber-50/70 text-sm text-[#2d2a26] font-bold placeholder-[#2d2a26]/60 focus:outline-none focus:bg-amber-100/90 transition font-doodle shadow-[3px_3px_0px_0px_#2d2a26]"
            />
          </div>
        </div>

        {/* Search Results / Pinned App Cards */}
        <div className="flex-1 px-3 py-2 overflow-y-auto min-h-0 flex flex-col font-doodle">
          {searchQuery ? (
            // Search Results Layout
            searchResults.length > 0 ? (
              <div className="flex gap-4 h-full min-h-0">
                {/* Left Column: Results List */}
                <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-1">
                  <div className="font-doodle text-xs uppercase tracking-wider text-[#2d2a26] font-bold mb-1 flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Search Results</span>
                  </div>
                  {searchResults.map((item, idx) => (
                    <button
                      key={item.id}
                      onMouseEnter={() => setSelectedSearchIndex(idx)}
                      onClick={item.action}
                      className={`
                        w-full flex items-center justify-between p-3 rounded-2xl border-[2.5px] border-[#2d2a26] transition cursor-pointer text-left font-doodle
                        ${selectedSearchIndex === idx 
                          ? 'bg-sky-100 text-[#2d2a26] shadow-[3px_3px_0px_0px_#2d2a26]' 
                          : 'bg-white text-[#2d2a26] shadow-[2px_2px_0px_0px_#2d2a26] hover:bg-amber-50'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-1.5 rounded-xl bg-amber-100/80 border border-[#2d2a26]">
                          {item.icon}
                        </div>
                        <span className="text-sm font-bold truncate font-doodle">{item.title}</span>
                      </div>
                      <span className="text-[10px] text-[#2d2a26] border border-[#2d2a26] bg-amber-200/80 px-2 py-0.5 rounded-full font-bold uppercase">
                        {item.category}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Right Column: Preview Pane */}
                <div className="w-[210px] hidden sm:flex flex-col items-center justify-between p-4 rounded-2xl border-[2.5px] border-[#2d2a26] bg-amber-50/60 h-full shadow-[3px_3px_0px_0px_#2d2a26]">
                  {searchResults[selectedSearchIndex] ? (
                    (() => {
                      const sel = searchResults[selectedSearchIndex];
                      return (
                        <>
                          <div className="flex flex-col items-center text-center gap-3 w-full font-doodle">
                            <div className="w-14 h-14 rounded-2xl border-[2.5px] border-[#2d2a26] bg-amber-100 flex items-center justify-center shadow-[2px_2px_0px_0px_#2d2a26]">
                              <div className="transform scale-125">
                                {sel.icon}
                              </div>
                            </div>
                            <div className="w-full">
                              <h4 className="text-sm font-bold text-[#2d2a26] truncate font-doodle">{sel.title}</h4>
                              <span className="text-[10px] text-[#2d2a26] font-bold uppercase tracking-wider bg-amber-200 px-2 py-0.5 rounded-md border border-[#2d2a26]">
                                {sel.category}
                              </span>
                            </div>
                            <p className="text-xs text-[#2d2a26]/80 leading-relaxed max-h-[150px] overflow-y-auto pt-2 border-t-2 border-dashed border-[#2d2a26]/30 w-full font-doodle font-medium">
                              {sel.desc}
                            </p>
                          </div>
                          <button
                            onClick={sel.action}
                            className="w-full py-2.5 rounded-xl border-[2.5px] border-[#2d2a26] bg-sky-300 hover:bg-sky-400 text-[#2d2a26] text-xs font-bold transition cursor-pointer text-center font-doodle shadow-[3px_3px_0px_0px_#2d2a26]"
                          >
                            {sel.category === 'Web' ? 'Open Link 🚀' : 'Open App ✨'}
                          </button>
                        </>
                      );
                    })()
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-[#2d2a26]/70 gap-2 font-doodle">
                <span className="text-3xl">✏️</span>
                <div className="text-sm font-bold">No doodle matches for "{searchQuery}"</div>
                <div className="text-xs text-[#2d2a26]/60 font-medium">Try searching for other apps or settings.</div>
              </div>
            )
          ) : viewMode === 'allApps' ? (
            // All Apps View
            <div className="flex-1 flex flex-col min-h-0 font-doodle">
              <div className="flex justify-between items-center mb-3 text-xs font-bold text-[#2d2a26]">
                <button
                  onClick={() => setViewMode('pinned')}
                  className="flex items-center gap-1 hover:text-sky-600 text-[#2d2a26] transition cursor-pointer font-doodle"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Pinned</span>
                </button>
                <span className="text-xs text-[#2d2a26] uppercase tracking-wider font-bold bg-amber-200 px-2 py-0.5 rounded-md border border-[#2d2a26]">All Notebook Apps</span>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 max-h-[380px] scrollbar-thin">
                {Object.entries(
                  allAppsList.reduce((acc, app) => {
                    const letter = app.letter;
                    if (!acc[letter]) acc[letter] = [];
                    acc[letter].push(app);
                    return acc;
                  }, {} as Record<string, typeof allAppsList>)
                )
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([letter, apps]) => (
                    <div key={letter} className="flex flex-col gap-1.5">
                      <div className="text-xs font-bold text-[#2d2a26] px-2.5 py-0.5 border border-[#2d2a26] bg-amber-200 rounded-lg self-start select-none font-doodle shadow-[1.5px_1.5px_0px_0px_#2d2a26]">
                        {letter}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pl-1">
                        {apps.map((app) => (
                          <button
                            key={app.id}
                            onClick={app.action}
                            className="flex items-center gap-3 p-2.5 rounded-2xl border-[2.5px] border-[#2d2a26] bg-white hover:bg-amber-50 text-left transition cursor-pointer group shadow-[2.5px_2.5px_0px_0px_#2d2a26] font-doodle"
                          >
                            <div className="p-1.5 rounded-xl bg-amber-100 border border-[#2d2a26] group-hover:scale-110 transition-transform">
                              {app.icon}
                            </div>
                            <span className="text-xs text-[#2d2a26] font-bold truncate">
                              {app.title}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            // Default Start Launcher View (Pinned Cards & Recently Opened)
            <>
              <div className="flex justify-between items-center mb-3 text-xs font-bold text-[#2d2a26]">
                <span className="font-doodle text-[#2d2a26] text-sm font-bold tracking-wide">📌 Pinned Notebook Apps</span>
                <button 
                  onClick={() => setViewMode('allApps')}
                  className="px-3 py-1 rounded-xl border-[2px] border-[#2d2a26] bg-amber-100 hover:bg-amber-200 text-xs text-[#2d2a26] font-bold transition cursor-pointer font-doodle shadow-[2px_2px_0px_0px_#2d2a26]"
                >
                  All Apps →
                </button>
              </div>
              
              {/* Hand-Drawn Pinned App Cards */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {pinnedApps.map((app) => (
                  <button
                    key={app.id}
                    onClick={app.action}
                    className="border-[2.5px] border-[#2d2a26] bg-white hover:bg-amber-50 rounded-2xl p-3 shadow-[3.5px_3.5px_0px_0px_#2d2a26] transition flex flex-col items-center gap-2 group cursor-pointer font-doodle hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <div className="p-2 rounded-xl bg-amber-100/80 border border-[#2d2a26] group-hover:scale-110 transition-transform">
                      {app.icon}
                    </div>
                    <span className="text-xs text-[#2d2a26] truncate w-full text-center font-doodle font-bold">
                      {app.title}
                    </span>
                  </button>
                ))}
              </div>

              {/* Recently Opened Apps */}
              <div className="mt-5 border-t-2 border-dashed border-[#2d2a26]/30 pt-3.5">
                <div className="text-xs font-bold text-[#2d2a26] mb-2.5 font-doodle tracking-wide">🕒 Recently Opened</div>
                {recentItems.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {recentItems.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={item.action}
                        className="flex items-center gap-3 p-2.5 rounded-2xl border-[2.5px] border-[#2d2a26] bg-white hover:bg-amber-50 text-left transition cursor-pointer group font-doodle shadow-[2.5px_2.5px_0px_0px_#2d2a26]"
                      >
                        <div className="p-2 rounded-xl bg-amber-100/80 border border-[#2d2a26] group-hover:scale-110 transition-transform">
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-[#2d2a26] font-bold truncate font-doodle">{item.title}</div>
                          <div className="text-[11px] text-[#2d2a26]/70 truncate font-doodle font-medium">{item.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-[#2d2a26]/60 py-2 font-doodle font-medium">
                    No recently opened applications yet.
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer Settings & Power Options Card */}
        <div className="h-14 px-4 bg-amber-100/90 rounded-2xl border-[2.5px] border-[#2d2a26] flex justify-between items-center shadow-[3.5px_3.5px_0px_0px_#2d2a26]">
          <div className="flex items-center gap-3 font-doodle">
            <div className="w-8 h-8 rounded-full border-[2px] border-[#2d2a26] bg-white flex items-center justify-center text-[#2d2a26] text-xs font-bold shadow-[1.5px_1.5px_0px_0px_#2d2a26]">
              <User className="w-4 h-4 text-[#2d2a26]" />
            </div>
            <div className="leading-tight">
              <div className="text-xs font-bold text-[#2d2a26] font-doodle">{PROFILE.name}</div>
              <div className="text-[10px] text-[#2d2a26]/70 font-doodle font-semibold">{PROFILE.title}</div>
            </div>
          </div>

          <button
            onClick={() => {
              showConfirm(
                'Power Options',
                'Shut down simulated environment? (This will reload the page)',
                () => {
                  window.location.reload();
                }
              );
            }}
            className="p-2 rounded-xl border-[2px] border-[#2d2a26] bg-rose-200 hover:bg-rose-300 text-[#2d2a26] transition cursor-pointer shadow-[2px_2px_0px_0px_#2d2a26]"
            title="Sign out / Power Options"
          >
            <Power className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
