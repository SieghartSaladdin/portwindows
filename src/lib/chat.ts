import { useOSStore } from '@/lib/store';
import { WALLPAPERS } from '@/lib/data';

export type ChatPartner = 'robot' | 'stark' | 'fern';

interface ChatHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatAction {
  type: 'open_window' | 'open_widgets' | 'open_link' | 'change_wallpaper';
  target?: string;
  projectId?: string;
}

// Mirrors the server-side limits of POST /api/chat.
const MAX_MESSAGE = 2000;
const MAX_HISTORY_ITEMS = 20;
const MAX_HISTORY_CONTENT = 4000;

const historyKey = (partner: ChatPartner) => `frieren_${partner}_chat_history`;

function loadHistory(partner: ChatPartner): ChatHistoryItem[] {
  try {
    const stored = localStorage.getItem(historyKey(partner));
    const parsed: unknown = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (m): m is ChatHistoryItem =>
          !!m && typeof m === 'object' && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string',
      )
      .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_HISTORY_CONTENT) }))
      .slice(-MAX_HISTORY_ITEMS);
  } catch (err) {
    console.error('Error loading chat history from localStorage:', err);
    return [];
  }
}

function cleanReply(raw: string): string {
  let reply = raw;
  const thinkingEnd = reply.indexOf('...done thinking.');
  if (reply.includes('Thinking...') && thinkingEnd !== -1) {
    reply = reply.substring(thinkingEnd + '...done thinking.'.length);
  } else {
    const thinkEnd = reply.indexOf('</think>');
    if (reply.includes('<think>') && thinkEnd !== -1) reply = reply.substring(thinkEnd + '</think>'.length);
  }
  return reply.trim().replace(/^(Fern|Stark|HelperBot|Robot):\s*/i, '').trim();
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Links the assistant may open: only ones that exist in the loaded portfolio data. */
function knownLinks(): Set<string> {
  const { profile, projects } = useOSStore.getState();
  const urls = [profile?.githubUrl, profile?.linkedinUrl, profile?.websiteUrl, ...projects.flatMap((p) => [p.githubUrl, p.liveUrl])];
  return new Set(urls.filter((u): u is string => !!u));
}

function applyAction(action: ChatAction) {
  const store = useOSStore.getState();
  const { type, target, projectId } = action;

  if (type === 'open_window' && target) {
    if (!Object.prototype.hasOwnProperty.call(store.windows, target)) return;
    if (target === 'projector' && projectId) {
      const key = projectId.toLowerCase().replace(/\s+/g, '');
      const proj = store.projects.find(
        (p) => p.id === projectId || p.title.toLowerCase().replace(/\s+/g, '') === key || p.title.toLowerCase().includes(projectId.toLowerCase()),
      );
      if (proj) store.setSelectedProjectId(proj.id);
    }
    store.openWindow(target);
  } else if (type === 'open_widgets') {
    store.setIsWidgetsOpen(true);
  } else if (type === 'open_link' && target) {
    if (isHttpUrl(target) && knownLinks().has(target)) {
      window.open(target, '_blank', 'noopener,noreferrer');
    }
  } else if (type === 'change_wallpaper' && target) {
    if (WALLPAPERS.some((w) => w.id === target)) store.setWallpaper(target);
  }
}

function setSpeech(partner: ChatPartner, text: string | null) {
  const store = useOSStore.getState();
  if (partner === 'robot') store.setRobotSpeech(text);
  else if (partner === 'stark') store.setStarkSpeech(text);
  else store.setFernSpeech(text);
}

export async function sendChatMessage(message: string, partner: ChatPartner): Promise<string> {
  const store = useOSStore.getState();
  store.setIsThinking(true);
  setSpeech(partner, null);

  const trimmed = message.trim().slice(0, MAX_MESSAGE);
  const history = loadHistory(partner);

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: trimmed, history, partner }),
    });

    const data: { text?: string; action?: ChatAction | null; error?: string } = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Chat request failed (${res.status})`);

    const reply = cleanReply(data.text || '');
    setSpeech(partner, reply);
    if (partner === 'robot' && data.action) applyAction(data.action);

    try {
      const updatedHistory: ChatHistoryItem[] = [
        ...history,
        { role: 'user' as const, content: trimmed },
        { role: 'assistant' as const, content: reply.slice(0, MAX_HISTORY_CONTENT) },
      ].slice(-MAX_HISTORY_ITEMS);
      localStorage.setItem(historyKey(partner), JSON.stringify(updatedHistory));
      window.dispatchEvent(new CustomEvent('chat_history_updated', { detail: { partner } }));
    } catch (err) {
      console.error('Error saving chat history to localStorage:', err);
    }

    return reply;
  } catch (error) {
    console.error(error);
    const serverMessage = error instanceof Error ? error.message : '';
    const errorReply =
      partner === 'stark'
        ? '... (Stark is looking nervous)'
        : partner === 'fern'
          ? '... (Fern is ignoring Frieren-sama)'
          : `BEEP BOOP! ${serverMessage || 'I could not reach the server. Please try again.'}`;
    setSpeech(partner, errorReply);
    throw error;
  } finally {
    useOSStore.getState().setIsThinking(false);
  }
}

export function clearChatHistory(partner: ChatPartner) {
  try {
    localStorage.removeItem(historyKey(partner));
    window.dispatchEvent(new CustomEvent('chat_history_updated', { detail: { partner } }));
  } catch (err) {
    console.error('Error clearing chat history:', err);
  }
}
