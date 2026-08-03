import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerProfileTools } from "./profile";
import { registerProjectsTools } from "./projects";
import { registerSkillsTools } from "./skills";
import { registerExperiencesTools } from "./experiences";
import { registerStatsTools } from "./stats";

// Helper for formatted text response
export function textResponse(text: string) {
  return {
    content: [{ type: "text" as const, text }],
  };
}

// Helper for formatted JSON response
export function jsonResponse(data: any) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

// Master function to register all tools
export function registerTools(server: McpServer) {
  registerProfileTools(server);
  registerProjectsTools(server);
  registerSkillsTools(server);
  registerExperiencesTools(server);
  registerStatsTools(server);
}
