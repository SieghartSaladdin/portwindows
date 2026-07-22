import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { prisma } from "../../lib/db";
import { jsonResponse, textResponse } from "./index";

export function registerExperiencesTools(server: McpServer) {
  server.tool(
    "list_experiences",
    "List all timeline professional experience entries.",
    {},
    async () => {
      try {
        const experiences = await prisma.experience.findMany();
        return jsonResponse(experiences);
      } catch (err: any) {
        return textResponse(`Error listing experiences: ${err.message}`);
      }
    }
  );

  server.tool(
    "create_experience",
    "Create a new timeline professional experience entry.",
    {
      role: z.string().describe("Job role/title"),
      company: z.string().describe("Company name"),
      duration: z.string().describe("Duration span (e.g. '2023 - Present')"),
      description: z.array(z.string()).describe("List of key achievements/description points"),
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

  server.tool(
    "update_experience",
    "Update details of an existing professional experience entry.",
    {
      id: z.string().describe("The unique ID of the experience to update"),
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

  server.tool(
    "delete_experience",
    "Delete a professional experience entry.",
    {
      id: z.string().describe("The unique ID of the experience to delete"),
    },
    async (args) => {
      try {
        await prisma.experience.delete({
          where: { id: args.id },
        });
        return textResponse(`Experience entry with ID ${args.id} deleted successfully.`);
      } catch (err: any) {
        return textResponse(`Error deleting experience: ${err.message}`);
      }
    }
  );
}
