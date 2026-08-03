import { NextApiRequest, NextApiResponse } from "next";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { mcpServer } from "@/lib/mcp";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS setup
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-api-key");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // API Key Authentication Validation
  const configuredKey = process.env.MCP_API_KEY;
  if (configuredKey && configuredKey.trim() !== "") {
    const authHeader = req.headers["authorization"] || req.headers["Authorization"];
    const xApiKey = req.headers["x-api-key"] || req.headers["X-Api-Key"];
    const queryKey = req.query.apiKey || req.query.api_key;

    let token = "";
    if (typeof authHeader === "string") {
      const match = authHeader.match(/^Bearer\s+(.+)$/i);
      token = match ? match[1].trim() : authHeader.trim();
    } else if (typeof xApiKey === "string") {
      token = xApiKey.trim();
    } else if (typeof queryKey === "string") {
      token = queryKey.trim();
    }

    if (token !== configuredKey) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Invalid or missing MCP_API_KEY. Provide it via header 'Authorization: Bearer <key>', 'x-api-key: <key>', or query param '?apiKey=<key>'.",
      });
      return;
    }
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
