import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { prisma } from "../../lib/db";
import { jsonResponse, textResponse } from "./index";

export function registerProjectsTools(server: McpServer) {
  server.tool(
    "list_projects",
    "List all projects displayed in the portfolio database.",
    {},
    async () => {
      try {
        const projects = await prisma.project.findMany();
        return jsonResponse(projects);
      } catch (err: any) {
        return textResponse(`Error listing projects: ${err.message}`);
      }
    }
  );

  server.tool(
    "create_project",
    "Add a new developer project to the portfolio database.",
    {
      title: z.string().describe("Title of the project"),
      description: z.string().describe("Short project description/summary"),
      tags: z.array(z.string()).describe("List of tech stack tags (e.g. ['React', 'SQLite'])"),
      githubUrl: z.string().url().optional().describe("GitHub code repository URL"),
      liveUrl: z.string().url().optional().describe("Live deployment URL"),
    },
    async (args) => {
      try {
        const newProject = await prisma.project.create({
          data: {
            title: args.title,
            description: args.description,
            tags: args.tags,
            githubUrl: args.githubUrl || null,
            liveUrl: args.liveUrl || null,
          },
        });
        return jsonResponse({ message: "Project created successfully", project: newProject });
      } catch (err: any) {
        return textResponse(`Error creating project: ${err.message}`);
      }
    }
  );

  server.tool(
    "update_project",
    "Update details of an existing project in the database.",
    {
      id: z.string().describe("The unique ID (UUID) of the project to update"),
      title: z.string().optional().describe("New title"),
      description: z.string().optional().describe("New description"),
      tags: z.array(z.string()).optional().describe("New list of tech stack tags"),
      githubUrl: z.string().url().optional().nullable().describe("New GitHub link (or null to clear)"),
      liveUrl: z.string().url().optional().nullable().describe("New live demo link (or null to clear)"),
    },
    async (args) => {
      try {
        const updated = await prisma.project.update({
          where: { id: args.id },
          data: {
            title: args.title !== undefined ? args.title : undefined,
            description: args.description !== undefined ? args.description : undefined,
            tags: args.tags !== undefined ? args.tags : undefined,
            githubUrl: args.githubUrl !== undefined ? args.githubUrl : undefined,
            liveUrl: args.liveUrl !== undefined ? args.liveUrl : undefined,
          },
        });
        return jsonResponse({ message: "Project updated successfully", project: updated });
      } catch (err: any) {
        return textResponse(`Error updating project: ${err.message}`);
      }
    }
  );

  server.tool(
    "delete_project",
    "Remove a project from the database.",
    {
      id: z.string().describe("The unique ID of the project to delete"),
    },
    async (args) => {
      try {
        await prisma.project.delete({
          where: { id: args.id },
        });
        return textResponse(`Project with ID ${args.id} deleted successfully.`);
      } catch (err: any) {
        return textResponse(`Error deleting project: ${err.message}`);
      }
    }
  );
}
