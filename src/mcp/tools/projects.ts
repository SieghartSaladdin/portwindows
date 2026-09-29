import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { projectRepo } from "../../lib/server/repos";
import { errorMessage, errorResponse, jsonResponse, matchesQuery, registerEntityTools, textResponse } from "./helpers";

const urlHint = "http(s) URL or /api/uploads/... path";

export function registerProjectsTools(server: McpServer) {
  registerEntityTools(server, {
    singular: "project",
    plural: "projects",
    repo: projectRepo,
    createShape: {
      title: z.string().describe("Project title"),
      description: z.string().describe("Project description / summary"),
      tags: z.array(z.string()).optional().describe("Tech stack tags, e.g. ['React', 'PostgreSQL']"),
      githubUrl: z.string().optional().describe(`Source code repository (${urlHint})`),
      liveUrl: z.string().optional().describe(`Live demo URL (${urlHint})`),
      images: z.array(z.string()).optional().describe(`Screenshot URLs (${urlHint})`),
      featured: z.boolean().optional().describe("Show as the featured project"),
      role: z.string().optional().describe("Your role in the project, e.g. 'Lead developer'"),
      period: z.string().optional().describe("When it happened, e.g. '2024 - 2025'"),
      order: z.number().int().min(0).optional().describe("Display position (0 = first)"),
    },
    search: (p, q) => matchesQuery(q, p.title, p.description, p.role, p.tags),
  });

  server.registerTool(
    "get_project",
    {
      description: "Get one project by its id, or the first project whose title contains the given text.",
      inputSchema: {
        id: z.string().optional().describe("Project id (UUID)"),
        title: z.string().optional().describe("Title or part of the title (case-insensitive)"),
      },
    },
    async (args) => {
      if (!args.id && !args.title) return errorResponse("Provide either 'id' or 'title'.");
      try {
        const projects = (await projectRepo.list()).map(projectRepo.serialize);
        const t = args.title?.toLowerCase();
        const project = args.id ? projects.find((p) => p.id === args.id) : projects.find((p) => p.title.toLowerCase().includes(t ?? ""));
        return project ? jsonResponse(project) : textResponse(`No project found for ${args.id ?? args.title}.`);
      } catch (err) {
        return errorResponse(`Error getting project: ${errorMessage(err)}`);
      }
    },
  );
}
