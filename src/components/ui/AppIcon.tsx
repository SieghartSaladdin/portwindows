'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';
import { useOSStore, type DesktopIconSize } from '@/lib/store';
import type { DesktopIcon } from '@/lib/data';
import { profileLinkUrl, openExternal } from '@/hooks/useProfileLinks';
import { cx } from '@/components/ui/primitives';
import {
  DoodleBioIcon,
  DoodleFolderIcon,
  DoodleTerminalIcon,
  DoodleSettingsIcon,
  DoodlePetIcon,
  DoodleLinkIcon,
  DoodleAdminIcon,
} from '@/components/ui/DoodleIcons';

interface AppIconProps {
  icon: DesktopIcon;
  size?: DesktopIconSize;
}

const SIZE_STYLES: Record<DesktopIconSize, { box: string; glyph: string; label: string }> = {
  small: { box: 'w-20 min-h-[76px] gap-1', glyph: 'w-8 h-8', label: 'text-2xs' },
  medium: { box: 'w-24 min-h-[92px] gap-1.5', glyph: 'w-11 h-11', label: 'text-xs' },
  large: { box: 'w-28 min-h-[112px] gap-2', glyph: 'w-14 h-14', label: 'text-sm' },
};

function renderGlyph(icon: DesktopIcon, className: string) {
  switch (icon.iconType) {
    case 'notepad':
      return <DoodleBioIcon className={className} />;
    case 'folder':
      return <DoodleFolderIcon className={className} />;
    case 'terminal':
      return <DoodleTerminalIcon className={className} />;
    case 'settings':
      return <DoodleSettingsIcon className={className} />;
    case 'game':
      return <DoodlePetIcon className={className} />;
    case 'browser':
    default:
      if (icon.id === 'admin') return <DoodleAdminIcon className={className} />;
      return <DoodleLinkIcon className={className} />;
  }
}

/**
 * Desktop shortcut. Mouse: click selects, double-click opens. Touch: a single tap opens.
 * Keyboard: Enter / Space opens (arrow-key navigation is handled by the Desktop grid).
 */
export function AppIcon({ icon, size = 'medium' }: AppIconProps) {
  const openWindow = useOSStore((s) => s.openWindow);
  const profile = useOSStore((s) => s.profile);
  const styles = SIZE_STYLES[size];
  const isLink = icon.action === 'openLink';

  const handleAction = () => {
    if (icon.action === 'openApp' && icon.appId) {
      openWindow(icon.appId, icon.title);
    } else if (isLink && icon.profileLink) {
      const url = profileLinkUrl(profile, icon.profileLink);
      if (url) openExternal(url);
    }
  };

  return (
    <button
      type="button"
      data-desktop-icon
      aria-label={isLink ? `${icon.title} (opens in a new tab)` : `Open ${icon.title}`}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => {
        // Touch devices have no double-click: a single tap opens.
        if (e.pointerType === 'touch') handleAction();
      }}
      onClick={(e) => {
        e.stopPropagation();
        // detail === 0 means keyboard activation (Enter / Space)
        if (e.detail === 0) handleAction();
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        handleAction();
      }}
      className={cx(
        'group relative flex flex-col items-center justify-start p-2 rounded-2xl border-2 border-transparent font-doodle cursor-pointer select-none',
        'transition-all duration-150 outline-none',
        'hover:border-dashed hover:border-line hover:bg-surface/40',
        'focus:bg-surface/90 focus:border-solid focus:border-line focus:shadow-doodle-md',
        'focus-visible:outline-[2.5px] focus-visible:outline-dashed focus-visible:outline-line focus-visible:outline-offset-2',
        styles.box,
      )}
    >
      <span className="relative flex items-center justify-center">
        {renderGlyph(icon, cx(styles.glyph, 'transition-transform group-hover:scale-110 select-none'))}
        {isLink && (
          <ExternalLink
            aria-hidden
            className="absolute -bottom-1 -right-1 w-4 h-4 text-ink bg-highlight rounded-full p-[1px] border border-ink"
          />
        )}
      </span>

      <span
        className={cx(
          'leading-tight text-center font-bold tracking-tight max-w-full px-2 py-0.5 rounded-lg truncate transition-all',
          'text-fg bg-surface-2 border-2 border-line shadow-doodle-sm',
          'group-hover:bg-highlight group-hover:text-ink group-hover:border-ink',
          'group-focus:bg-highlight group-focus:text-ink group-focus:border-ink',
          styles.label,
        )}
      >
        {icon.title}
      </span>
    </button>
  );
}
