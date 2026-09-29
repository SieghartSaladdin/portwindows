import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { prisma } from "../../lib/db";
import { PROFILE_ID } from "../../lib/server/portfolio";
import { serializeProfile } from "../../lib/server/serializers";
import { profileSchema } from "../../lib/server/validation";
import { errorMessage, errorResponse, jsonResponse, textResponse, validate } from "./helpers";

const urlHint = "http(s) URL or /api/uploads/... path; empty string clears it";

export function registerProfileTools(server: McpServer) {
  server.registerTool(
    "get_profile",
    { description: "Get the developer profile (name, title, bio, location, email, phone, links, avatar and CV URLs)." },
    async () => {
      try {
        const profile = await prisma.profile.findUnique({ where: { id: PROFILE_ID } });
        return profile ? jsonResponse(serializeProfile(profile)) : textResponse("The profile has not been created yet.");
      } catch (err) {
        return errorResponse(`Error retrieving profile: ${errorMessage(err)}`);
      }
    },
  );

  server.registerTool(
    "update_profile",
    {
      description: "Update the developer profile. Omitted fields stay unchanged. If no profile exists yet, 'name' is required.",
      inputSchema: {
        name: z.string().optional().describe("Full name"),
        title: z.string().optional().describe("Professional title"),
        location: z.string().optional().describe("City / country"),
        email: z.string().optional().describe("Public contact email (empty string clears it)"),
        bio: z.string().optional().describe("About-me text"),
        phone: z.string().optional().describe("Phone number (empty string clears it)"),
        githubUrl: z.string().optional().describe(`GitHub profile (${urlHint})`),
        linkedinUrl: z.string().optional().describe(`LinkedIn profile (${urlHint})`),
        websiteUrl: z.string().optional().describe(`Personal website (${urlHint})`),
        avatarUrl: z.string().optional().describe(`Avatar image (${urlHint})`),
        resumeUrl: z.string().optional().describe(`CV / resume PDF (${urlHint})`),
      },
    },
    async (args) => {
      try {
        const existing = await prisma.profile.findUnique({ where: { id: PROFILE_ID } });
        const v = validate(existing ? profileSchema.partial() : profileSchema, args);
        if (!v.ok) return v.response;
        const d = v.data;

        const profile = existing
          ? await prisma.profile.update({ where: { id: PROFILE_ID }, data: d })
          : await prisma.profile.create({
              data: {
                id: PROFILE_ID,
                name: d.name ?? "",
                title: d.title ?? "",
                location: d.location ?? "",
                email: d.email ?? "",
                bio: d.bio ?? "",
                githubUrl: d.githubUrl ?? null,
                linkedinUrl: d.linkedinUrl ?? null,
                websiteUrl: d.websiteUrl ?? null,
                phone: d.phone ?? null,
                avatarUrl: d.avatarUrl ?? null,
                resumeUrl: d.resumeUrl ?? null,
              },
            });
        return jsonResponse({ message: existing ? "Profile updated." : "Profile created.", profile: serializeProfile(profile) });
      } catch (err) {
        return errorResponse(`Error updating profile: ${errorMessage(err)}`);
      }
    },
  );
}
