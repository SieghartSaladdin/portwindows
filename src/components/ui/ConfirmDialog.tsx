'use client';

import React from 'react';
import { useOSStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

export function ConfirmDialog() {
  const { confirmDialog, closeConfirm } = useOSStore();

  if (!confirmDialog || !confirmDialog.isOpen) return null;

  const { title, message, onConfirm } = confirmDialog;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/45 backdrop-blur-[2px] z-[9999] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="w-full max-w-sm rounded-xl border border-white/10 bg-zinc-900/90 backdrop-blur-xl p-5 text-white shadow-2xl flex flex-col gap-4 select-none"
        >
          {/* Header */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-win-accent/20 flex items-center justify-center text-win-accent-light">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold tracking-wide text-slate-100">{title}</h3>
          </div>

          {/* Message */}
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            {message}
          </p>

          {/* Buttons Footer */}
          <div className="flex gap-2.5 justify-end mt-2">
            <button
              onClick={() => {
                closeConfirm();
              }}
              className="px-5 py-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold transition cursor-default min-w-[72px]"
            >
              No
            </button>
            <button
              onClick={() => {
                if (onConfirm) onConfirm();
                closeConfirm();
              }}
              className="px-5 py-2 rounded-lg bg-win-accent hover:bg-win-accent/80 text-white text-xs font-bold transition cursor-default min-w-[72px] shadow-lg shadow-win-accent/20"
            >
              Yes
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
