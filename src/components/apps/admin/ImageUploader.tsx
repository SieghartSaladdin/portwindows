'use client';

import React, { useRef, useState } from 'react';
import { Button, IconButton, Input, cx } from '@/components/ui/primitives';
import { DoodleTrashIcon } from '@/components/ui/DoodleIcons';
import { IconArrowLeft, IconArrowRight, IconClose, IconFile, IconImage, IconUpload, IconAlert } from './AdminIcons';
import { ButtonSpinner } from './AdminShared';
import { LINK_ERROR, errorMessage, isValidLink, useAdminApi } from './useAdminApi';

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

interface PendingUpload {
  key: string;
  name: string;
  progress: number;
  error?: string;
}

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ------------------------------------------------------------------ */
/* Images (multiple, with thumbnails, reorder, remove, paste URL)       */
/* ------------------------------------------------------------------ */

export interface ImageUploaderProps {
  id: string;
  value: string[];
  /** Receives an updater so concurrent uploads never overwrite each other. */
  onChange: (updater: (prev: string[]) => string[]) => void;
  /** Maximum number of images. 1 = single image mode (a new upload replaces the old one). */
  max?: number;
  /** Mark the first image as the cover. */
  showCover?: boolean;
  invalid?: boolean;
  describedBy?: string;
}

export function ImageUploader({ id, value, onChange, max = 12, showCover, invalid, describedBy }: ImageUploaderProps) {
  const { api } = useAdminApi();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const [urlDraft, setUrlDraft] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const single = max === 1;
  const activeUploads = pending.filter((p) => !p.error).length;
  const remaining = single ? 1 : Math.max(0, max - value.length - activeUploads);

  const updatePending = (key: string, patch: Partial<PendingUpload>) =>
    setPending((list) => list.map((p) => (p.key === key ? { ...p, ...patch } : p)));

  const handleFiles = (files: FileList | File[]) => {
    const list = Array.from(files).slice(0, single ? 1 : remaining);
    for (const file of list) {
      const key = uid();
      if (!IMAGE_TYPES.includes(file.type)) {
        setPending((p) => [...p, { key, name: file.name, progress: 0, error: 'Only PNG, JPEG, WebP or GIF images are allowed.' }]);
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        setPending((p) => [...p, { key, name: file.name, progress: 0, error: 'Images must be 5 MB or smaller.' }]);
        continue;
      }
      setPending((p) => [...p, { key, name: file.name, progress: 0 }]);
      api
        .upload(file, 'image', (progress) => updatePending(key, { progress }))
        .then((url) => {
          onChange((prev) => (single ? [url] : [...prev, url]));
          setPending((p) => p.filter((x) => x.key !== key));
        })
        .catch((err) => updatePending(key, { error: errorMessage(err, 'Upload failed.') }));
    }
  };

  const addUrl = () => {
    const url = urlDraft.trim();
    if (!url) return;
    if (!isValidLink(url)) {
      setUrlError(LINK_ERROR);
      return;
    }
    if (!single && value.includes(url)) {
      setUrlError('That image is already in the list.');
      return;
    }
    onChange((prev) => (single ? [url] : [...prev, url]));
    setUrlDraft('');
    setUrlError(null);
  };

  const move = (index: number, delta: -1 | 1) =>
    onChange((prev) => {
      const target = index + delta;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const moved = next[index];
      next[index] = next[target];
      next[target] = moved;
      return next;
    });

  const remove = (index: number) => onChange((prev) => prev.filter((_, i) => i !== index));

  return (
    <div className="flex flex-col gap-3" aria-describedby={describedBy}>
      {(value.length > 0 || pending.length > 0) && (
        <ul className="flex flex-wrap gap-2.5" aria-label="Images">
          {value.map((src, index) => (
            <li
              key={`${src}-${index}`}
              className={cx(
                'relative rounded-xl border-2 border-line bg-surface-2 shadow-doodle-xs overflow-hidden flex flex-col',
                single ? 'w-36' : 'w-32',
              )}
            >
              <div className="relative h-20 bg-surface-3">
                {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-provided URLs */}
                <img src={src} alt={`Image ${index + 1}`} className="w-full h-full object-cover" loading="lazy" />
                {showCover && index === 0 && (
                  <span className="absolute top-1 left-1 rounded-full border-2 border-ink bg-highlight text-ink px-1.5 text-3xs font-bold">
                    Cover
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-1 p-1 border-t-2 border-line">
                {!single ? (
                  <div className="flex gap-1">
                    <IconButton size="sm" label={`Move image ${index + 1} left`} disabled={index === 0} onClick={() => move(index, -1)}>
                      <IconArrowLeft className="w-3 h-3" />
                    </IconButton>
                    <IconButton size="sm" label={`Move image ${index + 1} right`} disabled={index === value.length - 1} onClick={() => move(index, 1)}>
                      <IconArrowRight className="w-3 h-3" />
                    </IconButton>
                  </div>
                ) : (
                  <span className="text-3xs text-fg-muted px-1 truncate">Current</span>
                )}
                <IconButton size="sm" label={`Remove image ${index + 1}`} onClick={() => remove(index)}>
                  <DoodleTrashIcon className="w-3.5 h-3.5" />
                </IconButton>
              </div>
            </li>
          ))}

          {pending.map((p) => (
            <li
              key={p.key}
              className={cx(
                'relative w-32 min-h-28 rounded-xl border-2 border-dashed p-2 flex flex-col gap-1.5 text-2xs',
                p.error ? 'border-danger bg-surface-2' : 'border-line bg-surface-2',
              )}
            >
              <span className="truncate font-bold text-fg" title={p.name}>{p.name}</span>
              {p.error ? (
                <>
                  <span role="alert" className="text-danger font-bold leading-snug flex gap-1">
                    <IconAlert className="w-3 h-3 shrink-0 mt-px" /> {p.error}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPending((list) => list.filter((x) => x.key !== p.key))}
                    className="mt-auto self-start inline-flex items-center gap-1 text-fg-muted hover:text-fg underline cursor-pointer"
                  >
                    <IconClose className="w-3 h-3" /> Dismiss
                  </button>
                </>
              ) : (
                <>
                  <span className="text-fg-muted">Uploading… {p.progress}%</span>
                  <div
                    className="h-2.5 rounded-full border-2 border-line bg-surface overflow-hidden"
                    role="progressbar"
                    aria-label={`Uploading ${p.name}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={p.progress}
                  >
                    <div className="h-full bg-highlight transition-all" style={{ width: `${p.progress}%` }} />
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {remaining > 0 || single ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
          }}
          className={cx(
            'flex flex-wrap items-center gap-3 rounded-xl border-2 border-dashed px-3 py-3 transition-colors',
            invalid ? 'border-danger' : 'border-line',
            dragOver ? 'bg-highlight/40' : 'bg-surface-2',
          )}
        >
          <IconImage className="w-5 h-5 text-fg-muted shrink-0" />
          <div className="flex-1 min-w-40 text-2xs text-fg-muted leading-snug">
            <span className="font-bold text-fg">
              {single ? (value.length ? 'Replace the image' : 'Upload an image') : 'Drop images here or upload'}
            </span>
            <br />
            PNG, JPEG, WebP or GIF, up to 5 MB{single ? '' : ` each (${remaining} more allowed)`}.
          </div>
          <Button size="sm" icon={activeUploads ? <ButtonSpinner /> : <IconUpload className="w-3.5 h-3.5" />} onClick={() => fileRef.current?.click()}>
            {single ? 'Choose image' : 'Choose files'}
          </Button>
          <input
            ref={fileRef}
            id={`${id}-file`}
            type="file"
            accept={IMAGE_TYPES.join(',')}
            multiple={!single}
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(e) => {
              if (e.target.files?.length) handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </div>
      ) : (
        <p className="text-2xs text-fg-muted">Maximum of {max} images reached. Remove one to add another.</p>
      )}

      <div className="flex flex-col gap-1">
        <div className="flex gap-2">
          <Input
            id={id}
            type="url"
            inputMode="url"
            placeholder="…or paste an image URL (https://…)"
            value={urlDraft}
            aria-invalid={urlError ? true : undefined}
            aria-label="Image URL"
            onChange={(e) => {
              setUrlDraft(e.target.value);
              if (urlError) setUrlError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addUrl();
              }
            }}
          />
          <Button onClick={addUrl} disabled={!urlDraft.trim()} className="shrink-0">
            Add URL
          </Button>
        </div>
        {urlError && <p role="alert" className="text-2xs font-bold text-danger">{urlError}</p>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Single document (PDF) upload or URL                                  */
/* ------------------------------------------------------------------ */

export interface DocumentUploaderProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  describedBy?: string;
}

export function DocumentUploader({ id, value, onChange, invalid, describedBy }: DocumentUploaderProps) {
  const { api } = useAdminApi();
  const fileRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setError(null);
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed.');
      return;
    }
    if (file.size > MAX_DOCUMENT_BYTES) {
      setError('Documents must be 10 MB or smaller.');
      return;
    }
    setProgress(0);
    api
      .upload(file, 'document', setProgress)
      .then((url) => onChange(url))
      .catch((err) => setError(errorMessage(err, 'Upload failed.')))
      .finally(() => setProgress(null));
  };

  const uploading = progress !== null;
  const hasFile = value.trim() !== '' && isValidLink(value);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <div className="flex-1 min-w-48">
          <Input
            id={id}
            type="text"
            inputMode="url"
            placeholder="https://… or upload a PDF"
            value={value}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
        <Button
          icon={uploading ? <ButtonSpinner /> : <IconUpload className="w-3.5 h-3.5" />}
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="shrink-0"
        >
          {uploading ? `Uploading… ${progress}%` : 'Upload PDF'}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />
      </div>
      {hasFile && (
        <div className="flex items-center gap-2 text-2xs">
          <IconFile className="w-4 h-4 text-fg-muted" />
          <a href={value} target="_blank" rel="noopener noreferrer" className="font-bold text-fg underline decoration-dashed underline-offset-2 hover:text-fg-muted">
            Open current file
          </a>
          <button type="button" onClick={() => onChange('')} className="text-fg-muted hover:text-danger underline cursor-pointer">
            Remove
          </button>
        </div>
      )}
      {error && <p role="alert" className="text-2xs font-bold text-danger">{error}</p>}
    </div>
  );
}
