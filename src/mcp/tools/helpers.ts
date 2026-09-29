import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { formatZodError } from "../../lib/server/validation";
import type { Repo } from "../../lib/server/repos";

export function textResponse(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

export function jsonResponse(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function errorResponse(text: string) {
  return { content: [{ type: "text" as const, text }], isError: true };
}

export function errorMessage(err: unknown): string {
  if (err && typeof err === "object" && "code" in err && (err as { code: unknown }).code === "P2025") {
    return "Record not found.";
  }
  return err instanceof Error ? err.message : String(err);
}

type Validated<T> = { ok: true; data: T } | { ok: false; response: ReturnType<typeof errorResponse> };

/** Validates tool arguments with the same rules as the REST API. */
export function validate<S extends z.ZodType>(schema: S, args: unknown): Validated<z.output<S>> {
  const result = schema.safeParse(args);
  if (result.success) return { ok: true, data: result.data };
  const details = Object.entries(formatZodError(result.error))
    .map(([field, msg]) => `- ${field}: ${msg}`)
    .join("\n");
  return { ok: false, response: errorResponse(`Invalid input:\n${details}`) };
}

export const matchesQuery = (query: string, ...fields: (string | null | undefined | string[])[]) => {
  const q = query.trim().toLowerCase();
  return fields.some((f) => (Array.isArray(f) ? f.join(" ") : f || "").toLowerCase().includes(q));
};

interface EntityToolsConfig<Row, Out, CreateS extends z.ZodType, UpdateS extends z.ZodType> {
  singular: string;
  plural: string;
  repo: Repo<Row, Out, CreateS, UpdateS>;
  /** Plain (JSON-schema friendly) argument shape advertised to clients for create; validated with repo.createSchema. */
  createShape: z.ZodRawShape;
  search: (item: Out, query: string) => boolean;
}

/** Registers list_<plural>, create_<singular>, update_<singular> and delete_<singular>. */
export function registerEntityTools<Row, Out, CreateS extends z.ZodType, UpdateS extends z.ZodType>(
  server: McpServer,
  cfg: EntityToolsConfig<Row, Out, CreateS, UpdateS>,
) {
  const { repo } = cfg;
  const label = repo.label.toLowerCase();
  const updateShape: z.ZodRawShape = {
    id: z.string().min(1).describe(`ID of the ${label} to update`),
    ...Object.fromEntries(Object.entries(cfg.createShape).map(([key, value]) => [key, (value as z.ZodType).optional()])),
  };

  server.registerTool(
    `list_${cfg.plural}`,
    {
      description: `List ${label} entries (sorted by display order), optionally filtered by a search term.`,
      inputSchema: { query: z.string().max(200).optional().describe("Optional search term") },
    },
    async (args) => {
      try {
        const items = (await repo.list()).map(repo.serialize);
        const q = typeof args.query === "string" ? args.query : "";
        return jsonResponse(q ? items.filter((item) => cfg.search(item, q)) : items);
      } catch (err) {
        return errorResponse(`Error listing ${cfg.plural}: ${errorMessage(err)}`);
      }
    },
  );

  server.registerTool(
    `create_${cfg.singular}`,
    { description: `Create a new ${label} entry. It is appended at the end unless 'order' is given.`, inputSchema: cfg.createShape },
    async (args) => {
      const v = validate(repo.createSchema, args);
      if (!v.ok) return v.response;
      try {
        const max = await repo.maxOrder();
        const row = await repo.create(v.data, max === null ? 0 : max + 1);
        return jsonResponse({ message: `${repo.label} created.`, [cfg.singular]: repo.serialize(row) });
      } catch (err) {
        return errorResponse(`Error creating ${cfg.singular}: ${errorMessage(err)}`);
      }
    },
  );

  server.registerTool(
    `update_${cfg.singular}`,
    { description: `Update fields of an existing ${label} entry. Omitted fields are left unchanged; send "" to clear an optional field.`, inputSchema: updateShape },
    async (args) => {
      const { id, ...rest } = args as Record<string, unknown>;
      const v = validate(repo.updateSchema, rest);
      if (!v.ok) return v.response;
      try {
        const row = await repo.update(String(id), v.data);
        return jsonResponse({ message: `${repo.label} updated.`, [cfg.singular]: repo.serialize(row) });
      } catch (err) {
        return errorResponse(`Error updating ${cfg.singular}: ${errorMessage(err)}`);
      }
    },
  );

  server.registerTool(
    `delete_${cfg.singular}`,
    {
      description: `Permanently delete a ${label} entry.`,
      inputSchema: { id: z.string().min(1).describe(`ID of the ${label} to delete`) },
      annotations: { destructiveHint: true },
    },
    async (args) => {
      try {
        await repo.remove(args.id);
        return textResponse(`${repo.label} "${args.id}" deleted.`);
      } catch (err) {
        return errorResponse(`Error deleting ${cfg.singular}: ${errorMessage(err)}`);
      }
    },
  );
}
