import { useState, useEffect, useCallback } from 'react';

interface ContextMenuPosition {
  x: number;
  y: number;
}

export function useContextMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<ContextMenuPosition>({ x: 0, y: 0 });

  const handleContextMenu = useCallback((e: MouseEvent) => {
    e.preventDefault();
    
    const menuWidth = 240;
    const menuHeight = 220;
    
    let x = e.clientX;
    let y = e.clientY;
    
    // Clamp to prevent screen overflow
    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth - 10;
    }
    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight - 10;
    }
    
    setPosition({ x, y });
    setIsOpen(true);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    // Left click anywhere closes the context menu
    const handleOutsideClick = () => {
      if (isOpen) closeMenu();
    };

    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isOpen, closeMenu]);

  return {
    isOpen,
    position,
    handleContextMenu,
    closeMenu,
  };
}
