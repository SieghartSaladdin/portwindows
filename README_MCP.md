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

The MCP server is integrated **directly inside your Next.js application**! 
When you run your dev server (`npm run dev`) or run it in Docker, the MCP endpoints are automatically online on the same port:

- **SSE Stream endpoint**: `http://localhost:3000/api/mcp`
- **Messages POST endpoint**: `http://localhost:3000/api/mcp-messages`

This means you do **not** need to run any separate server commands or manage other ports.

---

## 🖥️ AI Client Configuration

### 1. In Cursor (IDE)
1. Go to **Settings** (Gear icon in top-right) -> **Features** -> **MCP**.
2. Click **+ Add New MCP Server**.
3. Fill in:
   - **Name**: `portwindows-mcp`
   - **Type**: `SSE`
   - **URL**: `http://localhost:3000/api/mcp`
4. Click **Save**.

---

### 2. In Windsurf (IDE)
1. Go to **Settings** -> **Advanced** -> **MCP**.
2. Add a new MCP server:
   - **Name**: `portwindows-mcp`
   - **Type**: `sse`
   - **Endpoint**: `http://localhost:3000/api/mcp`
3. Click **Add**.

---

### 3. In VS Code Cline (Extension)
Cline runs locally inside your VS Code window and can spawn local processes directly. Click **Configure MCP Servers** in Cline's settings and add:
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

### 4. In Claude Desktop
Edit your configuration file:
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

Add the following entry:
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

If you build and run the project inside Docker, the MCP server runs automatically on the same container port!

To ensure changes made by the AI persist when using Docker, mount the `prisma` directory as a volume. For example:
```bash
docker run -p 3000:3000 -v $(pwd)/prisma:/app/prisma sieghartsaladdin/portwindows:latest
```
This maps the SQLite database to your host machine so that both the website inside the container and your AI tools on the host share the same database updates.
