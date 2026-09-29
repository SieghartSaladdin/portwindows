import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { experienceRepo } from "../../lib/server/repos";
import { matchesQuery, registerEntityTools } from "./helpers";

export function registerExperiencesTools(server: McpServer) {
  registerEntityTools(server, {
    singular: "experience",
    plural: "experiences",
    repo: experienceRepo,
    createShape: {
      role: z.string().describe("Job title, e.g. 'Frontend Engineer'"),
      company: z.string().describe("Company or organisation"),
      duration: z.string().describe("Period, e.g. '2023 - Present'"),
      description: z.array(z.string()).optional().describe("Key achievements / responsibilities, one per item"),
      order: z.number().int().min(0).optional().describe("Display position (0 = first)"),
    },
    search: (e, q) => matchesQuery(q, e.role, e.company, e.description),
  });
}
