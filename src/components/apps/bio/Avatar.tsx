'use client';

import React from 'react';
import { cx } from '@/components/ui/primitives';
import { initials, safeHref } from './links';

interface AvatarProps {
  name: string;
  src?: string | null;
  className?: string;
}

function AvatarImage({ name, src, className }: { name: string; src: string; className?: string }) {
  const [failed, setFailed] = React.useState(false);
  if (failed) return <Initials name={name} className={className} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`Portrait of ${name}`}
      onError={() => setFailed(true)}
      className={cx('rounded-full border-[2.5px] border-line object-cover bg-surface-2 shadow-doodle-sm shrink-0', className)}
    />
  );
}

function Initials({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cx(
        'rounded-full border-[2.5px] border-ink bg-highlight text-ink font-doodle font-bold flex items-center justify-center shadow-doodle-sm shrink-0',
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}

/** Round profile picture; falls back to initials when missing or broken. */
export function Avatar({ name, src, className = 'w-16 h-16 text-xl' }: AvatarProps) {
  const href = safeHref(src);
  if (!href) return <Initials name={name} className={className} />;
  // Keyed by URL so a new picture gets a fresh "failed" state.
  return <AvatarImage key={href} name={name} src={href} className={className} />;
}
