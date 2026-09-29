'use client';

import React from 'react';
import { ImageOff } from 'lucide-react';
import { cx } from '@/components/ui/primitives';
import { safeHref } from '../bio/links';

interface SafeImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  /** Rendered instead of the image when src is missing/unsafe or fails to load */
  fallback?: React.ReactNode;
  fit?: 'cover' | 'contain';
}

function DefaultFallback({ className }: { className?: string }) {
  return (
    <div className={cx('flex flex-col items-center justify-center gap-1.5 bg-surface-2 text-fg-muted', className)}>
      <ImageOff className="w-6 h-6" aria-hidden />
      <span className="text-2xs font-bold">Image unavailable</span>
    </div>
  );
}

function Img({ src, alt, className, fallback, fit }: Omit<SafeImageProps, 'src'> & { src: string }) {
  const [failed, setFailed] = React.useState(false);
  if (failed) return <>{fallback ?? <DefaultFallback className={className} />}</>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={cx(fit === 'contain' ? 'object-contain' : 'object-cover', className)}
    />
  );
}

/** <img> that swaps to an honest placeholder when the file is missing or broken. */
export function SafeImage({ src, ...rest }: SafeImageProps) {
  const href = safeHref(src);
  if (!href) return <>{rest.fallback ?? <DefaultFallback className={rest.className} />}</>;
  return <Img key={href} src={href} {...rest} />;
}
