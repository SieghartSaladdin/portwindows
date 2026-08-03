'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useOSStore } from '@/lib/store';
import { sendChatMessage } from '@/lib/chat';
import { Terminal, Send } from 'lucide-react';

interface ConsoleLine {
  text: string;
  type: 'input' | 'output' | 'error' | 'success';
}

const COMMAND_LIST = ['help', 'about', 'projects', 'skills', 'contact', 'clear', 'neofetch', 'view', 'open', 'theme', 'wallpaper', 'date', 'lock'];

export function TerminalApp() {
  const { 
    profile, 
    projects, 
    skills, 
    openWindow, 
    setSelectedProjectId,
    setIsWidgetsOpen,
    setIsLocked,
    setWallpaper,
    wallpaper,
    themeMode
  } = useOSStore();
  
  const isDark = themeMode === 'dark';

  const [history, setHistory] = useState<ConsoleLine[]>([
    { text: '✏ Doodle Shell [Notebook Terminal Core v1.0.0]', type: 'output' },
    { text: '(c) Aura Workspace Solutions. Hand-crafted doodle edition.', type: 'output' },
    { text: '', type: 'output' },
    { text: 'Type "help" to view all available notebook CLI commands.', type: 'success' },
    { text: '', type: 'output' },
  ]);
  const [inputVal, setInputVal] = useState('');
  
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      if (historyIdx === -1) tempInput.current = inputVal;
      const nextIdx = historyIdx + 1 < cmdHistory.length ? historyIdx + 1 : historyIdx;
      setHistoryIdx(nextIdx);
      setInputVal(cmdHistory[cmdHistory.length - 1 - nextIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx === -1) return;
      const nextIdx = historyIdx - 1;
      setHistoryIdx(nextIdx);
      if (nextIdx === -1) {
        setInputVal(tempInput.current);
      } else {
        setInputVal(cmdHistory[cmdHistory.length - 1 - nextIdx]);
      }
    }
  };

  const triggerAIExplanation = async (project: any) => {
    try {
      const response = await sendChatMessage(
        `Berikan ringkasan eksekutif singkat 2 paragraf mengenai proyek "${project.title}" (Tech: ${project.tags.join(', ')}). Deskripsi: ${project.description}`,
        'robot'
      );
      setHistory(prev => [
        ...prev,
        { text: `\n🤖 [ROBOT ASSISTANT REVIEW - ${project.title.toUpperCase()}]:`, type: 'success' },
        { text: response, type: 'output' },
        { text: '', type: 'output' }
      ]);
    } catch (error) {
      setHistory(prev => [
        ...prev,
        { text: `🤖 [ROBOT ASSISTANT]: AI service temporarily unavailable.`, type: 'error' }
      ]);
    }
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputVal.trim();
    if (!cmd) return;

    const newHistory = [...history, { text: `visitor@aura-os:~$ ${cmd}`, type: 'input' as const }];
    setCmdHistory(prev => [...prev, cmd]);
    setHistoryIdx(-1);

    const parts = cmd.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    let outputLines: ConsoleLine[] = [];

    switch (command) {
      case 'help':
        outputLines = [
          { text: 'AVAILABLE COMMANDS:', type: 'success' },
          { text: '  help          - Show this help menu', type: 'output' },
          { text: '  about / bio   - Display developer bio & summary', type: 'output' },
          { text: '  projects      - List all interactive projects', type: 'output' },
          { text: '  skills        - Display developer tech stack', type: 'output' },
          { text: '  clear / cls   - Clear console screen', type: 'output' },
          { text: '  open <app>    - Launch window (bio, projects, settings, frieren, projector)', type: 'output' },
          { text: '  theme <mode>  - Switch OS theme mode (light / dark)', type: 'output' },
          { text: '  wallpaper <n> - Switch desktop wallpaper (1 - 4)', type: 'output' },
          { text: '  date          - Show current system time', type: 'output' },
          { text: '  lock          - Lock session workspace', type: 'output' },
        ];
        break;

      case 'clear':
      case 'cls':
        setHistory([]);
        setInputVal('');
        return;

      case 'about':
      case 'bio':
        outputLines = [
          { text: `NAME     : ${profile.name}`, type: 'output' },
          { text: `TITLE    : ${profile.title}`, type: 'output' },
          { text: `LOCATION : ${profile.location}`, type: 'output' },
          { text: `EMAIL    : ${profile.email}`, type: 'output' },
          { text: `BIO      : ${profile.bio}`, type: 'output' },
        ];
        break;

      case 'projects':
        outputLines = [
          { text: `REGISTERED PROJECTS (${projects.length}):`, type: 'success' },
          ...projects.map((p: any, i: number) => ({
            text: `  [${i + 1}] ${p.title} - ${p.description.substring(0, 45)}...`,
            type: 'output' as const
          })),
        ];
        break;

      case 'skills':
        outputLines = [
          { text: `SKILLS MATRIX (${skills.length} Categories):`, type: 'success' },
          ...skills.map((s: any) => ({
            text: `  ✦ ${s.category}: ${s.skills.join(', ')}`,
            type: 'output' as const
          })),
        ];
        break;

      case 'open':
        if (args.length > 0) {
          const appArg = args[0].toLowerCase();
          const appMap: Record<string, string> = {
            bio: 'bio',
            notepad: 'bio',
            projects: 'projects',
            settings: 'settings',
            frieren: 'frieren',
            terminal: 'terminal',
            projector: 'projector',
            widgets: 'widgets',
          };
          const storeId = appMap[appArg];
          if (storeId) {
            openWindow(storeId);
            outputLines = [{ text: `[SYSTEM] Launching ${storeId}...`, type: 'success' }];
          } else {
            outputLines = [
              { text: `Error: Application "${appArg}" not recognized.`, type: 'error' },
              { text: 'Available apps: bio, projects, settings, frieren, terminal, projector, widgets', type: 'output' },
            ];
          }
        } else {
          outputLines = [
            { text: 'Usage: open [app_name]', type: 'success' },
            { text: 'Available apps: bio, projects, settings, frieren, terminal, projector, widgets', type: 'output' },
          ];
        }
        break;

      case 'theme':
        if (args.length > 0 && (args[0] === 'light' || args[0] === 'dark')) {
          useOSStore.getState().setThemeMode(args[0] as 'light' | 'dark');
          outputLines = [{ text: `Theme switched to: ${args[0]}`, type: 'success' }];
        } else {
          outputLines = [{ text: `Current theme mode: ${themeMode}. Usage: theme <light|dark>`, type: 'output' }];
        }
        break;

      case 'wallpaper':
        if (args.length > 0) {
          const wpIdx = parseInt(args[0]);
          if (!isNaN(wpIdx) && wpIdx >= 1 && wpIdx <= 4) {
            setWallpaper(`wp-${wpIdx}`);
            outputLines = [{ text: `Wallpaper set to wp-${wpIdx}`, type: 'success' }];
          } else {
            outputLines = [{ text: 'Usage: wallpaper <1|2|3|4>', type: 'error' }];
          }
        } else {
          outputLines = [{ text: `Current wallpaper: ${wallpaper}`, type: 'output' }];
        }
        break;

      case 'date':
        outputLines = [{ text: new Date().toString(), type: 'output' }];
        break;

      case 'lock':
        setIsLocked(true);
        outputLines = [{ text: 'Locking workspace session...', type: 'success' }];
        break;

      default: {
        let projectToView: any = null;
        let isProjectCmd = false;
        const cleanInput = cmd.toLowerCase().trim();

        if (cleanInput.startsWith('view ')) {
          isProjectCmd = true;
          const projName = cleanInput.substring(5).trim().toLowerCase().replace(/\s+/g, '');
          projectToView = projects.find(p => p.title.toLowerCase().replace(/\s+/g, '') === projName || p.title.toLowerCase().includes(projName));
        } else {
          projectToView = projects.find(p => p.title.toLowerCase().replace(/\s+/g, '') === cleanInput.replace(/\s+/g, ''));
          if (projectToView) {
            isProjectCmd = true;
          }
        }

        if (isProjectCmd) {
          if (projectToView) {
            setSelectedProjectId(projectToView.id);
            openWindow('projector', `Projector - ${projectToView.title}`);
            outputLines = [
              { text: `[SYSTEM] Opening Projector Screen for "${projectToView.title}"...`, type: 'success' },
              { text: `[SYSTEM] Requesting AI Assistant review for "${projectToView.title}"...`, type: 'output' },
            ];
            triggerAIExplanation(projectToView);
          } else {
            outputLines = [
              { text: `Error: Project "${cmd.replace(/^view\s+/i, '')}" not found.`, type: 'error' },
              { text: 'Type "projects" to see the list of available projects.', type: 'output' },
            ];
          }
        } else {
          outputLines = [
            { text: `"${cmd}" is not recognized as an internal or external command.`, type: 'error' },
            { text: 'Type "help" for a list of available commands.', type: 'output' },
          ];
        }
        break;
      }
    }

    setHistory([...newHistory, ...outputLines, { text: '', type: 'output' }]);
    setInputVal('');
  };

  return (
    <div 
      onClick={focusInput}
      className={`h-full flex flex-col font-mono text-xs p-3 overflow-hidden leading-relaxed select-text cursor-text gap-3 ${
        isDark ? 'bg-[#18181b] text-slate-200' : 'bg-[#fdfbf7] text-[#2d2a26]'
      }`}
    >
      {/* Doodle Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#fef08a] border-[2.5px] border-[#2d2a26] text-[#2d2a26] font-extrabold rounded-2xl shadow-[4px_4px_0px_0px_#2d2a26] shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="text-base">✏</span>
          <Terminal className="w-4 h-4 text-[#2d2a26]" />
          <span className="text-xs tracking-wider uppercase font-black">Doodle Console Terminal</span>
        </div>
        <span className="text-[10px] bg-[#2d2a26] text-[#fef08a] px-2.5 py-0.5 rounded-full font-bold shadow-sm">
          Notebook Shell
        </span>
      </div>

      {/* Doodle Response Container with Bold Dark Outlines */}
      <div className={`flex-1 overflow-y-auto p-4 border-[2.5px] border-[#2d2a26] rounded-2xl shadow-[4px_4px_0px_0px_#2d2a26] font-mono ${
        isDark ? 'bg-zinc-900/90 text-slate-200' : 'bg-[#fffdfa] text-[#2d2a26]'
      }`}>
        {history.map((line, idx) => (
          <div 
            key={idx} 
            className={`
              whitespace-pre-wrap min-h-[16px] py-0.5 font-bold
              ${line.type === 'input' ? (isDark ? 'text-[#fef08a]' : 'text-amber-900 font-extrabold') : ''}
              ${line.type === 'error' ? 'text-rose-500 font-extrabold' : ''}
              ${line.type === 'success' ? (isDark ? 'text-emerald-400' : 'text-emerald-800') : ''}
              ${line.type === 'output' ? (isDark ? 'text-slate-300' : 'text-[#2d2a26]') : ''}
            `}
          >
            {line.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Notebook Prompt Input Container */}
      <form 
        onSubmit={handleCommandSubmit} 
        className={`flex items-center px-4 py-2.5 border-[2.5px] border-[#2d2a26] rounded-2xl shadow-[4px_4px_0px_0px_#2d2a26] shrink-0 ${
          isDark ? 'bg-zinc-900/90' : 'bg-[#fcf9f2]'
        }`}
      >
        <span className="mr-2 text-xs flex items-center gap-1.5 shrink-0 select-none font-extrabold">
          <span className="text-amber-500">✏ ~</span>
          <span className={isDark ? 'text-emerald-400' : 'text-emerald-800'}>visitor@aura-os:~$</span>
        </span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`flex-1 bg-transparent border-none outline-none font-mono text-xs placeholder-zinc-500 focus:ring-0 select-text font-bold ${
            isDark ? 'text-white' : 'text-[#2d2a26]'
          }`}
          placeholder="type notebook command..."
          autoFocus
        />
        <button 
          type="submit" 
          className="ml-2 bg-[#fef08a] text-[#2d2a26] border border-[#2d2a26] p-1.5 rounded-xl hover:bg-yellow-300 transition-all shadow-[2px_2px_0px_0px_#2d2a26] cursor-pointer"
        >
          <Send className="w-3.5 h-3.5 text-[#2d2a26]" />
        </button>
      </form>
    </div>
  );
}
