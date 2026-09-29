import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import http from "http";
import { createMcpServer } from "../lib/mcp";
import { extractMcpKey, getMcpKeyStatus, isValidMcpKey } from "../lib/server/mcpAuth";

/** One MCP server per SSE session (an McpServer can only hold one transport). */
const sseSessions = new Map<string, { transport: SSEServerTransport; server: McpServer }>();

function sendJson(res: http.ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

async function runStdio() {
  // stdio is a local pipe owned by the MCP client process; there is no network surface to protect.
  const server = createMcpServer();
  await server.connect(new StdioServerTransport());
  console.error("[MCP] Aura OS portfolio MCP server running on stdio");
}

async function runHttp() {
  const status = getMcpKeyStatus();
  if (!status.ok) {
    console.error(`[MCP] Refusing to start the network MCP server: ${status.reason}`);
    console.error("[MCP] Set MCP_API_KEY to a long random value, e.g. `node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"`.");
    process.exit(1);
  }
  const apiKey = status.key;
  const PORT = parseInt(process.env.MCP_PORT || "3002", 10);

  const httpServer = http.createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-api-key, mcp-session-id, mcp-protocol-version");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url || "/", "http://localhost");
    const pathname = url.pathname;

    // Minimal unauthenticated health check. Reveals nothing about configuration.
    if ((pathname === "/health" || pathname === "/") && req.method === "GET") {
      sendJson(res, 200, { status: "ok" });
      return;
    }

    const presented = extractMcpKey(req.headers, Object.fromEntries(url.searchParams));
    if (!isValidMcpKey(presented, apiKey)) {
      console.error(`[MCP] Unauthorized ${req.method} ${pathname} from ${req.socket.remoteAddress}`);
      sendJson(res, 401, { error: "Unauthorized. Send the MCP API key as 'Authorization: Bearer <key>' or 'x-api-key: <key>'." });
      return;
    }

    try {
      // Legacy SSE transport (/sse + /messages), used by mcp-remote.
      if (pathname === "/sse" && req.method === "GET") {
        const transport = new SSEServerTransport("/messages", res);
        const server = createMcpServer();
        sseSessions.set(transport.sessionId, { transport, server });
        res.on("close", () => {
          sseSessions.delete(transport.sessionId);
          void server.close();
        });
        await server.connect(transport);
        return;
      }

      if (pathname === "/messages" && req.method === "POST") {
        const session = sseSessions.get(url.searchParams.get("sessionId") || "");
        if (!session) {
          sendJson(res, 404, { error: "Unknown or expired SSE session." });
          return;
        }
        await session.transport.handlePostMessage(req, res);
        return;
      }

      // Stateless Streamable HTTP transport: fresh server + transport per request.
      if (pathname === "/mcp") {
        const server = createMcpServer();
        const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
        res.on("close", () => {
          void transport.close();
          void server.close();
        });
        await server.connect(transport);
        await transport.handleRequest(req, res);
        return;
      }

      sendJson(res, 404, { error: "Not found." });
    } catch (error) {
      console.error("[MCP] request failed:", error instanceof Error ? error.message : error);
      if (!res.headersSent) sendJson(res, 500, { error: "MCP request failed." });
    }
  });

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.error(`[MCP] Aura OS portfolio MCP server listening on port ${PORT} (API key required)`);
    console.error(`[MCP]   Streamable HTTP: http://localhost:${PORT}/mcp`);
    console.error(`[MCP]   SSE:             http://localhost:${PORT}/sse`);
  });
}

const main = process.argv.includes("--stdio") ? runStdio : runHttp;
main().catch((err) => {
  console.error("[MCP] Fatal error:", err instanceof Error ? err.message : err);
  process.exit(1);
});
