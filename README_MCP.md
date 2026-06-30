# Portfolio Model Context Protocol (MCP) Server

This is a custom **Model Context Protocol (MCP) server** that exposes your portfolio database (projects, skills, experience, and bio) directly to AI assistants. It enables compatible AI systems to query, create, update, and delete elements in your database dynamically over stdio transport.

---

## 🛠️ Features

Exposes the following tools to the AI assistant:
- **Profile / About Me**: `get_profile`, `update_profile`
- **Projects Explorer**: `list_projects`, `create_project`, `update_project`, `delete_project`
- **Skills Categories**: `list_skills`, `create_skill`, `update_skill`, `delete_skill`
- **Professional Timeline**: `list_experiences`, `create_experience`, `update_experience`, `delete_experience`

---

## 🚀 Setup & Integration

### Claude Desktop Integration

To register this server with your local **Claude Desktop** application, edit your Claude Desktop configuration file:

- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

Add the following entry to the `mcpServers` object:

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

> [!NOTE]
> Make sure to adjust `c:/laragon/www/webapp/portwindows` to match the exact absolute path to your portfolio root workspace if it differs.

---

## 🖥️ Local Running & Testing

To test the server locally and inspect its tool declarations, you can run:

```bash
npm run mcp
```
*(Since it runs on stdio transport, it will wait for JSON-RPC input. Use `Ctrl+C` to exit)*

To inspect and test using the official MCP inspector:
```bash
npx @modelcontextprotocol/inspector npx tsx src/mcp/index.ts
```
This opens a web dashboard at `http://localhost:5173` where you can manually run and test all tools directly in your browser.
