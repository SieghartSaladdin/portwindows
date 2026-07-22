'use client';

import React, { useState, useEffect } from 'react';
import { useOSStore } from '@/lib/store';
import { Bot, Sparkles, X, MessageSquare } from 'lucide-react';

export function ChatNotificationToast() {
  const { robotSpeech, setRobotSpeech } = useOSStore();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (robotSpeech) {
      setToastMessage(robotSpeech);
      setVisible(true);

      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        setVisible(false);
      }, 5500);

      return () => clearTimeout(timer);
    }
  }, [robotSpeech]);

  const handleClose = () => {
    setVisible(false);
    setRobotSpeech(null);
  };

  if (!visible || !toastMessage) return null;

  return (
    <div className="fixed top-5 right-5 z-50 pointer-events-auto transition-all duration-300 transform translate-y-0 opacity-100 animate-in fade-in slide-in-from-top-4">
      <div className="bg-zinc-950/85 border border-blue-500/35 backdrop-blur-xl rounded-2xl shadow-2xl p-3.5 w-[320px] sm:w-[360px] text-slate-100 flex flex-col gap-2 relative overflow-hidden group">
        {/* Top Glow Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-500" />

        {/* Toast Header */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                HelperBot
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </span>
              <span className="text-[9.5px] text-slate-400 font-sans flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                Notification Bubble
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-white/10 rounded-full transition-colors"
            title="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Toast Body Content */}
        <div className="flex items-start gap-2.5 mt-0.5">
          <div className="p-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0 mt-0.5">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-sans line-clamp-3 select-text">
            {toastMessage}
          </p>
        </div>
      </div>
    </div>
  );
}
