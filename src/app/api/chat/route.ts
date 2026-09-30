import { NextResponse } from 'next/server';
import { stripMarkdown } from '@/lib/server/plainText';
import { AIMessage, HumanMessage, type BaseMessage } from '@langchain/core/messages';
import { graph } from '@/lib/agents/main_agent/graph';
import { LlmNotConfiguredError } from '@/lib/agents/main_agent/nodes';
import { jsonError, parseJsonBody } from '@/lib/server/http';
import { getLlmConfig, LLM_TIMEOUT_MS } from '@/lib/server/llm';
import { createRateLimiter, getClientIp } from '@/lib/server/rateLimit';
import { chatSchema, defaultSpeaker } from '@/lib/server/validation';

export const dynamic = 'force-dynamic';
export const maxDuration = 75;

const globalForChat = globalThis as unknown as { __auraChatLimiter?: ReturnType<typeof createRateLimiter> };
const chatLimiter = (globalForChat.__auraChatLimiter ??= createRateLimiter({ limit: 20, windowMs: 60 * 1000 }));

const NOT_CONFIGURED = 'The AI assistant is not configured on this server yet.';
const UNAVAILABLE = 'The AI assistant is unavailable right now. Please try again in a moment.';

function isTimeout(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return error.name === 'AbortError' || error.name === 'TimeoutError' || /abort|timed? ?out/i.test(error.message);
}

/** POST { message, history?, partner?, speaker? } -> { text, action } */
export async function POST(request: Request) {
  const limit = chatLimiter.consume(getClientIp(request));
  if (!limit.allowed) {
    return jsonError(429, 'You are sending messages too quickly. Please wait a moment.', undefined, {
      'Retry-After': String(limit.retryAfter),
    });
  }

  const parsed = await parseJsonBody(request, chatSchema);
  if (!parsed.ok) return parsed.response;
  const { message, history, partner } = parsed.data;
  const speaker = parsed.data.speaker ?? defaultSpeaker(partner);

  if (!getLlmConfig()) return jsonError(503, NOT_CONFIGURED);

  const messages: BaseMessage[] = history.map((m) =>
    m.role === 'user' ? new HumanMessage(m.content) : new AIMessage(m.content),
  );
  messages.push(new HumanMessage(message));

  try {
    const finalState = await graph.invoke(
      { messages, partner, speaker },
      { signal: AbortSignal.timeout(LLM_TIMEOUT_MS), recursionLimit: 12 },
    );
    const text = stripMarkdown(finalState.output || '');
    if (!text) return jsonError(503, UNAVAILABLE);
    return NextResponse.json({ text, action: partner === 'robot' ? finalState.action ?? null : null });
  } catch (error) {
    if (error instanceof LlmNotConfiguredError) return jsonError(503, NOT_CONFIGURED);
    // Log the reason server-side only; never echo provider URLs or stack traces to the client.
    console.error('[api] chat failed:', error instanceof Error ? `${error.name}: ${error.message}` : error);
    if (isTimeout(error)) return jsonError(504, 'The AI assistant took too long to answer. Please try again.');
    return jsonError(503, UNAVAILABLE);
  }
}
