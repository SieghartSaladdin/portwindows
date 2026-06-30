import { NextApiRequest, NextApiResponse } from "next";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { mcpServer } from "@/lib/mcp";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS setup
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  console.error(`[MCP] Request received: ${req.method} ${req.url}`);

  // Create the streamable HTTP transport matching the latest specification
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  res.on("close", () => transport.close());

  // Connect the global server instance to this transport connection
  await mcpServer.connect(transport);

  // Process the request stream
  await transport.handleRequest(req, res);
}

// Disable body parsing so that standard Node.js request stream remains intact 
// and can be read directly by the StreamableHTTPServerTransport.handleRequest function.
export const config = {
  api: {
    bodyParser: false,
  },
};
