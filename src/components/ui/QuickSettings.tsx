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
    setWallpaper,
    themeMode,
    toggleThemeMode,
    openWindow
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

  const isDark = themeMode === 'dark';

  // Tile helper styling for high contrast
  const getTileStyle = (active: boolean, activeBg: string = 'bg-sky-400') => {
    if (active) {
      return `${activeBg} text-[#2d2a26] shadow-[3px_3px_0px_0px_#2d2a26]`;
    }
    return isDark 
      ? 'bg-zinc-900 text-slate-200 hover:bg-zinc-800 shadow-[3px_3px_0px_0px_#2d2a26]' 
      : 'bg-[#fffdfa] text-[#2d2a26] hover:bg-[#fef08a] shadow-[3px_3px_0px_0px_#2d2a26]';
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className={`fixed bottom-14 right-3 w-[360px] rounded-2xl border-[2.5px] border-[#2d2a26] p-4 shadow-[6px_6px_0px_0px_#2d2a26] z-50 font-doodle select-none ${
          isDark ? 'bg-[#262422] text-slate-100' : 'bg-[#fcf9f2] text-[#2d2a26]'
        }`}
      >
        {/* Toggle Grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {/* Theme Mode Toggle Tile */}
          <button
            onClick={toggleThemeMode}
            className={`flex flex-col items-center justify-between p-3 rounded-xl border-2 border-[#2d2a26] transition-all cursor-pointer ${
              themeMode === 'light' 
                ? 'bg-[#fef08a] text-[#2d2a26] shadow-[3px_3px_0px_0px_#2d2a26]' 
                : 'bg-amber-400 text-[#2d2a26] shadow-[3px_3px_0px_0px_#2d2a26]'
            }`}
          >
            {themeMode === 'light' ? <Sun className="w-5 h-5 mb-1.5 text-[#2d2a26]" /> : <Moon className="w-5 h-5 mb-1.5 text-[#2d2a26]" />}
            <span className="text-[10.5px] font-extrabold truncate max-w-full">
              {themeMode === 'light' ? 'Mode Terang' : 'Mode Gelap'}
            </span>
            <span className="text-[8.5px] font-bold uppercase truncate max-w-full opacity-80">Tema OS</span>
          </button>

          {/* Wifi */}
          <button
            onClick={() => setWifi(!wifi)}
            className={`flex flex-col items-center justify-between p-3 rounded-xl border-2 border-[#2d2a26] transition-all cursor-pointer ${getTileStyle(wifi, 'bg-sky-400')}`}
          >
            {wifi ? <Wifi className="w-5 h-5 mb-1.5" /> : <WifiOff className="w-5 h-5 mb-1.5 text-rose-500" />}
            <span className="text-[10.5px] font-extrabold truncate max-w-full">
              {wifi ? 'Terhubung' : 'Mati'}
            </span>
            <span className="text-[8.5px] font-bold uppercase truncate max-w-full opacity-80">Wi-Fi</span>
          </button>

          {/* Bluetooth */}
          <button
            onClick={() => setBluetooth(!bluetooth)}
            className={`flex flex-col items-center justify-between p-3 rounded-xl border-2 border-[#2d2a26] transition-all cursor-pointer ${getTileStyle(bluetooth, 'bg-sky-400')}`}
          >
            <Bluetooth className={`w-5 h-5 mb-1.5 ${bluetooth ? '' : 'text-slate-400'}`} />
            <span className="text-[10.5px] font-extrabold truncate max-w-full">
              {bluetooth ? 'Aktif' : 'Mati'}
            </span>
            <span className="text-[8.5px] font-bold uppercase truncate max-w-full opacity-80">Bluetooth</span>
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
            className={`flex flex-col items-center justify-between p-3 rounded-xl border-2 border-[#2d2a26] transition-all cursor-pointer ${getTileStyle(airplaneMode, 'bg-amber-300')}`}
          >
            <Plane className="w-5 h-5 mb-1.5" />
            <span className="text-[10.5px] font-extrabold truncate max-w-full">
              {airplaneMode ? 'Aktif' : 'Mati'}
            </span>
            <span className="text-[8.5px] font-bold uppercase truncate max-w-full opacity-80">Pesawat</span>
          </button>

          {/* Battery Saver */}
          <button
            onClick={() => setBatterySaver(!batterySaver)}
            className={`flex flex-col items-center justify-between p-3 rounded-xl border-2 border-[#2d2a26] transition-all cursor-pointer ${getTileStyle(batterySaver, 'bg-emerald-400')}`}
          >
            <Zap className="w-5 h-5 mb-1.5" />
            <span className="text-[10.5px] font-extrabold truncate max-w-full">
              {batterySaver ? 'Aktif' : 'Mati'}
            </span>
            <span className="text-[8.5px] font-bold uppercase truncate max-w-full opacity-80">Hemat Daya</span>
          </button>

          {/* Night Light */}
          <button
            onClick={() => setNightLight(!nightLight)}
            className={`flex flex-col items-center justify-between p-3 rounded-xl border-2 border-[#2d2a26] transition-all cursor-pointer ${getTileStyle(nightLight, 'bg-[#fca5a5]')}`}
          >
            <MoonStar className="w-5 h-5 mb-1.5" />
            <span className="text-[10.5px] font-extrabold truncate max-w-full">
              {nightLight ? 'Aktif' : 'Mati'}
            </span>
            <span className="text-[8.5px] font-bold uppercase truncate max-w-full opacity-80">Mode Malam</span>
          </button>

          {/* Theme Toggle (Wallpaper cycle) */}
          <button
            onClick={handleWallpaperCycle}
            className={`col-span-3 flex items-center justify-between px-4 py-2.5 rounded-xl border-2 border-[#2d2a26] transition-all cursor-pointer shadow-[3px_3px_0px_0px_#2d2a26] ${
              isDark ? 'bg-zinc-900 text-slate-100 hover:bg-zinc-800' : 'bg-[#fffdfa] text-[#2d2a26] hover:bg-[#fef08a]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-extrabold">Wallpaper Theme:</span>
            </div>
            <span className="text-xs font-mono font-extrabold uppercase bg-[#fef08a] text-[#2d2a26] px-2.5 py-0.5 rounded-full border border-[#2d2a26]">
              {wallpaper}
            </span>
          </button>
        </div>

        {/* Sliders Container */}
        <div className="flex flex-col gap-3 py-3 border-t-2 border-[#2d2a26]">
          {/* Volume Slider */}
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleMute}
              className={`p-1.5 rounded-lg border border-[#2d2a26] transition cursor-pointer ${isDark ? 'bg-zinc-800 text-slate-200' : 'bg-[#fffdfa] text-[#2d2a26]'}`}
            >
              {volume === 0 ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
            </button>
            <div className="flex-1 flex items-center">
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer border-2 border-[#2d2a26] bg-[#fffdfa] accent-[#2d2a26] focus:outline-none"
              />
            </div>
            <span className="text-xs font-mono font-bold w-7 text-right">{volume}%</span>
          </div>

          {/* Brightness Slider */}
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-lg border border-[#2d2a26] ${isDark ? 'bg-zinc-800 text-amber-300' : 'bg-[#fffdfa] text-amber-600'}`}>
              <Sun className="w-4 h-4" />
            </div>
            <div className="flex-1 flex items-center">
              <input
                type="range"
                min="10"
                max="100"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer border-2 border-[#2d2a26] bg-[#fffdfa] accent-[#2d2a26] focus:outline-none"
              />
            </div>
            <span className="text-xs font-mono font-bold w-7 text-right">{brightness}%</span>
          </div>
        </div>

        {/* Bottom Utility Bar */}
        <div className="flex items-center justify-between pt-3 mt-1 border-t-2 border-[#2d2a26]">
          {/* Battery Status */}
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <Battery className="w-4 h-4 text-emerald-600" />
            <span>82% Remaining</span>
          </div>

          {/* Quick Settings Action Buttons */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                closeQuickSettings();
                lockScreen();
              }}
              className="px-3 py-1 rounded-full border-2 border-[#2d2a26] bg-[#fee2e2] text-rose-900 hover:bg-rose-300 transition-colors flex items-center gap-1 text-xs font-extrabold shadow-[2px_2px_0px_0px_#2d2a26] cursor-pointer"
              title="Lock Screen"
            >
              <Lock className="w-3 h-3" />
              <span>Lock</span>
            </button>
            
            <button 
              onClick={() => {
                closeQuickSettings();
                openWindow('settings', 'Settings');
              }}
              className={`p-1.5 rounded-full border-2 border-[#2d2a26] transition-colors shadow-[2px_2px_0px_0px_#2d2a26] cursor-pointer ${
                isDark ? 'bg-zinc-800 text-slate-200 hover:bg-zinc-700' : 'bg-[#fffdfa] text-[#2d2a26] hover:bg-[#fef08a]'
              }`}
              title="All Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
