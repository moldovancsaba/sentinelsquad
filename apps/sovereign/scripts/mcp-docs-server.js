#!/usr/bin/env node
/**
 * MCP server for repo runbooks + optional BookStack wiki (LLD-007). Read-only resources over stdio.
 * Static: doc://runbooks/…, doc://project/…
 * Wiki (when SOVEREIGN_WIKI_* set): doc://wiki/bookstack/page/{id}
 */
const path = require("node:path");
const fs = require("node:fs");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const readline = require("node:readline");
const {
  isBookStackConfigured,
  listPages,
  readPageBodyForMcp
} = require("./lib/wiki-bookstack");

function getRepoRoot() {
  const env = process.env.SOVEREIGN_DOCS_REPO_ROOT;
  if (env && String(env).trim()) {
    return path.resolve(String(env).trim());
  }
  return path.resolve(__dirname, "..", "..", "..");
}

/** @type {{ uri: string; relpath: string; name: string; title: string; mimeType: string }[]} */
const RESOURCE_MAP = [
  {
    uri: "doc://runbooks/getting-started",
    relpath: "docs/runbooks/getting-started.md",
    name: "runbooks-getting-started",
    title: "Runbook: Getting started",
    mimeType: "text/markdown"
  },
  {
    uri: "doc://project/ssot-board",
    relpath: "docs/SOVEREIGN_PROJECT_BOARD_SSOT.md",
    name: "ssot-project-board",
    title: "Project board SSOT",
    mimeType: "text/markdown"
  }
];

const WIKI_PAGE_URI_RE = /^doc:\/\/wiki\/bookstack\/page\/(\d+)$/i;

function send(msg) {
  console.log(JSON.stringify(msg));
}

function staticResourceMeta() {
  return RESOURCE_MAP.map((r) => ({
    uri: r.uri,
    name: r.name,
    title: r.title,
    mimeType: r.mimeType,
    description: `Repo file: ${r.relpath}`
  }));
}

async function buildResourcesList() {
  const resources = staticResourceMeta();
  if (!isBookStackConfigured()) {
    return { resources };
  }
  try {
    const pages = await listPages();
    for (const p of pages) {
      const id = p.id;
      if (id == null) continue;
      resources.push({
        uri: `doc://wiki/bookstack/page/${id}`,
        name: `wiki-page-${id}`,
        title: p.name || `BookStack page ${id}`,
        mimeType: "text/markdown",
        description: `BookStack page id ${id}${p.book_id != null ? ` (book ${p.book_id})` : ""}`
      });
    }
  } catch (err) {
    console.error("[mcp-docs] BookStack pages list failed:", err?.message || err);
  }
  return { resources };
}

function readStaticFile(uri) {
  const entry = RESOURCE_MAP.find((r) => r.uri === uri);
  if (!entry) {
    return { _badUri: true, uri };
  }
  const abs = path.join(getRepoRoot(), entry.relpath);
  let text;
  try {
    text = fs.readFileSync(abs, "utf8");
  } catch (e) {
    return { _ioError: true, uri, message: String(e?.message || e) };
  }
  return {
    contents: [{ uri, mimeType: entry.mimeType, text }]
  };
}

async function handleResourcesRead(uri) {
  const u = String(uri || "").trim();
  const wikiMatch = WIKI_PAGE_URI_RE.exec(u);
  if (wikiMatch) {
    if (!isBookStackConfigured()) {
      return { _badUri: true, uri: u };
    }
    try {
      const { title, text, mimeType } = await readPageBodyForMcp(wikiMatch[1]);
      return {
        contents: [
          {
            uri: u,
            mimeType,
            text: text || `_(empty page: ${title})_`
          }
        ]
      };
    } catch (err) {
      return { _wikiError: true, uri: u, message: String(err?.message || err) };
    }
  }
  return readStaticFile(u);
}

async function handleRequest(msg) {
  const { id, method, params } = msg;
  if (id === undefined) return;

  try {
    if (method === "initialize") {
      send({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: {
            resources: { subscribe: false, listChanged: false }
          },
          serverInfo: { name: "sovereign-docs", version: "1.1.0" }
        }
      });
      return;
    }
    if (method === "notifications/initialized") return;
    if (method === "resources/list") {
      const result = await buildResourcesList();
      send({ jsonrpc: "2.0", id, result });
      return;
    }
    if (method === "resources/read") {
      const uri = params?.uri;
      const readResult = await handleResourcesRead(uri);
      if (readResult._badUri) {
        send({
          jsonrpc: "2.0",
          id,
          error: { code: -32602, message: `Invalid or unknown resource URI: ${readResult.uri || uri}` }
        });
        return;
      }
      if (readResult._ioError) {
        send({
          jsonrpc: "2.0",
          id,
          error: {
            code: -32002,
            message: `Resource unavailable (file missing or unreadable): ${readResult.uri}`,
            data: readResult.message
          }
        });
        return;
      }
      if (readResult._wikiError) {
        send({
          jsonrpc: "2.0",
          id,
          error: {
            code: -32002,
            message: `Wiki unavailable: ${readResult.uri}`,
            data: readResult.message
          }
        });
        return;
      }
      send({ jsonrpc: "2.0", id, result: readResult });
      return;
    }
    send({ jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } });
  } catch (err) {
    send({
      jsonrpc: "2.0",
      id,
      error: { code: -32603, message: String(err?.message || err) }
    });
  }
}

function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
  rl.on("line", (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    let parsed;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      return;
    }
    void handleRequest(parsed);
  });
  process.on("SIGINT", () => process.exit(0));
  process.on("SIGTERM", () => process.exit(0));
}

main();
