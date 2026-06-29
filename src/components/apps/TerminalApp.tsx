'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useOSStore } from '@/lib/store';

interface ConsoleLine {
  text: string;
  type: 'input' | 'output' | 'error' | 'success';
}

const COMMAND_LIST = ['help', 'about', 'projects', 'skills', 'contact', 'clear', 'neofetch'];

export function TerminalApp() {
  const { profile, projects, skills } = useOSStore();
  const [history, setHistory] = useState<ConsoleLine[]>([
    { text: 'Microsoft Windows [Version 10.0.22621.1702]', type: 'output' },
    { text: '(c) Microsoft Corporation. All rights reserved.', type: 'output' },
    { text: '', type: 'output' },
    { text: 'Type "help" to see available portfolio commands.', type: 'success' },
    { text: '', type: 'output' },
  ]);
  const [inputVal, setInputVal] = useState('');
  
  // CLI Command History
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const tempInput = useRef('');

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  useEffect(() => {
    focusInput();
  }, []);

  const handleAutocomplete = () => {
    const query = inputVal.toLowerCase().trim();
    if (!query) return;
    const matches = COMMAND_LIST.filter(c => c.startsWith(query));
    if (matches.length > 0) {
      setInputVal(matches[0]);
    }
  };

  const handleHistoryUp = () => {
    if (cmdHistory.length === 0) return;
    let nextIdx = historyIdx;
    if (historyIdx === -1) {
      tempInput.current = inputVal;
      nextIdx = cmdHistory.length - 1;
    } else if (historyIdx > 0) {
      nextIdx = historyIdx - 1;
    }
    setHistoryIdx(nextIdx);
    setInputVal(cmdHistory[nextIdx]);
  };

  const handleHistoryDown = () => {
    if (historyIdx === -1) return;
    let nextIdx = historyIdx + 1;
    if (nextIdx >= cmdHistory.length) {
      setHistoryIdx(-1);
      setInputVal(tempInput.current);
    } else {
      setHistoryIdx(nextIdx);
      setInputVal(cmdHistory[nextIdx]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      handleAutocomplete();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleHistoryUp();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleHistoryDown();
    }
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputVal.trim();
    if (!cmd) return;

    // Add command to CLI navigation history (avoid duplicates)
    setCmdHistory(prev => {
      if (prev.length > 0 && prev[prev.length - 1] === cmd) return prev;
      return [...prev, cmd];
    });
    setHistoryIdx(-1);

    const newHistory = [...history, { text: `C:\\Users\\Visitor> ${cmd}`, type: 'input' as const }];
    const cleanCmd = cmd.toLowerCase();

    let outputLines: ConsoleLine[] = [];

    switch (cleanCmd) {
      case 'help':
        outputLines = [
          { text: 'Available commands:', type: 'success' },
          { text: '  about      - Display developer biography details', type: 'output' },
          { text: '  projects   - List portfolio projects and descriptions', type: 'output' },
          { text: '  skills     - View categorized technical skill matrix', type: 'output' },
          { text: '  contact    - Retrieve contact links and details', type: 'output' },
          { text: '  clear      - Clear the console terminal history', type: 'output' },
          { text: '  neofetch   - Display system specs and profile overview', type: 'output' },
        ];
        break;
      case 'clear':
        setHistory([]);
        setInputVal('');
        return;
      case 'about':
        outputLines = [
          { text: `${profile.name} - ${profile.title}`, type: 'success' },
          { text: profile.bio, type: 'output' },
        ];
        break;
      case 'projects':
        outputLines = projects.flatMap((p) => [
          { text: `\n📂 ${p.title}`, type: 'success' as const },
          { text: `   Description: ${p.description}`, type: 'output' as const },
          { text: `   Tech Stack:  ${Array.isArray(p.tags) ? p.tags.join(', ') : p.tags}`, type: 'output' as const },
          { text: p.githubUrl ? `   Repository:  ${p.githubUrl}` : '', type: 'output' as const },
        ]).filter((line) => line.text !== '');
        break;
      case 'skills':
        outputLines = skills.flatMap((grp) => [
          { text: `\n🛠️ ${grp.category}`, type: 'success' as const },
          { text: `   ${Array.isArray(grp.skills) ? grp.skills.join(' | ') : grp.skills}`, type: 'output' as const },
        ]);
        break;
      case 'contact':
        outputLines = [
          { text: 'Connect with me:', type: 'success' },
          { text: `   Email:     ${profile.email}`, type: 'output' },
          { text: `   GitHub:    ${profile.githubUrl || 'https://github.com'}`, type: 'output' },
          { text: `   LinkedIn:  ${profile.linkedinUrl || 'https://linkedin.com'}`, type: 'output' },
        ];
        break;
      case 'neofetch':
        outputLines = [
          { text: '       .---.       visitor@win11-portfolio', type: 'success' },
          { text: '      /     \\      ------------------------', type: 'output' },
          { text: '      \\     /      OS: Windows 11 Pro clone web environment', type: 'output' },
          { text: '       `---`       Kernel: Next.js App Router V16', type: 'output' },
          { text: '                   Shell: Custom React CLI V1.0', type: 'output' },
          { text: '                   Design: Glassmorphism / Tailwind v4', type: 'output' },
          { text: `                   Developer: ${profile.name}`, type: 'output' },
          { text: `                   Role: ${profile.title}`, type: 'output' },
        ];
        break;
      default:
        outputLines = [
          { text: `"${cmd}" is not recognized as an internal or external command,`, type: 'error' },
          { text: 'operable program or batch file. Type "help" for a list of commands.', type: 'error' },
        ];
        break;
    }

    setHistory([...newHistory, ...outputLines, { text: '', type: 'output' }]);
    setInputVal('');
  };

  return (
    <div 
      onClick={focusInput}
      className="h-full flex flex-col bg-zinc-950/90 text-slate-200 font-mono text-xs p-3 overflow-y-auto leading-relaxed select-text select-none cursor-text"
    >
      <div className="flex-1">
        {history.map((line, idx) => (
          <div 
            key={idx} 
            className={`
              whitespace-pre-wrap min-h-[14px]
              ${line.type === 'input' ? 'text-white font-semibold' : ''}
              ${line.type === 'error' ? 'text-red-400' : ''}
              ${line.type === 'success' ? 'text-emerald-400 font-semibold' : ''}
              ${line.type === 'output' ? 'text-slate-300' : ''}
            `}
          >
            {line.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleCommandSubmit} className="flex items-center mt-2 select-none">
        <span className="text-white mr-2">C:\Users\Visitor&gt;</span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-white font-mono text-xs select-text"
          autoFocus
        />
      </form>
    </div>
  );
}
