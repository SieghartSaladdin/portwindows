import { useOSStore } from '@/lib/store';

export async function sendChatMessage(message: string, partner: 'robot' | 'stark' | 'fern'): Promise<string> {
  const store = useOSStore.getState();
  
  store.setIsThinking(true);
  if (partner === 'robot') {
    store.setRobotSpeech(null);
  } else if (partner === 'stark') {
    store.setStarkSpeech(null);
  } else {
    store.setFernSpeech(null);
  }

  const historyKey = `frieren_${partner}_chat_history`;
  let history: any[] = [];
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
      body: JSON.stringify({ message, history, partner }),
    });

    if (!res.ok) throw new Error('API failed');

    const data = await res.json();
    let reply = data.text || '';

    // Clean thinking blocks or prefix "Fern:", "Stark:", "HelperBot:"
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
    reply = reply.replace(/^(Fern|Stark|HelperBot|Robot):\s*/i, '').trim();

    // 1. Update character speech state
    if (partner === 'stark') {
      store.setStarkSpeech(reply);
    } else if (partner === 'robot') {
      store.setRobotSpeech(reply);
      // 2. Dispatch actions
      if (data.action) {
        const { type, target, projectId } = data.action;
        if (type === 'open_window' && target) {
          if (target !== 'admin') {
            if (target === 'projector' && projectId) {
              const proj = store.projects.find(p => p.id === projectId || p.title.toLowerCase().replace(/\s+/g, '') === projectId.toLowerCase().replace(/\s+/g, '') || p.title.toLowerCase().includes(projectId.toLowerCase()));
              if (proj) {
                store.setSelectedProjectId(proj.id);
              }
            }
            store.openWindow(target);
          }
        } else if (type === 'open_widgets') {
          store.setIsWidgetsOpen(true);
        } else if (type === 'open_link' && target) {
          window.open(target, '_blank');
        } else if (type === 'change_wallpaper' && target) {
          store.setWallpaper(target);
        }
      }
    } else {
      store.setFernSpeech(reply);
    }

    // 3. Save to localStorage history and dispatch event
    try {
      const updatedHistory = [
        ...history,
        { role: 'user', content: message },
        { role: 'assistant', content: reply }
      ];
      if (updatedHistory.length > 20) {
        updatedHistory.splice(0, updatedHistory.length - 20);
      }
      localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('chat_history_updated', { detail: { partner } }));
      }
    } catch (err) {
      console.error('Error saving chat history to localStorage:', err);
    }

    return reply;
  } catch (error) {
    console.error(error);
    let errorReply = '';
    if (partner === 'stark') {
      errorReply = '... (Stark is looking nervous)';
      store.setStarkSpeech(errorReply);
    } else if (partner === 'robot') {
      errorReply = 'BEEP BOOP! Error connecting to server. Please try again.';
      store.setRobotSpeech(errorReply);
    } else {
      errorReply = '... (Fern is ignoring Frieren-sama)';
      store.setFernSpeech(errorReply);
    }
    throw error;
  } finally {
    store.setIsThinking(false);
  }
}

export function clearChatHistory(partner: 'robot' | 'stark' | 'fern') {
  const historyKey = `frieren_${partner}_chat_history`;
  try {
    localStorage.removeItem(historyKey);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('chat_history_updated', { detail: { partner } }));
    }
  } catch (err) {
    console.error('Error clearing chat history:', err);
  }
}
