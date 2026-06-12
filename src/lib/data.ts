export interface DesktopIcon {
  id: string;
  title: string;
  iconType: 'settings' | 'notepad' | 'folder' | 'terminal' | 'browser' | 'game';
  action: 'openApp' | 'openLink';
  appId?: string;
  url?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  githubUrl?: string;
  liveUrl?: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  duration: string;
  description: string[];
}

export interface SkillGroup {
  category: string;
  skills: string[];
}

export const DESKTOP_ICONS: DesktopIcon[] = [
  { id: 'bio', title: 'Bio.txt', iconType: 'notepad', action: 'openApp', appId: 'bio' },
  { id: 'projects', title: 'Projects', iconType: 'folder', action: 'openApp', appId: 'projects' },
  { id: 'terminal', title: 'Terminal', iconType: 'terminal', action: 'openApp', appId: 'terminal' },
  { id: 'frieren', title: 'Frieren.exe', iconType: 'game', action: 'openApp', appId: 'frieren' },
  { id: 'settings', title: 'Settings', iconType: 'settings', action: 'openApp', appId: 'settings' },
  { id: 'github', title: 'GitHub', iconType: 'browser', action: 'openLink', url: 'https://github.com' },
  { id: 'linkedin', title: 'LinkedIn', iconType: 'browser', action: 'openLink', url: 'https://linkedin.com' },
];

export const PROFILE = {
  name: 'Alex Mercer',
  title: 'Senior Frontend Developer & UI Architect',
  location: 'Seattle, WA',
  email: 'alex.mercer@example.com',
  bio: `I am a Senior Frontend Developer with 6+ years of experience specializing in building highly interactive, pixel-perfect web experiences. I love combining state-of-the-art designs with modular architectures, smooth transitions, and high-performance React code.

This interactive portfolio is structured like Windows 11 Pro, demonstrating my passion for desktop-grade web applications and high-fidelity user interface replications. Feel free to drag the windows, run commands in the Terminal, or browse my projects!`,
};

export const PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Cognitive OS',
    description: 'A React-based virtual workspace mimicking full OS capabilities with window managers, sandbox terminals, and rich file explorers.',
    tags: ['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Zustand'],
    githubUrl: 'https://github.com',
    liveUrl: 'https://example.com',
  },
  {
    id: '2',
    title: 'Aura UI',
    description: 'A component library focusing on fluid animations, glassmorphism templates, and deep accessibility compliance.',
    tags: ['React', 'CSS Modules', 'Framer Motion', 'Radix UI'],
    githubUrl: 'https://github.com',
  },
  {
    id: '3',
    title: 'Pulse Analytics',
    description: 'Real-time performance analytics dashboards with customizable drag-and-drop tiles and interactive WebGL canvas charts.',
    tags: ['Next.js', 'Chart.js', 'React Query', 'Tailwind CSS'],
    githubUrl: 'https://github.com',
    liveUrl: 'https://example.com',
  },
];

export const EXPERIENCES: Experience[] = [
  {
    id: 'exp-1',
    role: 'Lead UI Architect',
    company: 'Quantum Tech Solutions',
    duration: '2023 - Present',
    description: [
      'Spearheaded the redesign of our core dashboard system using Next.js App Router, cutting page load time by 35%.',
      'Developed and maintained an internal design system built with custom CSS variables and utility classes.',
      'Mentored a team of 8 frontend engineers in modern React practices, accessibility, and high-performance rendering.',
    ],
  },
  {
    id: 'exp-2',
    role: 'Senior Frontend Engineer',
    company: 'CloudFlow Labs',
    duration: '2020 - 2023',
    description: [
      'Built interactive data visualization interfaces utilizing D3.js and React.',
      'Implemented Zustand and React Context state managers, reducing prop drilling and optimizing render times.',
      'Collaborated closely with product designers to build custom micro-animations using Framer Motion.',
    ],
  },
];

export const SKILLS: SkillGroup[] = [
  {
    category: 'Frontend Core',
    skills: ['TypeScript', 'JavaScript (ES6+)', 'React 19', 'Next.js App Router', 'HTML5 & CSS3'],
  },
  {
    category: 'Styling & Animation',
    skills: ['Tailwind CSS', 'Framer Motion', 'CSS Modules', 'Sass', 'Design Systems'],
  },
  {
    category: 'State & Query',
    skills: ['Zustand', 'React Context', 'Redux Toolkit', 'React Query', 'SWR'],
  },
  {
    category: 'Tooling & Testing',
    skills: ['Webpack', 'Vite', 'ESLint', 'Jest', 'React Testing Library'],
  },
];
