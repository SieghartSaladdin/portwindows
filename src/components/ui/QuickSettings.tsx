'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wifi, 
  WifiOff, 
  Bluetooth, 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon, 
  Battery, 
  Lock, 
  Settings, 
  Sliders, 
  Zap, 
  MoonStar,
  Plane
} from 'lucide-react';
import { useOSStore } from '@/lib/store';

export function QuickSettings() {
  const { 
    isQuickSettingsOpen, 
    closeQuickSettings, 
    lockScreen, 
    wallpaper, 
    setWallpaper 
  } = useOSStore();

  // Local state for Quick Settings toggles
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(true);
  const [airplaneMode, setAirplaneMode] = useState(false);
  const [batterySaver, setBatterySaver] = useState(false);
  const [nightLight, setNightLight] = useState(false);
  
  const [volume, setVolume] = useState(70);
  const [prevVolume, setPrevVolume] = useState(70);
  const [brightness, setBrightness] = useState(80);

  if (!isQuickSettingsOpen) return null;

  const toggleMute = () => {
    if (volume > 0) {
      setPrevVolume(volume);
      setVolume(0);
    } else {
      setVolume(prevVolume || 70);
    }
  };

  const handleWallpaperCycle = () => {
    const wallpapers = ['default', 'sunset', 'emerald', 'cyberpunk'];
    const currentIndex = wallpapers.indexOf(wallpaper);
    const nextIndex = (currentIndex + 1) % wallpapers.length;
    setWallpaper(wallpapers[nextIndex]);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="fixed bottom-14 right-3 w-[360px] rounded-xl border border-white/10 win-mica-dark p-4 shadow-2xl z-50 text-slate-200 select-none"
      >
        {/* Toggle Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {/* Wifi */}
          <button
            onClick={() => setWifi(!wifi)}
            className={`flex flex-col items-center justify-between p-3 rounded-lg border transition-all ${
              wifi 
                ? 'bg-sky-500 border-sky-400/30 text-white shadow-lg shadow-sky-500/20' 
                : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
            }`}
          >
            {wifi ? <Wifi className="w-5 h-5 mb-2" /> : <WifiOff className="w-5 h-5 mb-2" />}
            <span className="text-[10px] font-medium truncate max-w-full">
              {wifi ? 'Connected' : 'Disconnected'}
            </span>
            <span className="text-[8px] opacity-70 truncate max-w-full">Wi-Fi</span>
          </button>

          {/* Bluetooth */}
          <button
            onClick={() => setBluetooth(!bluetooth)}
            className={`flex flex-col items-center justify-between p-3 rounded-lg border transition-all ${
              bluetooth 
                ? 'bg-sky-500 border-sky-400/30 text-white shadow-lg shadow-sky-500/20' 
                : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
            }`}
          >
            <Bluetooth className="w-5 h-5 mb-2" />
            <span className="text-[10px] font-medium truncate max-w-full">
              {bluetooth ? 'On' : 'Off'}
            </span>
            <span className="text-[8px] opacity-70 truncate max-w-full">Bluetooth</span>
          </button>

          {/* Airplane Mode */}
          <button
            onClick={() => {
              setAirplaneMode(!airplaneMode);
              if (!airplaneMode) {
                setWifi(false);
                setBluetooth(false);
              } else {
                setWifi(true);
                setBluetooth(true);
              }
            }}
            className={`flex flex-col items-center justify-between p-3 rounded-lg border transition-all ${
              airplaneMode 
                ? 'bg-sky-500 border-sky-400/30 text-white shadow-lg shadow-sky-500/20' 
                : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
            }`}
          >
            <Plane className="w-5 h-5 mb-2" />
            <span className="text-[10px] font-medium truncate max-w-full">
              {airplaneMode ? 'On' : 'Off'}
            </span>
            <span className="text-[8px] opacity-70 truncate max-w-full">Airplane</span>
          </button>

          {/* Battery Saver */}
          <button
            onClick={() => setBatterySaver(!batterySaver)}
            className={`flex flex-col items-center justify-between p-3 rounded-lg border transition-all ${
              batterySaver 
                ? 'bg-sky-500 border-sky-400/30 text-white shadow-lg shadow-sky-500/20' 
                : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
            }`}
          >
            <Zap className="w-5 h-5 mb-2" />
            <span className="text-[10px] font-medium truncate max-w-full">
              {batterySaver ? 'On' : 'Off'}
            </span>
            <span className="text-[8px] opacity-70 truncate max-w-full">Saver</span>
          </button>

          {/* Night Light */}
          <button
            onClick={() => setNightLight(!nightLight)}
            className={`flex flex-col items-center justify-between p-3 rounded-lg border transition-all ${
              nightLight 
                ? 'bg-sky-500 border-sky-400/30 text-white shadow-lg shadow-sky-500/20' 
                : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
            }`}
          >
            <MoonStar className="w-5 h-5 mb-2" />
            <span className="text-[10px] font-medium truncate max-w-full">
              {nightLight ? 'On' : 'Off'}
            </span>
            <span className="text-[8px] opacity-70 truncate max-w-full">Night Light</span>
          </button>

          {/* Theme Toggle (Wallpaper cycle) */}
          <button
            onClick={handleWallpaperCycle}
            className="flex flex-col items-center justify-between p-3 rounded-lg border bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:text-slate-200 transition-all"
          >
            <Sliders className="w-5 h-5 mb-2 text-indigo-400" />
            <span className="text-[10px] font-medium truncate max-w-full capitalize">
              {wallpaper}
            </span>
            <span className="text-[8px] opacity-70 truncate max-w-full">Theme</span>
          </button>
        </div>

        {/* Sliders Container */}
        <div className="flex flex-col gap-4 py-2 border-t border-white/5">
          {/* Volume Slider */}
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleMute}
              className="text-slate-400 hover:text-white transition-colors"
            >
              {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <div className="flex-1 flex items-center">
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full h-[4px] rounded-lg appearance-none cursor-pointer bg-white/10 accent-sky-500 focus:outline-none"
              />
            </div>
            <span className="text-xs font-mono w-7 text-right">{volume}</span>
          </div>

          {/* Brightness Slider */}
          <div className="flex items-center gap-3">
            <span className="text-slate-400">
              <Sun className="w-5 h-5" />
            </span>
            <div className="flex-1 flex items-center">
              <input
                type="range"
                min="10"
                max="100"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full h-[4px] rounded-lg appearance-none cursor-pointer bg-white/10 accent-sky-500 focus:outline-none"
              />
            </div>
            <span className="text-xs font-mono w-7 text-right">{brightness}</span>
          </div>
        </div>

        {/* Bottom Utility Bar */}
        <div className="flex items-center justify-between pt-3 mt-2 border-t border-white/5 text-slate-400">
          {/* Battery Status */}
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <Battery className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">82%</span>
            <span className="text-[10px] opacity-75">Remaining</span>
          </div>

          {/* Quick Settings Action Buttons */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                closeQuickSettings();
                lockScreen();
              }}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-xs"
              title="Lock Screen"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock</span>
            </button>
            
            <div className="w-[1px] h-4 bg-white/10" />

            <button 
              onClick={closeQuickSettings}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              title="Quick Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
