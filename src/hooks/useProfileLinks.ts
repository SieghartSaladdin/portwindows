import { useMemo } from 'react';
import { useOSStore } from '@/lib/store';
import { EMPTY_PROFILE } from '@/lib/data';
import type { Profile } from '@/lib/types';

export type ProfileLinkField = 'githubUrl' | 'linkedinUrl' | 'websiteUrl';

export interface ProfileLink {
  id: 'github' | 'linkedin' | 'website';
  field: ProfileLinkField;
  label: string;
  url: string;
}

const LINK_FIELDS: Array<{ id: ProfileLink['id']; field: ProfileLinkField; label: string }> = [
  { id: 'github', field: 'githubUrl', label: 'GitHub' },
  { id: 'linkedin', field: 'linkedinUrl', label: 'LinkedIn' },
  { id: 'website', field: 'websiteUrl', label: 'Website' },
];

/** Returns the URL stored in a profile link field, or null when it is empty / not http(s). */
export function profileLinkUrl(profile: Profile | null | undefined, field: ProfileLinkField): string | null {
  const raw = profile?.[field]?.trim();
  if (!raw) return null;
  return /^https?:\/\//i.test(raw) ? raw : null;
}

/** Only the links actually present in the profile — never a bare fallback URL. */
export function getProfileLinks(profile: Profile | null | undefined): ProfileLink[] {
  return LINK_FIELDS.flatMap(({ id, field, label }) => {
    const url = profileLinkUrl(profile, field);
    return url ? [{ id, field, label, url }] : [];
  });
}

export function useProfileLinks(): ProfileLink[] {
  const profile = useOSStore((s) => s.profile);
  return useMemo(() => getProfileLinks(profile), [profile]);
}

/** True while the profile is still the neutral placeholder (not loaded or never filled in). */
export function isPlaceholderProfile(profile: Profile | null | undefined) {
  return !profile || !profile.name || profile.name === EMPTY_PROFILE.name;
}

export function openExternal(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer');
}
