import type {
  Certification,
  ContactMessage,
  Education,
  Experience,
  Profile,
  Project,
  SkillGroup,
} from '@/lib/types';

/** Normalises a Prisma Json column (array, JSON string, or garbage) to a string array. */
export function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((v) => typeof v === 'string' || typeof v === 'number')
      .map((v) => String(v).trim())
      .filter(Boolean);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return toStringArray(parsed);
    } catch {
      // not JSON: treat as a single item
    }
    return [trimmed];
  }
  return [];
}

interface ProjectRow {
  id: string;
  title: string;
  description: string;
  tags: unknown;
  githubUrl: string | null;
  liveUrl: string | null;
  images: unknown;
  featured: boolean;
  role: string | null;
  period: string | null;
  order: number;
  createdAt: Date;
}

export function serializeProject(p: ProjectRow): Project & { createdAt: string } {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    tags: toStringArray(p.tags),
    githubUrl: p.githubUrl,
    liveUrl: p.liveUrl,
    images: toStringArray(p.images),
    featured: p.featured,
    role: p.role,
    period: p.period,
    order: p.order,
    createdAt: p.createdAt.toISOString(),
  };
}

export function serializeSkill(s: { id: string; category: string; skills: unknown; order: number }): SkillGroup {
  return { id: s.id, category: s.category, skills: toStringArray(s.skills), order: s.order };
}

export function serializeExperience(e: {
  id: string;
  role: string;
  company: string;
  duration: string;
  description: unknown;
  order: number;
}): Experience {
  return {
    id: e.id,
    role: e.role,
    company: e.company,
    duration: e.duration,
    description: toStringArray(e.description),
    order: e.order,
  };
}

export function serializeEducation(e: Education): Education {
  return {
    id: e.id,
    institution: e.institution,
    degree: e.degree,
    field: e.field ?? null,
    period: e.period,
    description: e.description ?? null,
    order: e.order,
  };
}

export function serializeCertification(c: Certification): Certification {
  return {
    id: c.id,
    name: c.name,
    issuer: c.issuer,
    date: c.date,
    credentialUrl: c.credentialUrl ?? null,
    order: c.order,
  };
}

export function serializeProfile(p: Profile): Profile {
  return {
    id: p.id,
    name: p.name,
    title: p.title,
    location: p.location,
    email: p.email,
    bio: p.bio,
    githubUrl: p.githubUrl ?? null,
    linkedinUrl: p.linkedinUrl ?? null,
    websiteUrl: p.websiteUrl ?? null,
    phone: p.phone ?? null,
    avatarUrl: p.avatarUrl ?? null,
    resumeUrl: p.resumeUrl ?? null,
  };
}

export function serializeMessage(m: {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: Date;
}): ContactMessage {
  return { id: m.id, name: m.name, email: m.email, message: m.message, read: m.read, createdAt: m.createdAt.toISOString() };
}
