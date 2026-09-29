/**
 * Lets other apps (e.g. the Terminal's `view <n>`) ask the Projects explorer to
 * open a project's detail page, whether or not the Projects window is mounted.
 */

export const OPEN_PROJECT_EVENT = 'aura:open-project';

let pendingProjectId: string | null = null;

export function requestProjectDetail(id: string) {
  pendingProjectId = id;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent<string>(OPEN_PROJECT_EVENT, { detail: id }));
  }
}

/** Read (without clearing) the project requested before the explorer mounted. */
export function peekPendingProject(): string | null {
  return pendingProjectId;
}

export function clearPendingProject() {
  pendingProjectId = null;
}
