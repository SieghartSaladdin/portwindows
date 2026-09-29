# Aura OS MCP server

Aura OS exposes its portfolio database through the [Model Context Protocol](https://modelcontextprotocol.io), so an AI assistant (Claude Desktop, Cursor, Windsurf, ...) can read and edit the same content as the Developer Hub.

## Authentication

Every MCP endpoint requires `MCP_API_KEY`.

- Use a long random value (at least 16 characters), e.g. `openssl rand -hex 32`.
- If the key is missing, too short, or still the old published example value, `/api/mcp` answers `503` and the standalone server refuses to start.
- Send the key as `Authorization: Bearer <key>` (preferred) or `x-api-key: <key>`. An `?apiKey=<key>` query parameter is still accepted for clients that cannot set headers, but it can end up in logs, so avoid it where possible.
- Keys are compared in constant time. The key is never printed in logs or responses.

## Endpoints

- **Inside the web app**: `POST /api/mcp` (stateless Streamable HTTP, JSON responses). Available wherever the Next.js app runs, including the Docker image.
- **Standalone server** (`npm run mcp`, port `MCP_PORT`, default 3002):
  - `POST /mcp`: stateless Streamable HTTP.
  - `GET /sse` + `POST /messages?sessionId=...`: legacy SSE transport (for `mcp-remote`).
  - `GET /` or `GET /health`: `{ "status": "ok" }`, the only unauthenticated path.
- **stdio** (`npm run mcp:stdio`): for clients that spawn the server as a local process. No network port is opened, so no key check applies.

Each HTTP request (or SSE session) gets its own MCP server instance, so concurrent clients do not interfere with each other. Both `npm run mcp` scripts read `.env.local` for `DATABASE_URL` and `MCP_API_KEY`.

## Tools

Tool inputs are validated with the same rules as the REST API: required text fields must be non-empty, URL fields must be `http(s)` URLs or `/api/uploads/...` paths, and an empty string clears an optional field. New entries are appended at the end of the list unless `order` is given.

- **Overview**: `get_dashboard_stats` (counts per collection, unread messages, profile status).
- **Profile**: `get_profile`, `update_profile` (name, title, location, email, bio, phone, githubUrl, linkedinUrl, websiteUrl, avatarUrl, resumeUrl).
- **Projects**: `list_projects`, `get_project`, `create_project`, `update_project`, `delete_project` (title, description, tags, githubUrl, liveUrl, images, featured, role, period, order).
- **Skills**: `list_skills`, `create_skill`, `update_skill`, `delete_skill` (category, skills, order).
- **Experience**: `list_experiences`, `create_experience`, `update_experience`, `delete_experience` (role, company, duration, description[], order).
- **Education**: `list_educations`, `create_education`, `update_education`, `delete_education` (institution, degree, field, period, description, order).
- **Certifications**: `list_certifications`, `create_certification`, `update_certification`, `delete_certification` (name, issuer, date, credentialUrl, order).
- **Contact messages**: `list_messages` (optional `unreadOnly`, `limit`), `mark_message_read` (`id`, `read`).

All `list_*` tools accept an optional `query` search term.

## Client configuration

Streamable HTTP (clients that support remote servers with headers):

```json
{
  "mcpServers": {
    "aura-os": {
      "url": "https://your.domain/api/mcp",
      "headers": { "Authorization": "Bearer <MCP_API_KEY>" }
    }
  }
}
```

Via `mcp-remote` (for clients that only speak stdio):

```json
{
  "mcpServers": {
    "aura-os": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://your.domain/api/mcp", "--header", "Authorization: Bearer ${MCP_API_KEY}"],
      "env": { "MCP_API_KEY": "<your key>" }
    }
  }
}
```

Local stdio (run from the project directory):

```json
{
  "mcpServers": {
    "aura-os": {
      "command": "npm",
      "args": ["run", "--silent", "mcp:stdio"],
      "cwd": "/path/to/portwindows"
    }
  }
}
```

For plain-HTTP servers on a LAN, add `--allow-http` to the `mcp-remote` arguments.
