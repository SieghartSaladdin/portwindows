import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { prisma } from "../../lib/db";
import { jsonResponse, textResponse } from "./index";

export function registerStatsTools(server: McpServer) {
  server.tool(
    "get_dashboard_stats",
    "Get live metrics and summary overview of the Admin Dashboard (Projects count, Skill groups, Experiences, Profile status, and Database diagnostics).",
    {},
    async () => {
      try {
        const [projectsCount, skillsCount, experiencesCount, profile] = await Promise.all([
          prisma.project.count(),
          prisma.skill.count(),
          prisma.experience.count(),
          prisma.profile.findFirst(),
        ]);

        return jsonResponse({
          status: "ONLINE",
          engine: "PostgreSQL (portfolio_db)",
          orm: "Prisma Client",
          metrics: {
            totalProjects: projectsCount,
            totalSkillGroups: skillsCount,
            totalExperiences: experiencesCount,
            profileConfigured: !!profile,
          },
          profileSummary: profile
            ? {
                name: profile.name,
                title: profile.title,
                location: profile.location,
                email: profile.email,
              }
            : null,
        });
      } catch (err: any) {
        return textResponse(`Error retrieving dashboard stats: ${err.message}`);
      }
    }
  );
}
