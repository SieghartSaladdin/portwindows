'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  Monitor, 
  Paintbrush, 
  User, 
  RefreshCw,
  HardDrive,
  Cpu,
  Smile,
  CheckCircle2,
  Sun,
  Moon
} from 'lucide-react';
import { useOSStore } from '@/lib/store';

// Doodle SVG components
const DoodleSettingsSVG = () => (
  <svg className="w-6 h-6 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const DoodleMonitorSVG = () => (
  <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="3" rx="2" />
    <line x1="8" x2="16" y1="21" y2="21" />
    <line x1="12" x2="12" y1="17" y2="21" />
  </svg>
);

type ActiveTab = 'system' | 'personalization' | 'accounts' | 'update';

export function SettingsApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('personalization');
  const { wallpaper, setWallpaper, profile, themeMode, setThemeMode } = useOSStore();

  const isDark = themeMode === 'dark';

  const wallpapers = isDark ? [
    { id: 'default', name: 'Graphite Grid (Classic Dark)', className: 'bg-[#181716] border-[#2d2a26]' },
    { id: 'sunset', name: 'Crimson Night (Deep Rose Dark)', className: 'bg-[#2a1215] border-[#2d2a26]' },
    { id: 'emerald', name: 'Forest Night (Deep Green Dark)', className: 'bg-[#092017] border-[#2d2a26]' },
    { id: 'cyberpunk', name: 'Cyber Night (Neon Fuchsia Dark)', className: 'bg-[#22102b] border-[#2d2a26]' },
  ] : [
    { id: 'default', name: 'Notebook Grid (Classic Light)', className: 'bg-[#fefce8] border-[#2d2a26]' },
    { id: 'sunset', name: 'Crimson Dusk (Warm Rose Light)', className: 'bg-[#fff1f2] border-[#2d2a26]' },
    { id: 'emerald', name: 'Forest Glow (Mint Green Light)', className: 'bg-[#ecfdf5] border-[#2d2a26]' },
    { id: 'cyberpunk', name: 'Cyber Lavender (Violet Light)', className: 'bg-[#f5f3ff] border-[#2d2a26]' },
  ];

  return (
    <div className={`flex h-full font-mono select-none overflow-hidden ${
      isDark ? 'bg-[#18181b] text-slate-100' : 'bg-[#fdfbf7] text-[#2d2a26]'
    }`}>
      {/* Settings Navigation Sidebar with Binder line */}
      <div className={`w-56 border-r-2 border-[#2d2a26] p-4 hidden sm:flex flex-col gap-2.5 text-xs shrink-0 shadow-[4px_0px_0px_0px_#2d2a26] ${
        isDark ? 'bg-zinc-950/90' : 'bg-[#fcf9f2]'
      }`}>
        <div className="flex items-center gap-2.5 px-3 py-2 mb-3 border-b-2 border-[#2d2a26]">
          <span>✏</span>
          <DoodleSettingsSVG />
          <span className={`font-extrabold uppercase tracking-wider text-xs ${isDark ? 'text-[#fef08a]' : 'text-amber-900'}`}>Settings</span>
        </div>

        <button
          onClick={() => setActiveTab('personalization')}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full border-2 border-[#2d2a26] text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'personalization' 
              ? 'bg-[#fef08a] text-[#2d2a26] shadow-[2px_2px_0px_0px_#2d2a26]' 
              : isDark ? 'bg-zinc-900/80 text-slate-300 hover:bg-zinc-800' : 'bg-[#fffdfa] text-[#2d2a26] hover:bg-[#f5efe2]'
          }`}
        >
          <Paintbrush className="w-4 h-4 text-pink-500" />
          <span>Personalization</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full border-2 border-[#2d2a26] text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'system' 
              ? 'bg-[#fef08a] text-[#2d2a26] shadow-[2px_2px_0px_0px_#2d2a26]' 
              : isDark ? 'bg-zinc-900/80 text-slate-300 hover:bg-zinc-800' : 'bg-[#fffdfa] text-[#2d2a26] hover:bg-[#f5efe2]'
          }`}
        >
          <DoodleMonitorSVG />
          <span>System</span>
        </button>

        <button
          onClick={() => setActiveTab('accounts')}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full border-2 border-[#2d2a26] text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'accounts' 
              ? 'bg-[#fef08a] text-[#2d2a26] shadow-[2px_2px_0px_0px_#2d2a26]' 
              : isDark ? 'bg-zinc-900/80 text-slate-300 hover:bg-zinc-800' : 'bg-[#fffdfa] text-[#2d2a26] hover:bg-[#f5efe2]'
          }`}
        >
          <User className="w-4 h-4 text-emerald-500" />
          <span>Accounts</span>
        </button>

        <button
          onClick={() => setActiveTab('update')}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full border-2 border-[#2d2a26] text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'update' 
              ? 'bg-[#fef08a] text-[#2d2a26] shadow-[2px_2px_0px_0px_#2d2a26]' 
              : isDark ? 'bg-zinc-900/80 text-slate-300 hover:bg-zinc-800' : 'bg-[#fffdfa] text-[#2d2a26] hover:bg-[#f5efe2]'
          }`}
        >
          <RefreshCw className="w-4 h-4 text-sky-500" />
          <span>System Update</span>
        </button>
      </div>

      {/* Settings Right Side Content Panel */}
      <div className={`flex-1 p-6 overflow-y-auto flex flex-col gap-6 ${
        isDark ? 'bg-zinc-950/60' : 'bg-[#fdfbf7]'
      }`}>
        
        {/* Personalization Tab */}
        {activeTab === 'personalization' && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#2d2a26]">
              <div>
                <h2 className="text-base font-extrabold uppercase tracking-wider">Personalization</h2>
                <p className={`text-xs mt-1 font-mono ${isDark ? 'text-slate-400' : 'text-zinc-600'}`}>
                  Pilih mode tema tampilan dan latar belakang kertas sketsa.
                </p>
              </div>

              <span className="bg-[#fef08a] text-[#2d2a26] border-2 border-[#2d2a26] shadow-[2px_2px_0px_0px_#2d2a26] font-bold rounded-full px-3 py-1 text-xs">
                ✦ Mode Tema & Wallpaper
              </span>
            </div>

            {/* Theme Mode Card */}
            <div className={`p-5 rounded-2xl border-[2.5px] border-[#2d2a26] shadow-[4px_4px_0px_0px_#2d2a26] flex flex-col gap-3 ${
              isDark ? 'bg-zinc-900/90 text-slate-100' : 'bg-[#fcf9f2] text-[#2d2a26]'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-sm font-extrabold uppercase tracking-wider ${isDark ? 'text-[#fef08a]' : 'text-amber-900'}`}>
                    Mode Tema OS
                  </h3>
                  <p className={`text-xs font-mono mt-0.5 ${isDark ? 'text-slate-300' : 'text-zinc-600'}`}>
                    Pilih tampilan Mode Terang (Light Mode) atau Mode Gelap (Dark Mode).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  onClick={() => setThemeMode('light')}
                  className={`p-3.5 rounded-xl border-2 border-[#2d2a26] flex items-center justify-center gap-2 font-extrabold text-xs transition cursor-pointer ${
                    themeMode === 'light'
                      ? 'bg-[#fef08a] text-[#2d2a26] shadow-[3px_3px_0px_0px_#2d2a26]'
                      : isDark ? 'bg-zinc-800 text-slate-300 hover:bg-zinc-700' : 'bg-[#fffdfa] text-[#2d2a26] hover:bg-[#f5efe2]'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-600" />
                  <span>☀️ Mode Terang (Light)</span>
                </button>

                <button
                  onClick={() => setThemeMode('dark')}
                  className={`p-3.5 rounded-xl border-2 border-[#2d2a26] flex items-center justify-center gap-2 font-extrabold text-xs transition cursor-pointer ${
                    themeMode === 'dark'
                      ? 'bg-[#fef08a] text-[#2d2a26] shadow-[3px_3px_0px_0px_#2d2a26]'
                      : isDark ? 'bg-zinc-800 text-slate-300 hover:bg-zinc-700' : 'bg-[#fffdfa] text-[#2d2a26] hover:bg-[#f5efe2]'
                  }`}
                >
                  <Moon className="w-4 h-4 text-sky-600" />
                  <span>🌙 Mode Gelap (Dark)</span>
                </button>
              </div>
            </div>

            {/* Wallpaper Selection */}
            <div>
              <h3 className={`text-xs font-extrabold uppercase mb-3 ${isDark ? 'text-amber-300' : 'text-amber-900'}`}>
                Pilihan Wallpaper Kertas Sketsa:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {wallpapers.map((wp) => (
                  <button
                    key={wp.id}
                    onClick={() => setWallpaper(wp.id)}
                    className={`
                      group relative flex flex-col p-4 rounded-2xl border-[2.5px] border-[#2d2a26] text-left transition-all cursor-pointer font-mono shadow-[4px_4px_0px_0px_#2d2a26]
                      ${wallpaper === wp.id 
                        ? 'bg-[#fef08a] text-[#2d2a26]' 
                        : isDark ? 'bg-zinc-900/90 text-slate-200 hover:bg-zinc-800' : 'bg-[#fcf9f2] text-[#2d2a26] hover:bg-[#f5efe2]'
                      }
                    `}
                  >
                    <div className={`w-full h-24 rounded-xl ${wp.className} border-2 border-[#2d2a26] mb-3 transition-transform group-hover:scale-[1.01]`} />
                    <span className="text-xs font-extrabold">{wp.name}</span>
                    {wallpaper === wp.id && (
                      <span className="absolute top-6 right-6 bg-[#2d2a26] text-[#fef08a] border-2 border-[#2d2a26] font-bold rounded-full px-2.5 py-0.5 text-[10px]">
                        ✏ Active Doodle
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* System Info Tab */}
        {activeTab === 'system' && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#2d2a26]">
              <div>
                <h2 className="text-base font-extrabold uppercase tracking-wider">System Information</h2>
                <p className={`text-xs mt-1 font-mono ${isDark ? 'text-slate-400' : 'text-zinc-600'}`}>Spesifikasi Perangkat & Performa AuraOS</p>
              </div>

              <span className="bg-[#fef08a] text-[#2d2a26] border-2 border-[#2d2a26] shadow-[2px_2px_0px_0px_#2d2a26] font-bold rounded-full px-3 py-1 text-xs">
                ✦ Windows 11 Doodle
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`p-5 rounded-2xl border-[2.5px] border-[#2d2a26] shadow-[4px_4px_0px_0px_#2d2a26] flex items-start gap-4 ${
                isDark ? 'bg-zinc-900/90 text-slate-100' : 'bg-[#fcf9f2] text-[#2d2a26]'
              }`}>
                <Cpu className="w-6 h-6 text-indigo-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-extrabold uppercase">Processor</h4>
                    <span className="bg-[#fef08a] text-[#2d2a26] border border-[#2d2a26] text-[9px] px-2 py-0.5 rounded-full font-bold">12-Cores</span>
                  </div>
                  <p className={`text-xs mt-2 font-mono ${isDark ? 'text-slate-400' : 'text-zinc-600'}`}>Virtual AMD Ryzen 9 7900X (Next.js Engine)</p>
                </div>
              </div>

              <div className={`p-5 rounded-2xl border-[2.5px] border-[#2d2a26] shadow-[4px_4px_0px_0px_#2d2a26] flex items-start gap-4 ${
                isDark ? 'bg-zinc-900/90 text-slate-100' : 'bg-[#fcf9f2] text-[#2d2a26]'
              }`}>
                <HardDrive className="w-6 h-6 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-extrabold uppercase">System Info</h4>
                    <span className="bg-[#fef08a] text-[#2d2a26] border border-[#2d2a26] text-[9px] px-2 py-0.5 rounded-full font-bold">Core</span>
                  </div>
                  <p className={`text-xs mt-2 font-mono ${isDark ? 'text-slate-400' : 'text-zinc-600'}`}>Next.js 16.x App Router | React 19.x | Zustand Store</p>
                </div>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border-[2.5px] border-[#2d2a26] shadow-[4px_4px_0px_0px_#2d2a26] text-xs leading-relaxed font-mono flex flex-col gap-3 ${
              isDark ? 'bg-zinc-900/90 text-slate-300' : 'bg-[#fcf9f2] text-[#2d2a26]'
            }`}>
              <div className="flex justify-between py-2 border-b-2 border-[#2d2a26]">
                <span className={isDark ? 'text-slate-400' : 'text-zinc-600'}>Device Name</span>
                <span className="font-extrabold text-[#fef08a]">DESKTOP-PORTFOLIO</span>
              </div>
              <div className="flex justify-between py-2 border-b-2 border-[#2d2a26]">
                <span className={isDark ? 'text-slate-400' : 'text-zinc-600'}>Developer Profile</span>
                <span className="font-bold">{profile.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b-2 border-[#2d2a26]">
                <span className={isDark ? 'text-slate-400' : 'text-zinc-600'}>Current Role</span>
                <span className="font-bold">{profile.title}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className={isDark ? 'text-slate-400' : 'text-zinc-600'}>Current Location</span>
                <span className="font-bold">{profile.location}</span>
              </div>
            </div>
          </div>
        )}

        {/* Accounts Tab */}
        {activeTab === 'accounts' && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#2d2a26]">
              <div>
                <h2 className="text-base font-extrabold uppercase tracking-wider">Developer Account</h2>
                <p className={`text-xs mt-1 font-mono ${isDark ? 'text-slate-400' : 'text-zinc-600'}`}>Akun Pengembang Administrator</p>
              </div>
              <span className="bg-[#fef08a] text-[#2d2a26] border-2 border-[#2d2a26] shadow-[2px_2px_0px_0px_#2d2a26] font-bold rounded-full px-3 py-1 text-xs">
                ✦ Administrator
              </span>
            </div>

            <div className={`p-5 rounded-2xl border-[2.5px] border-[#2d2a26] shadow-[4px_4px_0px_0px_#2d2a26] flex items-center gap-4 ${
              isDark ? 'bg-zinc-900/90 text-slate-100' : 'bg-[#fcf9f2] text-[#2d2a26]'
            }`}>
              <div className="w-14 h-14 rounded-full bg-[#fef08a] border-2 border-[#2d2a26] flex items-center justify-center text-[#2d2a26] font-extrabold text-xl shadow-[2px_2px_0px_0px_#2d2a26]">
                {profile.name ? profile.name.charAt(0) : 'A'}
              </div>
              <div>
                <h3 className="font-extrabold text-sm">{profile.name}</h3>
                <p className={`text-xs font-mono mt-0.5 ${isDark ? 'text-slate-400' : 'text-zinc-600'}`}>{profile.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="bg-[#fef08a] text-[#2d2a26] border border-[#2d2a26] text-[9.5px] px-2 py-0.5 rounded-full font-bold">
                    Developer & Owner
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Update Tab */}
        {activeTab === 'update' && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#2d2a26]">
              <div>
                <h2 className="text-base font-extrabold uppercase tracking-wider">System Update</h2>
                <p className={`text-xs mt-1 font-mono ${isDark ? 'text-slate-400' : 'text-zinc-600'}`}>Status Pembaruan AuraOS</p>
              </div>
              <span className="bg-[#fef08a] text-[#2d2a26] border-2 border-[#2d2a26] shadow-[2px_2px_0px_0px_#2d2a26] font-bold rounded-full px-3 py-1 text-xs">
                ✦ Version 2.5.0
              </span>
            </div>

            <div className={`p-5 rounded-2xl border-[2.5px] border-[#2d2a26] shadow-[4px_4px_0px_0px_#2d2a26] flex items-center gap-4 ${
              isDark ? 'bg-zinc-900/90 text-slate-100' : 'bg-[#fcf9f2] text-[#2d2a26]'
            }`}>
              <CheckCircle2 className="w-8 h-8 text-emerald-500 flex-shrink-0" />
              <div>
                <h3 className="font-extrabold text-sm">Sistem Anda Sudah Terbarui</h3>
                <p className={`text-xs font-mono mt-1 ${isDark ? 'text-slate-400' : 'text-zinc-600'}`}>
                  Terakhir diperiksa: Hari ini • AuraOS Handcrafted Doodle Edition
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
