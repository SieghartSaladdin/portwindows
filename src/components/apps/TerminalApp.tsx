'use client';

import React from 'react';
import { CornerDownLeft } from 'lucide-react';
import { useOSStore } from '@/lib/store';
import { sendChatMessage } from '@/lib/chat';
import { OS_VERSION, WALLPAPERS } from '@/lib/data';
import type { Project } from '@/lib/types';
import { IconButton, cx } from '@/components/ui/primitives';
import { safeHref } from './bio/links';
import { readClientInfo } from './settings/clientInfo';
import { requestProjectDetail } from './projects/navigation';

type LineType = 'input' | 'output' | 'error' | 'success' | 'muted';

interface ConsoleLine {
  id: number;
  text: string;
  type: LineType;
  /** Renders the text as a link */
  href?: string;
}

type NewLine = Omit<ConsoleLine, 'id'>;

interface CommandDef {
  name: string;
  aliases?: string[];
  usage?: string;
  description: string;
}

/** Single source of truth for `help`, dispatch and Tab completion. */
const COMMANDS: CommandDef[] = [
  { name: 'help', description: 'Show this list of commands' },
  { name: 'about', aliases: ['bio', 'whoami'], description: 'Who built this place' },
  { name: 'projects', aliases: ['ls'], description: 'List projects with their numbers' },
  { name: 'view', usage: 'view <#|name>', description: 'Open a project in the Projects explorer' },
  { name: 'explain', usage: 'explain <#|name>', description: 'Ask the helper robot to summarise a project' },
  { name: 'skills', description: 'Tech stack, grouped' },
  { name: 'experience', aliases: ['work'], description: 'Work history' },
  { name: 'education', description: 'Schools and degrees' },
  { name: 'certs', aliases: ['certifications'], description: 'Certifications and credentials' },
  { name: 'contact', description: 'How to get in touch' },
  { name: 'neofetch', description: 'System info, with ASCII art' },
  { name: 'open', usage: 'open <app>', description: 'Launch an app (see "open" for the list)' },
  { name: 'theme', usage: 'theme <light|dark>', description: 'Switch the colour theme' },
  { name: 'wallpaper', usage: 'wallpaper [1-4|id]', description: 'List or change the wallpaper' },
  { name: 'date', description: 'Current date and time' },
  { name: 'history', description: 'Commands you typed this session' },
  { name: 'lock', description: 'Lock the screen' },
  { name: 'clear', aliases: ['cls'], description: 'Clear the screen (or Ctrl+L)' },
];

const COMMAND_NAMES = COMMANDS.flatMap((c) => [c.name, ...(c.aliases || [])]);

function resolveCommand(input: string): string | null {
  const found = COMMANDS.find((c) => c.name === input || c.aliases?.includes(input));
  return found ? found.name : null;
}

const APPS: Record<string, { id: string; title: string }> = {
  bio: { id: 'bio', title: 'Bio.txt' },
  about: { id: 'bio', title: 'Bio.txt' },
  projects: { id: 'projects', title: 'Projects' },
  settings: { id: 'settings', title: 'Settings' },
  frieren: { id: 'frieren', title: 'Frieren.exe' },
  projector: { id: 'projector', title: 'Projector Screen' },
  terminal: { id: 'terminal', title: 'Aura Terminal' },
  admin: { id: 'admin', title: 'Developer Hub' },
};
const APP_NAMES = ['bio', 'projects', 'settings', 'frieren', 'projector', 'terminal', 'admin', 'widgets'];

const ART = [
  '     ______________',
  '    /             /|',
  '   /  aura  os   / |',
  '  /_____________/  |',
  '  |  ~  ~  ~   |   |',
  '  |  ~~~~~~~   |  /',
  '  |____________|/',
];

const PROMPT = 'visitor@aura-os:~$';
const MAX_LINES = 600;

let lineSeq = 0;
const mk = (lines: NewLine[]): ConsoleLine[] => lines.map((l) => ({ ...l, id: ++lineSeq }));

const WELCOME: NewLine[] = [
  { text: `Aura OS terminal · version ${OS_VERSION}`, type: 'output' },
  { text: 'Type "help" to see what I understand. Tab completes, ↑/↓ browses history.', type: 'muted' },
  { text: '', type: 'output' },
];

function findProject(projects: Project[], arg: string): Project | undefined {
  const n = Number(arg);
  if (Number.isInteger(n) && n >= 1 && n <= projects.length) return projects[n - 1];
  const needle = arg.toLowerCase().replace(/\s+/g, '');
  if (!needle) return undefined;
  return (
    projects.find((p) => p.title.toLowerCase().replace(/\s+/g, '') === needle) ||
    projects.find((p) => p.title.toLowerCase().replace(/\s+/g, '').includes(needle))
  );
}

/** Only shorten genuinely long text, at a word boundary. */
function shorten(text: string, max = 140) {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(' ') > 60 ? cut.lastIndexOf(' ') : max)}…`;
}

function commonPrefix(words: string[]) {
  if (words.length === 0) return '';
  let prefix = words[0];
  for (const w of words.slice(1)) {
    while (!w.startsWith(prefix)) prefix = prefix.slice(0, -1);
  }
  return prefix;
}

export function TerminalApp() {
  const [lines, setLines] = React.useState<ConsoleLine[]>(() => mk(WELCOME));
  const [input, setInput] = React.useState('');
  const [cmdHistory, setCmdHistory] = React.useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = React.useState(-1);
  const draft = React.useRef('');
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const mountedAt = React.useRef<number | null>(null);

  React.useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [lines]);

  const append = React.useCallback((newLines: NewLine[]) => {
    setLines((prev) => [...prev, ...mk(newLines)].slice(-MAX_LINES));
  }, []);

  const explainProject = async (project: Project) => {
    const lang = typeof navigator !== 'undefined' ? navigator.language : 'en';
    const prompt =
      `Give a short, two-paragraph executive summary of the portfolio project "${project.title}"` +
      (project.tags.length ? ` (tech: ${project.tags.join(', ')})` : '') +
      `. Description: ${project.description || 'none provided'}. ` +
      `Reply in the visitor's language (their browser reports "${lang}"); if unsure, reply in English. ` +
      `Do not invent facts that are not in the description.`;
    try {
      const reply = await sendChatMessage(prompt, 'robot');
      append([
        { text: `Helper robot on "${project.title}":`, type: 'success' },
        { text: reply || '(no answer)', type: 'output' },
        { text: '', type: 'output' },
      ]);
    } catch {
      append([
        { text: 'The helper robot is unavailable right now (AI service not reachable).', type: 'error' },
        { text: '', type: 'output' },
      ]);
    }
  };

  const run = (raw: string) => {
    const s = useOSStore.getState();
    const [head = '', ...args] = raw.trim().split(/\s+/);
    const argStr = args.join(' ');
    const command = resolveCommand(head.toLowerCase());
    const out: NewLine[] = [];
    const push = (text: string, type: LineType = 'output', href?: string) => out.push({ text, type, href });
    const loadingNote = () => {
      if (s.dataStatus === 'loading') push('Portfolio data is still loading, try again in a moment.', 'muted');
      if (s.dataStatus === 'error') push('Portfolio data failed to load. Run "open projects" and press Retry.', 'error');
    };

    switch (command) {
      case 'help': {
        push('Available commands:', 'success');
        const width = Math.max(...COMMANDS.map((c) => (c.usage || c.name).length)) + 2;
        for (const c of COMMANDS) {
          const alias = c.aliases?.length ? ` (also: ${c.aliases.join(', ')})` : '';
          push(`  ${(c.usage || c.name).padEnd(width)}${c.description}${alias}`);
        }
        break;
      }

      case 'about': {
        loadingNote();
        const p = s.profile;
        push(p.name, 'success');
        if (p.title) push(p.title);
        if (p.location) push(`Location: ${p.location}`, 'muted');
        push('');
        push(p.bio || 'No bio written yet.');
        push('');
        push('More in the About me app: open bio', 'muted');
        break;
      }

      case 'projects': {
        loadingNote();
        if (s.projects.length === 0) {
          if (s.dataStatus === 'ready') push('No projects published yet.', 'muted');
          break;
        }
        push(`Projects (${s.projects.length}):`, 'success');
        s.projects.forEach((p, i) => {
          const meta = [p.role, p.period].filter(Boolean).join(' · ');
          push(`  [${i + 1}] ${p.title}${p.featured ? '  ★ featured' : ''}${meta ? `  (${meta})` : ''}`);
          if (p.description) push(`      ${shorten(p.description)}`, 'muted');
          if (p.tags.length) push(`      ${p.tags.join(', ')}`, 'muted');
        });
        push('');
        push('Tip: "view 1" opens the first project, "explain 1" asks the robot about it.', 'muted');
        break;
      }

      case 'view':
      case 'explain': {
        if (!argStr) {
          push(`Usage: ${command} <#|name>   e.g. ${command} 1`, 'error');
          break;
        }
        const project = findProject(s.projects, argStr);
        if (!project) {
          loadingNote();
          push(`No project matches "${argStr}". Type "projects" for the list.`, 'error');
          break;
        }
        if (command === 'view') {
          requestProjectDetail(project.id);
          s.openWindow('projects', 'Projects');
          push(`Opening "${project.title}" in Projects…`, 'success');
        } else {
          push(`Asking the helper robot about "${project.title}"…`, 'muted');
          void explainProject(project);
        }
        break;
      }

      case 'skills': {
        loadingNote();
        const groups = s.skills.filter((g) => g.skills.length > 0);
        if (groups.length === 0) {
          if (s.dataStatus === 'ready') push('No skills added yet.', 'muted');
          break;
        }
        push(`Skills (${groups.length} groups):`, 'success');
        groups.forEach((g) => push(`  ${g.category}: ${g.skills.join(', ')}`));
        break;
      }

      case 'experience': {
        loadingNote();
        if (s.experiences.length === 0) {
          if (s.dataStatus === 'ready') push('No experience added yet.', 'muted');
          break;
        }
        push('Experience:', 'success');
        s.experiences.forEach((e) => {
          push(`  ${e.role} @ ${e.company}${e.duration ? `  (${e.duration})` : ''}`);
          e.description.forEach((d) => push(`    - ${d}`, 'muted'));
        });
        break;
      }

      case 'education': {
        loadingNote();
        if (s.educations.length === 0) {
          if (s.dataStatus === 'ready') push('No education added yet.', 'muted');
          break;
        }
        push('Education:', 'success');
        s.educations.forEach((e) => {
          push(`  ${e.degree}${e.field ? `, ${e.field}` : ''}: ${e.institution}${e.period ? `  (${e.period})` : ''}`);
          if (e.description) push(`    ${e.description}`, 'muted');
        });
        break;
      }

      case 'certs': {
        loadingNote();
        if (s.certifications.length === 0) {
          if (s.dataStatus === 'ready') push('No certifications added yet.', 'muted');
          break;
        }
        push('Certifications:', 'success');
        s.certifications.forEach((c) => {
          push(`  ${c.name}: ${c.issuer}${c.date ? `, ${c.date}` : ''}`);
          const href = safeHref(c.credentialUrl);
          if (href) push(`    ${href}`, 'muted', href);
        });
        break;
      }

      case 'contact': {
        loadingNote();
        const p = s.profile;
        const links: Array<[string, string | null]> = [
          ['GitHub', safeHref(p.githubUrl)],
          ['LinkedIn', safeHref(p.linkedinUrl)],
          ['Website', safeHref(p.websiteUrl)],
          ['CV', safeHref(p.resumeUrl)],
        ];
        push('Get in touch:', 'success');
        if (p.email) push(`  Email    ${p.email}`, 'output', `mailto:${p.email}`);
        if (p.phone) push(`  Phone    ${p.phone}`, 'output', `tel:${p.phone.replace(/[^\d+]/g, '')}`);
        links.forEach(([label, href]) => href && push(`  ${label.padEnd(8)} ${href}`, 'output', href));
        push('  Or leave a message: open bio → Contact', 'muted');
        break;
      }

      case 'neofetch': {
        const c = readClientInfo();
        const wp = WALLPAPERS.find((w) => w.id === s.wallpaper);
        const mins = mountedAt.current ? Math.max(0, Math.round((Date.now() - mountedAt.current) / 60000)) : 0;
        ART.forEach((a) => push(a, 'success'));
        push('');
        push('visitor@aura-os', 'success');
        push('---------------', 'muted');
        push(`OS         Aura OS ${OS_VERSION}`);
        push(`Owner      ${s.profile.name}${s.profile.title ? `, ${s.profile.title}` : ''}`);
        push(`Browser    ${c.browser} on ${c.platform}`);
        push(`Screen     ${c.screen} (window ${c.viewport})`);
        push(`Theme      ${s.themeMode}`);
        push(`Wallpaper  ${wp ? `${wp.name} (${wp.id})` : s.wallpaper}`);
        push(
          `Content    ${s.projects.length} projects, ${s.skills.length} skill groups, ${s.experiences.length} jobs, ` +
            `${s.educations.length} education, ${s.certifications.length} certs`,
        );
        push(`Data       ${s.dataStatus}`);
        push(`Terminal   open for ${mins} min`);
        break;
      }

      case 'open': {
        const name = args[0]?.toLowerCase();
        if (!name) {
          push('Usage: open <app>', 'error');
          push(`Apps: ${APP_NAMES.join(', ')}`, 'muted');
          break;
        }
        if (name === 'widgets') {
          s.setIsWidgetsOpen(true);
          push('Opening widgets…', 'success');
          break;
        }
        const app = APPS[name];
        if (!app) {
          push(`Unknown app "${name}".`, 'error');
          push(`Apps: ${APP_NAMES.join(', ')}`, 'muted');
          break;
        }
        s.openWindow(app.id, app.title);
        push(`Opening ${app.title}…`, 'success');
        break;
      }

      case 'theme': {
        const mode = args[0]?.toLowerCase();
        if (mode === 'light' || mode === 'dark') {
          s.setThemeMode(mode);
          push(`Theme set to ${mode}.`, 'success');
        } else if (mode) {
          push(`Unknown theme "${args[0]}". Usage: theme <light|dark>`, 'error');
        } else {
          push(`Current theme: ${s.themeMode}. Usage: theme <light|dark>`);
        }
        break;
      }

      case 'wallpaper': {
        const arg = args[0]?.toLowerCase();
        if (!arg) {
          push('Wallpapers:', 'success');
          WALLPAPERS.forEach((w, i) => push(`  ${i + 1}  ${w.id.padEnd(10)} ${w.name}${w.id === s.wallpaper ? '  ← current' : ''}`));
          push('Usage: wallpaper <1-4|id>', 'muted');
          break;
        }
        const n = Number(arg);
        const wp = Number.isInteger(n) ? WALLPAPERS[n - 1] : WALLPAPERS.find((w) => w.id === arg);
        if (!wp) {
          push(`Unknown wallpaper "${args[0]}". Try 1-${WALLPAPERS.length} or one of: ${WALLPAPERS.map((w) => w.id).join(', ')}`, 'error');
          break;
        }
        s.setWallpaper(wp.id);
        push(`Wallpaper set to ${wp.name}.`, 'success');
        break;
      }

      case 'date':
        push(new Date().toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'long' }));
        break;

      case 'history':
        if (cmdHistory.length === 0) push('No commands yet.', 'muted');
        cmdHistory.forEach((c, i) => push(`  ${String(i + 1).padStart(3)}  ${c}`));
        break;

      case 'lock':
        push('Locking the screen…', 'success');
        s.lockScreen();
        break;

      case 'clear':
        return 'clear' as const;

      default:
        push(`Command not found: ${head}. Type "help" to see what I understand.`, 'error');
    }
    return out;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();
    setInput('');
    setHistoryIdx(-1);
    if (!cmd) {
      append([{ text: PROMPT, type: 'input' }]);
      return;
    }
    const result = run(cmd);
    setCmdHistory((h) => (h[h.length - 1] === cmd ? h : [...h, cmd]).slice(-100));
    if (result === 'clear') {
      setLines([]);
      return;
    }
    append([{ text: `${PROMPT} ${cmd}`, type: 'input' }, ...result, { text: '', type: 'output' }]);
  };

  const complete = () => {
    const hasSpace = /\s/.test(input);
    if (!hasSpace) {
      const matches = COMMAND_NAMES.filter((c) => c.startsWith(input.toLowerCase()));
      if (matches.length === 1) setInput(`${matches[0]} `);
      else if (matches.length > 1) {
        const prefix = commonPrefix(matches);
        if (prefix.length > input.length) setInput(prefix);
        else append([{ text: `${PROMPT} ${input}`, type: 'input' }, { text: matches.join('  '), type: 'muted' }]);
      }
      return;
    }
    const [head, ...rest] = input.split(/\s+/);
    const partial = (rest[rest.length - 1] || '').toLowerCase();
    const cmd = resolveCommand(head.toLowerCase());
    const options =
      cmd === 'open' ? APP_NAMES : cmd === 'theme' ? ['light', 'dark'] : cmd === 'wallpaper' ? WALLPAPERS.map((w) => w.id) : [];
    const matches = options.filter((o) => o.startsWith(partial));
    if (matches.length === 1) setInput(`${head} ${matches[0]}`);
    else if (matches.length > 1) append([{ text: `${PROMPT} ${input}`, type: 'input' }, { text: matches.join('  '), type: 'muted' }]);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      if (historyIdx === -1) draft.current = input;
      const next = Math.min(historyIdx + 1, cmdHistory.length - 1);
      setHistoryIdx(next);
      setInput(cmdHistory[cmdHistory.length - 1 - next]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx === -1) return;
      const next = historyIdx - 1;
      setHistoryIdx(next);
      setInput(next === -1 ? draft.current : cmdHistory[cmdHistory.length - 1 - next]);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      complete();
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  const lineClass: Record<LineType, string> = {
    input: 'text-fg font-bold',
    output: 'text-fg',
    success: 'text-success font-bold',
    error: 'text-danger font-bold',
    muted: 'text-fg-muted',
  };

  return (
    <div className="h-full flex flex-col gap-2 p-2 sm:p-3 bg-surface text-fg font-mono text-xs">
      <div
        role="log"
        aria-live="polite"
        aria-label="Terminal output"
        data-selectable
        onMouseUp={() => {
          // Clicking the output focuses the prompt, unless the visitor is selecting text to copy.
          if (!window.getSelection()?.toString()) inputRef.current?.focus();
        }}
        className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 rounded-2xl border-[2.5px] border-line bg-surface-2 shadow-doodle-sm select-text leading-relaxed"
      >
        {lines.map((line) => (
          <div key={line.id} className={cx('whitespace-pre-wrap break-words min-h-[1.25em]', lineClass[line.type])}>
            {line.href ? (
              <a href={line.href} target={line.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="underline decoration-dashed underline-offset-2 hover:text-success">
                {line.text}
              </a>
            ) : (
              line.text
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={submit} className="flex items-center gap-2 px-3 py-2 rounded-2xl border-[2.5px] border-line bg-surface-2 shadow-doodle-sm shrink-0">
        <label htmlFor="terminal-input" className="shrink-0 text-success font-bold select-none">
          <span className="hidden min-[420px]:inline">{PROMPT}</span>
          <span className="min-[420px]:hidden">$</span>
          <span className="sr-only"> command</span>
        </label>
        <input
          id="terminal-input"
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setHistoryIdx(-1);
          }}
          onKeyDown={onKeyDown}
          autoFocus
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder='try "help"'
          className="flex-1 min-w-0 bg-transparent border-none outline-none text-fg placeholder:text-fg-muted/70 font-mono text-xs"
        />
        <IconButton type="submit" label="Run command" size="sm" variant="primary">
          <CornerDownLeft className="w-3.5 h-3.5" />
        </IconButton>
      </form>
    </div>
  );
}
