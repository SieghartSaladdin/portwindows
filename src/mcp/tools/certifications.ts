import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { certificationRepo } from "../../lib/server/repos";
import { matchesQuery, registerEntityTools } from "./helpers";

export function registerCertificationTools(server: McpServer) {
  registerEntityTools(server, {
    singular: "certification",
    plural: "certifications",
    repo: certificationRepo,
    createShape: {
      name: z.string().describe("Certificate name"),
      issuer: z.string().describe("Issuing organisation"),
      date: z.string().describe("Issue date, e.g. '2024-05' or 'May 2024'"),
      credentialUrl: z.string().optional().describe("Verification link (http(s) URL or /api/uploads/... path)"),
      order: z.number().int().min(0).optional().describe("Display position (0 = first)"),
    },
    search: (c, q) => matchesQuery(q, c.name, c.issuer, c.date),
  });
}
