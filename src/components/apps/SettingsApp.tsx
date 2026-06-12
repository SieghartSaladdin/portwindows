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
  ShieldAlert,
  Smile
} from 'lucide-react';
import { useOSStore } from '@/lib/store';
import { PROFILE } from '@/lib/data';

type ActiveTab = 'system' | 'personalization' | 'accounts' | 'update';

export function SettingsApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('system');
  const { wallpaper, setWallpaper } = useOSStore();

  const wallpapers = [
    { id: 'default', name: 'Windows 11 Light (Blue)', className: 'bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 border-indigo-400/50' },
    { id: 'sunset', name: 'Crimson Dusk (Warm Rose)', className: 'bg-gradient-to-tr from-zinc-950 via-neutral-900 to-rose-950 border-rose-400/50' },
    { id: 'emerald', name: 'Forest Glow (Deep Green)', className: 'bg-gradient-to-tr from-stone-950 via-zinc-900 to-emerald-950 border-emerald-400/50' },
    { id: 'cyberpunk', name: 'Cyber Neon (Vibrant Fuchsia)', className: 'bg-gradient-to-tr from-slate-950 via-slate-900 to-fuchsia-950 border-fuchsia-400/50' },
  ];

  return (
    <div className="flex h-full bg-zinc-950/40 text-slate-100 select-none">
      {/* Settings Navigation Sidebar */}
      <div className="w-48 bg-black/20 border-r border-white/5 p-2 hidden sm:flex flex-col gap-1 text-xs">
        <div className="flex items-center gap-2 px-3 py-2 mb-4">
          <Settings className="w-4.5 h-4.5 text-blue-400 animate-spin-slow" />
          <span className="font-semibold text-slate-200">Settings</span>
        </div>

        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-left transition ${
            activeTab === 'system' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
          }`}
        >
          <Monitor className="w-4 h-4 text-blue-400" />
          <span>System</span>
        </button>

        <button
          onClick={() => setActiveTab('personalization')}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-left transition ${
            activeTab === 'personalization' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
          }`}
        >
          <Paintbrush className="w-4 h-4 text-pink-400" />
          <span>Personalization</span>
        </button>

        <button
          onClick={() => setActiveTab('accounts')}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-left transition ${
            activeTab === 'accounts' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
          }`}
        >
          <User className="w-4 h-4 text-emerald-400" />
          <span>Accounts</span>
        </button>

        <button
          onClick={() => setActiveTab('update')}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-left transition ${
            activeTab === 'update' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
          }`}
        >
          <RefreshCw className="w-4 h-4 text-sky-400" />
          <span>Windows Update</span>
        </button>
      </div>

      {/* Settings Right Side Content Panel */}
      <div className="flex-1 p-6 overflow-y-auto bg-black/10">
        {/* System Info Tab */}
        {activeTab === 'system' && (
          <div>
            <h2 className="text-lg font-bold text-slate-100 mb-4">System Specifications</h2>
            
            {/* Spec Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-start gap-3">
                <Cpu className="w-5 h-5 text-indigo-400 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-300">Processor</h4>
                  <p className="text-xs text-slate-400 mt-1">Virtual AMD Ryzen 9 7900X (Next.js Virtualization)</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-start gap-3">
                <HardDrive className="w-5 h-5 text-amber-400 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-300">System Information</h4>
                  <p className="text-xs text-slate-400 mt-1">Next.js 16.x App Router | React 19.x | Zustand Store</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300 leading-relaxed">
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Device Name</span>
                <span>DESKTOP-PORTFOLIO</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Developer Profile</span>
                <span>{PROFILE.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Current Role</span>
                <span>{PROFILE.title}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Current Location</span>
                <span>{PROFILE.location}</span>
              </div>
            </div>
          </div>
        )}

        {/* Personalization Tab (Wallpaper Changer) */}
        {activeTab === 'personalization' && (
          <div>
            <h2 className="text-lg font-bold text-slate-100 mb-2">Personalization</h2>
            <p className="text-xs text-slate-400 mb-6">Select a desktop background style for your virtual workspace.</p>

            <div className="grid grid-cols-2 gap-4">
              {wallpapers.map((wp) => (
                <button
                  key={wp.id}
                  onClick={() => setWallpaper(wp.id)}
                  className={`
                    group relative flex flex-col p-2.5 rounded-xl border bg-black/20 text-left transition cursor-default
                    ${wallpaper === wp.id ? 'border-win-accent-light bg-win-accent/5' : 'border-white/5 hover:bg-white/5'}
                  `}
                >
                  <div className={`w-full h-20 rounded-lg ${wp.className} border mb-2 transition-transform group-hover:scale-[1.01]`} />
                  <span className="text-xs font-medium text-slate-200">{wp.name}</span>
                  {wallpaper === wp.id && (
                    <span className="absolute top-4 right-4 bg-win-accent text-[9px] font-bold text-white px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Accounts Tab */}
        {activeTab === 'accounts' && (
          <div>
            <h2 className="text-lg font-bold text-slate-100 mb-6">Accounts</h2>
            
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 mb-6">
              <div className="w-14 h-14 bg-win-accent rounded-full flex items-center justify-center text-white text-xl font-bold ring-2 ring-white/10">
                {PROFILE.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-sm">{PROFILE.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{PROFILE.email}</p>
                <span className="inline-block mt-2 px-2 py-0.5 bg-win-accent/20 border border-win-accent-light/35 text-slate-300 rounded text-[10px] font-medium">
                  Administrator
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-400 flex items-center gap-3">
              <Smile className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>You are signed in as a local admin guest. Explore other desktop directories or launch applications!</span>
            </div>
          </div>
        )}

        {/* Windows Update Tab */}
        {activeTab === 'update' && (
          <div>
            <h2 className="text-lg font-bold text-slate-100 mb-4">Windows Update</h2>
            
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center gap-4 mb-6">
              <div>
                <h3 className="font-bold text-slate-100 text-xs">You're up to date</h3>
                <p className="text-xs text-slate-400 mt-1">Last checked: Today, {new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p>
              </div>
              <button 
                onClick={() => alert('All system services are operating normally!')}
                className="px-3.5 py-1.5 bg-win-accent hover:bg-win-accent/80 text-white rounded text-xs transition cursor-default font-semibold shadow-md"
              >
                Check for updates
              </button>
            </div>

            <div className="p-4 rounded-xl border border-white/5 bg-white/5 text-xs flex gap-3 text-slate-400 leading-relaxed">
              <ShieldAlert className="w-5 h-5 text-sky-400 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-slate-300">Simulated Build Details</h4>
                <p className="mt-1">Version: Windows 11 Pro 24H2</p>
                <p>Experience: Windows Feature Experience Pack 1000.22621.1000.0</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
