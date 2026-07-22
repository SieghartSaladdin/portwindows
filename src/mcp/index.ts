import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import http from "http";
import { parse } from "url";
import { registerTools } from "./tools";

// Initialize the MCP server
const server = new McpServer({
  name: "portwindows-mcp",
  version: "1.0.0",
});

// Register modular tools
registerTools(server);

// ----------------------------------------------------
// Startup logic supporting both stdio and HTTP SSE
// ----------------------------------------------------
async function main() {
  const isSseMode = process.argv.includes("--sse");

  if (isSseMode) {
    // Expose as network-accessible HTTP Streamable service matching latest specs
    const serverHttp = http.createServer(async (req, res) => {
      // Setup CORS headers
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");

      if (req.method === "OPTIONS") {
        res.writeHead(200);
        res.end();
        return;
      }

      const parsedUrl = parse(req.url || "", true);
      if (parsedUrl.pathname === "/mcp") {
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: undefined,
          enableJsonResponse: true,
        });

        res.on("close", () => transport.close());

        await server.connect(transport);
        await transport.handleRequest(req, res);
        return;
      }

      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
    });

    const PORT = parseInt(process.env.MCP_PORT || "3001", 10);
    serverHttp.listen(PORT, "0.0.0.0", () => {
      console.error(`Portfolio MCP Server running on HTTP Streamable at http://localhost:${PORT}/mcp`);
    });
  } else {
    // Default stdio transport for local AI clients (Claude Desktop, Cursor, etc.)
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Portfolio MCP Server running on stdio transport");
  }
}

main().catch((err) => {
  console.error("Fatal error running MCP Server:", err);
  process.exit(1);
});
