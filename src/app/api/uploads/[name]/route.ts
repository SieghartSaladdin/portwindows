import { readFile } from 'fs/promises';
import { jsonError } from '@/lib/server/http';
import { MIME_BY_EXT, resolveUploadPath, type DetectedFile } from '@/lib/server/uploads';

type Ctx = { params: Promise<{ name: string }> };

/** Public: serves a file previously stored by POST /api/upload. */
export async function GET(_request: Request, ctx: Ctx) {
  const { name } = await ctx.params;
  const filePath = resolveUploadPath(name);
  if (!filePath) return jsonError(404, 'File not found.');

  let data: Buffer;
  try {
    data = await readFile(filePath);
  } catch {
    return jsonError(404, 'File not found.');
  }

  const ext = name.slice(name.lastIndexOf('.') + 1) as DetectedFile['ext'];
  return new Response(new Uint8Array(data), {
    status: 200,
    headers: {
      'Content-Type': MIME_BY_EXT[ext],
      'Content-Length': String(data.byteLength),
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      'Content-Disposition': ext === 'pdf' ? `inline; filename="${name}"` : 'inline',
    },
  });
}
