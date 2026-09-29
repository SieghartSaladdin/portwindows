import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { prisma } from "../../lib/db";
import { serializeMessage } from "../../lib/server/serializers";
import { errorMessage, errorResponse, jsonResponse } from "./helpers";

export function registerMessageTools(server: McpServer) {
  server.registerTool(
    "list_messages",
    {
      description: "List messages sent through the public contact form, newest first.",
      inputSchema: {
        unreadOnly: z.boolean().optional().describe("Only return unread messages"),
        limit: z.number().int().min(1).max(200).optional().describe("Maximum number of messages (default 50)"),
      },
    },
    async (args) => {
      try {
        const messages = await prisma.contactMessage.findMany({
          where: args.unreadOnly ? { read: false } : undefined,
          orderBy: { createdAt: "desc" },
          take: args.limit ?? 50,
        });
        return jsonResponse(messages.map(serializeMessage));
      } catch (err) {
        return errorResponse(`Error listing messages: ${errorMessage(err)}`);
      }
    },
  );

  server.registerTool(
    "mark_message_read",
    {
      description: "Mark a contact message as read (or unread again).",
      inputSchema: {
        id: z.string().min(1).describe("Message id"),
        read: z.boolean().optional().describe("true = read (default), false = unread"),
      },
    },
    async (args) => {
      try {
        const updated = await prisma.contactMessage.update({ where: { id: args.id }, data: { read: args.read ?? true } });
        return jsonResponse({ message: "Message updated.", contactMessage: serializeMessage(updated) });
      } catch (err) {
        return errorResponse(`Error updating message: ${errorMessage(err)}`);
      }
    },
  );
}
