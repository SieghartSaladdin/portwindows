# Aura OS

A developer portfolio that looks and behaves like a small, hand-drawn desktop operating system. Visitors open "apps" in draggable windows to read the bio, browse projects, chat with an AI companion and send a message, while the owner manages all content from a built-in admin app (the Developer Hub) or from an AI assistant over MCP.

## Features

- **Doodle desktop**: sketch-style UI with light and dark themes and four wallpapers (Lemon Paper, Sunset Rose, Mint Garden, Lilac Night). Windows can be dragged, minimised, maximised and focused; on phones they open full screen.
- **Apps**: Bio (profile, work experience, education, certifications, avatar, CV download and a contact form), Projects (project folder with detail view and a Projector preview), Terminal, Settings, the Frieren.exe mini game and the Developer Hub.
- **AI companion**: HelperBot answers questions about the owner using live data from the database (LangGraph tool calling) and can act on the desktop (open a window, change the wallpaper, open a link that exists in the portfolio data). Stark and Fern are chatty character companions. Works with any OpenAI-compatible endpoint (OpenRouter, a self-hosted router, Ollama).
- **Developer Hub**: password-protected admin app to edit the profile, projects, skills, experience, education and certifications, reorder entries, upload images and a CV (PDF), and read contact messages.
- **Contact form**: validated, rate-limited, with a honeypot field; messages land in the Developer Hub inbox.
- **MCP server**: the same content can be read and edited from Claude Desktop, Cursor, Windsurf and other MCP clients, either through `/api/mcp` in the web app or a standalone server. See [README_MCP.md](README_MCP.md).
- **SEO basics**: metadata, `robots.txt` and `sitemap.xml` built from `NEXT_PUBLIC_SITE_URL`.

## Tech stack

Next.js 16 (App Router), React 19, Tailwind CSS v4, Zustand, Framer Motion, Prisma 7 with PostgreSQL (`@prisma/adapter-pg`), LangChain / LangGraph, the MCP TypeScript SDK and Zod.

## Getting started

Requirements: Node.js 20.12 or newer and a PostgreSQL 14+ database.

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local` and fill it in (see below).
3. Create the tables: `npm run db:migrate`
4. Optionally create the placeholder profile row: `npm run db:seed` (it never adds sample projects or people).
5. Start the dev server: `npm run dev` and open http://localhost:3000.
6. Open the Developer Hub on the desktop, sign in with `ADMIN_USERNAME` / `ADMIN_PASSWORD` and add your content.

A fresh install shows honest empty states until you add content.

### Environment variables

Required:
- `DATABASE_URL`: PostgreSQL connection string.
- `ADMIN_USERNAME`, `ADMIN_PASSWORD`: Developer Hub login. Login returns 503 until both are set.
- `JWT_SECRET`: signs admin sessions. Required in production; in development a random secret is generated per process (sessions reset on restart).

For the AI companion:
- `LLM_API_KEY` (or the legacy `OPENROUTER_API_KEY`): without a key the chat returns 503.
- `LLM_PROVIDER` (default `openrouter`; `ollama` needs no key), `LLM_API_BASE_URL` (any OpenAI-compatible `/v1` endpoint), `LLM_MODEL`.
- `OLLAMA_BASE_URL`, `OLLAMA_MODEL`: only when `LLM_PROVIDER=ollama`.

For MCP:
- `MCP_API_KEY`: at least 16 random characters. `/api/mcp` answers 503 and `npm run mcp` refuses to start without it (the old example key is rejected).
- `MCP_PORT`: port of the standalone server (default 3002).

Optional:
- `NEXT_PUBLIC_SITE_URL`: public URL for metadata, robots and sitemap (inlined at build time).
- `UPLOAD_DIR`: where uploaded files are stored (default `./uploads`, git-ignored).

Generate secrets with `openssl rand -hex 32`.

## Scripts

- `npm run dev`, `npm run build`, `npm run start`: Next.js.
- `npm run lint`, `npm run typecheck`: ESLint and TypeScript.
- `npm test`: unit tests (Node test runner via tsx) for auth tokens, rate limiting, input validation and upload detection.
- `npm run db:migrate`: apply Prisma migrations (`prisma migrate deploy`).
- `npm run db:seed`: create the placeholder profile if none exists.
- `npm run mcp` / `npm run mcp:stdio`: standalone MCP server over HTTP/SSE or stdio.

## API overview

All endpoints return JSON; errors look like `{ "error": "...", "details": { "field": "message" } }`. Admin endpoints need `Authorization: Bearer <token>` from `POST /api/auth`.

- Public: `GET /api/portfolio`, `GET /api/profile`, `GET /api/{projects|skills|experiences|educations|certifications}`, `POST /api/contact`, `POST /api/chat`, `GET /api/uploads/<file>`.
- Auth: `POST /api/auth` (rate-limited), `GET /api/auth/verify`.
- Admin: `PUT /api/profile`; `POST /api/<collection>`, `PUT|DELETE /api/<collection>/<id>`; `POST /api/reorder`; `GET /api/messages`, `PATCH|DELETE /api/messages/<id>`; `POST /api/upload` (PNG, JPEG, WebP or GIF up to 5 MB; PDF up to 10 MB, checked by file signature).

## Docker

`docker-compose.yml` runs PostgreSQL and the app (image `rfieq/portwindows:latest`). It contains no default secrets:

1. Create a `.env` file next to `docker-compose.yml` with at least `POSTGRES_PASSWORD`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `JWT_SECRET` and `MCP_API_KEY`, plus the `LLM_*` variables for the chat (or run `docker compose --env-file .env.local up -d`).
2. `docker compose up -d`

On start the container runs `prisma migrate deploy` (it never drops data) and then the Next.js server on port 3000. Uploads are kept in the `uploads_data` volume and the database in `postgres_data`.

Upgrading a database that was created with the old `prisma db push` start command: mark the baseline migration as applied once, then start normally:

```bash
docker compose run --rm portwindows node ./node_modules/prisma/build/index.js migrate resolve --applied 0_init
```

To build the image yourself: `docker build --build-arg NEXT_PUBLIC_SITE_URL=https://your.domain -t rfieq/portwindows:latest .`
