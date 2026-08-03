# Portfolio Model Context Protocol (MCP) Server 🖥️

This repository includes a full-featured **Model Context Protocol (MCP) server** built with TypeScript & JSON-RPC (`@modelcontextprotocol/sdk`). It exposes your Admin Dashboard database (Profile, Projects, Skills, Experiences, and Dashboard Metrics) directly to local or remote AI assistants over **stdio**, **SSE**, or **Streamable HTTP**.

---

## 🛠️ Complete CRUD Tools Available

The MCP server provides complete CRUD (Create, Read, Update, Delete) & Diagnostic capabilities across all entities:

### 1. 📊 Dashboard Metrics
- **`get_dashboard_stats`**: Get live system health, database status, and total count metrics (projects, skills, experiences, profile presence).

### 2. 👤 Profile Management
- **`get_profile`**: Retrieve developer profile information (name, title, location, email, bio, githubUrl, linkedinUrl).
- **`update_profile`**: Update or create profile details.

### 3. 📂 Projects Repositories
- **`list_projects`**: List all projects with optional query filtering and `featuredOnly` flag.
- **`get_project`**: Retrieve single project details by unique ID or title.
- **`create_project`**: Add a new project (title, description, tags, githubUrl, liveUrl, images, featured).
- **`update_project`**: Edit any project attributes by ID.
- **`delete_project`**: Permanently remove a project by ID.

### 4. ⚡ Skills Matrix
- **`list_skills`**: List all skill categories and associated tags.
- **`get_skill`**: Retrieve single skill category by ID or category name.
- **`create_skill`**: Add a new skill category and tag list.
- **`update_skill`**: Update category name or skill tags by ID.
- **`delete_skill`**: Delete a skill category by ID.

### 5. 💼 Work Experiences
- **`list_experiences`**: List all timeline work experience entries.
- **`get_experience`**: Retrieve single experience entry by ID, role, or company name.
- **`create_experience`**: Add a new work experience entry.
- **`update_experience`**: Edit work experience details by ID.
- **`delete_experience`**: Delete a work experience entry by ID.

---

## 🚀 Running the MCP Server

Start the standalone MCP HTTP SSE Server on port `3002`:

```bash
npm run mcp
```

Or run in local **stdio** mode for desktop clients (Claude Desktop / Cursor local binary):

```bash
npm run mcp:stdio
```

---

## 🔌 Client Connection Options

### 1. Remote Client (`mcp-remote` / JSON-RPC over SSE)
To connect remote AI clients using `mcp-remote`, add this block to your client configuration:

```json
{
  "mcpServers": {
    "portwindows-admin-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "http://<SERVER_IP>:3002/sse",
        "--allow-http"
      ]
    }
  }
}
```

### 2. In Cursor / Windsurf / Claude Desktop (SSE)
- **URL**: `http://<SERVER_IP>:3002/sse` or `http://localhost:3000/api/mcp`
- **Transport**: `SSE`
