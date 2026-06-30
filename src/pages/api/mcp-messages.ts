import { NextApiRequest, NextApiResponse } from "next";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

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

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const transport = globalForMcp.mcpTransport;
  if (!transport) {
    res.status(400).send("SSE connection not established");
    return;
  }

  console.error("[MCP] SSE client message POST received");
  await transport.handlePostMessage(req, res);
}

// Disable body parsing so that standard Node.js request stream remains intact 
// and can be read directly by the SSEServerTransport.handlePostMessage function.
export const config = {
  api: {
    bodyParser: false,
  },
};
