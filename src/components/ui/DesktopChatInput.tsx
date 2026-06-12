import React, { useState, useEffect, useRef } from 'react';
import { useOSStore } from '@/lib/store';
import { Send } from 'lucide-react';

export function DesktopChatInput() {
  const [text, setText] = useState('');
  const { 
    setFrierenSpeech, 
    setFernSpeech, 
    setStarkSpeech,
    isThinking,
    setIsThinking, 
    isChatInputOpen,
    setIsChatInputOpen,
    activeChatPartner,
    frierenConfig 
  } = useOSStore();
  const { isSpawned } = frierenConfig;

  const inputRef = useRef<HTMLInputElement>(null);

  const handleLeave = () => {
    setIsChatInputOpen(false);
    setFrierenSpeech(null);
    setFernSpeech(null);
    setStarkSpeech(null);
    setIsThinking(false);
  };

  // Auto-focus input when opened
  useEffect(() => {
    if (isChatInputOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isChatInputOpen]);

  // Close input on Escape key
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

  // Don't render the input if Frieren is not spawned or chat is not open
  if (!isSpawned || !isChatInputOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanText = text.trim();
    if (!cleanText || isThinking) return;

    // 1. Clear input and disable immediately to provide instant feedback
    setText('');
    setIsThinking(true);
    setFrierenSpeech(cleanText);

    if (activeChatPartner === 'stark') {
      setStarkSpeech(null);
    } else {
      setFernSpeech(null);
    }

    const historyKey = activeChatPartner === 'stark' ? 'frieren_stark_chat_history' : 'frieren_fern_chat_history';

    // Get history from localStorage
    let history: { role: 'user' | 'assistant'; content: string }[] = [];
    try {
      const stored = localStorage.getItem(historyKey);
      if (stored) {
        history = JSON.parse(stored);
      }
    } catch (err) {
      console.error('Error loading chat history from localStorage:', err);
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: cleanText, history, partner: activeChatPartner }),
      });

      if (!res.ok) throw new Error('API failed');

      const data = await res.json();
      let reply = data.text || '';

      // 2. Parse Ollama's response (thoughts vs dialogue)
      const thinkingStart = reply.indexOf('Thinking...');
      const thinkingEnd = reply.indexOf('...done thinking.');

      if (thinkingStart !== -1 && thinkingEnd !== -1) {
        reply = reply.substring(thinkingEnd + 17).trim();
      } else {
        const thinkStart = reply.indexOf('<think>');
        const thinkEnd = reply.indexOf('</think>');
        if (thinkStart !== -1 && thinkEnd !== -1) {
          reply = reply.substring(thinkEnd + 8).trim();
        }
      }

      // Clean prefix "Fern:" or "Stark:"
      reply = reply.replace(/^(Fern|Stark):\s*/i, '').trim();

      // 3. Update store states
      if (activeChatPartner === 'stark') {
        setStarkSpeech(reply);
      } else {
        setFernSpeech(reply);
      }

      // Save updated history to localStorage
      try {
        const updatedHistory = [
          ...history,
          { role: 'user', content: cleanText },
          { role: 'assistant', content: reply }
        ];
        // Cap history to last 20 messages to keep local storage tidy and prompt size bounded
        if (updatedHistory.length > 20) {
          updatedHistory.splice(0, updatedHistory.length - 20);
        }
        localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
      } catch (err) {
        console.error('Error saving chat history to localStorage:', err);
      }
    } catch (error) {
      console.error(error);
      if (activeChatPartner === 'stark') {
        setStarkSpeech('... (Stark is looking nervous, Frieren-sama)');
      } else {
        setFernSpeech('... (Fern is ignoring Frieren-sama)');
      }
    } finally {
      setIsThinking(false);
    }
  };

  const partnerName = activeChatPartner === 'stark' ? 'Stark' : 'Fern';

  return (
    <div 
      className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 w-[90vw] sm:w-[460px] pointer-events-auto"
      onClick={(e) => e.stopPropagation()} // Prevent closing start menu / context menu
    >
      <form 
        onSubmit={handleSubmit}
        className="flex-1 flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-950/70 border border-white/10 backdrop-blur-md shadow-2xl focus-within:border-rose-500/50 transition-all duration-300"
      >
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={isThinking ? `${partnerName} is thinking...` : `Type Frieren's message to ${partnerName}...`}
          disabled={isThinking}
          className="flex-1 bg-transparent border-none outline-none text-xs text-slate-100 placeholder-slate-400 focus:ring-0 select-text disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isThinking || !text.trim()}
          className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-rose-400 transition-colors cursor-default disabled:opacity-35 disabled:hover:text-slate-400"
          title="Send speech bubble"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      <button
        type="button"
        onClick={handleLeave}
        className="px-3 py-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/35 hover:border-rose-500/60 text-rose-200 text-xs font-semibold backdrop-blur-md rounded-full shadow-xl transition-all duration-200 cursor-pointer flex items-center gap-1 shrink-0"
      >
        Leave
      </button>
    </div>
  );
}
