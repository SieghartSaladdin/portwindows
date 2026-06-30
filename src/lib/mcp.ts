import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { prisma } from "./db";

// Helper for formatted text response
function textResponse(text: string) {
  return {
    content: [{ type: "text" as const, text }],
  };
}

// Helper for formatted JSON response
function jsonResponse(data: any) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

// Create server globally to persist across Next.js hot-reloads
const globalForMcp = globalThis as unknown as {
  mcpServer?: McpServer;
};

if (!globalForMcp.mcpServer) {
  globalForMcp.mcpServer = new McpServer({
    name: "portwindows-mcp",
    version: "1.0.0",
  });

  const server = globalForMcp.mcpServer;

  // ----------------------------------------------------
  // 1. Profile Tools
  // ----------------------------------------------------
  server.tool(
    "get_profile",
    "Retrieve the developer's profile information (name, title, bio, email, location, githubUrl, linkedinUrl).",
    {},
    async () => {
      try {
        let profile = await prisma.profile.findFirst();
        if (!profile) {
          return textResponse("No profile record found in the database.");
        }
        return jsonResponse(profile);
      } catch (err: any) {
        return textResponse(`Error retrieving profile: ${err.message}`);
      }
    }
  );

  server.tool(
    "update_profile",
    "Update the developer's profile/about-me details.",
    {
      name: z.string().optional().describe("Developer's full name"),
      title: z.string().optional().describe("Professional job title"),
      location: z.string().optional().describe("Location (e.g., Seattle, WA)"),
      email: z.string().email().optional().describe("Contact email address"),
      bio: z.string().optional().describe("Biography markdown string"),
      githubUrl: z.string().url().optional().describe("GitHub profile link"),
      linkedinUrl: z.string().url().optional().describe("LinkedIn profile link"),
    },
    async (args) => {
      try {
        let profile = await prisma.profile.findFirst();
        if (!profile) {
          const newProfile = await prisma.profile.create({
            data: {
              id: "1",
              name: args.name || "Default Name",
              title: args.title || "Developer",
              location: args.location || "Earth",
              email: args.email || "email@example.com",
              bio: args.bio || "",
              githubUrl: args.githubUrl || null,
              linkedinUrl: args.linkedinUrl || null,
            },
          });
          return textResponse(`No profile existed; created a new one: ${JSON.stringify(newProfile, null, 2)}`);
        }

        const updated = await prisma.profile.update({
          where: { id: profile.id },
          data: {
            name: args.name !== undefined ? args.name : undefined,
            title: args.title !== undefined ? args.title : undefined,
            location: args.location !== undefined ? args.location : undefined,
            email: args.email !== undefined ? args.email : undefined,
            bio: args.bio !== undefined ? args.bio : undefined,
            githubUrl: args.githubUrl !== undefined ? args.githubUrl : undefined,
            linkedinUrl: args.linkedinUrl !== undefined ? args.linkedinUrl : undefined,
          },
        });

        return jsonResponse({ message: "Profile updated successfully", profile: updated });
      } catch (err: any) {
        return textResponse(`Error updating profile: ${err.message}`);
      }
    }
  );

  // ----------------------------------------------------
  // 2. Projects CRUD Tools
  // ----------------------------------------------------
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

  // ----------------------------------------------------
  // 3. Skills CRUD Tools
  // ----------------------------------------------------
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

  // ----------------------------------------------------
  // 4. Experiences CRUD Tools
  // ----------------------------------------------------
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

export const mcpServer = globalForMcp.mcpServer;
