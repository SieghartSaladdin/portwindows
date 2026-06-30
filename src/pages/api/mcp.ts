import { NextApiRequest, NextApiResponse } from "next";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { mcpServer } from "@/lib/mcp";

const globalForMcp = globalThis as unknown as {
  mcpTransport?: SSEServerTransport;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS setup
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  // Setup SSE stream headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");

  console.error("[MCP] SSE client connection request received");

  // Create SSE transport pointing to the POST messages endpoint in Next.js
  const transport = new SSEServerTransport("/api/mcp-messages", res);
  globalForMcp.mcpTransport = transport;

  await mcpServer.connect(transport);
}
