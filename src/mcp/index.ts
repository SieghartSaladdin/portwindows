import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import http from "http";
import { parse } from "url";
import { registerTools } from "./tools";

// Initialize the MCP server instance
const server = new McpServer({
  name: "portwindows-admin-mcp",
  version: "1.0.0",
});

// Register all CRUD and Stats tools
registerTools(server);

// Active SSE Transports Map by Session ID
const sseTransports = new Map<string, SSEServerTransport>();

async function main() {
  const isStdioMode = process.argv.includes("--stdio");

  if (isStdioMode) {
    // Standard IO mode for local desktop clients (Claude Desktop, Cursor, etc.)
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("[MCP] Portfolio Admin MCP Server running on stdio transport");
    return;
  }

  // Network HTTP Server (SSE & Streamable HTTP mode)
  const PORT = parseInt(process.env.MCP_PORT || "3002", 10);

  const httpServer = http.createServer(async (req, res) => {
    // CORS headers for remote clients
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-session-id");

    if (req.method === "OPTIONS") {
      res.writeHead(200);
      res.end();
      return;
    }

    const parsedUrl = parse(req.url || "", true);
    const pathname = parsedUrl.pathname || "/";

    // 1. Standard SSE Transport Endpoint (/sse & /messages) for mcp-remote
    if (pathname === "/sse") {
      console.error(`[MCP SSE] New client connection from ${req.socket.remoteAddress}`);
      
      const sseTransport = new SSEServerTransport("/messages", res);
      const sessionId = sseTransport.sessionId;
      sseTransports.set(sessionId, sseTransport);

      req.on("close", () => {
        console.error(`[MCP SSE] Client session closed: ${sessionId}`);
        sseTransports.delete(sessionId);
      });

      await server.connect(sseTransport);
      return;
    }

    // Handle POST messages for SSE transport (/messages)
    if (pathname === "/messages") {
      const sessionId = parsedUrl.query.sessionId as string;
      const sseTransport = sseTransports.get(sessionId);

      if (!sseTransport) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: `Session not found for ID: ${sessionId}` }));
        return;
      }

      await sseTransport.handlePostMessage(req, res);
      return;
    }

    // 2. Streamable HTTP Transport Endpoint (/mcp)
    if (pathname === "/mcp") {
      console.error(`[MCP Streamable] Request received: ${req.method} ${req.url}`);
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true,
      });

      res.on("close", () => transport.close());
      await server.connect(transport);
      await transport.handleRequest(req, res);
      return;
    }

    // 3. Health & Status Dashboard Endpoint (/)
    if (pathname === "/") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify(
          {
            name: "portwindows-admin-mcp",
            version: "1.0.0",
            status: "ONLINE",
            endpoints: {
              sse: `http://localhost:${PORT}/sse`,
              mcp: `http://localhost:${PORT}/mcp`,
            },
            mcpRemoteUsage: {
              command: "npx",
              args: ["-y", "mcp-remote", `http://<YOUR_IP>:${PORT}/sse`, "--allow-http"],
            },
          },
          null,
          2
        )
      );
      return;
    }

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Endpoint Not Found");
  });

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.error(`=======================================================`);
    console.error(`🚀 Portfolio Admin MCP Server running on port ${PORT}`);
    console.error(`🔗 SSE Endpoint : http://0.0.0.0:${PORT}/sse`);
    console.error(`🔗 MCP Endpoint : http://0.0.0.0:${PORT}/mcp`);
    console.error(`=======================================================`);
  });
}

main().catch((err) => {
  console.error("Fatal error starting Portfolio Admin MCP Server:", err);
  process.exit(1);
});
