# Portfolio Model Context Protocol (MCP) Server

This is a custom **Model Context Protocol (MCP) server** that exposes your portfolio database (projects, skills, experience, and bio) directly to AI assistants. It enables compatible AI systems to query, create, update, and delete elements in your database dynamically.

---

## 🛠️ Features

Exposes the following tools to the AI assistant:
- **Profile / About Me**: `get_profile`, `update_profile`
- **Projects Explorer**: `list_projects`, `create_project`, `update_project`, `delete_project`
- **Skills Categories**: `list_skills`, `create_skill`, `update_skill`, `delete_skill`
- **Professional Timeline**: `list_experiences`, `create_experience`, `update_experience`, `delete_experience`

---

## 🚀 Setup & Integration

The MCP server is built using the official **Streamable HTTP transport** standard (which combines both SSE and POST messages under a single, unified endpoint) and also supports standard local **stdio** execution.

You have two ways to run it:

### Option A: Built-in to Next.js (Port 3000)
When you run your Next.js dev server (`npm run dev`) or host it in Docker, the MCP endpoint is automatically active on the same port:
- **Unified Endpoint URL**: `http://localhost:3000/api/mcp`
- *(No separate commands or ports to manage!)*

### Option B: Standalone Background Server (Port 3001)
If you prefer running it independently of the Next.js frontend, run:
```bash
npm run mcp:sse
```
- **Unified Endpoint URL**: `http://localhost:3001/mcp`

---

## 🖥️ AI Client Configuration

### 1. In Hermes Agent
Add the following to your `~/.hermes/config.yaml` file (use your actual live domain if deployed to the cloud):
```yaml
mcp_servers:
  portwindows-mcp:
    url: "https://your-portfolio-domain.com/api/mcp"
    transport: sse
```

### 2. In Cursor (IDE)
1. Go to **Settings** (Gear icon in top-right) -> **Features** -> **MCP**.
2. Click **+ Add New MCP Server**.
3. Fill in:
   - **Name**: `portwindows-mcp`
   - **Type**: `SSE`
   - **URL**: `http://localhost:3000/api/mcp` (or `http://localhost:3001/mcp` if running Option B).
4. Click **Save**.

### 3. In Windsurf (IDE)
1. Go to **Settings** -> **Advanced** -> **MCP**.
2. Add a new MCP server:
   - **Name**: `portwindows-mcp`
   - **Type**: `sse`
   - **Endpoint**: `http://localhost:3000/api/mcp` (or `http://localhost:3001/mcp` if running Option B).
3. Click **Add**.

### 4. In Claude Desktop
Edit your configuration file (`%APPDATA%\Claude\claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "portwindows-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "tsx",
        "c:/laragon/www/webapp/portwindows/src/mcp/index.ts"
      ],
      "cwd": "c:/laragon/www/webapp/portwindows"
    }
  }
}
```

---

## 🐋 Running in Docker

When you run the project inside Docker, the MCP server runs automatically on the same container port!

To ensure changes made by the AI persist when using Docker, mount the `prisma` directory as a volume. For example:
```bash
docker run -p 3000:3000 -v $(pwd)/prisma:/app/prisma rfieq/portwindows:latest
```
This maps the SQLite database to your host machine so that both the website inside the container and your AI tools on the host share the same database updates.
