import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { prisma } from "../../lib/db";
import { jsonResponse, textResponse } from "./index";

export function registerSkillsTools(server: McpServer) {
  server.tool(
    "list_skills",
    "List all skill categories and their associated skill tags.",
    {},
    async () => {
      try {
        const skills = await prisma.skill.findMany();
        return jsonResponse(skills);
      } catch (err: any) {
        return textResponse(`Error listing skills: ${err.message}`);
      }
    }
  );

  server.tool(
    "create_skill",
    "Add a new skill category with its initial skill tags.",
    {
      category: z.string().describe("Category name (e.g. 'Frontend', 'Backend')"),
      skills: z.array(z.string()).describe("Initial skill tags (e.g. ['React', 'Next.js'])"),
    },
    async (args) => {
      try {
        const newSkill = await prisma.skill.create({
          data: {
            category: args.category,
            skills: args.skills,
          },
        });
        return jsonResponse({ message: "Skill category created successfully", skill: newSkill });
      } catch (err: any) {
        return textResponse(`Error creating skill: ${err.message}`);
      }
    }
  );

  server.tool(
    "update_skill",
    "Update an existing skill category name or its associated list of skill tags.",
    {
      id: z.string().describe("The unique ID of the skill category to update"),
      category: z.string().optional().describe("New category name"),
      skills: z.array(z.string()).optional().describe("New list of skill tags"),
    },
    async (args) => {
      try {
        const updated = await prisma.skill.update({
          where: { id: args.id },
          data: {
            category: args.category !== undefined ? args.category : undefined,
            skills: args.skills !== undefined ? args.skills : undefined,
          },
        });
        return jsonResponse({ message: "Skill category updated successfully", skill: updated });
      } catch (err: any) {
        return textResponse(`Error updating skill: ${err.message}`);
      }
    }
  );

  server.tool(
    "delete_skill",
    "Delete a skill category.",
    {
      id: z.string().describe("The unique ID of the skill category to delete"),
    },
    async (args) => {
      try {
        await prisma.skill.delete({
          where: { id: args.id },
        });
        return textResponse(`Skill category with ID ${args.id} deleted successfully.`);
      } catch (err: any) {
        return textResponse(`Error deleting skill: ${err.message}`);
      }
    }
  );
}
