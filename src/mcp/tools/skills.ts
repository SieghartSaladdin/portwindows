import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { skillRepo } from "../../lib/server/repos";
import { matchesQuery, registerEntityTools } from "./helpers";

export function registerSkillsTools(server: McpServer) {
  registerEntityTools(server, {
    singular: "skill",
    plural: "skills",
    repo: skillRepo,
    createShape: {
      category: z.string().describe("Skill group name, e.g. 'Backend'"),
      skills: z.array(z.string()).describe("Skills in this group, e.g. ['Node.js', 'PostgreSQL']"),
      order: z.number().int().min(0).optional().describe("Display position (0 = first)"),
    },
    search: (s, q) => matchesQuery(q, s.category, s.skills),
  });
}
