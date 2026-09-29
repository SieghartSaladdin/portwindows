import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTools } from "../mcp/tools";

/**
 * Creates a fresh MCP server with every portfolio tool registered.
 *
 * An McpServer can only be connected to one transport at a time ("Already connected to a
 * transport"), so callers create one per request (stateless Streamable HTTP) or per
 * session (SSE / stdio) instead of sharing a global instance.
 */
export function createMcpServer(): McpServer {
  const server = new McpServer({ name: "aura-os-portfolio-mcp", version: "1.0.0" });
  registerTools(server);
  return server;
}
