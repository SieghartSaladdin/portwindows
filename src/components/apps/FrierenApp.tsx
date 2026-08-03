'use client';

import React, { useEffect } from 'react';
import { useOSStore } from '@/lib/store';
import { Gamepad2, Info, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

export function FrierenApp() {
  const { 
    frierenConfig, 
    updateFrierenConfig, 
    setFrierenSpeech, 
    setFernSpeech,
    setStarkSpeech,
    themeMode
  } = useOSStore();
  const { isSpawned, spawnFern, spawnStark, scale, speed, speechVolume } = frierenConfig;
  const isDark = themeMode === 'dark';

  // Automatically spawn Frieren, Fern, and Stark when the control app window is opened
  useEffect(() => {
    updateFrierenConfig({ isSpawned: true, spawnFern: true, spawnStark: true });
  }, [updateFrierenConfig]);

  return (
    <div className={`p-5 flex flex-col md:flex-row gap-6 font-mono select-none h-full overflow-y-auto ${
      isDark ? 'bg-[#18181b] text-slate-100' : 'bg-[#fdfbf7] text-[#2d2a26]'
    }`}>
      {/* Controls Column */}
      <div className="flex-1 flex flex-col gap-5">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b-2 border-[#2d2a26]">
          <span className="text-amber-500">✏</span>
          <Gamepad2 className="w-5 h-5 text-amber-500" />
          <h2 className={`text-base font-extrabold uppercase tracking-wide ${isDark ? 'text-white' : 'text-[#2d2a26]'}`}>Frieren.exe Control Panel</h2>
        </div>

        {/* Toggle Spawn */}
        <div className={`flex items-center justify-between p-3.5 rounded-2xl border-[2.5px] border-[#2d2a26] shadow-[3px_3px_0px_0px_#2d2a26] ${
          isDark ? 'bg-zinc-900/90' : 'bg-[#fcf9f2]'
        }`}>
          <div>
            <h4 className={`text-xs font-extrabold ${isDark ? 'text-slate-100' : 'text-[#2d2a26]'}`}>Spawn Frieren</h4>
            <p className={`text-[10px] font-bold mt-0.5 ${isDark ? 'text-slate-400' : 'text-zinc-600'}`}>Toggle playable Frieren on the desktop</p>
          </div>
          <button
            onClick={() => updateFrierenConfig({ isSpawned: !isSpawned })}
            className={`
              px-4 py-1.5 rounded-full text-xs font-extrabold transition border-2 border-[#2d2a26] cursor-pointer shadow-[2px_2px_0px_0px_#2d2a26]
              ${isSpawned 
                ? 'bg-rose-400 hover:bg-rose-500 text-[#2d2a26]' 
                : 'bg-[#fef08a] hover:bg-yellow-300 text-[#2d2a26]'
              }
            `}
          >
            {isSpawned ? 'Despawn' : 'Spawn'}
          </button>
        </div>

        {/* Toggle Fern Spawn */}
        <div className={`flex items-center justify-between p-3.5 rounded-2xl border-[2.5px] border-[#2d2a26] shadow-[3px_3px_0px_0px_#2d2a26] ${
          isDark ? 'bg-zinc-900/90' : 'bg-[#fcf9f2]'
        }`}>
          <div>
            <h4 className={`text-xs font-extrabold ${isDark ? 'text-slate-100' : 'text-[#2d2a26]'}`}>Spawn Fern (NPC)</h4>
            <p className={`text-[10px] font-bold mt-0.5 ${isDark ? 'text-slate-400' : 'text-zinc-600'}`}>Toggle autonomous Fern on the desktop</p>
          </div>
          <button
            onClick={() => updateFrierenConfig({ spawnFern: !spawnFern })}
            className={`
              px-4 py-1.5 rounded-full text-xs font-extrabold transition border-2 border-[#2d2a26] cursor-pointer shadow-[2px_2px_0px_0px_#2d2a26]
              ${spawnFern 
                ? 'bg-rose-400 hover:bg-rose-500 text-[#2d2a26]' 
                : 'bg-[#fef08a] hover:bg-yellow-300 text-[#2d2a26]'
              }
            `}
          >
            {spawnFern ? 'Despawn' : 'Spawn'}
          </button>
        </div>

        {/* Toggle Stark Spawn */}
        <div className={`flex items-center justify-between p-3.5 rounded-2xl border-[2.5px] border-[#2d2a26] shadow-[3px_3px_0px_0px_#2d2a26] ${
          isDark ? 'bg-zinc-900/90' : 'bg-[#fcf9f2]'
        }`}>
          <div>
            <h4 className={`text-xs font-extrabold ${isDark ? 'text-slate-100' : 'text-[#2d2a26]'}`}>Spawn Stark (NPC)</h4>
            <p className={`text-[10px] font-bold mt-0.5 ${isDark ? 'text-slate-400' : 'text-zinc-600'}`}>Toggle autonomous Stark on the desktop</p>
          </div>
          <button
            onClick={() => updateFrierenConfig({ spawnStark: !spawnStark })}
            className={`
              px-4 py-1.5 rounded-full text-xs font-extrabold transition border-2 border-[#2d2a26] cursor-pointer shadow-[2px_2px_0px_0px_#2d2a26]
              ${spawnStark 
                ? 'bg-rose-400 hover:bg-rose-500 text-[#2d2a26]' 
                : 'bg-[#fef08a] hover:bg-yellow-300 text-[#2d2a26]'
              }
            `}
          >
            {spawnStark ? 'Despawn' : 'Spawn'}
          </button>
        </div>

        {/* Size Slider */}
        <div className={`p-4 rounded-2xl border-[2.5px] border-[#2d2a26] shadow-[3px_3px_0px_0px_#2d2a26] ${
          isDark ? 'bg-zinc-900/90' : 'bg-[#fcf9f2]'
        }`}>
          <div className="flex justify-between items-center mb-2">
            <span className={`text-xs font-extrabold ${isDark ? 'text-slate-100' : 'text-[#2d2a26]'}`}>Character Size</span>
            <span className="text-xs bg-[#fef08a] text-[#2d2a26] border border-[#2d2a26] px-2 py-0.5 rounded-full font-extrabold">{scale}px</span>
          </div>
          <input
            type="range"
            min="48"
            max="128"
            value={scale}
            onChange={(e) => updateFrierenConfig({ scale: Number(e.target.value) })}
            className="w-full accent-[#fef08a] cursor-pointer"
          />
        </div>

        {/* Speed Slider */}
        <div className={`p-4 rounded-2xl border-[2.5px] border-[#2d2a26] shadow-[3px_3px_0px_0px_#2d2a26] ${
          isDark ? 'bg-zinc-900/90' : 'bg-[#fcf9f2]'
        }`}>
          <div className="flex justify-between items-center mb-2">
            <span className={`text-xs font-extrabold ${isDark ? 'text-slate-100' : 'text-[#2d2a26]'}`}>Movement Speed</span>
            <span className="text-xs bg-[#fef08a] text-[#2d2a26] border border-[#2d2a26] px-2 py-0.5 rounded-full font-extrabold">{speed}px/s</span>
          </div>
          <input
            type="range"
            min="100"
            max="500"
            step="20"
            value={speed}
            onChange={(e) => updateFrierenConfig({ speed: Number(e.target.value) })}
            className="w-full accent-[#fef08a] cursor-pointer"
          />
        </div>

        {/* Speech Trigger Buttons */}
        <div className={`p-4 rounded-2xl border-[2.5px] border-[#2d2a26] shadow-[3px_3px_0px_0px_#2d2a26] flex flex-col gap-2.5 ${
          isDark ? 'bg-zinc-900/90' : 'bg-[#fcf9f2]'
        }`}>
          <span className={`text-xs font-extrabold ${isDark ? 'text-slate-100' : 'text-[#2d2a26]'}`}>Interactive Voice Triggers</span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setFrierenSpeech("Aura... I'll analyze this code magic!")}
              className="px-2 py-1.5 bg-[#fef08a] hover:bg-yellow-300 text-[#2d2a26] border-2 border-[#2d2a26] rounded-xl text-xs font-extrabold cursor-pointer shadow-[2px_2px_0px_0px_#2d2a26]"
            >
              Frieren Speak
            </button>
            <button
              onClick={() => setFernSpeech("Frieren-sama, please focus on the portfolio code.")}
              className="px-2 py-1.5 bg-sky-200 hover:bg-sky-300 text-[#2d2a26] border-2 border-[#2d2a26] rounded-xl text-xs font-extrabold cursor-pointer shadow-[2px_2px_0px_0px_#2d2a26]"
            >
              Fern Speak
            </button>
            <button
              onClick={() => setStarkSpeech("I'll defend this desktop app with my axe!")}
              className="px-2 py-1.5 bg-rose-200 hover:bg-rose-300 text-[#2d2a26] border-2 border-[#2d2a26] rounded-xl text-xs font-extrabold cursor-pointer shadow-[2px_2px_0px_0px_#2d2a26]"
            >
              Stark Speak
            </button>
          </div>
        </div>
      </div>

      {/* Manual / Instructions Column */}
      <div className={`w-full md:w-64 p-4 rounded-2xl border-[2.5px] border-[#2d2a26] shadow-[4px_4px_0px_0px_#2d2a26] flex flex-col gap-3 font-mono shrink-0 ${
        isDark ? 'bg-zinc-900/90 text-slate-100' : 'bg-[#fcf9f2] text-[#2d2a26]'
      }`}>
        <div className="flex items-center gap-2 border-b-2 border-[#2d2a26] pb-2">
          <Info className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-extrabold uppercase">Keyboard Controls</span>
        </div>

        <p className={`text-xs font-bold leading-relaxed ${isDark ? 'text-slate-300' : 'text-zinc-700'}`}>
          Controllable Frieren character responds to arrow keys on your keyboard when active:
        </p>

        <div className="flex flex-col gap-2 my-1">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-zinc-600'}`}>Walk Left</span>
            <kbd className="px-2 py-0.5 rounded-lg border-2 border-[#2d2a26] bg-[#fef08a] text-[#2d2a26] text-xs font-extrabold shadow-[2px_2px_0px_0px_#2d2a26]">
              <ArrowLeft className="w-3 h-3 inline" /> Left
            </kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-zinc-600'}`}>Walk Right</span>
            <kbd className="px-2 py-0.5 rounded-lg border-2 border-[#2d2a26] bg-[#fef08a] text-[#2d2a26] text-xs font-extrabold shadow-[2px_2px_0px_0px_#2d2a26]">
              <ArrowRight className="w-3 h-3 inline" /> Right
            </kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-zinc-600'}`}>Jump / Up</span>
            <kbd className="px-2 py-0.5 rounded-lg border-2 border-[#2d2a26] bg-[#fef08a] text-[#2d2a26] text-xs font-extrabold shadow-[2px_2px_0px_0px_#2d2a26]">
              <ArrowUp className="w-3 h-3 inline" /> Up
            </kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-zinc-600'}`}>Duck / Down</span>
            <kbd className="px-2 py-0.5 rounded-lg border-2 border-[#2d2a26] bg-[#fef08a] text-[#2d2a26] text-xs font-extrabold shadow-[2px_2px_0px_0px_#2d2a26]">
              <ArrowDown className="w-3 h-3 inline" /> Down
            </kbd>
          </div>
        </div>

        <div className={`p-3 rounded-xl border-2 border-[#2d2a26] bg-[#fef08a] text-[#2d2a26] text-[10.5px] font-extrabold leading-relaxed shadow-[2px_2px_0px_0px_#2d2a26]`}>
          ✦ Pet Frieren floats freely across the screen and walks on top of the taskbar floor platform!
        </div>
      </div>
    </div>
  );
}
