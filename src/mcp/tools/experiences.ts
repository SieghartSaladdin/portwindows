import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { prisma } from "../../lib/db";
import { jsonResponse, textResponse } from "./index";

export function registerExperiencesTools(server: McpServer) {
  // READ: List all experience entries
  server.tool(
    "list_experiences",
    "List all timeline professional work experience entries from the portfolio database.",
    {
      query: z.string().optional().describe("Optional search term for role, company, or description"),
    },
    async (args) => {
      try {
        let experiences = await prisma.experience.findMany();
        if (args.query) {
          const q = args.query.toLowerCase();
          experiences = experiences.filter((exp: any) => {
            const roleMatch = exp.role.toLowerCase().includes(q);
            const compMatch = exp.company.toLowerCase().includes(q);
            const descMatch = Array.isArray(exp.description) && exp.description.some((d: string) => d.toLowerCase().includes(q));
            return roleMatch || compMatch || descMatch;
          });
        }
        return jsonResponse(experiences);
      } catch (err: any) {
        return textResponse(`Error listing experiences: ${err.message}`);
      }
    }
  );

  // READ: Get single experience entry by ID, role, or company
  server.tool(
    "get_experience",
    "Retrieve details of a specific professional experience entry by ID, role, or company.",
    {
      id: z.string().optional().describe("Unique ID of the experience entry"),
      query: z.string().optional().describe("Company name or job role (case-insensitive search)"),
    },
    async (args) => {
      try {
        if (!args.id && !args.query) {
          return textResponse("Please provide either 'id' or 'query' to search for the experience entry.");
        }

        let experience = null;
        if (args.id) {
          experience = await prisma.experience.findUnique({ where: { id: args.id } });
        } else if (args.query) {
          const allExp = await prisma.experience.findMany();
          const target = args.query.toLowerCase();
          experience = allExp.find((exp: any) => 
            exp.company.toLowerCase().includes(target) || exp.role.toLowerCase().includes(target)
          ) || null;
        }

        if (!experience) {
          return textResponse(`Experience entry not found matching criteria: ${args.id || args.query}`);
        }
        return jsonResponse(experience);
      } catch (err: any) {
        return textResponse(`Error getting experience entry: ${err.message}`);
      }
    }
  );

  // CREATE: Add new experience entry
  server.tool(
    "create_experience",
    "Create a new timeline professional experience entry in the database.",
    {
      role: z.string().describe("Job role/title (e.g., 'Senior Frontend Engineer')"),
      company: z.string().describe("Company name"),
      duration: z.string().describe("Duration span (e.g., '2023 - Present')"),
      description: z.array(z.string()).describe("List of key achievements/responsibility points"),
    },
    async (args) => {
      try {
        const newExperience = await prisma.experience.create({
          data: {
            role: args.role,
            company: args.company,
            duration: args.duration,
            description: args.description,
          },
        });
        return jsonResponse({ message: "Experience created successfully", experience: newExperience });
      } catch (err: any) {
        return textResponse(`Error creating experience: ${err.message}`);
      }
    }
  );

  // UPDATE: Edit existing experience entry
  server.tool(
    "update_experience",
    "Update details of an existing professional experience entry.",
    {
      id: z.string().describe("The unique ID of the experience entry to update"),
      role: z.string().optional().describe("New job role"),
      company: z.string().optional().describe("New company name"),
      duration: z.string().optional().describe("New duration"),
      description: z.array(z.string()).optional().describe("New list of description points"),
    },
    async (args) => {
      try {
        const updated = await prisma.experience.update({
          where: { id: args.id },
          data: {
            role: args.role !== undefined ? args.role : undefined,
            company: args.company !== undefined ? args.company : undefined,
            duration: args.duration !== undefined ? args.duration : undefined,
            description: args.description !== undefined ? args.description : undefined,
          },
        });
        return jsonResponse({ message: "Experience updated successfully", experience: updated });
      } catch (err: any) {
        return textResponse(`Error updating experience: ${err.message}`);
      }
    }
  );

  // DELETE: Remove experience entry
  server.tool(
    "delete_experience",
    "Delete a professional experience entry from the database.",
    {
      id: z.string().describe("The unique ID of the experience to delete"),
    },
    async (args) => {
      try {
        await prisma.experience.delete({
          where: { id: args.id },
        });
        return textResponse(`Experience entry with ID "${args.id}" deleted successfully.`);
      } catch (err: any) {
        return textResponse(`Error deleting experience: ${err.message}`);
      }
    }
  );
}
