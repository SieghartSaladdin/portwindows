import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerProfileTools } from "./profile";
import { registerProjectsTools } from "./projects";
import { registerSkillsTools } from "./skills";
import { registerExperiencesTools } from "./experiences";
import { registerEducationTools } from "./educations";
import { registerCertificationTools } from "./certifications";
import { registerMessageTools } from "./messages";
import { registerStatsTools } from "./stats";

export { textResponse, jsonResponse, errorResponse } from "./helpers";

/** Registers every portfolio admin tool on the given server. */
export function registerTools(server: McpServer) {
  registerProfileTools(server);
  registerProjectsTools(server);
  registerSkillsTools(server);
  registerExperiencesTools(server);
  registerEducationTools(server);
  registerCertificationTools(server);
  registerMessageTools(server);
  registerStatsTools(server);
}
