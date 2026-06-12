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
    setStarkSpeech
  } = useOSStore();
  const { isSpawned, spawnFern, spawnStark, scale, speed, speechVolume } = frierenConfig;

  // Automatically spawn Frieren, Fern, and Stark when the control app window is opened
  useEffect(() => {
    updateFrierenConfig({ isSpawned: true, spawnFern: true, spawnStark: true });
  }, [updateFrierenConfig]);

  return (
    <div className="p-5 flex flex-col md:flex-row gap-6 bg-zinc-950/60 text-slate-100 select-none h-full overflow-y-auto">
      {/* Controls Column */}
      <div className="flex-1 flex flex-col gap-5">
        <div className="flex items-center gap-2 mb-2">
          <Gamepad2 className="w-5 h-5 text-rose-400 animate-pulse" />
          <h2 className="text-base font-bold text-slate-100">Frieren.exe Control Panel</h2>
        </div>

        {/* Toggle Spawn */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
          <div>
            <h4 className="text-xs font-semibold text-slate-200">Spawn Frieren</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Toggle playable Frieren on the desktop</p>
          </div>
          <button
            onClick={() => updateFrierenConfig({ isSpawned: !isSpawned })}
            className={`
              px-4 py-1.5 rounded-md text-xs font-bold transition cursor-default
              ${isSpawned 
                ? 'bg-rose-600 hover:bg-rose-500 text-white' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }
            `}
          >
            {isSpawned ? 'Despawn' : 'Spawn'}
          </button>
        </div>

        {/* Toggle Fern Spawn */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
          <div>
            <h4 className="text-xs font-semibold text-slate-200">Spawn Fern (NPC)</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Toggle autonomous Fern on the desktop</p>
          </div>
          <button
            onClick={() => updateFrierenConfig({ spawnFern: !spawnFern })}
            className={`
              px-4 py-1.5 rounded-md text-xs font-bold transition cursor-default
              ${spawnFern 
                ? 'bg-rose-600 hover:bg-rose-500 text-white' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }
            `}
          >
            {spawnFern ? 'Despawn' : 'Spawn'}
          </button>
        </div>

        {/* Toggle Stark Spawn */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
          <div>
            <h4 className="text-xs font-semibold text-slate-200">Spawn Stark (NPC)</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Toggle autonomous Stark on the desktop</p>
          </div>
          <button
            onClick={() => updateFrierenConfig({ spawnStark: !spawnStark })}
            className={`
              px-4 py-1.5 rounded-md text-xs font-bold transition cursor-default
              ${spawnStark 
                ? 'bg-rose-600 hover:bg-rose-500 text-white' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }
            `}
          >
            {spawnStark ? 'Despawn' : 'Spawn'}
          </button>
        </div>

        {/* Size Slider */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-200">Character Size</span>
            <span className="text-xs text-rose-400 font-bold">{scale}px</span>
          </div>
          <input
            type="range"
            min="48"
            max="128"
            step="8"
            value={scale}
            onChange={(e) => updateFrierenConfig({ scale: parseInt(e.target.value) })}
            className="w-full accent-rose-500 cursor-pointer bg-zinc-800 h-1 rounded-lg outline-none"
          />
          <div className="flex justify-between text-[9px] text-slate-500 mt-1">
            <span>48px</span>
            <span>Default (64px)</span>
            <span>128px</span>
          </div>
        </div>

        {/* Speed Slider */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-200">Walking Speed</span>
            <span className="text-xs text-rose-400 font-bold">{speed} px/frame</span>
          </div>
          <input
            type="range"
            min="2"
            max="12"
            step="1"
            value={speed}
            onChange={(e) => updateFrierenConfig({ speed: parseInt(e.target.value) })}
            className="w-full accent-rose-500 cursor-pointer bg-zinc-800 h-1 rounded-lg outline-none"
          />
          <div className="flex justify-between text-[9px] text-slate-500 mt-1">
            <span>Slow (2)</span>
            <span>Normal (5)</span>
            <span>Fast (12)</span>
          </div>
        </div>

        {/* Text Scroll Volume Slider */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-200">Text Scroll Volume</span>
            <span className="text-xs text-rose-400 font-bold">{Math.round(speechVolume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={speechVolume}
            onChange={(e) => updateFrierenConfig({ speechVolume: parseFloat(e.target.value) })}
            className="w-full accent-rose-500 cursor-pointer bg-zinc-800 h-1 rounded-lg outline-none"
          />
          <div className="flex justify-between text-[9px] text-slate-500 mt-1">
            <span>Mute (0%)</span>
            <span>Default (50%)</span>
            <span>Max (100%)</span>
          </div>
        </div>

        {/* Conversation Memory */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-3">
          <div>
            <h4 className="text-xs font-semibold text-slate-200">NPC Conversation Memory</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Clears the saved chat history from localStorage</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('frieren_fern_chat_history');
                  setFrierenSpeech(null);
                  setFernSpeech(null);
                }
              }}
              className="flex-1 py-2 rounded-md text-[10px] font-bold bg-rose-950/45 hover:bg-rose-900/60 border border-rose-500/35 hover:border-rose-500/60 text-rose-200 transition cursor-default text-center"
            >
              Clear Fern Memory
            </button>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('frieren_stark_chat_history');
                  setFrierenSpeech(null);
                  setStarkSpeech(null);
                }
              }}
              className="flex-1 py-2 rounded-md text-[10px] font-bold bg-rose-950/45 hover:bg-rose-900/60 border border-rose-500/35 hover:border-rose-500/60 text-rose-200 transition cursor-default text-center"
            >
              Clear Stark Memory
            </button>
          </div>
        </div>
      </div>

      {/* Instructions Column */}
      <div className="w-full md:w-60 flex flex-col gap-4">
        <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-3">
          <h3 className="text-xs font-bold text-slate-200">Movement Controls</h3>
          
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="flex items-center gap-1.5 bg-white/5 p-1.5 rounded">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-slate-300">W</kbd>
              <kbd className="px-1 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-slate-300"><ArrowUp className="w-2.5 h-2.5" /></kbd>
              <span className="text-slate-400 ml-1">Up</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 p-1.5 rounded">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-slate-300">S</kbd>
              <kbd className="px-1 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-slate-300"><ArrowDown className="w-2.5 h-2.5" /></kbd>
              <span className="text-slate-400 ml-1">Down</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 p-1.5 rounded">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-slate-300">A</kbd>
              <kbd className="px-1 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-slate-300"><ArrowLeft className="w-2.5 h-2.5" /></kbd>
              <span className="text-slate-400 ml-1">Left</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 p-1.5 rounded">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-slate-300">D</kbd>
              <kbd className="px-1 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-slate-300"><ArrowRight className="w-2.5 h-2.5" /></kbd>
              <span className="text-slate-400 ml-1">Right</span>
            </div>
          </div>

          <div className="flex gap-2 items-start mt-2 border-t border-white/5 pt-2 text-[10px] text-slate-400 leading-normal">
            <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
            <span>Frieren moves globally via WASD/Arrows. Fern wanders autonomously as an NPC. Control is paused while typing in terminal or notepad.</span>
          </div>
        </div>

        {/* Feature info */}
        <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/35 text-[10px] text-rose-300 leading-normal flex gap-2">
          <span>🧹</span>
          <span>We've automatically chroma-keyed out the solid gray background of the sprite sheet using Canvas in real-time, giving you a transparent pixel-art pet!</span>
        </div>
      </div>
    </div>
  );
}
