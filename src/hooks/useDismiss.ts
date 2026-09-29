import { useEffect, type RefObject } from 'react';

/**
 * Closes a floating panel on Escape or on a pointer-down outside of it.
 * `ignoreSelector` matches the trigger button(s), so clicking the trigger toggles instead of re-opening.
 */
export function useDismiss(
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  onClose: () => void,
  ignoreSelector?: string,
) {
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target || ref.current?.contains(target)) return;
      if (ignoreSelector && target.closest(ignoreSelector)) return;
      // Clicks inside dialogs (e.g. a confirm opened from the panel) should not close it
      if (target.closest('[role="dialog"]')) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [ref, open, onClose, ignoreSelector]);
}
