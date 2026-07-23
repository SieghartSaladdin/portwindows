import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { prisma } from "../../lib/db";
import { jsonResponse, textResponse } from "./index";

export function registerProjectsTools(server: McpServer) {
  // READ: List all projects
  server.tool(
    "list_projects",
    "List all developer projects in the portfolio database with optional search filtering.",
    {
      query: z.string().optional().describe("Optional search term for title, description, or tags"),
      featuredOnly: z.boolean().optional().describe("If true, only return featured projects"),
    },
    async (args) => {
      try {
        let projects = await prisma.project.findMany();
        if (args.featuredOnly) {
          projects = projects.filter((p: any) => p.featured === true);
        }
        if (args.query) {
          const q = args.query.toLowerCase();
          projects = projects.filter((p: any) => {
            const titleMatch = p.title.toLowerCase().includes(q);
            const descMatch = p.description.toLowerCase().includes(q);
            const tagsMatch = Array.isArray(p.tags) && p.tags.some((t: string) => t.toLowerCase().includes(q));
            return titleMatch || descMatch || tagsMatch;
          });
        }
        return jsonResponse(projects);
      } catch (err: any) {
        return textResponse(`Error listing projects: ${err.message}`);
      }
    }
  );

  // READ: Get single project by ID or title
  server.tool(
    "get_project",
    "Retrieve details of a single project by its unique ID or title.",
    {
      id: z.string().optional().describe("Unique ID (UUID) of the project"),
      title: z.string().optional().describe("Title of the project (case-insensitive search)"),
    },
    async (args) => {
      try {
        if (!args.id && !args.title) {
          return textResponse("Please provide either 'id' or 'title' to find the project.");
        }

        let project = null;
        if (args.id) {
          project = await prisma.project.findUnique({ where: { id: args.id } });
        } else if (args.title) {
          const allProjects = await prisma.project.findMany();
          const target = args.title.toLowerCase();
          project = allProjects.find((p: any) => p.title.toLowerCase().includes(target)) || null;
        }

        if (!project) {
          return textResponse(`Project not found matching criteria: ${args.id || args.title}`);
        }
        return jsonResponse(project);
      } catch (err: any) {
        return textResponse(`Error getting project: ${err.message}`);
      }
    }
  );

  // CREATE: Add new project
  server.tool(
    "create_project",
    "Add a new developer project repository to the portfolio database.",
    {
      title: z.string().describe("Title of the project"),
      description: z.string().describe("Detailed project description/summary"),
      tags: z.array(z.string()).describe("List of tech stack tags (e.g. ['React', 'Next.js', 'PostgreSQL'])"),
      githubUrl: z.string().url().optional().describe("GitHub code repository URL"),
      liveUrl: z.string().url().optional().describe("Live deployment/demo URL"),
      images: z.array(z.string()).optional().describe("List of project screenshot URLs"),
      featured: z.boolean().optional().describe("Whether this is a featured recommendation project"),
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
            images: args.images || [],
            featured: args.featured ?? false,
          },
        });
        return jsonResponse({ message: "Project created successfully", project: newProject });
      } catch (err: any) {
        return textResponse(`Error creating project: ${err.message}`);
      }
    }
  );

  // UPDATE: Edit existing project
  server.tool(
    "update_project",
    "Update fields of an existing project in the database.",
    {
      id: z.string().describe("The unique ID (UUID) of the project to update"),
      title: z.string().optional().describe("New title"),
      description: z.string().optional().describe("New description"),
      tags: z.array(z.string()).optional().describe("New list of tech stack tags"),
      githubUrl: z.string().url().optional().nullable().describe("New GitHub link"),
      liveUrl: z.string().url().optional().nullable().describe("New live demo link"),
      images: z.array(z.string()).optional().describe("New list of image URLs"),
      featured: z.boolean().optional().describe("Set featured status flag"),
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
            images: args.images !== undefined ? args.images : undefined,
            featured: args.featured !== undefined ? args.featured : undefined,
          },
        });
        return jsonResponse({ message: "Project updated successfully", project: updated });
      } catch (err: any) {
        return textResponse(`Error updating project: ${err.message}`);
      }
    }
  );

  // DELETE: Remove project
  server.tool(
    "delete_project",
    "Remove a project permanently from the portfolio database.",
    {
      id: z.string().describe("The unique ID of the project to delete"),
    },
    async (args) => {
      try {
        await prisma.project.delete({
          where: { id: args.id },
        });
        return textResponse(`Project with ID "${args.id}" deleted successfully.`);
      } catch (err: any) {
        return textResponse(`Error deleting project: ${err.message}`);
      }
    }
  );
}
