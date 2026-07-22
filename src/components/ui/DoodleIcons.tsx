'use client';

import React from 'react';

export interface DoodleIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

// 1. DoodleHomeIcon: Cozy house with pencil roof & star doodle
export function DoodleHomeIcon({ className = 'w-6 h-6', size, ...props }: DoodleIconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block transition-transform hover:scale-110 active:scale-95 duration-200 ${className}`}
      style={size ? { width: size, height: size } : undefined}
      {...props}
    >
      {/* Pastel Wall Fill */}
      <path
        d="M7 14.5 L7 27 C7 27.8 7.6 28.5 8.5 28.5 L23.5 28.5 C24.4 28.5 25 27.8 25 27 L25 14.5 Z"
        fill="#bae6fd"
      />
      {/* Pastel Roof Fill */}
      <path
        d="M4.5 14 L16 4.5 L27.5 14 Z"
        fill="#fef08a"
      />
      {/* Door Fill */}
      <path
        d="M13 28.5 L13 20 C13 19.2 13.7 18.5 14.5 18.5 L17.5 18.5 C18.3 18.5 19 19.2 19 20 L19 28.5 Z"
        fill="#ddd6fe"
      />
      {/* Main Bold Dark Strokes */}
      {/* Roof */}
      <path
        d="M4 14.5 L15.5 4.5 C15.8 4.2 16.2 4.2 16.5 4.5 L28 14.5"
        stroke="#2d2a26"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.5 13.8 L16 4.8 L26.5 13.8"
        stroke="#ffffff"
        strokeWidth="1"
        strokeDasharray="4 3"
        strokeLinecap="round"
        strokeOpacity="0.7"
      />
      {/* House Body */}
      <path
        d="M7 13.5 L7 27 C7 27.8 7.7 28.5 8.5 28.5 L23.5 28.5 C24.3 28.5 25 27.8 25 27 L25 13.5"
        stroke="#2d2a26"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Door Outline */}
      <path
        d="M13.5 28.5 L13.5 20 C13.5 19.2 14.1 18.5 15 18.5 L17 18.5 C17.9 18.5 18.5 19.2 18.5 20 L18.5 28.5"
        stroke="#2d2a26"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Window Window pane */}
      <rect
        x="9.5"
        y="16.5"
        width="2.5"
        height="3"
        rx="0.5"
        fill="#fef08a"
        stroke="#2d2a26"
        strokeWidth="1.5"
      />
      {/* Star Doodle in Roof */}
      <path
        d="M16 7 L16.6 8.8 L18.5 8.8 L17 10 L17.5 11.8 L16 10.7 L14.5 11.8 L15 10 L13.5 8.8 L15.4 8.8 Z"
        fill="#fde047"
        stroke="#2d2a26"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// 2. DoodleFolderIcon: Folder with lined paper sheet slipping out
export function DoodleFolderIcon({ className = 'w-6 h-6', size, ...props }: DoodleIconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block transition-transform hover:scale-110 active:scale-95 duration-200 ${className}`}
      style={size ? { width: size, height: size } : undefined}
      {...props}
    >
      {/* Back Folder Fill */}
      <path
        d="M4.5 10 C4.5 8.6 5.6 7.5 7 7.5 L12 7.5 L14.5 10 C14.9 10.4 15.4 10.5 16 10.5 L25 10.5 C26.4 10.5 27.5 11.6 27.5 13 L27.5 25.5 C27.5 26.9 26.4 28 25 28 L7 28 C5.6 28 4.5 26.9 4.5 25.5 Z"
        fill="#fed7aa"
      />
      {/* Lined Paper Sheet inside */}
      <rect
        x="9"
        y="6"
        width="14"
        height="16"
        rx="1.5"
        fill="#ffffff"
        stroke="#2d2a26"
        strokeWidth="1.8"
        transform="rotate(-5 16 14)"
      />
      {/* Lines on paper */}
      <path
        d="M12 10 L20 9M11.5 13 L19.5 12M11 16 L18 15"
        stroke="#94a3b8"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Front Folder Pocket Fill */}
      <path
        d="M4 14 C4 12.8 5 11.8 6.2 11.8 L25.8 11.8 C27 11.8 28 12.8 28 14 L27.2 25.5 C27.1 26.6 26.1 27.5 25 27.5 L7 27.5 C5.9 27.5 4.9 26.6 4.8 25.5 Z"
        fill="#fef08a"
      />
      {/* Bold Dark Outlines */}
      <path
        d="M4.5 14 L4.5 10 C4.5 8.6 5.6 7.5 7 7.5 L11.8 7.5 L14.2 10 L25 10 C26.4 10 27.5 11.1 27.5 12.5 L27.5 14"
        stroke="#2d2a26"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 13.5 C4 12.4 4.9 11.5 6 11.5 L26 11.5 C27.1 11.5 28 12.4 28 13.5 L27.2 25.8 C27.1 26.8 26.1 27.5 25 27.5 L7 27.5 C5.9 27.5 4.9 26.8 4.8 25.8 Z"
        stroke="#2d2a26"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Sketchy Pencil Hatching */}
      <path
        d="M7 16 L12 21M17 16 L22 21"
        stroke="#2d2a26"
        strokeWidth="1"
        strokeLinecap="round"
        strokeOpacity="0.3"
      />
    </svg>
  );
}

// 3. DoodleTerminalIcon: Retro CRT computer screen doodle
export function DoodleTerminalIcon({ className = 'w-6 h-6', size, ...props }: DoodleIconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block transition-transform hover:scale-110 active:scale-95 duration-200 ${className}`}
      style={size ? { width: size, height: size } : undefined}
      {...props}
    >
      {/* Screen Monitor Body Fill */}
      <rect
        x="4"
        y="5"
        width="24"
        height="18"
        rx="3"
        fill="#a7f3d0"
      />
      {/* Stand Base Fill */}
      <path
        d="M12 23 L20 23 L22 27.5 L10 27.5 Z"
        fill="#ddd6fe"
      />
      {/* Monitor Outer Stroke */}
      <rect
        x="4"
        y="5"
        width="24"
        height="18"
        rx="3"
        stroke="#2d2a26"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Screen Inner Bezel */}
      <rect
        x="7"
        y="8"
        width="18"
        height="12"
        rx="1.5"
        fill="#0f172a"
        stroke="#2d2a26"
        strokeWidth="1.8"
      />
      {/* Terminal Prompt `>_` doodle */}
      <path
        d="M10 11.5 L13 14 L10 16.5"
        stroke="#4ade80"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="15"
        y1="16.5"
        x2="19"
        y2="16.5"
        stroke="#4ade80"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Stand Base Stroke */}
      <path
        d="M13 23 L11 27.5 L21 27.5 L19 23"
        stroke="#2d2a26"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Bottom Feet */}
      <path
        d="M9 28.5 L23 28.5"
        stroke="#2d2a26"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Antenna doodle */}
      <path
        d="M12 5 L9 2M16 5 L16 1.5"
        stroke="#2d2a26"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="8.5" cy="2" r="1.2" fill="#fef08a" stroke="#2d2a26" strokeWidth="1" />
      <circle cx="16" cy="1.5" r="1.2" fill="#fbcfe8" stroke="#2d2a26" strokeWidth="1" />
    </svg>
  );
}

// 4. DoodleSettingsIcon: Sketchy gear wheel
export function DoodleSettingsIcon({ className = 'w-6 h-6', size, ...props }: DoodleIconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block transition-transform hover:scale-110 active:scale-95 duration-200 ${className}`}
      style={size ? { width: size, height: size } : undefined}
      {...props}
    >
      {/* Gear Body Fill */}
      <circle cx="16" cy="16" r="9" fill="#ddd6fe" />
      {/* Gear Outer Teeth & Body Path */}
      <path
        d="M14 3.5 L18 3.5 L18.7 6.2 C19.6 6.5 20.4 7 21.2 7.6 L23.8 6 C24.8 7 25.8 8.1 26.5 9.3 L25.2 11.9 C25.7 12.7 26.1 13.6 26.3 14.5 L29 15.5 L29 19.5 L26.3 20.5 C26.1 21.4 25.7 22.3 25.2 23.1 L26.5 25.7 C25.8 26.9 24.8 28 23.8 29 L21.2 27.4 C20.4 28 19.6 28.5 18.7 28.8 L18 31.5 L14 31.5 L13.3 28.8 C12.4 28.5 11.6 28 10.8 27.4 L8.2 29 C7.2 28 6.2 26.9 5.5 25.7 L6.8 23.1 C6.3 22.3 5.9 21.4 5.7 20.5 L3 19.5 L3 15.5 L5.7 14.5 C5.9 13.6 6.3 12.7 6.8 11.9 L5.5 9.3 C6.2 8.1 7.2 7 8.2 6 L10.8 7.6 C11.6 7 12.4 6.5 13.3 6.2 Z"
        fill="#ddd6fe"
        stroke="#2d2a26"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Center Hole */}
      <circle cx="16" cy="16" r="4.2" fill="#ffffff" stroke="#2d2a26" strokeWidth="2.2" />
      {/* Sketchy lines inside */}
      <path
        d="M16 7.5 L16 11.5M16 20.5 L16 24.5M7.5 16 L11.5 16M20.5 16 L24.5 16"
        stroke="#2d2a26"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.5"
      />
    </svg>
  );
}

// 5. DoodleBioIcon: Notebook & pencil doodle
export function DoodleBioIcon({ className = 'w-6 h-6', size, ...props }: DoodleIconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block transition-transform hover:scale-110 active:scale-95 duration-200 ${className}`}
      style={size ? { width: size, height: size } : undefined}
      {...props}
    >
      {/* Notebook Cover Fill */}
      <rect
        x="6"
        y="4"
        width="18"
        height="24"
        rx="2.5"
        fill="#fbcfe8"
      />
      {/* Notebook Outline */}
      <rect
        x="6"
        y="4"
        width="18"
        height="24"
        rx="2.5"
        stroke="#2d2a26"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Spiral Rings */}
      <path
        d="M4 7.5 L8 7.5M4 12.5 L8 12.5M4 17.5 L8 17.5M4 22.5 L8 22.5"
        stroke="#2d2a26"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Text Lines */}
      <path
        d="M11 9 L20 9M11 13 L19 13M11 17 L17 17"
        stroke="#2d2a26"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeDasharray="6 2"
      />
      {/* Pencil Fill & Outline */}
      <g transform="rotate(30 22 20)">
        <rect x="20" y="8" width="5" height="16" rx="1" fill="#fef08a" stroke="#2d2a26" strokeWidth="1.8" />
        <path d="M20 8 L22.5 3 L25 8 Z" fill="#fed7aa" stroke="#2d2a26" strokeWidth="1.5" />
        <path d="M21.5 5 L22.5 3 L23.5 5 Z" fill="#2d2a26" />
        <rect x="20" y="21" width="5" height="3" fill="#fecdd3" stroke="#2d2a26" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

// 6. DoodlePetIcon: Magic wand & star sparkle doodle (Frieren style)
export function DoodlePetIcon({ className = 'w-6 h-6', size, ...props }: DoodleIconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block transition-transform hover:scale-110 active:scale-95 duration-200 ${className}`}
      style={size ? { width: size, height: size } : undefined}
      {...props}
    >
      {/* Magic Star Fill */}
      <path
        d="M10.5 4.5 L12.5 9.5 L17.5 10.5 L13.5 14 L14.5 19 L10.5 16.5 L6.5 19 L7.5 14 L3.5 10.5 L8.5 9.5 Z"
        fill="#fef08a"
        stroke="#2d2a26"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Wand Shaft */}
      <path
        d="M12 15 L26 29"
        stroke="#ddd6fe"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M12 15 L26 29"
        stroke="#2d2a26"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Wand Tip Gem */}
      <circle cx="26" cy="29" r="2.5" fill="#fbcfe8" stroke="#2d2a26" strokeWidth="1.8" />
      {/* Sparkles around */}
      <path
        d="M21 7 L23 7M22 6 L22 8"
        stroke="#2d2a26"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M5 23 L7 23M6 22 L6 24"
        stroke="#2d2a26"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="20" cy="14" r="1.5" fill="#bae6fd" stroke="#2d2a26" strokeWidth="1" />
    </svg>
  );
}

// 7. DoodleAdminIcon: Shield & key doodle
export function DoodleAdminIcon({ className = 'w-6 h-6', size, ...props }: DoodleIconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block transition-transform hover:scale-110 active:scale-95 duration-200 ${className}`}
      style={size ? { width: size, height: size } : undefined}
      {...props}
    >
      {/* Shield Body Fill */}
      <path
        d="M16 4 L6 8 L6 16 C6 22.5 11 27.5 16 29 C21 27.5 26 22.5 26 16 L26 8 Z"
        fill="#fecdd3"
      />
      {/* Shield Main Stroke */}
      <path
        d="M16 4 L6 8 L6 16 C6 22.5 11 27.5 16 29 C21 27.5 26 22.5 26 16 L26 8 Z"
        stroke="#2d2a26"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Key Fill & Stroke */}
      <circle cx="16" cy="12" r="3.5" fill="#fef08a" stroke="#2d2a26" strokeWidth="2" />
      <path
        d="M16 15.5 L16 24M16 20 L19 20M16 22.5 L18 22.5"
        stroke="#2d2a26"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// 8. DoodleProjectorIcon: Camera film reel / projector doodle
export function DoodleProjectorIcon({ className = 'w-6 h-6', size, ...props }: DoodleIconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block transition-transform hover:scale-110 active:scale-95 duration-200 ${className}`}
      style={size ? { width: size, height: size } : undefined}
      {...props}
    >
      {/* Projector Body Fill */}
      <rect
        x="4"
        y="14"
        width="18"
        height="12"
        rx="2.5"
        fill="#bae6fd"
        stroke="#2d2a26"
        strokeWidth="2.5"
      />
      {/* Lens Fill & Stroke */}
      <path
        d="M22 17 L28 14 L28 26 L22 23 Z"
        fill="#fde047"
        stroke="#2d2a26"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Top Reel Wheels */}
      <circle cx="9" cy="9" r="4.5" fill="#ddd6fe" stroke="#2d2a26" strokeWidth="2" />
      <circle cx="9" cy="9" r="1.5" fill="#2d2a26" />
      <circle cx="17" cy="9" r="4.5" fill="#ddd6fe" stroke="#2d2a26" strokeWidth="2" />
      <circle cx="17" cy="9" r="1.5" fill="#2d2a26" />
      {/* Light Rays */}
      <path
        d="M29 16 L31 15M29 20 L31.5 20M29 24 L31 25"
        stroke="#fef08a"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// 9. DoodleWidgetsIcon: 4-grid window layout doodle
export function DoodleWidgetsIcon({ className = 'w-6 h-6', size, ...props }: DoodleIconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block transition-transform hover:scale-110 active:scale-95 duration-200 ${className}`}
      style={size ? { width: size, height: size } : undefined}
      {...props}
    >
      {/* Top Left Tile */}
      <rect x="5" y="5" width="10" height="10" rx="2" fill="#bae6fd" stroke="#2d2a26" strokeWidth="2.2" />
      {/* Top Right Tile */}
      <rect x="17" y="5" width="10" height="10" rx="2" fill="#a7f3d0" stroke="#2d2a26" strokeWidth="2.2" />
      {/* Bottom Left Tile */}
      <rect x="5" y="17" width="10" height="10" rx="2" fill="#fbcfe8" stroke="#2d2a26" strokeWidth="2.2" />
      {/* Bottom Right Tile */}
      <rect x="17" y="17" width="10" height="10" rx="2" fill="#fef08a" stroke="#2d2a26" strokeWidth="2.2" />
      {/* Inner doodle details */}
      <circle cx="10" cy="10" r="2" fill="#ffffff" stroke="#2d2a26" strokeWidth="1" />
      <path d="M20 8 L24 8M20 11 L23 11" stroke="#2d2a26" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M8 20 L12 24" stroke="#2d2a26" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M20 20 L24 20 L22 24 Z" fill="#ffffff" stroke="#2d2a26" strokeWidth="1" />
    </svg>
  );
}

// 10. DoodleSearchIcon: Magnifying glass doodle with glass shine
export function DoodleSearchIcon({ className = 'w-6 h-6', size, ...props }: DoodleIconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block transition-transform hover:scale-110 active:scale-95 duration-200 ${className}`}
      style={size ? { width: size, height: size } : undefined}
      {...props}
    >
      {/* Glass Lens Fill */}
      <circle cx="14" cy="14" r="8.5" fill="#bae6fd" />
      {/* Lens Outer Stroke */}
      <circle cx="14" cy="14" r="8.5" stroke="#2d2a26" strokeWidth="2.5" />
      {/* Glass Shine */}
      <path
        d="M10 10 C11.5 8.5 14.5 8.5 16 10"
        stroke="#ffffff"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Handle Fill & Stroke */}
      <path
        d="M20 20 L27.5 27.5"
        stroke="#fed7aa"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M20 20 L27.5 27.5"
        stroke="#2d2a26"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Handle grip lines */}
      <path
        d="M23 23 L24.5 24.5"
        stroke="#2d2a26"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// 11. DoodleEditPencilIcon: Pencil doodle
export function DoodleEditPencilIcon({ className = 'w-6 h-6', size, ...props }: DoodleIconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block transition-transform hover:scale-110 active:scale-95 duration-200 ${className}`}
      style={size ? { width: size, height: size } : undefined}
      {...props}
    >
      <g transform="rotate(-45 16 16)">
        {/* Body */}
        <rect x="13" y="6" width="6" height="18" fill="#fef08a" stroke="#2d2a26" strokeWidth="2" />
        {/* Tip wood */}
        <path d="M13 24 L16 29 L19 24 Z" fill="#fed7aa" stroke="#2d2a26" strokeWidth="2" strokeLinejoin="round" />
        {/* Lead */}
        <path d="M14.5 26.5 L16 29 L17.5 26.5 Z" fill="#2d2a26" />
        {/* Eraser */}
        <rect x="13" y="2" width="6" height="4" rx="1" fill="#fecdd3" stroke="#2d2a26" strokeWidth="2" />
        {/* Metal band */}
        <line x1="13" y1="6" x2="19" y2="6" stroke="#2d2a26" strokeWidth="2" />
      </g>
    </svg>
  );
}

// 12. DoodleTrashIcon: Trash bin doodle with lid
export function DoodleTrashIcon({ className = 'w-6 h-6', size, ...props }: DoodleIconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block transition-transform hover:scale-110 active:scale-95 duration-200 ${className}`}
      style={size ? { width: size, height: size } : undefined}
      {...props}
    >
      {/* Bin Body Fill */}
      <path
        d="M8 11 L9.5 26.5 C9.7 27.9 10.9 29 12.3 29 L19.7 29 C21.1 29 22.3 27.9 22.5 26.5 L24 11 Z"
        fill="#fbcfe8"
      />
      {/* Bin Body Stroke */}
      <path
        d="M8 11 L9.5 26.5 C9.7 27.9 10.9 29 12.3 29 L19.7 29 C21.1 29 22.3 27.9 22.5 26.5 L24 11 Z"
        stroke="#2d2a26"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Bin Vertical Rib Lines */}
      <path
        d="M12 15 L12.5 25M16 15 L16 25M20 15 L19.5 25"
        stroke="#2d2a26"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Bin Lid Rim Fill & Stroke */}
      <rect x="6" y="8" width="20" height="3" rx="1.5" fill="#fed7aa" stroke="#2d2a26" strokeWidth="2.2" />
      {/* Lid Handle */}
      <path
        d="M13 8 L13 5.5 C13 4.7 13.7 4 14.5 4 L17.5 4 C18.3 4 19 4.7 19 5.5 L19 8"
        stroke="#2d2a26"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// 13. DoodleLinkIcon: Interlocking chain link doodle
export function DoodleLinkIcon({ className = 'w-6 h-6', size, ...props }: DoodleIconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block transition-transform hover:scale-110 active:scale-95 duration-200 ${className}`}
      style={size ? { width: size, height: size } : undefined}
      {...props}
    >
      {/* Link 1 Fill & Stroke */}
      <rect
        x="6"
        y="12"
        width="14"
        height="8"
        rx="4"
        fill="#bae6fd"
        stroke="#2d2a26"
        strokeWidth="2.5"
        transform="rotate(-45 13 16)"
      />
      {/* Link 2 Fill & Stroke */}
      <rect
        x="12"
        y="12"
        width="14"
        height="8"
        rx="4"
        fill="#ddd6fe"
        stroke="#2d2a26"
        strokeWidth="2.5"
        transform="rotate(-45 19 16)"
      />
      {/* Interlocking Overlap Line */}
      <path
        d="M13.5 13.5 L18.5 18.5"
        stroke="#2d2a26"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
