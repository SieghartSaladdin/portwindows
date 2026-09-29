'use client';

/**
 * Centralised fetch helper for the admin app.
 * - Adds the `Authorization: Bearer <token>` header.
 * - Parses the `{ error, details }` error contract into an ApiError.
 * - Calls `onUnauthorized` on any 401 so the app can log out with a message.
 */

import { createContext, useContext } from 'react';
import type { ContactMessage } from '@/lib/types';
import type { DataStatus } from '@/lib/store';

export const ADMIN_TOKEN_KEY = 'admin_token';

export type FieldErrors = Record<string, string>;
export type ReorderEntity = 'projects' | 'skills' | 'experiences' | 'educations' | 'certifications';
export type UploadKind = 'image' | 'document';

export const SESSION_EXPIRED_MESSAGE = 'Your session has expired. Please sign in again.';

export class ApiError extends Error {
  status: number;
  details: FieldErrors;
  constructor(status: number, message: string, details: FieldErrors = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

function fallbackMessage(status: number): string {
  if (status === 0) return 'Network error. Check your connection and try again.';
  if (status === 400 || status === 422) return 'Please check the highlighted fields.';
  if (status === 401) return SESSION_EXPIRED_MESSAGE;
  if (status === 403) return 'You are not allowed to do that.';
  if (status === 404) return 'Not found. It may have been deleted already.';
  if (status === 413) return 'That file is too large.';
  if (status === 415) return 'That file type is not supported.';
  if (status === 429) return 'Too many requests. Please wait a moment and try again.';
  return 'Something went wrong on the server. Please try again.';
}

function normaliseDetails(raw: unknown): FieldErrors {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out: FieldErrors = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === 'string') out[key] = value;
    else if (Array.isArray(value) && value.length) out[key] = String(value[0]);
    else if (value != null) out[key] = String(value);
  }
  return out;
}

function toApiError(status: number, body: unknown): ApiError {
  const obj = body && typeof body === 'object' ? (body as { error?: unknown; details?: unknown }) : {};
  const message = typeof obj.error === 'string' && obj.error.trim() ? obj.error : fallbackMessage(status);
  return new ApiError(status, message, normaliseDetails(obj.details));
}

/** Turns anything thrown into a user-facing sentence. */
export function errorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
}

export interface AdminApi {
  request<T = unknown>(path: string, options?: RequestOptions): Promise<T>;
  upload(file: File, kind: UploadKind, onProgress?: (percent: number) => void): Promise<string>;
}

export function createAdminApi(token: string, onUnauthorized: (message: string) => void): AdminApi {
  const handle401 = (err: ApiError) => {
    if (err.status === 401) onUnauthorized(SESSION_EXPIRED_MESSAGE);
    return err;
  };

  return {
    async request<T>(path: string, { method = 'GET', body }: RequestOptions = {}): Promise<T> {
      const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
      if (body !== undefined) headers['Content-Type'] = 'application/json';

      let res: Response;
      try {
        res = await fetch(path, {
          method,
          headers,
          body: body === undefined ? undefined : JSON.stringify(body),
          cache: 'no-store',
        });
      } catch {
        throw new ApiError(0, fallbackMessage(0));
      }

      const text = await res.text();
      let data: unknown = undefined;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = undefined;
        }
      }

      if (!res.ok) throw handle401(toApiError(res.status, data));
      return data as T;
    },

    upload(file, kind, onProgress) {
      return new Promise<string>((resolve, reject) => {
        const form = new FormData();
        form.append('file', file);
        form.append('kind', kind);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/upload');
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onerror = () => reject(new ApiError(0, fallbackMessage(0)));
        xhr.onload = () => {
          let data: unknown = undefined;
          try {
            data = xhr.responseText ? JSON.parse(xhr.responseText) : undefined;
          } catch {
            data = undefined;
          }
          if (xhr.status < 200 || xhr.status >= 300) {
            reject(handle401(toApiError(xhr.status, data)));
            return;
          }
          const url = data && typeof data === 'object' ? (data as { url?: unknown }).url : undefined;
          if (typeof url !== 'string' || !url) {
            reject(new ApiError(xhr.status, 'Upload finished but the server did not return a file URL.'));
            return;
          }
          onProgress?.(100);
          resolve(url);
        };
        xhr.send(form);
      });
    },
  };
}

/* ------------------------------------------------------------------ */
/* Client-side validation helpers                                      */
/* ------------------------------------------------------------------ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

/** Accepts http(s) URLs and files served by our own upload route. */
export function isValidLink(value: string): boolean {
  const v = value.trim();
  if (v.startsWith('/api/uploads/')) return /^\/api\/uploads\/[\w.-]+$/.test(v);
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export const LINK_ERROR = 'Use a full http(s):// link or an uploaded file.';

/** Empty string → null, so optional fields are cleared on the server. */
export function nullable(value: string): string | null {
  const v = value.trim();
  return v ? v : null;
}

/* ------------------------------------------------------------------ */
/* Admin context (provided by AdminApp)                                */
/* ------------------------------------------------------------------ */

export type ToastTone = 'success' | 'error';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
}

export interface AdminContextValue {
  api: AdminApi;
  username: string | null;
  notify: (text: string, tone?: ToastTone) => void;
  confirm: (options: ConfirmOptions) => void;
  /** Reloads /api/portfolio into the global store so the public apps update. */
  refreshPortfolio: () => Promise<void>;
  messages: ContactMessage[];
  messagesStatus: DataStatus;
  reloadMessages: () => Promise<void>;
  setMessages: (updater: (prev: ContactMessage[]) => ContactMessage[]) => void;
}

export const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdminApi(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdminApi must be used inside <AdminApp>');
  return ctx;
}
