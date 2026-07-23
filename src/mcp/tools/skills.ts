import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { prisma } from "../../lib/db";
import { jsonResponse, textResponse } from "./index";

export function registerSkillsTools(server: McpServer) {
  // READ: List all skill groups
  server.tool(
    "list_skills",
    "List all skill categories and associated skill tags from the portfolio database.",
    {
      query: z.string().optional().describe("Optional search term for category name or skill tag"),
    },
    async (args) => {
      try {
        let skills = await prisma.skill.findMany();
        if (args.query) {
          const q = args.query.toLowerCase();
          skills = skills.filter((s: any) => {
            const catMatch = s.category.toLowerCase().includes(q);
            const tagMatch = Array.isArray(s.skills) && s.skills.some((sk: string) => sk.toLowerCase().includes(q));
            return catMatch || tagMatch;
          });
        }
        return jsonResponse(skills);
      } catch (err: any) {
        return textResponse(`Error listing skills: ${err.message}`);
      }
    }
  );

  // READ: Get single skill group by ID or category name
  server.tool(
    "get_skill",
    "Retrieve details of a specific skill category by ID or category name.",
    {
      id: z.string().optional().describe("Unique ID of the skill group"),
      category: z.string().optional().describe("Category name (case-insensitive search)"),
    },
    async (args) => {
      try {
        if (!args.id && !args.category) {
          return textResponse("Please provide either 'id' or 'category' to search for the skill group.");
        }

        let skillGroup = null;
        if (args.id) {
          skillGroup = await prisma.skill.findUnique({ where: { id: args.id } });
        } else if (args.category) {
          const allSkills = await prisma.skill.findMany();
          const target = args.category.toLowerCase();
          skillGroup = allSkills.find((s: any) => s.category.toLowerCase().includes(target)) || null;
        }

        if (!skillGroup) {
          return textResponse(`Skill group not found matching criteria: ${args.id || args.category}`);
        }
        return jsonResponse(skillGroup);
      } catch (err: any) {
        return textResponse(`Error getting skill group: ${err.message}`);
      }
    }
  );

  // CREATE: Add new skill group
  server.tool(
    "create_skill",
    "Add a new skill category with associated skill tags to the database.",
    {
      category: z.string().describe("Category name (e.g., 'Backend Development', 'DevOps & Cloud')"),
      skills: z.array(z.string()).describe("List of skill tags (e.g. ['Node.js', 'PostgreSQL', 'Docker'])"),
    },
    async (args) => {
      try {
        const newSkill = await prisma.skill.create({
          data: {
            category: args.category,
            skills: args.skills,
          },
        });
        return jsonResponse({ message: "Skill group created successfully", skill: newSkill });
      } catch (err: any) {
        return textResponse(`Error creating skill group: ${err.message}`);
      }
    }
  );

  // UPDATE: Edit existing skill group
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
        return textResponse(`Error updating skill category: ${err.message}`);
      }
    }
  );

  // DELETE: Remove skill group
  server.tool(
    "delete_skill",
    "Delete a skill category from the database.",
    {
      id: z.string().describe("The unique ID of the skill category to delete"),
    },
    async (args) => {
      try {
        await prisma.skill.delete({
          where: { id: args.id },
        });
        return textResponse(`Skill category with ID "${args.id}" deleted successfully.`);
      } catch (err: any) {
        return textResponse(`Error deleting skill category: ${err.message}`);
      }
    }
  );
}
