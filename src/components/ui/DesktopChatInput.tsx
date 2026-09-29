'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Trash2, Bot, Sparkles, Folder, Wrench, Briefcase, History, ChevronUp, ChevronDown, X, AlertTriangle } from 'lucide-react';
import { useOSStore } from '@/lib/store';
import { cx, IconButton } from '@/components/ui/primitives';
import {
  sendCompanionMessage,
  clearHistory,
  readHistory,
  partnerName as getPartnerName,
  ChatError,
  type ChatMessage,
  type ChatPartner,
} from '@/hooks/chatClient';

const SUGGESTIONS = [
  { label: 'Who are you?', prompt: 'Who are you and what can you help me with?', icon: Sparkles },
  { label: 'Best projects', prompt: 'Which projects are the best ones to look at first?', icon: Folder },
  { label: 'Skills & tech', prompt: 'What are the main skills and technologies?', icon: Wrench },
  { label: 'Contact', prompt: 'How can I get in touch or see the social profiles?', icon: Briefcase },
];

/** Elapsed-seconds counter while the model is thinking (LLM replies can take 15–30s). */
function useElapsed(active: boolean) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!active) return;
    const started = Date.now();
    const t = setInterval(() => setSeconds(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => {
      clearInterval(t);
      setSeconds(0);
    };
  }, [active]);
  return seconds;
}

function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1" aria-hidden>
      <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
      <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
      <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" />
    </span>
  );
}

export function DesktopChatInput() {
  const isChatInputOpen = useOSStore((s) => s.isChatInputOpen);
  const activeChatPartner = useOSStore((s) => s.activeChatPartner);
  const partner: ChatPartner = activeChatPartner || 'robot';
  // Static, flex-centred positioning layer: keeps centring out of the animated element's transform
  // so the bar slides in/out smoothly instead of jumping.
  return (
    <div className="absolute inset-x-0 top-4 sm:top-16 z-[9000] flex justify-center px-2 pointer-events-none">
      <AnimatePresence mode="wait">
        {/* Remount per partner so each conversation starts from its own stored history */}
        {isChatInputOpen && <ChatBar key={partner} partner={partner} />}
      </AnimatePresence>
    </div>
  );
}

function ChatBar({ partner }: { partner: ChatPartner }) {
  const [text, setText] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => readHistory(partner));
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isThinking = useOSStore((s) => s.isThinking);
  const setIsThinking = useOSStore((s) => s.setIsThinking);
  const setIsChatInputOpen = useOSStore((s) => s.setIsChatInputOpen);
  const name = getPartnerName(partner);
  const elapsed = useElapsed(isThinking);

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent<{ partner?: string }>).detail;
      if (!detail || detail.partner === partner) setChatHistory(readHistory(partner));
    };
    window.addEventListener('chat_history_updated', onUpdate);
    return () => window.removeEventListener('chat_history_updated', onUpdate);
  }, [partner]);

  useEffect(() => {
    if (isHistoryExpanded) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [chatHistory, isThinking, isHistoryExpanded]);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, []);

  const handleLeave = useCallback(() => {
    setIsChatInputOpen(false);
  }, [setIsChatInputOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleLeave();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleLeave]);

  // Cancel an in-flight request if the bar is closed
  useEffect(() => () => abortRef.current?.abort(), []);

  const send = async (prompt: string) => {
    const message = prompt.trim();
    if (!message || useOSStore.getState().isThinking) return;
    setError(null);
    setIsThinking(true);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      await sendCompanionMessage(message, partner, controller.signal);
    } catch (err) {
      if (err instanceof ChatError && err.status === -1) return; // cancelled by the visitor
      const msg = err instanceof ChatError ? err.message : 'Something went wrong. Please try again.';
      setError(msg);
      setText((current) => current || message); // give the text back so it can be retried
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setIsThinking(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = text;
    setText('');
    void send(message);
  };

  const thinkingLabel =
    elapsed >= 10 ? `${name} is still thinking (${elapsed}s). AI replies can take up to 30 seconds...` : `${name} is thinking...`;

  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.97, transition: { duration: 0.16, ease: 'easeIn' } }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      role="dialog"
      aria-label={`Chat with ${name}`}
      className="pointer-events-auto flex flex-col w-full max-w-[560px] font-doodle text-fg"
      onClick={(e) => e.stopPropagation()}
    >
      {/* History drawer */}
      <AnimatePresence>
        {isHistoryExpanded && (
          <motion.div
            key="history"
            // Only this wrapper animates. It owns the spacing below the drawer and has no border,
            // so at height 0 nothing is left over and the input row doesn't jump at the end.
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.25, 0.8, 0.25, 1] }}
            // The right/bottom padding leaves room for the offset shadow that overflow-hidden would clip
            className="overflow-hidden -mr-[6px] pr-[6px]"
          >
          <div className="mb-2.5 flex flex-col bg-surface border-[2.5px] border-line shadow-doodle-lg rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-surface-2 border-b-2 border-line">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-sky text-ink border-2 border-ink flex items-center justify-center shadow-doodle-xs">
                  <Bot className="w-4 h-4" aria-hidden />
                </span>
                <div>
                  <h2 className="text-xs font-bold">Chat history with {name}</h2>
                  <p className="text-2xs text-fg-muted">Last {chatHistory.length} messages · stored in this browser</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {chatHistory.length > 0 && (
                  <IconButton
                    label="Clear chat history"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      clearHistory(partner);
                      setChatHistory([]);
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </IconButton>
                )}
                <IconButton label="Collapse chat history" size="sm" variant="ghost" onClick={() => setIsHistoryExpanded(false)}>
                  <ChevronUp className="w-4 h-4" />
                </IconButton>
              </div>
            </div>

            <div className="p-3.5 overflow-y-auto flex flex-col gap-3 max-h-[min(250px,40dvh)]" aria-live="polite">
              {chatHistory.length === 0 && !isThinking ? (
                <div className="py-6 text-center text-xs text-fg-muted flex flex-col items-center gap-2">
                  <Bot className="w-8 h-8" aria-hidden />
                  <p className="max-w-[280px] leading-relaxed">No messages yet. Type something below or pick a suggestion.</p>
                </div>
              ) : (
                chatHistory.map((msg, idx) => (
                  <div key={idx} className={cx('flex flex-col', msg.role === 'user' ? 'items-end' : 'items-start')}>
                    <span className="text-3xs text-fg-muted mb-0.5 px-1 font-bold uppercase tracking-wider">{msg.role === 'user' ? 'You' : name}</span>
                    <p
                      data-selectable
                      className={cx(
                        'px-3.5 py-2 text-xs leading-relaxed max-w-[88%] border-2 rounded-2xl shadow-doodle-sm whitespace-pre-wrap break-words',
                        msg.role === 'user' ? 'bg-sky text-ink border-ink rounded-tr-sm' : 'bg-surface-2 text-fg border-line rounded-tl-sm',
                      )}
                    >
                      {msg.content}
                    </p>
                  </div>
                ))
              )}
              {isThinking && (
                <div className="flex flex-col items-start">
                  <span className="text-3xs text-fg-muted mb-0.5 px-1 font-bold uppercase tracking-wider">{name}</span>
                  <span className="bg-surface-2 border-2 border-line shadow-doodle-sm px-4 py-2.5 rounded-2xl rounded-tl-sm text-fg">
                    <ThinkingDots />
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggestions */}
      {partner === 'robot' && chatHistory.length === 0 && (
        <div className="flex gap-2 overflow-x-auto py-1 px-0.5 mb-2.5 [scrollbar-width:none]">
          {SUGGESTIONS.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => void send(chip.prompt)}
              disabled={isThinking}
              className="flex items-center gap-1.5 h-8 px-3 bg-surface hover:bg-surface-3 text-fg border-2 border-line shadow-doodle-sm text-xs font-bold rounded-xl transition shrink-0 disabled:opacity-50 cursor-pointer"
            >
              <chip.icon className="w-3.5 h-3.5" aria-hidden />
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="flex items-center gap-2">
        <form
          onSubmit={handleSubmit}
          className="flex-1 min-w-0 flex items-center gap-2 pl-4 pr-2 py-1.5 rounded-2xl bg-surface border-[2.5px] border-line shadow-doodle-md focus-within:shadow-doodle-lg transition-shadow"
        >
          <label htmlFor="desktop-chat-input" className="sr-only">
            Message {name}
          </label>
          <input
            id="desktop-chat-input"
            ref={inputRef}
            type="text"
            value={text}
            maxLength={1000}
            onChange={(e) => setText(e.target.value)}
            placeholder={isThinking ? `${name} is thinking...` : `Message ${name}...`}
            disabled={isThinking}
            autoComplete="off"
            className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm text-fg placeholder:text-fg-muted font-mono disabled:opacity-60"
          />

          <button
            type="button"
            onClick={() => setIsHistoryExpanded((v) => !v)}
            aria-expanded={isHistoryExpanded}
            aria-label={isHistoryExpanded ? 'Hide chat history' : 'Show chat history'}
            title="Chat history"
            className={cx(
              'shrink-0 flex items-center gap-1 h-8 px-2 rounded-xl text-xs font-bold border-2 shadow-doodle-xs transition cursor-pointer',
              isHistoryExpanded ? 'bg-sky text-ink border-ink' : 'bg-surface-2 text-fg border-line hover:bg-surface-3',
            )}
          >
            <History className="w-3.5 h-3.5" aria-hidden />
            <span className="hidden sm:inline">History</span>
            {chatHistory.length > 0 && <span className="text-3xs px-1.5 rounded-full border border-current">{chatHistory.length}</span>}
            {isHistoryExpanded ? <ChevronUp className="w-3.5 h-3.5" aria-hidden /> : <ChevronDown className="w-3.5 h-3.5" aria-hidden />}
          </button>

          {isThinking ? (
            <IconButton label="Stop waiting for the reply" size="sm" variant="secondary" onClick={() => abortRef.current?.abort()}>
              <X className="w-3.5 h-3.5" />
            </IconButton>
          ) : (
            <IconButton label={`Send message to ${name}`} size="sm" variant="primary" type="submit" disabled={!text.trim()}>
              <Send className="w-3.5 h-3.5" />
            </IconButton>
          )}
        </form>

        <button
          type="button"
          onClick={handleLeave}
          className="shrink-0 h-11 px-3.5 bg-rose hover:bg-rose-300 border-[2.5px] border-ink text-ink text-xs font-bold rounded-2xl shadow-doodle-sm transition cursor-pointer"
        >
          Close
        </button>
      </div>

      {/* Status line: thinking progress or a clear error */}
      <div aria-live="polite" className="min-h-0 [&:not(:empty)]:mt-2.5">
        {isThinking && (
          <p role="status" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-line bg-surface-2 text-xs text-fg shadow-doodle-xs">
            <ThinkingDots />
            {thinkingLabel}
          </p>
        )}
        {!isThinking && error && (
          <p role="alert" className="flex items-start gap-2 px-3 py-2 rounded-xl border-2 border-ink bg-rose text-ink text-xs font-bold shadow-doodle-sm">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-px" aria-hidden />
            <span className="flex-1">{error}</span>
            <button type="button" onClick={() => setError(null)} aria-label="Dismiss error" className="shrink-0 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </p>
        )}
      </div>
    </motion.div>
  );
}
