'use client';

import React from 'react';
import { Briefcase, GraduationCap, Award, Sparkles, ExternalLink, MapPin, Mail, Phone } from 'lucide-react';
import { Badge, EmptyState, cx } from '@/components/ui/primitives';
import type { Certification, Education, Experience, Profile, SkillGroup } from '@/lib/types';
import { safeHref } from './links';

/** Section title with a hand-drawn underline. */
export function SectionTitle({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-base font-bold font-doodle text-fg mb-4">
      {icon && (
        <span className="w-7 h-7 rounded-lg border-2 border-ink bg-highlight text-ink flex items-center justify-center shadow-doodle-xs" aria-hidden>
          {icon}
        </span>
      )}
      <span className="border-b-2 border-dashed border-line pb-0.5">{children}</span>
    </h2>
  );
}

/* ------------------------------------------------------------------ */
/* About                                                               */
/* ------------------------------------------------------------------ */

export function AboutSection({ profile }: { profile: Profile }) {
  const paragraphs = (profile.bio || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const phoneHref = profile.phone ? `tel:${profile.phone.replace(/[^\d+]/g, '')}` : null;

  return (
    <section>
      <SectionTitle icon={<Sparkles className="w-4 h-4" />}>About me</SectionTitle>
      {paragraphs.length > 0 ? (
        <div data-selectable className="flex flex-col gap-3 text-sm leading-7 text-fg select-text">
          {paragraphs.map((p, i) => (
            <p key={i} className="whitespace-pre-line break-words">
              {p}
            </p>
          ))}
        </div>
      ) : (
        <EmptyState title="No bio written yet" message="The owner hasn't added an introduction." />
      )}

      {(profile.location || profile.email || profile.phone) && (
        <ul className="mt-6 flex flex-col gap-2 text-xs text-fg-muted">
          {profile.location && (
            <li className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden />
              <span>{profile.location}</span>
            </li>
          )}
          {profile.email && (
            <li className="flex items-center gap-2 min-w-0">
              <Mail className="w-3.5 h-3.5 shrink-0" aria-hidden />
              <a href={`mailto:${profile.email}`} className="underline decoration-dashed underline-offset-4 hover:text-fg break-all">
                {profile.email}
              </a>
            </li>
          )}
          {profile.phone && phoneHref && (
            <li className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 shrink-0" aria-hidden />
              <a href={phoneHref} className="underline decoration-dashed underline-offset-4 hover:text-fg">
                {profile.phone}
              </a>
            </li>
          )}
        </ul>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Experience                                                          */
/* ------------------------------------------------------------------ */

export function ExperienceSection({ experiences }: { experiences: Experience[] }) {
  return (
    <section>
      <SectionTitle icon={<Briefcase className="w-4 h-4" />}>Experience</SectionTitle>
      {experiences.length === 0 ? (
        <EmptyState icon={<Briefcase className="w-8 h-8" />} title="No experience added yet" message="Work history will show up here once it's added." />
      ) : (
        <ol className="relative ml-2 border-l-2 border-dashed border-line flex flex-col gap-6">
          {experiences.map((exp) => (
            <li key={exp.id} className="relative pl-5">
              <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-ink bg-highlight" aria-hidden />
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <h3 className="text-sm font-bold text-fg">{exp.role}</h3>
                <span className="text-xs text-fg-muted">at {exp.company}</span>
              </div>
              {exp.duration && (
                <Badge tone="sky" className="mt-1.5">
                  {exp.duration}
                </Badge>
              )}
              {exp.description.length > 0 && (
                <ul className="mt-2.5 flex flex-col gap-1.5 text-xs leading-relaxed text-fg">
                  {exp.description.map((line, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-fg-muted" aria-hidden>
                        ✦
                      </span>
                      <span className="break-words min-w-0">{line}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Education                                                           */
/* ------------------------------------------------------------------ */

export function EducationSection({ educations }: { educations: Education[] }) {
  return (
    <section>
      <SectionTitle icon={<GraduationCap className="w-4 h-4" />}>Education</SectionTitle>
      {educations.length === 0 ? (
        <EmptyState icon={<GraduationCap className="w-8 h-8" />} title="No education added yet" />
      ) : (
        <ul className="flex flex-col gap-4">
          {educations.map((edu) => (
            <li key={edu.id} className="rounded-2xl border-[2.5px] border-line bg-surface-2 p-4 shadow-doodle-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-fg break-words">{edu.institution}</h3>
                  <p className="text-xs text-fg-muted mt-0.5 break-words">
                    {edu.degree}
                    {edu.field ? ` · ${edu.field}` : ''}
                  </p>
                </div>
                {edu.period && <Badge tone="mint">{edu.period}</Badge>}
              </div>
              {edu.description && <p className="mt-2.5 text-xs leading-relaxed text-fg whitespace-pre-line break-words">{edu.description}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Certifications                                                      */
/* ------------------------------------------------------------------ */

export function CertificationsSection({ certifications }: { certifications: Certification[] }) {
  return (
    <section>
      <SectionTitle icon={<Award className="w-4 h-4" />}>Certifications</SectionTitle>
      {certifications.length === 0 ? (
        <EmptyState icon={<Award className="w-8 h-8" />} title="No certifications added yet" />
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certifications.map((cert) => {
            const href = safeHref(cert.credentialUrl);
            return (
              <li key={cert.id} className="flex flex-col gap-2 rounded-2xl border-[2.5px] border-line bg-surface-2 p-4 shadow-doodle-sm">
                <div className="flex items-start gap-2.5">
                  <Award className="w-5 h-5 shrink-0 mt-0.5 text-fg-muted" aria-hidden />
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-fg break-words">{cert.name}</h3>
                    <p className="text-xs text-fg-muted break-words">
                      {cert.issuer}
                      {cert.date ? ` · ${cert.date}` : ''}
                    </p>
                  </div>
                </div>
                {href && (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="self-start inline-flex items-center gap-1.5 rounded-xl border-2 border-line bg-surface px-2.5 py-1 text-2xs font-bold text-fg shadow-doodle-xs hover:bg-surface-3"
                  >
                    <ExternalLink className="w-3 h-3" aria-hidden />
                    View credential
                    <span className="sr-only"> for {cert.name} (opens in a new tab)</span>
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Skills                                                              */
/* ------------------------------------------------------------------ */

const SKILL_TONES = ['highlight', 'sky', 'mint', 'lilac', 'peach', 'rose'] as const;

export function SkillsSection({ skills }: { skills: SkillGroup[] }) {
  const groups = skills.filter((g) => g.skills.length > 0);
  return (
    <section>
      <SectionTitle icon={<Sparkles className="w-4 h-4" />}>Skills</SectionTitle>
      {groups.length === 0 ? (
        <EmptyState title="No skills added yet" />
      ) : (
        <div className="flex flex-col gap-5">
          {groups.map((group, gi) => (
            <div key={group.id ?? group.category}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-fg-muted mb-2">{group.category}</h3>
              <ul className={cx('flex flex-wrap gap-2')}>
                {group.skills.map((skill) => (
                  <li key={skill}>
                    <Badge tone={SKILL_TONES[gi % SKILL_TONES.length]} className="text-xs">
                      {skill}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
