# Self-hosted wiki (LLD-007)

**Goal:** Run an optional wiki (BookStack) alongside {sovereign}, then expose documentation to agents via MCP.

## 1. Deploy BookStack (Docker)

From the **repository root**:

```bash
docker compose -f docker-compose.wiki.yml up -d
```

- UI: **http://127.0.0.1:6875** (override host port with `BOOKSTACK_PORT`).
- **Change default passwords** in `docker-compose.wiki.yml` before any shared or production use.

This stack is **independent** of `docker-compose.yml` (Postgres for the app).

## 2. MCP docs server (repo runbooks today)

The app ships **`npm run mcp:docs`** (`apps/sovereign/scripts/mcp-docs-server.js`), which exposes read-only **MCP resources** backed by files in this repo (e.g. `doc://runbooks/getting-started`). No wiki is required for that path.

```bash
cd apps/sovereign
npm run mcp:docs
```

Send JSON-RPC lines on stdin, e.g. `resources/list` and `resources/read` with `params.uri` set to a listed URI.

## 3. API token (BookStack)

1. In BookStack, open your user profile → **API Tokens** → create a token (save **Token ID** and **Token Secret**).
2. Ensure the user’s role has **Access system API** (and permission to read the shelves/books/pages you need).

## 4. MCP docs + live wiki (`apps/sovereign/.env`)

Set:

| Variable | Example |
|----------|---------|
| `SOVEREIGN_WIKI_TYPE` | `bookstack` (default) |
| `SOVEREIGN_WIKI_BASE_URL` | `http://127.0.0.1:6875` (no trailing slash) |
| `SOVEREIGN_WIKI_TOKEN_ID` | from BookStack |
| `SOVEREIGN_WIKI_TOKEN_SECRET` | from BookStack |
| `SOVEREIGN_WIKI_MCP_PAGE_LIMIT` | optional, default `60` (max 200) — how many pages appear in `resources/list` |

Restart **`npm run mcp:docs`**. Then:

- **Static** URIs unchanged: `doc://runbooks/getting-started`, `doc://project/ssot-board`.
- **Wiki** URIs: `doc://wiki/bookstack/page/{numericId}` (IDs come from BookStack’s API / UI).

`resources/read` uses **`GET /api/pages/{id}/export/markdown`** when available; otherwise it falls back to the page JSON `markdown` / `html` fields.

If the wiki is down or the token is invalid, `resources/read` returns a JSON-RPC error (`-32002`) with details; `resources/list` still returns repo files and may omit wiki pages (check stderr for list errors).

## 5. Ingest a page into `ProjectMemory`

Creates a **PO_PRODUCT** row with `sourceKind=bookstack` and `sourceUrl` pointing at the public page URL.

```bash
cd apps/sovereign
# Dry run (no DB write):
node scripts/ingest-wiki-to-memory.js --page-id=123 --project-session-id=<your-session-cuid> --dry-run
# Write:
npm run wiki:ingest-page -- --page-id=123 --project-session-id=<your-session-cuid>
```

Requires **`DATABASE_URL`** and the same BookStack env vars as above. Use a **project session id** from your running app (e.g. active product session).

## 6. Outline / other engines

Only **BookStack** is wired today (`SOVEREIGN_WIKI_TYPE=bookstack`). Other types are ignored until an adapter exists.
