'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useOSStore } from '@/lib/store';
import { Save, RefreshCw } from 'lucide-react';

export function BioApp() {
  const { profile, setProfile } = useOSStore();
  const [content, setContent] = useState('');
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [isModified, setIsModified] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [fileMenuOpen, setFileMenuOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync content with store profile bio on load
  useEffect(() => {
    if (profile?.bio) {
      setContent(profile.bio);
      setIsModified(false);
    }
  }, [profile?.bio]);

  // Handle Ctrl+S keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if this window is open/focused (you can check active element or let it be global)
      // Usually, it's safer to only listen if the active element is inside the Notepad container
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        const active = document.activeElement;
        if (active && textareaRef.current && textareaRef.current.contains(active)) {
          e.preventDefault();
          handleSave();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, profile]);

  const handleSave = async () => {
    if (!profile) return;
    setSaveStatus('saving');
    try {
      const updatedProfile = {
        ...profile,
        bio: content,
      };

      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers,
        body: JSON.stringify(updatedProfile),
      });

      if (!res.ok) throw new Error('API failed to save');
      const data = await res.json();
      setProfile(data);
      setIsModified(false);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (error) {
      console.error('Failed to save bio:', error);
      // Fallback: save to store locally
      setProfile({
        ...profile,
        bio: content,
      });
      setIsModified(false);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsModified(true);
    updateCursorPos(e.target);
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
    <div className="flex flex-col h-full bg-zinc-950/70 text-slate-100 font-mono text-sm leading-relaxed select-text relative">
      {/* Mock Editor Menu */}
      <div className="flex justify-between items-center px-3 py-1 bg-black/20 border-b border-white/5 text-xs text-slate-400 select-none">
        <div className="flex gap-4">
          <div className="relative">
            <span 
              onClick={() => setFileMenuOpen(!fileMenuOpen)}
              className="hover:text-white cursor-default transition px-1.5 py-0.5 rounded hover:bg-white/5 active:bg-white/10"
            >
              File
            </span>
            {fileMenuOpen && (
              <div 
                className="absolute left-0 mt-1.5 w-40 bg-zinc-900 border border-white/15 rounded-lg shadow-xl z-50 py-1 flex flex-col"
                onMouseLeave={() => setFileMenuOpen(false)}
              >
                <button
                  onClick={() => {
                    handleSave();
                    setFileMenuOpen(false);
                  }}
                  className="flex items-center justify-between px-3 py-1.5 text-left text-xs hover:bg-white/10 text-slate-200 hover:text-white cursor-default"
                >
                  <span>Save</span>
                  <span className="text-[10px] text-slate-500 font-sans">Ctrl+S</span>
                </button>
                <button
                  onClick={() => {
                    if (profile?.bio) setContent(profile.bio);
                    setIsModified(false);
                    setFileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-white/10 text-slate-200 hover:text-white cursor-default"
                >
                  <span>Revert changes</span>
                </button>
              </div>
            )}
          </div>
          <span className="hover:text-white cursor-default transition px-1.5 py-0.5 rounded hover:bg-white/5">Edit</span>
          <span className="hover:text-white cursor-default transition px-1.5 py-0.5 rounded hover:bg-white/5">Format</span>
          <span className="hover:text-white cursor-default transition px-1.5 py-0.5 rounded hover:bg-white/5">View</span>
        </div>

        {/* Toolbar controls */}
        <div className="flex items-center gap-3">
          {isModified && (
            <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
              Unsaved changes
            </span>
          )}
          
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/10 hover:text-white active:bg-white/15 text-slate-300 disabled:opacity-50 transition cursor-default"
            title="Save file (Ctrl+S)"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="text-[11px] font-sans">Save</span>
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 p-3 overflow-hidden flex flex-col bg-transparent">
        {/* Header Metadata Display */}
        <div className="mb-4 border-b border-white/5 pb-3 shrink-0 select-none">
          <h1 className="text-lg font-bold text-emerald-400 font-sans tracking-wide">
            {profile?.name || 'Developer Bio'}
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            {profile?.title || 'Senior Developer'} | {profile?.location || 'Earth'}
          </p>
        </div>

        {/* Editable Biography */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleTextareaChange}
          onSelect={handleSelect}
          onKeyUp={handleKeyUp}
          placeholder="Write biography here..."
          className="flex-1 w-full bg-transparent resize-none border-none outline-none focus:ring-0 leading-relaxed font-mono select-text text-sm border-0 focus:outline-none focus:ring-offset-0 focus:border-0"
        />
      </div>

      {/* Status Bar */}
      <div className="flex justify-between items-center px-4 py-1 bg-black/30 border-t border-white/5 text-[10.5px] text-slate-400 select-none shrink-0 font-sans">
        <div>
          Ln {cursorPos.line}, Col {cursorPos.col}
        </div>
        <div className="flex gap-4">
          <span>
            {saveStatus === 'saving' && 'Saving...'}
            {saveStatus === 'saved' && '✓ Saved'}
            {saveStatus === 'error' && '⚠️ Save failed'}
            {saveStatus === 'idle' && ''}
          </span>
          <span>100%</span>
          <span>Windows (CRLF)</span>
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  );
}
