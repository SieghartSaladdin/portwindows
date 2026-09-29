'use client';

/**
 * Small inline icons used only by the admin app, for glyphs that have no
 * counterpart in DoodleIcons.tsx. Two flavours:
 *  - Line icons (currentColor stroke) for utility actions: arrows, plus, close...
 *  - Doodle icons (pastel fill + ink stroke) for section tabs, matching DoodleIcons.
 */

import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement> & { className?: string };

function Line({ className = 'w-4 h-4', children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconArrowUp = (p: IconProps) => <Line {...p}><path d="M12 19V5M6 11l6-6 6 6" /></Line>;
export const IconArrowDown = (p: IconProps) => <Line {...p}><path d="M12 5v14M6 13l6 6 6-6" /></Line>;
export const IconArrowLeft = (p: IconProps) => <Line {...p}><path d="M19 12H5M11 6l-6 6 6 6" /></Line>;
export const IconArrowRight = (p: IconProps) => <Line {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Line>;
export const IconPlus = (p: IconProps) => <Line {...p}><path d="M12 5v14M5 12h14" /></Line>;
export const IconClose = (p: IconProps) => <Line {...p}><path d="M6 6l12 12M18 6L6 18" /></Line>;
export const IconCheck = (p: IconProps) => <Line {...p}><path d="M5 12.5l4.5 4.5L19 7" /></Line>;
export const IconAlert = (p: IconProps) => (
  <Line {...p}>
    <path d="M12 3.5L2.8 19.5h18.4L12 3.5z" />
    <path d="M12 10v4M12 17h.01" />
  </Line>
);
export const IconRefresh = (p: IconProps) => (
  <Line {...p}>
    <path d="M20 11a8 8 0 0 0-14.3-4.9L4 8" />
    <path d="M4 4v4h4" />
    <path d="M4 13a8 8 0 0 0 14.3 4.9L20 16" />
    <path d="M20 20v-4h-4" />
  </Line>
);
export const IconLogout = (p: IconProps) => (
  <Line {...p}>
    <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
    <path d="M10 16l-4-4 4-4M6 12h10" />
  </Line>
);
export const IconUpload = (p: IconProps) => (
  <Line {...p}>
    <path d="M12 16V4M7 9l5-5 5 5" />
    <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
  </Line>
);
export const IconReply = (p: IconProps) => (
  <Line {...p}>
    <path d="M9 7L4 12l5 5" />
    <path d="M4 12h10a6 6 0 0 1 6 6v1" />
  </Line>
);
export const IconMailOpen = (p: IconProps) => (
  <Line {...p}>
    <path d="M3 10l9-6 9 6v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9z" />
    <path d="M3 10l9 6 9-6" />
  </Line>
);
export const IconMailClosed = (p: IconProps) => (
  <Line {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </Line>
);
export const IconFile = (p: IconProps) => (
  <Line {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z" />
    <path d="M14 3v5h5M9 13h6M9 17h4" />
  </Line>
);
export const IconImage = (p: IconProps) => (
  <Line {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="10" r="2" />
    <path d="M21 16l-5-5-9 9" />
  </Line>
);

/* ------------------------------------------------------------------ */
/* Doodle-style section icons (fixed pastel fills + ink outlines)       */
/* ------------------------------------------------------------------ */

function Doodle({ className = 'w-5 h-5', children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden className={className} {...rest}>
      {children}
    </svg>
  );
}

const INK = 'var(--ink)';

export const DoodleSparkIcon = (p: IconProps) => (
  <Doodle {...p}>
    <path d="M16 3l3.2 8.8L28 15l-8.8 3.2L16 27l-3.2-8.8L4 15l8.8-3.2L16 3z" fill="var(--lilac)" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
    <path d="M25 4v4M23 6h4" stroke={INK} strokeWidth="2" strokeLinecap="round" />
  </Doodle>
);

export const DoodleBriefcaseIcon = (p: IconProps) => (
  <Doodle {...p}>
    <rect x="4" y="10" width="24" height="16" rx="3" fill="var(--peach)" stroke={INK} strokeWidth="2.4" />
    <path d="M12 10V7.5A1.5 1.5 0 0 1 13.5 6h5A1.5 1.5 0 0 1 20 7.5V10" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
    <path d="M4 17h24" stroke={INK} strokeWidth="2" />
    <rect x="14" y="15" width="4" height="4" rx="1" fill="var(--highlight)" stroke={INK} strokeWidth="1.8" />
  </Doodle>
);

export const DoodleGradCapIcon = (p: IconProps) => (
  <Doodle {...p}>
    <path d="M16 6L3 12.5 16 19l13-6.5L16 6z" fill="var(--sky)" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
    <path d="M9 16v5.5c0 1.8 3.1 3.5 7 3.5s7-1.7 7-3.5V16" fill="var(--sky)" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M27 13.5V21" stroke={INK} strokeWidth="2" strokeLinecap="round" />
    <circle cx="27" cy="22.5" r="1.6" fill="var(--highlight)" stroke={INK} strokeWidth="1.6" />
  </Doodle>
);

export const DoodleBadgeIcon = (p: IconProps) => (
  <Doodle {...p}>
    <path d="M11 18l-3 10 4-2 3 3 2-9M21 18l3 10-4-2-3 3-2-9" fill="var(--rose)" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
    <circle cx="16" cy="13" r="8.5" fill="var(--highlight)" stroke={INK} strokeWidth="2.4" />
    <path d="M12.5 13l2.5 2.5 4.5-5" stroke={INK} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Doodle>
);

export const DoodleMailIcon = (p: IconProps) => (
  <Doodle {...p}>
    <rect x="4" y="8" width="24" height="17" rx="3" fill="var(--mint)" stroke={INK} strokeWidth="2.4" />
    <path d="M5 10l11 8 11-8" stroke={INK} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Doodle>
);

export const DoodleLockIcon = (p: IconProps) => (
  <Doodle {...p}>
    <rect x="6" y="14" width="20" height="14" rx="3" fill="var(--highlight)" stroke={INK} strokeWidth="2.4" />
    <path d="M10.5 14V10a5.5 5.5 0 0 1 11 0v4" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
    <circle cx="16" cy="20.5" r="1.8" fill={INK} />
    <path d="M16 22v2.5" stroke={INK} strokeWidth="2" strokeLinecap="round" />
  </Doodle>
);
