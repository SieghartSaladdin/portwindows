import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { jsonError, requireAdmin } from '@/lib/server/http';
import { detectFileType, getUploadDir, MAX_UPLOAD_BYTES, type UploadKind } from '@/lib/server/uploads';

export const dynamic = 'force-dynamic';

const MB = 1024 * 1024;
const LIMIT_TEXT: Record<UploadKind, string> = {
  image: 'PNG, JPEG, WebP or GIF up to 5 MB',
  document: 'PDF up to 10 MB',
};
const TOO_LARGE = 'File is too large. Images may be up to 5 MB and PDFs up to 10 MB.';

/** POST multipart/form-data: `file` (required), `kind` = image | document (optional). */
export async function POST(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_UPLOAD_BYTES.document + MB) return jsonError(413, TOO_LARGE);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError(400, 'Expected a multipart/form-data body with a "file" field.');
  }

  const file = form.get('file');
  if (!(file instanceof File)) {
    return jsonError(400, 'Validation failed.', { file: 'A file is required.' });
  }
  const kindField = form.get('kind');
  if (kindField !== null && kindField !== 'image' && kindField !== 'document') {
    return jsonError(400, 'Validation failed.', { kind: 'kind must be "image" or "document".' });
  }
  const requestedKind: UploadKind | null = kindField;

  if (file.size === 0) return jsonError(400, 'Validation failed.', { file: 'The file is empty.' });
  if (file.size > MAX_UPLOAD_BYTES.document) return jsonError(413, TOO_LARGE);

  const bytes = new Uint8Array(await file.arrayBuffer());
  const detected = detectFileType(bytes);
  if (!detected || (requestedKind && detected.kind !== requestedKind)) {
    const allowed = requestedKind ? LIMIT_TEXT[requestedKind] : `${LIMIT_TEXT.image}, or ${LIMIT_TEXT.document}`;
    return jsonError(415, 'Unsupported file type.', { file: `Allowed: ${allowed}.` });
  }
  if (bytes.byteLength > MAX_UPLOAD_BYTES[detected.kind]) {
    return jsonError(413, `File is too large. Allowed: ${LIMIT_TEXT[detected.kind]}.`);
  }

  try {
    const dir = getUploadDir();
    await mkdir(dir, { recursive: true });
    const name = `${randomUUID()}.${detected.ext}`;
    await writeFile(path.join(dir, name), bytes, { flag: 'wx' });
    return NextResponse.json(
      { url: `/api/uploads/${name}`, kind: detected.kind, contentType: detected.mime, size: bytes.byteLength },
      { status: 201 },
    );
  } catch (error) {
    console.error('[api] upload failed:', error instanceof Error ? error.message : error);
    return jsonError(500, 'Could not store the file on the server.');
  }
}
