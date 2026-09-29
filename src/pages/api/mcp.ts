import type { NextApiRequest, NextApiResponse } from "next";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpServer } from "@/lib/mcp";
import { extractMcpKey, getMcpKeyStatus, isValidMcpKey } from "@/lib/server/mcpAuth";

/**
 * Stateless MCP endpoint (Streamable HTTP) served by the Next.js app at /api/mcp.
 * Every request gets its own server + transport, so concurrent requests never share state.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-api-key, mcp-session-id, mcp-protocol-version");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  const status = getMcpKeyStatus();
  if (!status.ok) {
    console.error(`[MCP] /api/mcp is disabled: ${status.reason}`);
    res.status(503).json({ error: "The MCP endpoint is disabled because MCP_API_KEY is not configured securely." });
    return;
  }

  const presented = extractMcpKey(req.headers, req.query);
  if (!isValidMcpKey(presented, status.key)) {
    res.status(401).json({ error: "Unauthorized. Send the MCP API key as 'Authorization: Bearer <key>' or 'x-api-key: <key>'." });
    return;
  }

  const server = createMcpServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  res.on("close", () => {
    void transport.close();
    void server.close();
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res);
  } catch (error) {
    console.error("[MCP] request failed:", error instanceof Error ? error.message : error);
    if (!res.headersSent) res.status(500).json({ error: "MCP request failed." });
  }
}

// Keep the raw request stream intact for StreamableHTTPServerTransport.handleRequest.
export const config = {
  api: {
    bodyParser: false,
  },
};
