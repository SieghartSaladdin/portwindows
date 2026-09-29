import { useState, useEffect, useCallback } from 'react';

interface ContextMenuPosition {
  x: number;
  y: number;
}

/** Must match the rendered menu: ContextMenu is `w-64` (256px). Height is an upper bound. */
export const CONTEXT_MENU_WIDTH = 256;
export const CONTEXT_MENU_HEIGHT = 330;
const EDGE_GAP = 8;

export function useContextMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<ContextMenuPosition>({ x: 0, y: 0 });

  const handleContextMenu = useCallback((e: MouseEvent) => {
    e.preventDefault();

    const maxX = window.innerWidth - CONTEXT_MENU_WIDTH - EDGE_GAP;
    const maxY = window.innerHeight - CONTEXT_MENU_HEIGHT - EDGE_GAP;

    // Clamp so the whole menu stays on screen (and never goes negative on tiny viewports)
    const x = Math.max(EDGE_GAP, Math.min(e.clientX, maxX));
    const y = Math.max(EDGE_GAP, Math.min(e.clientY, maxY));

    setPosition({ x, y });
    setIsOpen(true);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    // Left click anywhere or Escape closes the context menu
    const handleOutsideClick = () => closeMenu();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };

    document.addEventListener('click', handleOutsideClick);
    window.addEventListener('keydown', handleKey);
    window.addEventListener('resize', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('resize', handleOutsideClick);
    };
  }, [isOpen, closeMenu]);

  return {
    isOpen,
    position,
    handleContextMenu,
    closeMenu,
  };
}
