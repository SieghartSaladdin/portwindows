'use client';

import React from 'react';
import { Award, Briefcase, Check, Copy, Download, Globe, GraduationCap, Mail, MapPin, RefreshCw, Sparkles, User } from 'lucide-react';
import { useOSStore } from '@/lib/store';
import { Button, Spinner, cx } from '@/components/ui/primitives';
import { MenuBar, type MenuDef } from './bio/MenuBar';
import { Avatar } from './bio/Avatar';
import { GitHubIcon, LinkedInIcon, safeHref } from './bio/links';
import { AboutSection, CertificationsSection, EducationSection, ExperienceSection, SkillsSection } from './bio/sections';
import { ContactSection } from './bio/ContactForm';
import { TabNav, panelId, tabId, type TabItem } from './settings/TabNav';

type SectionId = 'about' | 'experience' | 'education' | 'certifications' | 'skills' | 'contact';

const ZOOM_MIN = 0.8;
const ZOOM_MAX = 1.4;
const ZOOM_STEP = 0.1;

/** Anchor styled like the secondary/primary Button primitive. */
function LinkButton({
  href,
  children,
  icon,
  primary,
  download,
  label,
}: {
  href: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  primary?: boolean;
  download?: boolean;
  label?: string;
}) {
  const external = /^https?:\/\//i.test(href) || download;
  return (
    <a
      href={href}
      aria-label={label}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...(download ? { download: '' } : {})}
      className={cx(
        'inline-flex items-center gap-1.5 h-8 px-3 rounded-xl border-2 text-xs font-bold font-doodle shadow-doodle-sm transition-all',
        'active:translate-x-[1px] active:translate-y-[1px] active:shadow-doodle-xs',
        primary ? 'bg-highlight text-ink border-ink hover:bg-highlight-strong' : 'bg-surface text-fg border-line hover:bg-surface-3',
      )}
    >
      <span className="w-3.5 h-3.5 flex items-center justify-center" aria-hidden>
        {icon}
      </span>
      {children}
    </a>
  );
}

export function BioApp() {
  const profile = useOSStore((s) => s.profile);
  const experiences = useOSStore((s) => s.experiences);
  const educations = useOSStore((s) => s.educations);
  const certifications = useOSStore((s) => s.certifications);
  const skills = useOSStore((s) => s.skills);
  const dataStatus = useOSStore((s) => s.dataStatus);
  const fetchDatabaseData = useOSStore((s) => s.fetchDatabaseData);

  const [section, setSection] = React.useState<SectionId>('about');
  const [zoom, setZoom] = React.useState(1);
  const [copied, setCopied] = React.useState<'bio' | 'email' | null>(null);
  const copyTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => () => {
    if (copyTimer.current) clearTimeout(copyTimer.current);
  }, []);

  const resumeHref = safeHref(profile.resumeUrl);
  const githubHref = safeHref(profile.githubUrl);
  const linkedinHref = safeHref(profile.linkedinUrl);
  const websiteHref = safeHref(profile.websiteUrl);

  const copy = async (what: 'bio' | 'email') => {
    const text = what === 'bio' ? profile.bio : profile.email;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(null), 2000);
    } catch {
      /* clipboard blocked (e.g. insecure context) – nothing sensible to do */
    }
  };

  const changeZoom = (delta: number | null) =>
    setZoom((z) => (delta === null ? 1 : Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round((z + delta) * 10) / 10))));

  const menus: MenuDef[] = [
    {
      label: 'File',
      items: [
        { label: 'Copy bio text', onSelect: () => copy('bio'), disabled: !profile.bio },
        { label: 'Copy email address', onSelect: () => copy('email'), disabled: !profile.email },
        { label: 'Download CV', onSelect: () => resumeHref && window.open(resumeHref, '_blank', 'noopener'), disabled: !resumeHref },
        { label: 'Write a message…', onSelect: () => setSection('contact') },
      ],
    },
    {
      label: 'View',
      items: [
        { label: 'Zoom in', hint: `${Math.round(zoom * 100)}%`, onSelect: () => changeZoom(ZOOM_STEP), disabled: zoom >= ZOOM_MAX },
        { label: 'Zoom out', onSelect: () => changeZoom(-ZOOM_STEP), disabled: zoom <= ZOOM_MIN },
        { label: 'Reset zoom', onSelect: () => changeZoom(null), disabled: zoom === 1 },
      ],
    },
  ];

  const tabs: TabItem<SectionId>[] = [
    { id: 'about', label: 'About', icon: <User className="w-4 h-4" /> },
    { id: 'experience', label: 'Experience', icon: <Briefcase className="w-4 h-4" />, count: experiences.length },
    { id: 'education', label: 'Education', icon: <GraduationCap className="w-4 h-4" />, count: educations.length },
    { id: 'certifications', label: 'Certifications', icon: <Award className="w-4 h-4" />, count: certifications.length },
    { id: 'skills', label: 'Skills', icon: <Sparkles className="w-4 h-4" />, count: skills.length },
    { id: 'contact', label: 'Contact', icon: <Mail className="w-4 h-4" /> },
  ];

  const loading = dataStatus === 'loading';

  return (
    <div className="h-full flex flex-col bg-surface text-fg font-doodle overflow-hidden">
      {/* Menu bar */}
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 border-b-2 border-line bg-surface-2 shrink-0">
        <MenuBar menus={menus} />
        <Button
          size="sm"
          onClick={() => copy('bio')}
          disabled={!profile.bio}
          icon={copied === 'bio' ? <Check className="w-3.5 h-3.5" aria-hidden /> : <Copy className="w-3.5 h-3.5" aria-hidden />}
        >
          <span aria-live="polite">{copied === 'bio' ? 'Copied!' : copied === 'email' ? 'Email copied!' : 'Copy bio'}</span>
        </Button>
      </div>

      {/* Profile header */}
      <header className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-4 border-b-2 border-line shrink-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Avatar name={profile.name} src={profile.avatarUrl} className="w-12 h-12 sm:w-16 sm:h-16 text-lg sm:text-xl" />
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold leading-tight break-words">{loading ? 'Loading…' : profile.name}</h1>
            {!loading && profile.title && <p className="text-xs sm:text-sm text-fg-muted break-words">{profile.title}</p>}
            {!loading && profile.location && (
              <p className="text-2xs sm:text-xs text-fg-muted flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 shrink-0" aria-hidden />
                <span className="truncate">{profile.location}</span>
              </p>
            )}
          </div>
        </div>

        {!loading && (
          <nav aria-label="Profile links" className="flex flex-wrap gap-2">
            {resumeHref && (
              <LinkButton href={resumeHref} icon={<Download className="w-3.5 h-3.5" />} primary download>
                Download CV
              </LinkButton>
            )}
            {profile.email && (
              <LinkButton href={`mailto:${profile.email}`} icon={<Mail className="w-3.5 h-3.5" />}>
                Email
              </LinkButton>
            )}
            {githubHref && (
              <LinkButton href={githubHref} icon={<GitHubIcon className="w-3.5 h-3.5" />} label="GitHub profile (opens in a new tab)">
                GitHub
              </LinkButton>
            )}
            {linkedinHref && (
              <LinkButton href={linkedinHref} icon={<LinkedInIcon className="w-3.5 h-3.5" />} label="LinkedIn profile (opens in a new tab)">
                LinkedIn
              </LinkButton>
            )}
            {websiteHref && (
              <LinkButton href={websiteHref} icon={<Globe className="w-3.5 h-3.5" />} label="Personal website (opens in a new tab)">
                Website
              </LinkButton>
            )}
          </nav>
        )}
      </header>

      {/* Notebook: side index + page */}
      <div className="flex-1 min-h-0 flex flex-col sm:flex-row">
        <TabNav
          idPrefix="bio"
          label="About me sections"
          items={tabs}
          value={section}
          onChange={setSection}
          className="sm:w-48 border-b-2 sm:border-b-0 sm:border-r-2 border-line bg-surface-2"
        />

        <div
          role="tabpanel"
          id={panelId('bio', section)}
          aria-labelledby={tabId('bio', section)}
          tabIndex={0}
          className="flex-1 min-w-0 overflow-y-auto bg-surface"
        >
          <div className="doodle-margin-line ml-4 sm:ml-8 pl-4 sm:pl-6 pr-4 sm:pr-8 py-5 min-h-full" style={{ zoom }}>
            {dataStatus === 'error' && (
              <div role="alert" className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border-2 border-ink bg-rose text-ink px-3 py-2 text-xs font-bold">
                <span className="flex-1 min-w-40">Couldn&apos;t load the portfolio data.</span>
                <Button size="sm" onClick={() => fetchDatabaseData()} icon={<RefreshCw className="w-3 h-3" aria-hidden />}>
                  Retry
                </Button>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center gap-3 py-16 text-sm text-fg-muted">
                <Spinner label="Loading profile" />
                <span>Loading profile…</span>
              </div>
            ) : (
              <>
                {section === 'about' && <AboutSection profile={profile} />}
                {section === 'experience' && <ExperienceSection experiences={experiences} />}
                {section === 'education' && <EducationSection educations={educations} />}
                {section === 'certifications' && <CertificationsSection certifications={certifications} />}
                {section === 'skills' && <SkillsSection skills={skills} />}
                {/* Kept mounted so a half-written message survives switching tabs */}
                <div hidden={section !== 'contact'}>
                  <ContactSection profile={profile} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
