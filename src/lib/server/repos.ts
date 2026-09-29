import { prisma } from '@/lib/db';
import type { z } from 'zod';
import {
  serializeCertification,
  serializeEducation,
  serializeExperience,
  serializeProject,
  serializeSkill,
} from './serializers';
import {
  certificationCreateSchema,
  certificationUpdateSchema,
  educationCreateSchema,
  educationUpdateSchema,
  experienceCreateSchema,
  experienceUpdateSchema,
  projectCreateSchema,
  projectUpdateSchema,
  skillCreateSchema,
  skillUpdateSchema,
} from './validation';

/** Data-access definition for one sortable collection (shared by the REST routes and MCP tools). */
export interface Repo<Row, Out, CreateS extends z.ZodType, UpdateS extends z.ZodType> {
  /** Human label used in messages, e.g. "Project". */
  label: string;
  createSchema: CreateS;
  updateSchema: UpdateS;
  list: () => Promise<Row[]>;
  /** Receives validated data plus the next free `order` value (used when none was given). */
  create: (data: z.output<CreateS>, nextOrder: number) => Promise<Row>;
  update: (id: string, data: z.output<UpdateS>) => Promise<Row>;
  remove: (id: string) => Promise<unknown>;
  maxOrder: () => Promise<number | null>;
  serialize: (row: Row) => Out;
}

export function defineRepo<Row, Out, CreateS extends z.ZodType, UpdateS extends z.ZodType>(
  repo: Repo<Row, Out, CreateS, UpdateS>,
): Repo<Row, Out, CreateS, UpdateS> {
  return repo;
}

export const projectRepo = defineRepo({
  label: 'Project',
  createSchema: projectCreateSchema,
  updateSchema: projectUpdateSchema,
  list: () => prisma.project.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'asc' }, { title: 'asc' }] }),
  maxOrder: async () => (await prisma.project.aggregate({ _max: { order: true } }))._max.order,
  create: (d, nextOrder) =>
    prisma.project.create({
      data: {
        title: d.title,
        description: d.description,
        tags: d.tags ?? [],
        githubUrl: d.githubUrl ?? null,
        liveUrl: d.liveUrl ?? null,
        images: d.images ?? [],
        featured: d.featured ?? false,
        role: d.role ?? null,
        period: d.period ?? null,
        order: d.order ?? nextOrder,
      },
    }),
  update: (id, d) => prisma.project.update({ where: { id }, data: d }),
  remove: (id) => prisma.project.delete({ where: { id } }),
  serialize: serializeProject,
});

export const skillRepo = defineRepo({
  label: 'Skill group',
  createSchema: skillCreateSchema,
  updateSchema: skillUpdateSchema,
  list: () => prisma.skill.findMany({ orderBy: [{ order: 'asc' }, { category: 'asc' }] }),
  maxOrder: async () => (await prisma.skill.aggregate({ _max: { order: true } }))._max.order,
  create: (d, nextOrder) =>
    prisma.skill.create({ data: { category: d.category, skills: d.skills, order: d.order ?? nextOrder } }),
  update: (id, d) => prisma.skill.update({ where: { id }, data: d }),
  remove: (id) => prisma.skill.delete({ where: { id } }),
  serialize: serializeSkill,
});

export const experienceRepo = defineRepo({
  label: 'Experience',
  createSchema: experienceCreateSchema,
  updateSchema: experienceUpdateSchema,
  list: () => prisma.experience.findMany({ orderBy: [{ order: 'asc' }, { company: 'asc' }] }),
  maxOrder: async () => (await prisma.experience.aggregate({ _max: { order: true } }))._max.order,
  create: (d, nextOrder) =>
    prisma.experience.create({
      data: {
        role: d.role,
        company: d.company,
        duration: d.duration,
        description: d.description ?? [],
        order: d.order ?? nextOrder,
      },
    }),
  update: (id, d) => prisma.experience.update({ where: { id }, data: d }),
  remove: (id) => prisma.experience.delete({ where: { id } }),
  serialize: serializeExperience,
});

export const educationRepo = defineRepo({
  label: 'Education',
  createSchema: educationCreateSchema,
  updateSchema: educationUpdateSchema,
  list: () => prisma.education.findMany({ orderBy: [{ order: 'asc' }, { institution: 'asc' }] }),
  maxOrder: async () => (await prisma.education.aggregate({ _max: { order: true } }))._max.order,
  create: (d, nextOrder) =>
    prisma.education.create({
      data: {
        institution: d.institution,
        degree: d.degree,
        field: d.field ?? null,
        period: d.period,
        description: d.description ?? null,
        order: d.order ?? nextOrder,
      },
    }),
  update: (id, d) => prisma.education.update({ where: { id }, data: d }),
  remove: (id) => prisma.education.delete({ where: { id } }),
  serialize: serializeEducation,
});

export const certificationRepo = defineRepo({
  label: 'Certification',
  createSchema: certificationCreateSchema,
  updateSchema: certificationUpdateSchema,
  list: () => prisma.certification.findMany({ orderBy: [{ order: 'asc' }, { name: 'asc' }] }),
  maxOrder: async () => (await prisma.certification.aggregate({ _max: { order: true } }))._max.order,
  create: (d, nextOrder) =>
    prisma.certification.create({
      data: {
        name: d.name,
        issuer: d.issuer,
        date: d.date,
        credentialUrl: d.credentialUrl ?? null,
        order: d.order ?? nextOrder,
      },
    }),
  update: (id, d) => prisma.certification.update({ where: { id }, data: d }),
  remove: (id) => prisma.certification.delete({ where: { id } }),
  serialize: serializeCertification,
});
