import { safeEqual } from './crypto';

/** The example key that used to ship in .env.example / docker-compose.yml. Never accepted. */
export const PUBLISHED_EXAMPLE_MCP_KEY = 'mcp-sk-secretkey12345';
const MIN_KEY_LENGTH = 16;

export type McpKeyStatus = { ok: true; key: string } | { ok: false; reason: string };

/** Validates the configured MCP_API_KEY. The MCP endpoints stay closed unless this is ok. */
export function getMcpKeyStatus(value = process.env.MCP_API_KEY): McpKeyStatus {
  const key = value?.trim() ?? '';
  if (!key) return { ok: false, reason: 'MCP_API_KEY is not set.' };
  if (key === PUBLISHED_EXAMPLE_MCP_KEY) {
    return { ok: false, reason: 'MCP_API_KEY is still the published example value; generate a new random key.' };
  }
  if (key.length < MIN_KEY_LENGTH) {
    return { ok: false, reason: `MCP_API_KEY must be at least ${MIN_KEY_LENGTH} characters.` };
  }
  return { ok: true, key };
}

type HeaderValue = string | string[] | undefined;

function first(value: HeaderValue | unknown): string | undefined {
  if (Array.isArray(value)) return typeof value[0] === 'string' ? value[0] : undefined;
  return typeof value === 'string' ? value : undefined;
}

/**
 * Extracts a presented key from `Authorization: Bearer <key>`, `x-api-key: <key>`,
 * or the `apiKey` / `api_key` query parameter (kept for mcp-remote compatibility).
 */
export function extractMcpKey(
  headers: Record<string, HeaderValue>,
  query: Record<string, unknown> = {},
): string | undefined {
  const auth = first(headers['authorization']);
  if (auth) {
    const match = /^Bearer\s+(.+)$/i.exec(auth.trim());
    if (match) return match[1].trim();
  }
  const xApiKey = first(headers['x-api-key']);
  if (xApiKey) return xApiKey.trim();
  const queryKey = first(query.apiKey) ?? first(query.api_key);
  return queryKey?.trim() || undefined;
}

export function isValidMcpKey(presented: string | undefined, configured: string): boolean {
  if (!presented) return false;
  return safeEqual(presented, configured);
}
