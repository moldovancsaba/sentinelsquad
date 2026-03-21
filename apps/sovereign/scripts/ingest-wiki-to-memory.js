#!/usr/bin/env node
/**
 * Ingest one BookStack page into ProjectMemory (LLD-007 optional AC).
 * Requires DATABASE_URL, BookStack env (same as mcp-docs), and a valid projectSessionId.
 *
 * Usage:
 *   node scripts/ingest-wiki-to-memory.js --page-id=123 --project-session-id=<cuid> [--dry-run]
 */
const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { PrismaClient } = require("@prisma/client");
const { readPageForIngest } = require("./lib/wiki-bookstack");

const prisma = new PrismaClient();

function parseArgs(argv) {
  let pageId = null;
  let projectSessionId = null;
  let dryRun = false;
  for (const a of argv) {
    if (a.startsWith("--page-id=")) pageId = a.slice("--page-id=".length).trim();
    if (a.startsWith("--project-session-id=")) {
      projectSessionId = a.slice("--project-session-id=".length).trim();
    }
    if (a === "--dry-run") dryRun = true;
  }
  return { pageId, projectSessionId, dryRun };
}

function compactSummary(text, max = 240) {
  const n = String(text || "")
    .replace(/\s+/g, " ")
    .trim();
  if (n.length <= max) return n;
  return `${n.slice(0, max - 3).trimEnd()}...`;
}

async function main() {
  const { pageId, projectSessionId, dryRun } = parseArgs(process.argv.slice(2));
  if (!pageId || !projectSessionId) {
    console.error(
      "Usage: node scripts/ingest-wiki-to-memory.js --page-id=<id> --project-session-id=<cuid> [--dry-run]"
    );
    process.exit(1);
  }

  const page = await readPageForIngest(pageId);
  const summary = compactSummary(page.text, 240);
  const maxContent = 20000;
  const content =
    page.text.length > maxContent ? `${page.text.slice(0, maxContent)}\n\n…(truncated)` : page.text;

  if (dryRun) {
    console.log(
      JSON.stringify(
        {
          ok: true,
          dryRun: true,
          title: page.title,
          sourceUrl: page.sourceUrl,
          summaryLength: summary.length,
          contentLength: content.length
        },
        null,
        2
      )
    );
    return;
  }

  const session = await prisma.projectSession.findUnique({
    where: { id: projectSessionId },
    select: { id: true }
  });
  if (!session) {
    console.error(`Unknown projectSessionId: ${projectSessionId}`);
    process.exit(1);
  }

  const row = await prisma.projectMemory.create({
    data: {
      projectSessionId,
      title: page.title.slice(0, 500),
      summary,
      content,
      tags: ["wiki", "bookstack", `page:${page.pageId}`],
      status: "CAPTURED",
      kind: "PO_PRODUCT",
      sourceKind: "bookstack",
      sourceUrl: page.sourceUrl.slice(0, 2000)
    }
  });

  console.log(JSON.stringify({ ok: true, projectMemoryId: row.id, sourceUrl: page.sourceUrl }, null, 2));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
