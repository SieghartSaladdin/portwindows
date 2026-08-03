import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { prisma } from "../../lib/db";
import { jsonResponse, textResponse } from "./index";

export function registerProfileTools(server: McpServer) {
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
}
