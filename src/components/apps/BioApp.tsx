'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useOSStore } from '@/lib/store';
import { Lock, Copy, Check } from 'lucide-react';

export function BioApp() {
  const { profile, themeMode } = useOSStore();
  const isDark = themeMode === 'dark';

  const [content, setContent] = useState('');
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [copied, setCopied] = useState(false);
  const [fileMenuOpen, setFileMenuOpen] = useState(false);
  const [editMenuOpen, setEditMenuOpen] = useState(false);
  const [formatMenuOpen, setFormatMenuOpen] = useState(false);
  const [viewMenuOpen, setViewMenuOpen] = useState(false);
  const [wordWrap, setWordWrap] = useState(true);
  const [fontSize, setFontSize] = useState(13);
  const [fontFamily, setFontFamily] = useState<'mono' | 'sans'>('mono');
  const [statusBarVisible, setStatusBarVisible] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync content with store profile bio on load
  useEffect(() => {
    if (profile?.bio) {
      setContent(profile.bio);
    }
  }, [profile?.bio]);

  const handleCopyAll = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const updateCursorPos = (element: HTMLTextAreaElement) => {
    const start = element.selectionStart;
    const textBefore = element.value.substring(0, start);
    const lines = textBefore.split('\n');
    const line = lines.length;
    const col = lines[lines.length - 1].length + 1;
    setCursorPos({ line, col });
  };

  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    updateCursorPos(e.currentTarget);
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    updateCursorPos(e.currentTarget);
  };

  return (
    <div className={`flex flex-col h-full font-mono text-sm leading-relaxed select-text relative p-4 gap-4 overflow-hidden ${
      isDark ? 'bg-[#18181b] text-slate-100' : 'bg-[#fdfbf7] text-[#2d2a26]'
    }`}>
      <div className={`flex-1 flex flex-col border-[2.5px] border-[#2d2a26] rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_#2d2a26] ${
        isDark ? 'bg-zinc-900/90 text-slate-100' : 'bg-[#fffdfa] text-[#2d2a26]'
      }`}>
        {/* Notepad Menu Bar */}
        <div className={`flex justify-between items-center px-4 py-2 border-b-2 border-[#2d2a26] text-xs select-none z-30 font-mono ${
          isDark ? 'bg-zinc-950 text-slate-400' : 'bg-[#fcf9f2] text-[#2d2a26]'
        }`}>
          <div className="flex gap-4">
            {/* File Menu */}
            <div className="relative">
              <span 
                onClick={() => {
                  setFileMenuOpen(!fileMenuOpen);
                  setEditMenuOpen(false);
                  setFormatMenuOpen(false);
                  setViewMenuOpen(false);
                }}
                className={`cursor-pointer transition px-2.5 py-1 rounded-lg border border-[#2d2a26] font-bold ${
                  fileMenuOpen 
                    ? 'bg-[#fef08a] text-[#2d2a26] shadow-[2px_2px_0px_0px_#2d2a26]' 
                    : isDark ? 'hover:bg-zinc-800 text-slate-300' : 'hover:bg-[#f5efe2] text-[#2d2a26]'
                }`}
              >
                File
              </span>
              {fileMenuOpen && (
                <div 
                  className={`absolute left-0 mt-2 w-44 border-2 border-[#2d2a26] rounded-xl shadow-[4px_4px_0px_0px_#2d2a26] z-50 py-1.5 flex flex-col font-mono ${
                    isDark ? 'bg-zinc-950 text-slate-200' : 'bg-[#fffdfa] text-[#2d2a26]'
                  }`}
                  onMouseLeave={() => setFileMenuOpen(false)}
                >
                  <button
                    onClick={() => {
                      handleCopyAll();
                      setFileMenuOpen(false);
                    }}
                    className={`flex items-center justify-between px-3 py-1.5 text-left text-xs font-bold cursor-pointer ${
                      isDark ? 'hover:bg-zinc-800 text-slate-200' : 'hover:bg-[#f5efe2] text-[#2d2a26]'
                    }`}
                  >
                    <span>Copy All</span>
                    <span className={`text-[10px] font-mono ${isDark ? 'text-slate-500' : 'text-zinc-600'}`}>Ctrl+C</span>
                  </button>
                </div>
              )}
            </div>

            {/* Edit Menu */}
            <div className="relative">
              <span 
                onClick={() => {
                  setEditMenuOpen(!editMenuOpen);
                  setFileMenuOpen(false);
                  setFormatMenuOpen(false);
                  setViewMenuOpen(false);
                }}
                className={`cursor-pointer transition px-2.5 py-1 rounded-lg border border-[#2d2a26] font-bold ${
                  editMenuOpen 
                    ? 'bg-[#fef08a] text-[#2d2a26] shadow-[2px_2px_0px_0px_#2d2a26]' 
                    : isDark ? 'hover:bg-zinc-800 text-slate-300' : 'hover:bg-[#f5efe2] text-[#2d2a26]'
                }`}
              >
                Edit
              </span>
              {editMenuOpen && (
                <div 
                  className={`absolute left-0 mt-2 w-44 border-2 border-[#2d2a26] rounded-xl shadow-[4px_4px_0px_0px_#2d2a26] z-50 py-1.5 flex flex-col font-mono ${
                    isDark ? 'bg-zinc-950 text-slate-200' : 'bg-[#fffdfa] text-[#2d2a26]'
                  }`}
                  onMouseLeave={() => setEditMenuOpen(false)}
                >
                  <button
                    onClick={() => {
                      handleCopyAll();
                      setEditMenuOpen(false);
                    }}
                    className={`px-3 py-1.5 text-left text-xs font-bold cursor-pointer ${
                      isDark ? 'hover:bg-zinc-800 text-slate-200' : 'hover:bg-[#f5efe2] text-[#2d2a26]'
                    }`}
                  >
                    <span>Copy Text</span>
                  </button>
                  <button
                    onClick={() => {
                      textareaRef.current?.focus();
                      textareaRef.current?.select();
                      setEditMenuOpen(false);
                    }}
                    className={`px-3 py-1.5 text-left text-xs font-bold cursor-pointer flex justify-between ${
                      isDark ? 'hover:bg-zinc-800 text-slate-200' : 'hover:bg-[#f5efe2] text-[#2d2a26]'
                    }`}
                  >
                    <span>Select All</span>
                    <span className={`text-[10px] font-mono ${isDark ? 'text-slate-500' : 'text-zinc-600'}`}>Ctrl+A</span>
                  </button>
                </div>
              )}
            </div>

            {/* Format Menu */}
            <div className="relative">
              <span 
                onClick={() => {
                  setFormatMenuOpen(!formatMenuOpen);
                  setFileMenuOpen(false);
                  setEditMenuOpen(false);
                  setViewMenuOpen(false);
                }}
                className={`cursor-pointer transition px-2.5 py-1 rounded-lg border border-[#2d2a26] font-bold ${
                  formatMenuOpen 
                    ? 'bg-[#fef08a] text-[#2d2a26] shadow-[2px_2px_0px_0px_#2d2a26]' 
                    : isDark ? 'hover:bg-zinc-800 text-slate-300' : 'hover:bg-[#f5efe2] text-[#2d2a26]'
                }`}
              >
                Format
              </span>
              {formatMenuOpen && (
                <div 
                  className={`absolute left-0 mt-2 w-52 border-2 border-[#2d2a26] rounded-xl shadow-[4px_4px_0px_0px_#2d2a26] z-50 py-1.5 flex flex-col font-mono ${
                    isDark ? 'bg-zinc-950 text-slate-200' : 'bg-[#fffdfa] text-[#2d2a26]'
                  }`}
                  onMouseLeave={() => setFormatMenuOpen(false)}
                >
                  <button
                    onClick={() => {
                      setWordWrap(!wordWrap);
                      setFormatMenuOpen(false);
                    }}
                    className={`px-3 py-1.5 text-left text-xs font-bold cursor-pointer flex items-center justify-between ${
                      isDark ? 'hover:bg-zinc-800 text-slate-200' : 'hover:bg-[#f5efe2] text-[#2d2a26]'
                    }`}
                  >
                    <span>Word Wrap</span>
                    <span className="text-[9px] bg-[#fef08a] text-[#2d2a26] px-1.5 py-0.5 rounded font-bold border border-[#2d2a26]">{wordWrap ? 'On' : 'Off'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setFontFamily(fontFamily === 'mono' ? 'sans' : 'mono');
                      setFormatMenuOpen(false);
                    }}
                    className={`px-3 py-1.5 text-left text-xs font-bold cursor-pointer flex items-center justify-between ${
                      isDark ? 'hover:bg-zinc-800 text-slate-200' : 'hover:bg-[#f5efe2] text-[#2d2a26]'
                    }`}
                  >
                    <span>Font: {fontFamily === 'mono' ? 'Courier' : 'Sans-Serif'}</span>
                  </button>
                  <div className="border-t border-[#2d2a26] my-1" />
                  <div className={`px-3 py-1 text-[10px] font-bold uppercase ${isDark ? 'text-slate-500' : 'text-zinc-600'}`}>Font Size</div>
                  <div className="flex gap-1.5 px-3 py-1">
                    {[12, 13, 15].map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                          setFontSize(size);
                          setFormatMenuOpen(false);
                        }}
                        className={`flex-1 py-1 rounded-lg border border-[#2d2a26] text-center text-[10px] cursor-pointer font-bold ${
                          fontSize === size ? 'bg-[#fef08a] text-[#2d2a26]' : isDark ? 'bg-zinc-900 text-slate-400' : 'bg-[#fcf9f2] text-[#2d2a26]'
                        }`}
                      >
                        {size === 12 && 'Small'}
                        {size === 13 && 'Med'}
                        {size === 15 && 'Large'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* View Menu */}
            <div className="relative">
              <span 
                onClick={() => {
                  setViewMenuOpen(!viewMenuOpen);
                  setFileMenuOpen(false);
                  setEditMenuOpen(false);
                  setFormatMenuOpen(false);
                }}
                className={`cursor-pointer transition px-2.5 py-1 rounded-lg border border-[#2d2a26] font-bold ${
                  viewMenuOpen 
                    ? 'bg-[#fef08a] text-[#2d2a26] shadow-[2px_2px_0px_0px_#2d2a26]' 
                    : isDark ? 'hover:bg-zinc-800 text-slate-300' : 'hover:bg-[#f5efe2] text-[#2d2a26]'
                }`}
              >
                View
              </span>
              {viewMenuOpen && (
                <div 
                  className={`absolute left-0 mt-2 w-44 border-2 border-[#2d2a26] rounded-xl shadow-[4px_4px_0px_0px_#2d2a26] z-50 py-1.5 flex flex-col font-mono ${
                    isDark ? 'bg-zinc-950 text-slate-200' : 'bg-[#fffdfa] text-[#2d2a26]'
                  }`}
                  onMouseLeave={() => setViewMenuOpen(false)}
                >
                  <button
                    onClick={() => {
                      setStatusBarVisible(!statusBarVisible);
                      setViewMenuOpen(false);
                    }}
                    className={`px-3 py-1.5 text-left text-xs font-bold cursor-pointer flex items-center justify-between ${
                      isDark ? 'hover:bg-zinc-800 text-slate-200' : 'hover:bg-[#f5efe2] text-[#2d2a26]'
                    }`}
                  >
                    <span>Status Bar</span>
                    <span className="text-[9px] bg-[#fef08a] text-[#2d2a26] px-1.5 py-0.5 rounded font-bold border border-[#2d2a26]">{statusBarVisible ? 'Show' : 'Hide'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Toolbar controls with Pastel Yellow Badge */}
          <div className="flex items-center gap-3">
            <span className="bg-[#fef08a] text-[#2d2a26] border-2 border-[#2d2a26] shadow-[2px_2px_0px_0px_#2d2a26] font-extrabold rounded-full px-3 py-0.5 text-xs flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-[#2d2a26]" />
              Bio Document
            </span>

            <button
              onClick={handleCopyAll}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-[#2d2a26] transition cursor-pointer font-mono text-xs shadow-[2px_2px_0px_0px_#2d2a26] font-bold ${
                isDark ? 'bg-zinc-900 hover:bg-zinc-800 text-slate-200' : 'bg-[#fffdfa] hover:bg-[#f5efe2] text-[#2d2a26]'
              }`}
              title="Copy all text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-amber-600" />}
              <span>{copied ? 'Tersalin!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Editor Content Area */}
        <div className="flex-1 p-5 overflow-hidden flex flex-col bg-transparent">
          {/* Header Metadata Display */}
          <div className="mb-4 border-b-2 border-[#2d2a26] pb-3 shrink-0 select-none flex items-center justify-between">
            <div>
              <h1 className={`text-lg font-extrabold font-mono tracking-wide flex items-center gap-2 ${
                isDark ? 'text-[#fef08a]' : 'text-[#2d2a26]'
              }`}>
                <span className="text-amber-500">✏</span> {profile?.name || 'Developer Bio'}
              </h1>
              <p className={`text-xs font-mono font-bold mt-0.5 ${
                isDark ? 'text-slate-400' : 'text-zinc-600'
              }`}>
                {profile?.title || 'Senior Developer'} | {profile?.location || 'Earth'}
              </p>
            </div>

            {/* Pastel Yellow Badge */}
            <span className="bg-[#fef08a] text-[#2d2a26] border-2 border-[#2d2a26] shadow-[2px_2px_0px_0px_#2d2a26] font-extrabold rounded-full px-3 py-0.5 text-xs">
              ✦ Notebook Text
            </span>
          </div>

          {/* Read-Only Biography Area */}
          <textarea
            ref={textareaRef}
            value={content}
            readOnly={true}
            onSelect={handleSelect}
            onKeyUp={handleKeyUp}
            placeholder="Biography content..."
            className={`flex-1 w-full border-none outline-none focus:ring-0 select-text leading-relaxed cursor-text p-4 border-[2.5px] border-[#2d2a26] rounded-xl shadow-[3px_3px_0px_0px_#2d2a26] font-bold
              ${isDark ? 'bg-zinc-950/60 text-slate-200' : 'bg-[#fcf9f2] text-[#2d2a26]'}
              ${wordWrap ? 'whitespace-pre-wrap' : 'whitespace-pre overflow-x-auto'}
              ${fontFamily === 'mono' ? 'font-mono' : 'font-sans'}
            `}
            style={{ fontSize: `${fontSize}px` }}
          />
        </div>

        {/* Status Bar */}
        {statusBarVisible && (
          <div className={`flex justify-between items-center px-4 py-1.5 border-t-2 border-[#2d2a26] text-[11px] font-mono select-none shrink-0 font-bold ${
            isDark ? 'bg-zinc-950 text-slate-400' : 'bg-[#fcf9f2] text-zinc-700'
          }`}>
            <div>
              Ln {cursorPos.line}, Col {cursorPos.col}
            </div>
            <div className="flex gap-6">
              <span>{content.length} characters</span>
              <span>100%</span>
              <span>Windows (CRLF)</span>
              <span>UTF-8</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
