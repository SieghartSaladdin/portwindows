import path from 'path';

export type UploadKind = 'image' | 'document';

export interface DetectedFile {
  ext: 'png' | 'jpg' | 'webp' | 'gif' | 'pdf';
  mime: string;
  kind: UploadKind;
}

export const MAX_UPLOAD_BYTES: Record<UploadKind, number> = {
  image: 5 * 1024 * 1024,
  document: 10 * 1024 * 1024,
};

export const MIME_BY_EXT: Record<DetectedFile['ext'], string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  pdf: 'application/pdf',
};

/** `<uuid>.<ext>` exactly as produced by POST /api/upload. */
export const UPLOAD_NAME_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(png|jpg|webp|gif|pdf)$/;

function startsWith(bytes: Uint8Array, signature: number[], offset = 0): boolean {
  if (bytes.length < offset + signature.length) return false;
  return signature.every((b, i) => bytes[offset + i] === b);
}

const ascii = (s: string) => Array.from(s, (c) => c.charCodeAt(0));

/** Identifies an allowed file type from its magic bytes (the client-provided MIME type is ignored). */
export function detectFileType(bytes: Uint8Array): DetectedFile | null {
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return { ext: 'png', mime: MIME_BY_EXT.png, kind: 'image' };
  }
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) {
    return { ext: 'jpg', mime: MIME_BY_EXT.jpg, kind: 'image' };
  }
  if (startsWith(bytes, ascii('GIF87a')) || startsWith(bytes, ascii('GIF89a'))) {
    return { ext: 'gif', mime: MIME_BY_EXT.gif, kind: 'image' };
  }
  if (startsWith(bytes, ascii('RIFF')) && startsWith(bytes, ascii('WEBP'), 8)) {
    return { ext: 'webp', mime: MIME_BY_EXT.webp, kind: 'image' };
  }
  if (startsWith(bytes, ascii('%PDF-'))) {
    return { ext: 'pdf', mime: MIME_BY_EXT.pdf, kind: 'document' };
  }
  return null;
}

export function getUploadDir(): string {
  const configured = process.env.UPLOAD_DIR?.trim();
  return configured ? path.resolve(configured) : path.join(process.cwd(), 'uploads');
}

/** Resolves a stored file name to an absolute path, or null if the name is not a valid upload name. */
export function resolveUploadPath(name: string): string | null {
  if (!UPLOAD_NAME_REGEX.test(name)) return null;
  const dir = getUploadDir();
  const full = path.resolve(dir, name);
  // Defence in depth: the regex already forbids separators and dots other than the extension.
  if (path.dirname(full) !== dir) return null;
  return full;
}
