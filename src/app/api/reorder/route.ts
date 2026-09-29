import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleRouteError, jsonError, parseJsonBody, requireAdmin } from '@/lib/server/http';
import { reorderSchema, type ReorderEntity } from '@/lib/server/validation';

/** Existing ids for the entity, restricted to `ids`. */
async function findExisting(entity: ReorderEntity, ids: string[]): Promise<string[]> {
  const args = { where: { id: { in: ids } }, select: { id: true } } as const;
  switch (entity) {
    case 'projects':
      return (await prisma.project.findMany(args)).map((r) => r.id);
    case 'skills':
      return (await prisma.skill.findMany(args)).map((r) => r.id);
    case 'experiences':
      return (await prisma.experience.findMany(args)).map((r) => r.id);
    case 'educations':
      return (await prisma.education.findMany(args)).map((r) => r.id);
    case 'certifications':
      return (await prisma.certification.findMany(args)).map((r) => r.id);
  }
}

function updateOrder(entity: ReorderEntity, id: string, order: number) {
  const args = { where: { id }, data: { order } };
  switch (entity) {
    case 'projects':
      return prisma.project.update(args);
    case 'skills':
      return prisma.skill.update(args);
    case 'experiences':
      return prisma.experience.update(args);
    case 'educations':
      return prisma.education.update(args);
    case 'certifications':
      return prisma.certification.update(args);
  }
}

/** POST { entity, ids } sets `order` to each id's index in `ids`. */
export async function POST(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const parsed = await parseJsonBody(request, reorderSchema);
  if (!parsed.ok) return parsed.response;
  const { entity, ids } = parsed.data;

  try {
    const existing = new Set(await findExisting(entity, ids));
    const missing = ids.filter((id) => !existing.has(id));
    if (missing.length) {
      return jsonError(400, 'Some ids do not exist.', { ids: `Unknown ${entity} ids: ${missing.join(', ')}` });
    }
    await prisma.$transaction(ids.map((id, index) => updateOrder(entity, id, index)));
    return NextResponse.json({ success: true, entity, ids });
  } catch (error) {
    return handleRouteError(error, `reorder ${entity}`);
  }
}
