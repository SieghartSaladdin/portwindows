'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Sun, Moon, Lock, Settings, Palette, Users } from 'lucide-react';
import { useOSStore } from '@/lib/store';
import { WALLPAPERS } from '@/lib/data';
import { useDismiss } from '@/hooks/useDismiss';
import { Button, IconButton, cx } from '@/components/ui/primitives';

function Tile({
  active,
  onClick,
  icon,
  label,
  status,
  ariaLabel,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  status: string;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={active}
      className={cx(
        'flex flex-col items-center justify-between gap-1 p-3 rounded-xl border-2 shadow-doodle-sm transition-all cursor-pointer min-w-0',
        'active:translate-x-[1px] active:translate-y-[1px] active:shadow-doodle-xs',
        active ? 'bg-highlight text-ink border-ink hover:bg-highlight-strong' : 'bg-surface-2 text-fg border-line hover:bg-surface-3',
      )}
    >
      <span aria-hidden>{icon}</span>
      <span className="text-xs font-bold truncate max-w-full">{status}</span>
      <span className="text-3xs font-bold uppercase tracking-wider truncate max-w-full opacity-80">{label}</span>
    </button>
  );
}

export function QuickSettings() {
  const isOpen = useOSStore((s) => s.isQuickSettingsOpen);
  const closeQuickSettings = useOSStore((s) => s.closeQuickSettings);
  const lockScreen = useOSStore((s) => s.lockScreen);
  const wallpaper = useOSStore((s) => s.wallpaper);
  const setWallpaper = useOSStore((s) => s.setWallpaper);
  const themeMode = useOSStore((s) => s.themeMode);
  const toggleThemeMode = useOSStore((s) => s.toggleThemeMode);
  const openWindow = useOSStore((s) => s.openWindow);
  const frierenConfig = useOSStore((s) => s.frierenConfig);
  const updateFrierenConfig = useOSStore((s) => s.updateFrierenConfig);

  const panelRef = useRef<HTMLDivElement>(null);
  const [lastVolume, setLastVolume] = useState(0.5);
  useDismiss(panelRef, isOpen, closeQuickSettings, '[data-trigger="quick-settings"]');

  const currentWallpaper = WALLPAPERS.find((w) => w.id === wallpaper) ?? WALLPAPERS[0];
  const volumePct = Math.round((frierenConfig.speechVolume ?? 0) * 100);
  const isMuted = volumePct === 0;
  const isDark = themeMode === 'dark';

  const cycleWallpaper = () => {
    const idx = WALLPAPERS.findIndex((w) => w.id === wallpaper);
    setWallpaper(WALLPAPERS[(idx + 1) % WALLPAPERS.length].id);
  };

  const toggleMute = () => {
    if (isMuted) {
      updateFrierenConfig({ speechVolume: lastVolume || 0.5 });
    } else {
      setLastVolume(frierenConfig.speechVolume);
      updateFrierenConfig({ speechVolume: 0 });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-label="Quick settings"
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.97 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          onClick={(e) => e.stopPropagation()}
          className="fixed right-2 sm:right-3 bottom-[calc(var(--spacing-taskbar)+0.5rem)] w-[calc(100vw-1rem)] sm:w-[360px] max-h-[calc(100dvh-var(--spacing-taskbar)-1.5rem)] overflow-y-auto rounded-2xl border-[2.5px] border-line bg-surface text-fg p-4 shadow-doodle-lg z-[9000] font-doodle select-none"
        >
          <h2 className="sr-only">Quick settings</h2>

          <div className="grid grid-cols-3 gap-2.5">
            <Tile
              active={isDark}
              onClick={toggleThemeMode}
              icon={isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              status={isDark ? 'Dark' : 'Light'}
              label="Theme"
              ariaLabel={`Theme: ${isDark ? 'dark' : 'light'}. Switch to ${isDark ? 'light' : 'dark'} mode`}
            />
            <Tile
              active={frierenConfig.isSpawned}
              onClick={() => updateFrierenConfig({ isSpawned: !frierenConfig.isSpawned })}
              icon={<Users className="w-5 h-5" />}
              status={frierenConfig.isSpawned ? 'On' : 'Off'}
              label="Companions"
              ariaLabel={`Desktop companions ${frierenConfig.isSpawned ? 'on' : 'off'}`}
            />
            <Tile
              active={!isMuted}
              onClick={toggleMute}
              icon={isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              status={isMuted ? 'Muted' : 'On'}
              label="Sound"
              ariaLabel={isMuted ? 'Unmute companion voices' : 'Mute companion voices'}
            />

            <button
              type="button"
              onClick={cycleWallpaper}
              aria-label={`Wallpaper: ${currentWallpaper.name}. Switch to the next wallpaper`}
              className="col-span-3 flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border-2 border-line bg-surface-2 hover:bg-surface-3 text-fg shadow-doodle-sm transition-all cursor-pointer active:translate-x-[1px] active:translate-y-[1px] active:shadow-doodle-xs"
            >
              <span className="flex items-center gap-2 text-xs font-bold">
                <Palette className="w-4 h-4" aria-hidden />
                Wallpaper
              </span>
              <span className="flex items-center gap-2 text-xs font-bold">
                <span
                  aria-hidden
                  className="w-4 h-4 rounded-full border-2 border-line"
                  style={{ backgroundColor: isDark ? currentWallpaper.swatchDark : currentWallpaper.swatchLight }}
                />
                {currentWallpaper.name}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3 mt-4 pt-3 border-t-2 border-dashed border-line/50">
            <IconButton label={isMuted ? 'Unmute companion voices' : 'Mute companion voices'} size="sm" onClick={toggleMute}>
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </IconButton>
            <label className="flex-1 flex flex-col gap-1">
              <span className="text-2xs font-bold uppercase tracking-wider text-fg-muted">Companion voice volume</span>
              <input
                type="range"
                min={0}
                max={100}
                value={volumePct}
                onChange={(e) => updateFrierenConfig({ speechVolume: Number(e.target.value) / 100 })}
                className="w-full cursor-pointer accent-highlight-strong"
              />
            </label>
            <span className="text-xs font-mono font-bold w-9 text-right">{volumePct}%</span>
          </div>

          <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t-2 border-line">
            <Button
              size="sm"
              variant="danger"
              icon={<Lock className="w-3.5 h-3.5" aria-hidden />}
              onClick={() => {
                closeQuickSettings();
                lockScreen();
              }}
            >
              Lock screen
            </Button>
            <Button
              size="sm"
              variant="secondary"
              icon={<Settings className="w-3.5 h-3.5" aria-hidden />}
              onClick={() => {
                closeQuickSettings();
                openWindow('settings', 'Settings');
              }}
            >
              All settings
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
