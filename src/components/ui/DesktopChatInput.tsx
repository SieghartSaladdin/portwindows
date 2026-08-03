'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOSStore } from '@/lib/store';
import { Send, Trash2, Bot, Sparkles, Folder, Palette, Wrench, Briefcase, History, ChevronUp, ChevronDown, User, MessageCircle, X } from 'lucide-react';
import { sendChatMessage, clearChatHistory } from '@/lib/chat';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function DesktopChatInput() {
  const [text, setText] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [userSpeechBubble, setUserSpeechBubble] = useState<string | null>(null);

  const { 
    setFrierenSpeech, 
    setFernSpeech, 
    setStarkSpeech,
    setRobotSpeech,
    isThinking,
    setIsThinking, 
    isChatInputOpen,
    setIsChatInputOpen,
    activeChatPartner,
    setActiveChatPartner,
    frierenConfig
  } = useOSStore();
  const { isSpawned } = frierenConfig;

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechBubbleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const partner = activeChatPartner || 'robot';

  // Load chat history from localStorage
  const loadHistory = () => {
    const historyKey = `frieren_${partner}_chat_history`;
    try {
      const stored = localStorage.getItem(historyKey);
      if (stored) {
        setChatHistory(JSON.parse(stored));
      } else {
        setChatHistory([]);
      }
    } catch (err) {
      console.error('Error reading chat history:', err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [partner, isChatInputOpen]);

  useEffect(() => {
    const handleHistoryEvent = (e: Event) => {
      const customEvt = e as CustomEvent;
      if (!customEvt.detail || customEvt.detail.partner === partner) {
        loadHistory();
      }
    };

    window.addEventListener('chat_history_updated', handleHistoryEvent);
    return () => window.removeEventListener('chat_history_updated', handleHistoryEvent);
  }, [partner]);

  useEffect(() => {
    if (isHistoryExpanded) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isThinking, isHistoryExpanded]);

  useEffect(() => {
    if (isChatInputOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isChatInputOpen]);

  useEffect(() => {
    if (!isChatInputOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleLeave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isChatInputOpen]);

  if (!isChatInputOpen) return null;

  const partnerName = partner === 'robot' ? 'HelperBot' : partner === 'fern' ? 'Fern' : partner === 'stark' ? 'Stark' : 'Frieren';

  const suggestionChips = [
    { label: 'Siapa kamu?', prompt: 'Siapa kamu dan apa keahlianmu?', icon: Sparkles },
    { label: 'Lihat Proyek', prompt: 'Bisa sebutkan proyek terbaik yang pernah dibuat?', icon: Folder },
    { label: 'Skill & Tech', prompt: 'Teknologi dan keahlian utama apa saja yang kamu kuasai?', icon: Wrench },
    { label: 'Kontak', prompt: 'Bagaimana cara menghubungi atau melihat media sosialmu?', icon: Briefcase },
  ];

  const triggerUserSpeechBubble = (userText: string) => {
    if (partner !== 'robot') return;
    if (speechBubbleTimerRef.current) {
      clearTimeout(speechBubbleTimerRef.current);
    }
    setUserSpeechBubble(userText);
    speechBubbleTimerRef.current = setTimeout(() => {
      setUserSpeechBubble(null);
    }, 6000);
  };

  const handleSendPrompt = async (promptText: string) => {
    if (!promptText.trim() || isThinking) return;
    triggerUserSpeechBubble(promptText);
    setIsThinking(true);

    try {
      const historyKey = `frieren_${partner}_chat_history`;
      const currentHistory: ChatMessage[] = JSON.parse(localStorage.getItem(historyKey) || '[]');
      
      const newHistory: ChatMessage[] = [
        ...currentHistory,
        { role: 'user', content: promptText }
      ];
      localStorage.setItem(historyKey, JSON.stringify(newHistory));
      setChatHistory(newHistory);

      const response = await sendChatMessage(promptText, partner);
      
      if (partner === 'robot') {
        setRobotSpeech(response);
      } else if (partner === 'fern') {
        setFernSpeech(response);
      } else if (partner === 'stark') {
        setStarkSpeech(response);
      } else {
        setFrierenSpeech(response);
      }

      loadHistory();
    } catch (error) {
      console.error('Failed to send chat message:', error);
      const errMsg = 'Maaf, terjadi masalah koneksi saat merespon.';
      if (partner === 'robot') setRobotSpeech(errMsg);
      else setFrierenSpeech(errMsg);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isThinking) return;
    const userMsg = text;
    setText('');
    await handleSendPrompt(userMsg);
  };

  const handleClearHistory = () => {
    clearChatHistory(partner);
    setChatHistory([]);
    setUserSpeechBubble(null);
  };

  const handleLeave = () => {
    setIsChatInputOpen(false);
    setIsHistoryExpanded(false);
    setUserSpeechBubble(null);
  };

  return (
    <motion.div
      layout
      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
      className="absolute top-16 left-1/2 -translate-x-1/2 z-40 flex flex-col gap-2.5 w-[94vw] max-w-[560px] pointer-events-auto font-doodle px-1"
      onClick={(e) => e.stopPropagation()}
    >
      {/* HelperBot History Drawer */}
      <AnimatePresence>
        {isHistoryExpanded && partner === 'robot' && (
          <motion.div
            key="history-drawer"
            layout
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 350, damping: 26 }}
            className="flex flex-col bg-[#fcf9f2] border-[2.5px] border-[#2d2a26] shadow-[6px_6px_0px_0px_#2d2a26] rounded-2xl overflow-hidden font-doodle"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#f5efe2] border-b-[2px] border-[#2d2a26] text-xs select-none">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-sky-200 border-2 border-[#2d2a26] flex items-center justify-center text-[#2d2a26] font-bold shadow-[2px_2px_0px_0px_#2d2a26]">
                  🤖
                </div>
                <div>
                  <div className="font-bold text-[#2d2a26] text-xs flex items-center gap-1.5">
                    Riwayat Obrolan HelperBot
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse border border-[#2d2a26]" />
                  </div>
                  <div className="text-[11px] text-zinc-600 flex items-center gap-1 font-bold">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    Aura AI Assistant
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {chatHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="p-1.5 text-zinc-700 hover:text-rose-600 hover:bg-rose-100 rounded-xl border border-transparent hover:border-[#2d2a26] transition"
                    title="Hapus riwayat obrolan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsHistoryExpanded(false)}
                  className="p-1 text-zinc-700 hover:text-[#2d2a26] transition-colors"
                  title="Tutup riwayat"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* History Message Stream */}
            <div className="p-3.5 overflow-y-auto flex flex-col gap-3 max-h-[250px] scrollbar-thin">
              {chatHistory.length === 0 && !isThinking ? (
                <div className="py-6 text-center text-xs text-zinc-600 flex flex-col items-center gap-2">
                  <Bot className="w-8 h-8 text-sky-600" />
                  <p className="max-w-[280px] text-xs font-bold leading-relaxed">
                    Belum ada riwayat obrolan. Kirim pesan atau gunakan tombol saran di bawah!
                  </p>
                </div>
              ) : (
                chatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div className="text-[10px] text-zinc-600 mb-0.5 px-1 font-bold uppercase tracking-wider">
                      {msg.role === 'user' ? '👤 Anda' : '🤖 HelperBot'}
                    </div>
                    <div
                      className={`px-3.5 py-2 text-xs leading-relaxed max-w-[88%] select-text font-doodle font-bold border-[2px] border-[#2d2a26] ${
                        msg.role === 'user'
                          ? 'bg-[#bae6fd] text-[#2d2a26] rounded-2xl rounded-tr-xs shadow-[3px_3px_0px_0px_#2d2a26]'
                          : 'bg-[#fffdfa] text-[#2d2a26] rounded-2xl rounded-tl-xs shadow-[3px_3px_0px_0px_#2d2a26]'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))
              )}

              {/* Thinking Pulse Bubble */}
              {isThinking && (
                <div className="flex flex-col items-start">
                  <div className="text-[10px] text-zinc-600 mb-0.5 px-1 font-bold uppercase">
                    🤖 HelperBot
                  </div>
                  <div className="bg-[#fffdfa] border-[2px] border-[#2d2a26] shadow-[3px_3px_0px_0px_#2d2a26] px-4 py-2.5 rounded-2xl rounded-tl-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-sky-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 bg-sky-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Action Suggestion Chips */}
      {partner === 'robot' && (
        <motion.div layout className="flex gap-2 overflow-x-auto py-1 px-1 pr-4 scrollbar-none select-none flex-wrap sm:flex-nowrap">
          {suggestionChips.map((chip, idx) => {
            const IconComp = chip.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendPrompt(chip.prompt)}
                disabled={isThinking}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#fffdfa] hover:bg-amber-100 text-[#2d2a26] border-[2px] border-[#2d2a26] shadow-[2.5px_2.5px_0px_0px_#2d2a26] hover:shadow-[3.5px_3.5px_0px_0px_#2d2a26] text-xs font-bold rounded-xl transition-all duration-150 shrink-0 disabled:opacity-50"
              >
                <IconComp className="w-3.5 h-3.5 text-amber-700" />
                <span>{chip.label}</span>
              </button>
            );
          })}
        </motion.div>
      )}

      {/* Input Bar Row */}
      <motion.div layout className="flex items-center gap-2">
        <form 
          onSubmit={handleSubmit}
          className="flex-1 flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#fffdfa] border-[2.5px] border-[#2d2a26] shadow-[4px_4px_0px_0px_#2d2a26] focus-within:shadow-[5px_5px_0px_0px_#2d2a26] transition-all duration-200"
        >
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={isThinking ? `${partnerName} sedang berpikir...` : `Tulis pesan untuk ${partnerName}...`}
            disabled={isThinking}
            className="flex-1 bg-transparent border-none outline-none text-xs text-[#2d2a26] placeholder-zinc-500 font-doodle font-bold select-text disabled:opacity-50"
          />

          {/* History Toggle Button */}
          {partner === 'robot' && (
            <button
              type="button"
              onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border-[2px] border-[#2d2a26] transition-all duration-150 ${
                isHistoryExpanded 
                  ? 'bg-sky-200 text-[#2d2a26] shadow-[2px_2px_0px_0px_#2d2a26]' 
                  : 'bg-amber-100 hover:bg-amber-200 text-[#2d2a26] shadow-[2px_2px_0px_0px_#2d2a26]'
              }`}
              title="Riwayat Obrolan"
            >
              <History className="w-3.5 h-3.5 text-amber-800" />
              <span>History</span>
              {chatHistory.length > 0 && (
                <span className="bg-amber-400 text-[#2d2a26] border border-[#2d2a26] text-[9.5px] font-bold px-1.5 rounded-full">
                  {chatHistory.length}
                </span>
              )}
              {isHistoryExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}

          <button
            type="submit"
            disabled={isThinking || !text.trim()}
            className="p-1.5 rounded-xl bg-amber-300 hover:bg-amber-400 border-[2px] border-[#2d2a26] shadow-[2px_2px_0px_0px_#2d2a26] text-[#2d2a26] transition-all cursor-pointer disabled:opacity-40"
            title="Kirim Pesan"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        <button
          type="button"
          onClick={handleLeave}
          className="px-3.5 py-2 bg-rose-200 hover:bg-rose-300 border-[2.5px] border-[#2d2a26] text-[#2d2a26] text-xs font-bold rounded-2xl shadow-[3px_3px_0px_0px_#2d2a26] hover:shadow-[4px_4px_0px_0px_#2d2a26] transition-all duration-150 cursor-pointer flex items-center gap-1 shrink-0 font-doodle"
        >
          Keluar
        </button>
      </motion.div>

      {/* Animated User Speech Bubble */}
      <AnimatePresence>
        {partner === 'robot' && userSpeechBubble && (
          <motion.div
            key="user-speech-bubble"
            layout
            initial={{ opacity: 0, y: -12, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            className="relative self-start w-full max-w-[480px] mt-1 font-doodle"
          >
            <div className="bg-[#bae6fd] border-[2.5px] border-[#2d2a26] text-[#2d2a26] rounded-2xl rounded-tl-xs px-4 py-2.5 shadow-[4px_4px_0px_0px_#2d2a26] flex items-start justify-between gap-3 text-xs leading-relaxed relative group font-bold">
              <div className="flex items-start gap-2.5 relative z-10">
                <div className="p-1 rounded-xl bg-sky-300 border-[2px] border-[#2d2a26] text-[#2d2a26] shrink-0 mt-0.5 shadow-[1.5px_1.5px_0px_0px_#2d2a26]">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10.5px] text-sky-900 font-bold uppercase tracking-wider mb-0.5 flex items-center gap-1">
                    <span>Anda</span>
                    <MessageCircle className="w-3 h-3 text-sky-800" />
                  </div>
                  <p className="select-text text-[#2d2a26] font-bold">{userSpeechBubble}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setUserSpeechBubble(null)}
                className="text-[#2d2a26] hover:bg-rose-200 p-1 rounded-lg border border-[#2d2a26] transition-colors shrink-0 relative z-10"
                title="Tutup Balon Percakapan"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
