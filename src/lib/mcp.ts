import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTools } from "../mcp/tools";

// Create server globally to persist across Next.js hot-reloads
const globalForMcp = globalThis as unknown as {
  mcpServer?: McpServer;
};

if (!globalForMcp.mcpServer) {
  globalForMcp.mcpServer = new McpServer({
    name: "portwindows-mcp",
    version: "1.0.0",
  });

  registerTools(globalForMcp.mcpServer);
}

export const mcpServer = globalForMcp.mcpServer;
