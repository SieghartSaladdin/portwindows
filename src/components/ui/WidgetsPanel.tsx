'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Cpu, HardDrive, Network, Sparkles, Clock, ChevronRight } from 'lucide-react';
import { useOSStore } from '@/lib/store';
import { useDateTime } from '@/hooks/useDateTime';

export function WidgetsPanel() {
  const { isWidgetsOpen, closeWidgets } = useOSStore();
  const { time, fullDate } = useDateTime();

  // Mock real-time system metrics state
  const [metrics, setMetrics] = useState({
    cpu: 18,
    memory: 36,
    disk: 2,
    netDown: 4.2,
    netUp: 0.8,
  });

  useEffect(() => {
    if (!isWidgetsOpen) return;

    const interval = setInterval(() => {
      setMetrics((prev) => {
        const cpuDelta = (Math.random() - 0.5) * 6;
        const memDelta = (Math.random() - 0.5) * 0.4;
        const netDownDelta = (Math.random() - 0.5) * 1.5;
        const netUpDelta = (Math.random() - 0.5) * 0.3;

        return {
          cpu: Math.max(5, Math.min(95, Math.round(prev.cpu + cpuDelta))),
          memory: Math.max(30, Math.min(85, Math.round((prev.memory + memDelta) * 10) / 10)),
          disk: Math.random() > 0.7 ? Math.round(Math.random() * 8) : prev.disk,
          netDown: Math.max(0.1, Math.round((prev.netDown + netDownDelta) * 10) / 10),
          netUp: Math.max(0.05, Math.round((prev.netUp + netUpDelta) * 10) / 10),
        };
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isWidgetsOpen]);

  // Generate calendar days
  const getCalendarDays = () => {
    const days = [];
    // Just a placeholder grid of 35 days (e.g. June 2026 starting on Monday)
    // 1st is Monday, 30 days total
    const startDayOffset = 0; // Monday
    const currentDay = 29; // Today's date from additional metadata (2026-06-29)
    
    for (let i = 1 - startDayOffset; i <= 35 - startDayOffset; i++) {
      if (i > 0 && i <= 30) {
        days.push({ dayNum: i, current: i === currentDay });
      } else {
        days.push({ dayNum: null, current: false });
      }
    }
    return days;
  };

  const calendarDays = getCalendarDays();
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <AnimatePresence>
      {isWidgetsOpen && (
        <>
          {/* Backdrop Overlay to close panel */}
          <div 
            onClick={closeWidgets}
            className="fixed inset-0 bg-black/10 z-40"
          />

          {/* Sliding Widgets Panel */}
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 left-0 bottom-12 w-[380px] sm:w-[420px] rounded-r-2xl border-r border-y border-white/10 win-mica-dark p-6 shadow-2xl z-45 overflow-y-auto text-slate-200 select-none flex flex-col gap-6"
          >
            {/* Header / Search bar */}
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-win-accent-light animate-pulse" />
                <h2 className="text-lg font-semibold tracking-wide bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                  Widgets Board
                </h2>
              </div>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
                Alex's Space
              </span>
            </div>

            {/* Widget: Clock & Time */}
            <div className="flex flex-col p-4 rounded-xl border border-white/5 bg-zinc-950/20 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                  <Clock className="w-4 h-4 text-sky-400" />
                  <span>TIME & WEATHER</span>
                </div>
                <span className="text-[10px] text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                  Active
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono tracking-tight text-white">
                  {time ? time.split(' ')[0] : '12:00'}
                </span>
                <span className="text-sm font-semibold text-slate-400">
                  {time ? time.split(' ')[1] : 'PM'}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1 font-medium">{fullDate}</div>
              
              {/* Mini Weather inside Clock Widget */}
              <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center text-xs">
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-200">Cloudy & Calm</span>
                  <span className="text-[10px] text-slate-400">Wind: 5mph · Humidity: 65%</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-sky-300">68°F</span>
                </div>
              </div>
            </div>

            {/* Widget: Tech Metrics Monitor */}
            <div className="flex flex-col p-4 rounded-xl border border-white/5 bg-zinc-950/20 shadow-md">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-4">
                <Cpu className="w-4 h-4 text-indigo-400" />
                <span>SYSTEM PERFORMANCE</span>
              </div>
              
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* CPU */}
                <div className="flex flex-col">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-slate-400">CPU Usage</span>
                    <span className="font-mono text-slate-200 font-semibold">{metrics.cpu}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                      style={{ width: `${metrics.cpu}%` }}
                    />
                  </div>
                </div>

                {/* Memory */}
                <div className="flex flex-col">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-slate-400">RAM (16GB)</span>
                    <span className="font-mono text-slate-200 font-semibold">{metrics.memory}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-sky-500 rounded-full transition-all duration-1000"
                      style={{ width: `${metrics.memory}%` }}
                    />
                  </div>
                </div>

                {/* Disk Activity */}
                <div className="flex flex-col col-span-2">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                      Disk Active Time
                    </span>
                    <span className="font-mono text-slate-200 font-semibold">{metrics.disk}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                      style={{ width: `${metrics.disk}%` }}
                    />
                  </div>
                </div>

                {/* Network */}
                <div className="flex flex-col col-span-2">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Network className="w-3.5 h-3.5 text-rose-400" />
                      Network Throughput
                    </span>
                    <span className="font-mono text-[10px] text-slate-300">
                      ↓ {metrics.netDown} MB/s · ↑ {metrics.netUp} MB/s
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Widget: Calendar */}
            <div className="flex flex-col p-4 rounded-xl border border-white/5 bg-zinc-950/20 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                  <CalendarIcon className="w-4 h-4 text-emerald-400" />
                  <span>CALENDAR</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-300">June 2026</span>
              </div>

              {/* Grid Header */}
              <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-slate-500 mb-1">
                {weekDays.map((wd, i) => <span key={i}>{wd}</span>)}
              </div>

              {/* Grid Days */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium">
                {calendarDays.map((d, i) => (
                  <span
                    key={i}
                    className={`
                      py-1 rounded-md transition-all flex items-center justify-center h-7 w-7 mx-auto
                      ${!d.dayNum ? 'text-transparent pointer-events-none' : 'text-slate-300 hover:bg-white/10'}
                      ${d.current ? 'bg-sky-500 text-white font-bold shadow-lg shadow-sky-500/20' : ''}
                    `}
                  >
                    {d.dayNum}
                  </span>
                ))}
              </div>
            </div>

            {/* Widget: Frieren spell of the day */}
            <div className="flex flex-col p-4 rounded-xl border border-white/5 bg-zinc-950/20 shadow-md">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-3">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>SPELLS TO PRACTICE TODAY</span>
              </div>
              <ul className="text-xs text-slate-300 flex flex-col gap-2.5">
                <li className="flex items-start gap-2 border-b border-white/5 pb-2">
                  <ChevronRight className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-200">Spell to make sweet grapes sour</div>
                    <div className="text-[10px] text-slate-500">"Tasting sour makes the sweet ones taste better."</div>
                  </div>
                </li>
                <li className="flex items-start gap-2 border-b border-white/5 pb-2">
                  <ChevronRight className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-200">Spell to clean bronze statues of rust</div>
                    <div className="text-[10px] text-slate-500">"Vital for paying respect to Himmel's statues."</div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-200">Spell to find lost accessories</div>
                    <div className="text-[10px] text-slate-500">"Useful for finding that specific blue ring."</div>
                  </div>
                </li>
              </ul>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
