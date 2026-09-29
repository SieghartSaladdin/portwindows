import { NextResponse } from 'next/server';
import type { z } from 'zod';
import { handleRouteError, parseJsonBody, requireAdmin } from './http';
import type { Repo } from './repos';

type IdContext = { params: Promise<{ id: string }> };

/**
 * Builds the standard handlers for a sortable collection:
 * GET (public list), POST (admin create), PUT/DELETE by id (admin).
 */
export function createCrudHandlers<Row, Out, CreateS extends z.ZodType, UpdateS extends z.ZodType>(
  config: Repo<Row, Out, CreateS, UpdateS>,
) {
  const lower = config.label.toLowerCase();

  async function GET() {
    try {
      const rows = await config.list();
      return NextResponse.json(rows.map(config.serialize));
    } catch (error) {
      return handleRouteError(error, `list ${lower}`);
    }
  }

  async function POST(request: Request) {
    const denied = requireAdmin(request);
    if (denied) return denied;
    const parsed = await parseJsonBody(request, config.createSchema);
    if (!parsed.ok) return parsed.response;
    try {
      const max = await config.maxOrder();
      const row = await config.create(parsed.data, max === null ? 0 : max + 1);
      return NextResponse.json(config.serialize(row), { status: 201 });
    } catch (error) {
      return handleRouteError(error, `create ${lower}`, config.label);
    }
  }

  async function PUT(request: Request, ctx: IdContext) {
    const denied = requireAdmin(request);
    if (denied) return denied;
    const { id } = await ctx.params;
    const parsed = await parseJsonBody(request, config.updateSchema);
    if (!parsed.ok) return parsed.response;
    try {
      const row = await config.update(id, parsed.data);
      return NextResponse.json(config.serialize(row));
    } catch (error) {
      return handleRouteError(error, `update ${lower}`, config.label);
    }
  }

  async function DELETE(request: Request, ctx: IdContext) {
    const denied = requireAdmin(request);
    if (denied) return denied;
    const { id } = await ctx.params;
    try {
      await config.remove(id);
      return NextResponse.json({ success: true });
    } catch (error) {
      return handleRouteError(error, `delete ${lower}`, config.label);
    }
  }

  return { GET, POST, PUT, DELETE };
}
