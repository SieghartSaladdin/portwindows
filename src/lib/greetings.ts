import type { ChatPartner } from '@/hooks/chatClient';

/**
 * Opening lines a partner says the moment the visitor presses E (playing Frieren).
 * They are static on purpose: they appear instantly instead of waiting for the LLM, and they
 * are not saved to the chat history, so they never leak into the model's context.
 */
export const GREETINGS: Record<ChatPartner, readonly string[]> = {
  fern: [
    'Frieren-sama? If you want to talk, please do it before you start looking for snacks again.',
    'Yes, Frieren-sama? I hope this is not about sleeping in again.',
    'Oh, Frieren-sama. Is there something you need?',
  ],
  stark: [
    "F-Frieren-sama! Is something wrong? I wasn't running away, I promise!",
    'Frieren-sama! Do you need me for something? I can carry things!',
    'Ah, Frieren-sama... um, good day! What can I do for you?',
  ],
  robot: [
    'Hello, Frieren! Want me to show you around the developer\'s projects?',
    'Frieren! Perfect timing. Ask me about the portfolio, or I can open an app for you.',
    'Hi, Frieren! Need the terminal, the bio, or maybe a new wallpaper?',
  ],
};

/** Picks a greeting for the partner. `random` is injectable so tests stay deterministic. */
export function pickGreeting(partner: ChatPartner, random: () => number = Math.random): string {
  const lines = GREETINGS[partner];
  return lines[Math.min(lines.length - 1, Math.floor(random() * lines.length))];
}
