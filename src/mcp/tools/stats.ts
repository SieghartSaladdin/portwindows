import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { prisma } from "../../lib/db";
import { PROFILE_ID } from "../../lib/server/portfolio";
import { errorMessage, errorResponse, jsonResponse } from "./helpers";

export function registerStatsTools(server: McpServer) {
  server.registerTool(
    "get_dashboard_stats",
    { description: "Summary of the portfolio content: counts per collection, unread contact messages and profile status." },
    async () => {
      try {
        const [projects, skillGroups, experiences, educations, certifications, messages, unreadMessages, profile] =
          await Promise.all([
            prisma.project.count(),
            prisma.skill.count(),
            prisma.experience.count(),
            prisma.education.count(),
            prisma.certification.count(),
            prisma.contactMessage.count(),
            prisma.contactMessage.count({ where: { read: false } }),
            prisma.profile.findUnique({ where: { id: PROFILE_ID } }),
          ]);

        return jsonResponse({
          metrics: { projects, skillGroups, experiences, educations, certifications, messages, unreadMessages },
          profileConfigured: !!profile,
          profileSummary: profile ? { name: profile.name, title: profile.title, location: profile.location, email: profile.email } : null,
        });
      } catch (err) {
        return errorResponse(`Error retrieving dashboard stats: ${errorMessage(err)}`);
      }
    },
  );
}
