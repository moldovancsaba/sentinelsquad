import { NextRequest, NextResponse } from "next/server";
import { getAppSession } from "@/lib/app-session";
import { runHybridOrchestrator, type RunHybridOrchestratorOptions } from "@/lib/hybrid-orchestrator";

/**
 * POST /api/orchestrator/hybrid
 * Simulation / trace collection endpoint (spec v1 — no UI required).
 * Body: RunHybridOrchestratorOptions (JSON).
 */
export async function POST(req: NextRequest) {
  const session = await getAppSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Body must be a JSON object." }, { status: 400 });
  }

  try {
    const envelope = runHybridOrchestrator(body as RunHybridOrchestratorOptions);
    return NextResponse.json(
      {
        ok: true,
        envelope,
        trace: envelope.metadata
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { ok: false, error: "Hybrid orchestrator run failed.", message },
      { status: 500 }
    );
  }
}
