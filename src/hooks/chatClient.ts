import { useOSStore } from '@/lib/store';
import { APP_BY_ID } from '@/hooks/appRegistry';
import { WALLPAPERS } from '@/lib/data';

export type ChatPartner = 'robot' | 'fern' | 'stark';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/** Stored per partner in localStorage; capped so it never grows without bound. */
export const MAX_STORED_MESSAGES = 30;
/** Only the most recent turns are sent to the model. */
const MAX_SENT_MESSAGES = 12;
/** LLM replies can take 15–30s; give up after this. */
export const CHAT_TIMEOUT_MS = 60_000;

export class ChatError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ChatError';
    this.status = status;
  }
}

export const historyKey = (partner: ChatPartner) => `frieren_${partner}_chat_history`;

export function readHistory(partner: ChatPartner): ChatMessage[] {
  try {
    const raw = localStorage.getItem(historyKey(partner));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((m) => m && typeof m.content === 'string') : [];
  } catch {
    return [];
  }
}

export function writeHistory(partner: ChatPartner, history: ChatMessage[]) {
  try {
    localStorage.setItem(historyKey(partner), JSON.stringify(history.slice(-MAX_STORED_MESSAGES)));
    window.dispatchEvent(new CustomEvent('chat_history_updated', { detail: { partner } }));
  } catch {
    // Storage full or disabled: the chat still works, it just is not remembered
  }
}

function friendlyError(status: number, serverMessage?: string): string {
  if (status === 429) return serverMessage || 'You are sending messages too quickly. Please wait a moment and try again.';
  if (status === 503) return serverMessage || 'The AI companion is offline right now. Please try again later.';
  if (status === 400) return serverMessage || 'That message could not be sent. Try rephrasing it.';
  if (status === 0) return 'Could not reach the server. Check your connection and try again.';
  return serverMessage || `Something went wrong (error ${status}). Please try again.`;
}

function cleanReply(text: string) {
  let reply = text || '';
  const thinkingEnd = reply.indexOf('...done thinking.');
  if (reply.includes('Thinking...') && thinkingEnd !== -1) {
    reply = reply.substring(thinkingEnd + '...done thinking.'.length);
  } else {
    const thinkEnd = reply.indexOf('</think>');
    if (reply.includes('<think>') && thinkEnd !== -1) reply = reply.substring(thinkEnd + '</think>'.length);
  }
  return reply.trim().replace(/^(Fern|Stark|HelperBot|Robot):\s*/i, '').trim();
}

interface ChatAction {
  type?: string;
  target?: string;
  projectId?: string;
}

/** Performs a UI action requested by the AI companion and returns a human description of it. */
function runAction(action: ChatAction): string | null {
  const store = useOSStore.getState();
  const { type, target, projectId } = action;

  if (type === 'open_window' && target && target !== 'admin') {
    if (target === 'projector' && projectId) {
      const needle = projectId.toLowerCase().replace(/\s+/g, '');
      const proj = store.projects.find(
        (p) => p.id === projectId || p.title.toLowerCase().replace(/\s+/g, '') === needle || p.title.toLowerCase().includes(projectId.toLowerCase()),
      );
      if (proj) store.setSelectedProjectId(proj.id);
    }
    const title = APP_BY_ID[target]?.title;
    store.openWindow(target, title);
    return `Opened ${title ?? target}.`;
  }
  if (type === 'open_widgets') {
    store.setIsWidgetsOpen(true);
    return 'Opened the widgets panel.';
  }
  if (type === 'open_link' && target && /^https?:\/\//i.test(target)) {
    window.open(target, '_blank', 'noopener,noreferrer');
    return `Opened ${target} in a new tab.`;
  }
  if (type === 'change_wallpaper' && target) {
    const wp = WALLPAPERS.find((w) => w.id === target);
    if (!wp) return null;
    store.setWallpaper(wp.id);
    return `Changed the wallpaper to ${wp.name}.`;
  }
  return null;
}

/** Longest line shown in a speech bubble; anything longer is clipped so the bubble stays readable. */
const MAX_BUBBLE_CHARS = 140;

export function toBubbleText(text: string): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > MAX_BUBBLE_CHARS ? clean.slice(0, MAX_BUBBLE_CHARS - 1).trimEnd() + '…' : clean;
}

const PARTNER_NAMES: Record<ChatPartner, string> = { robot: 'HelperBot', fern: 'Fern', stark: 'Stark' };

export function partnerName(partner: ChatPartner) {
  return PARTNER_NAMES[partner];
}

function setSpeech(partner: ChatPartner, text: string | null) {
  const s = useOSStore.getState();
  if (partner === 'robot') s.setRobotSpeech(text);
  else if (partner === 'stark') s.setStarkSpeech(text);
  else s.setFernSpeech(text);
}

/**
 * Sends a message to /api/chat with proper error statuses, runs the companion's action,
 * stores capped history and pushes a notification when the companion did something.
 * Throws ChatError with a user-facing message on failure.
 */
export async function sendCompanionMessage(
  message: string,
  partner: ChatPartner,
  signal?: AbortSignal,
  options: { asFrieren?: boolean } = {},
): Promise<string> {
  const history = readHistory(partner);
  const store = useOSStore.getState();
  // Show the user's message immediately
  writeHistory(partner, [...history, { role: 'user', content: message }]);
  setSpeech(partner, null);
  // The visitor is playing Frieren: what they type is what she says out loud
  if (options.asFrieren) store.setFrierenSpeech(toBubbleText(message));

  const timeout = new AbortController();
  const timer = setTimeout(() => timeout.abort(), CHAT_TIMEOUT_MS);
  const onAbort = () => timeout.abort();
  signal?.addEventListener('abort', onAbort);

  let res: Response;
  try {
    res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        history: history.slice(-MAX_SENT_MESSAGES),
        partner,
        // E = the visitor plays Frieren; a plain click chats as themselves
        speaker: options.asFrieren ? 'frieren' : 'visitor',
      }),
      signal: timeout.signal,
    });
  } catch {
    // Roll back the optimistic user message so a retry does not duplicate it
    writeHistory(partner, history);
    if (options.asFrieren) useOSStore.getState().setFrierenSpeech(null);
    if (signal?.aborted) throw new ChatError('Request cancelled.', -1);
    if (timeout.signal.aborted) throw new ChatError(`${partnerName(partner)} took too long to answer. Please try again.`, 408);
    throw new ChatError(friendlyError(0), 0);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }

  let data: { text?: string; action?: ChatAction | null; error?: string } = {};
  try {
    data = await res.json();
  } catch {
    // Non-JSON body; handled by the status check below
  }

  if (!res.ok) {
    writeHistory(partner, history);
    if (options.asFrieren) useOSStore.getState().setFrierenSpeech(null);
    throw new ChatError(friendlyError(res.status, data.error), res.status);
  }

  const reply = cleanReply(data.text ?? '') || '...';
  // Turn-taking: Frieren's line gives way to the partner's answer
  if (options.asFrieren) useOSStore.getState().setFrierenSpeech(null);
  setSpeech(partner, reply);
  writeHistory(partner, [...history, { role: 'user', content: message }, { role: 'assistant', content: reply }]);

  if (partner === 'robot' && data.action) {
    const did = runAction(data.action);
    if (did) {
      useOSStore.getState().pushNotification({ title: 'HelperBot did something', message: did });
    }
  }

  return reply;
}

export function clearHistory(partner: ChatPartner) {
  try {
    localStorage.removeItem(historyKey(partner));
    window.dispatchEvent(new CustomEvent('chat_history_updated', { detail: { partner } }));
  } catch {
    // ignore
  }
}
