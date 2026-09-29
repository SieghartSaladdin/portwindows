import { prisma } from '@/lib/db';
import type { PortfolioData } from '@/lib/types';
import {
  serializeCertification,
  serializeEducation,
  serializeExperience,
  serializeProfile,
  serializeProject,
  serializeSkill,
} from './serializers';

export const PROFILE_ID = '1';

/** Read-only snapshot of every public portfolio collection, each sorted by `order`. */
export async function loadPortfolio(): Promise<PortfolioData> {
  const [profile, projects, skills, experiences, educations, certifications] = await Promise.all([
    prisma.profile.findUnique({ where: { id: PROFILE_ID } }),
    prisma.project.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'asc' }, { title: 'asc' }] }),
    prisma.skill.findMany({ orderBy: [{ order: 'asc' }, { category: 'asc' }] }),
    prisma.experience.findMany({ orderBy: [{ order: 'asc' }, { company: 'asc' }] }),
    prisma.education.findMany({ orderBy: [{ order: 'asc' }, { institution: 'asc' }] }),
    prisma.certification.findMany({ orderBy: [{ order: 'asc' }, { name: 'asc' }] }),
  ]);

  return {
    profile: profile ? serializeProfile(profile) : null,
    projects: projects.map(serializeProject),
    skills: skills.map(serializeSkill),
    experiences: experiences.map(serializeExperience),
    educations: educations.map(serializeEducation),
    certifications: certifications.map(serializeCertification),
  };
}
