# Aura OS: doodle desktop portfolio

A developer portfolio that looks like a small hand-drawn desktop OS: draggable app windows, an AI companion that answers questions from the portfolio database, a contact form, a password-protected Developer Hub for editing content, and a built-in MCP endpoint for AI assistants.

## Quick start (docker compose)

The image needs PostgreSQL. Use the `docker-compose.yml` from the repository and create a `.env` file next to it:

```env
POSTGRES_PASSWORD=<random>
ADMIN_USERNAME=<your login>
ADMIN_PASSWORD=<strong password>
JWT_SECRET=<openssl rand -hex 32>
MCP_API_KEY=<openssl rand -hex 32>
# AI companion (any OpenAI-compatible endpoint)
LLM_API_BASE_URL=https://openrouter.ai/api/v1
LLM_API_KEY=<key>
LLM_MODEL=<model id>
NEXT_PUBLIC_SITE_URL=https://your.domain
```

```bash
docker compose up -d
```

Compose refuses to start while a required secret is missing; there are no built-in default passwords. On start the container runs `prisma migrate deploy` and then serves the app on port 3000.

- Portfolio: http://localhost:3000
- MCP endpoint: `http://localhost:3000/api/mcp` (header `Authorization: Bearer <MCP_API_KEY>`)

## Data

- Database: `postgres_data` volume.
- Uploaded images and CV files: `uploads_data` volume mounted at `/app/uploads` (`UPLOAD_DIR`).

Upgrading from an older image whose database was created with `prisma db push`: run once
`docker compose run --rm portwindows node ./node_modules/prisma/build/index.js migrate resolve --applied 0_init`.

## Environment

- Required: `DATABASE_URL` (compose builds it from `POSTGRES_*`), `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `JWT_SECRET`, `MCP_API_KEY` (16+ characters).
- AI chat: `LLM_API_KEY` (or `OPENROUTER_API_KEY`), `LLM_PROVIDER`, `LLM_API_BASE_URL`, `LLM_MODEL`. Without a key the chat answers 503.
- Optional: `NEXT_PUBLIC_SITE_URL` (inlined at build time; pass it as a build arg when building the image), `UPLOAD_DIR`.

See `README_MCP.md` in the repository for MCP client configuration and the tool list.
