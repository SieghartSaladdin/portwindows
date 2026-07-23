# Windows 11 Pro Interactive Portfolio & MCP Server 🖥️

A high-fidelity replica of the Windows 11 Pro desktop environment, built as an interactive developer portfolio website. This project combines desktop-grade windowing capabilities, modular app panels, a functional CLI terminal, and an integrated **Model Context Protocol (MCP) server** to expose your portfolio database (projects, skills, experience, and bio) directly to local or cloud-based AI assistants (like Claude, Cursor, Windsurf, or Hermes).

---

## 🚀 Quick Start (Running the Docker Container)

The Docker image contains both the interactive portfolio website and the built-in MCP server.

### 1. Run with Persistent Database (Recommended)
To ensure changes made to your profile/projects persist on your host machine, mount the `prisma` directory as a volume:

```bash
docker run -d -p 3000:3000 \
  --name portwindows \
  -v $(pwd)/prisma:/app/prisma \
  rfieq/portwindows:latest
```

Once running:
*   **Interactive Portfolio**: Open **[http://localhost:3000](http://localhost:3000)** in your browser.
*   **MCP Server Endpoint (SSE)**: `http://localhost:3000/api/mcp`

---

## 🖥️ AI Client Configuration (MCP)

Since the container runs the SSE endpoint, you can connect your AI assistants directly using the Server-Sent Events (SSE) URL.

### 1. Remote Client (`mcp-remote`)
Add the following to your AI client configuration (e.g. Cursor, Claude Desktop, or Hermes):

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

### 2. In Hermes Agent
Add the following to your `~/.hermes/config.yaml` file:
```yaml
mcp_servers:
  portwindows-mcp:
    url: "http://localhost:3000/api/mcp"
    transport: sse
```
*(If you host this container in the cloud, replace `localhost:3000` with your live domain name).*

### 2. In Cursor (IDE)
1. Go to **Settings** (Gear icon) -> **Features** -> **MCP**.
2. Click **+ Add New MCP Server**.
3. Set:
   * **Name**: `portwindows-mcp`
   * **Type**: `SSE`
   * **URL**: `http://localhost:3000/api/mcp`
4. Click **Save**.

### 3. In Windsurf (IDE)
1. Go to **Settings** -> **Advanced** -> **MCP**.
2. Add a new MCP server:
   * **Name**: `portwindows-mcp`
   * **Type**: `sse`
   * **Endpoint**: `http://localhost:3000/api/mcp`

### 4. In Claude Desktop
If you prefer standard stdio for local use, you can configure Claude Desktop using the command line:
```json
{
  "mcpServers": {
    "portwindows-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "tsx",
        "/path/to/your/project/src/mcp/index.ts"
      ],
      "cwd": "/path/to/your/project"
    }
  }
}
```

---

## ⚙️ Environment Configuration

You can customize the container execution behavior using the following environment variables:

| Variable | Description | Example / Values |
| :--- | :--- | :--- |
| `PORT` | Container internal port mapping (defaults to 3000) | `3000` |
| `LLM_PROVIDER` | AI provider for the portfolio's built-in chat functions | `openrouter`, `ollama` |
| `OPENROUTER_API_KEY` | Your OpenRouter API token (required if using OpenRouter) | `sk-or-v1-...` |
| `OLLAMA_BASE_URL` | Local API URL for Ollama | `http://host.docker.internal:11434` |
| `OLLAMA_MODEL` | Ollama model tag to prompt | `gemma2` |
