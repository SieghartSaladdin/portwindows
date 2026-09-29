import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { educationRepo } from "../../lib/server/repos";
import { matchesQuery, registerEntityTools } from "./helpers";

export function registerEducationTools(server: McpServer) {
  registerEntityTools(server, {
    singular: "education",
    plural: "educations",
    repo: educationRepo,
    createShape: {
      institution: z.string().describe("School or university"),
      degree: z.string().describe("Degree or programme, e.g. 'B.Sc.'"),
      field: z.string().optional().describe("Field of study, e.g. 'Computer Science'"),
      period: z.string().describe("Period, e.g. '2018 - 2022'"),
      description: z.string().optional().describe("Optional notes (thesis, honours, activities)"),
      order: z.number().int().min(0).optional().describe("Display position (0 = first)"),
    },
    search: (e, q) => matchesQuery(q, e.institution, e.degree, e.field, e.description),
  });
}
