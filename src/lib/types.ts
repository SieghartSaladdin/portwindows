// Shared portfolio data contracts used by the API, the store and every app.

export interface Profile {
  id?: string;
  name: string;
  title: string;
  location: string;
  email: string;
  bio: string;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  websiteUrl?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  resumeUrl?: string | null;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  githubUrl?: string | null;
  liveUrl?: string | null;
  images?: string[];
  featured?: boolean;
  role?: string | null;
  period?: string | null;
  order?: number;
}

export interface SkillGroup {
  id?: string;
  category: string;
  skills: string[];
  order?: number;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  duration: string;
  description: string[];
  order?: number;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field?: string | null;
  period: string;
  description?: string | null;
  order?: number;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  credentialUrl?: string | null;
  order?: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
}

/** Shape returned by GET /api/portfolio */
export interface PortfolioData {
  profile: Profile | null;
  projects: Project[];
  skills: SkillGroup[];
  experiences: Experience[];
  educations: Education[];
  certifications: Certification[];
}
