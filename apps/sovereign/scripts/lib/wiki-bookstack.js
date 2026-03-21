/**
 * BookStack REST API helpers (LLD-007). Used by mcp-docs-server and ingest-wiki-to-memory.
 * Env: SOVEREIGN_WIKI_BASE_URL, SOVEREIGN_WIKI_TOKEN_ID, SOVEREIGN_WIKI_TOKEN_SECRET
 * Optional: SOVEREIGN_WIKI_TYPE=bookstack (default), SOVEREIGN_WIKI_MCP_PAGE_LIMIT (default 60)
 */
"use strict";

function getBookStackConfig() {
  const baseUrl = String(process.env.SOVEREIGN_WIKI_BASE_URL || "")
    .trim()
    .replace(/\/$/, "");
  const tokenId = String(process.env.SOVEREIGN_WIKI_TOKEN_ID || "").trim();
  const tokenSecret = String(process.env.SOVEREIGN_WIKI_TOKEN_SECRET || "").trim();
  const wikiType = String(process.env.SOVEREIGN_WIKI_TYPE || "bookstack")
    .trim()
    .toLowerCase();
  if (wikiType !== "bookstack") return null;
  if (!baseUrl || !tokenId || !tokenSecret) return null;
  return { baseUrl, tokenId, tokenSecret };
}

function isBookStackConfigured() {
  return Boolean(getBookStackConfig());
}

function authHeaders(config) {
  return {
    Authorization: `Token ${config.tokenId}:${config.tokenSecret}`
  };
}

async function bookstackFetchJson(config, apiPath) {
  const path = apiPath.startsWith("/") ? apiPath : `/${apiPath}`;
  const url = `${config.baseUrl}/api${path}`;
  const res = await fetch(url, {
    headers: { ...authHeaders(config), Accept: "application/json" }
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`BookStack ${res.status} ${path}: ${text.slice(0, 400)}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`BookStack ${path}: expected JSON`);
  }
}

async function bookstackFetchText(config, apiPath) {
  const path = apiPath.startsWith("/") ? apiPath : `/${apiPath}`;
  const url = `${config.baseUrl}/api${path}`;
  const res = await fetch(url, { headers: authHeaders(config) });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`BookStack ${res.status} ${path}: ${text.slice(0, 400)}`);
  }
  return text;
}

/**
 * @param {{ limit?: number; offset?: number }} opts
 * @returns {Promise<Array<{ id: number; name?: string; slug?: string; book_id?: number }>>}
 */
async function listPages(opts = {}) {
  const c = getBookStackConfig();
  if (!c) return [];
  const rawLimit =
    opts.limit != null ? opts.limit : process.env.SOVEREIGN_WIKI_MCP_PAGE_LIMIT;
  const limit = Math.min(Math.max(Number(rawLimit) || 60, 1), 200);
  const offset = Math.max(0, Number(opts.offset) || 0);
  const data = await bookstackFetchJson(c, `/pages?count=${limit}&offset=${offset}`);
  return Array.isArray(data.data) ? data.data : [];
}

/**
 * @param {string|number} pageId
 * @returns {Promise<{ title: string; text: string; mimeType: string }>}
 */
async function readPageBodyForMcp(pageId) {
  const c = getBookStackConfig();
  if (!c) throw new Error("BookStack not configured (set SOVEREIGN_WIKI_BASE_URL, TOKEN_ID, TOKEN_SECRET)");
  const id = String(pageId);
  const meta = await bookstackFetchJson(c, `/pages/${id}`);
  const title = meta.name || `Page ${id}`;
  let text;
  let mimeType = "text/markdown";
  try {
    text = await bookstackFetchText(c, `/pages/${id}/export/markdown`);
  } catch {
    text =
      typeof meta.markdown === "string" && meta.markdown.trim()
        ? meta.markdown
        : String(meta.html || "");
    mimeType = text.trim().startsWith("<") ? "text/html" : "text/markdown";
  }
  return { title, text, mimeType };
}

async function buildPublicPageUrl(config, pageMeta) {
  const bookId = pageMeta.book_id;
  const pageSlug = pageMeta.slug;
  const id = pageMeta.id;
  if (bookId != null && pageSlug) {
    try {
      const book = await bookstackFetchJson(config, `/books/${bookId}`);
      const bookSlug = book.slug || String(bookId);
      return `${config.baseUrl}/books/${bookSlug}/page/${pageSlug}`;
    } catch {
      /* fall through */
    }
  }
  return `${config.baseUrl}/page/${id}`;
}

/**
 * @param {string|number} pageId
 * @returns {Promise<{ title: string; text: string; sourceUrl: string; pageId: string }>}
 */
async function readPageForIngest(pageId) {
  const c = getBookStackConfig();
  if (!c) throw new Error("BookStack not configured");
  const id = String(pageId);
  const meta = await bookstackFetchJson(c, `/pages/${id}`);
  let text;
  try {
    text = await bookstackFetchText(c, `/pages/${id}/export/markdown`);
  } catch {
    text =
      typeof meta.markdown === "string" && meta.markdown.trim()
        ? meta.markdown
        : String(meta.html || "");
  }
  const title = meta.name || `Page ${id}`;
  const sourceUrl = await buildPublicPageUrl(c, meta);
  return { title, text, sourceUrl, pageId: id };
}

module.exports = {
  getBookStackConfig,
  isBookStackConfigured,
  listPages,
  readPageBodyForMcp,
  readPageForIngest,
  buildPublicPageUrl
};
