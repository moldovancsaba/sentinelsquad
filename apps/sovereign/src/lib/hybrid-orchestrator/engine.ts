import {
  AFFINITY_WEIGHTS,
  AI_AGENT_IDS,
  MISI_TRIGGER_THRESHOLD,
  PIPELINE_ORDER,
  SULTAN_TRIGGER_THRESHOLD
} from "./constants";
import {
  clamp01,
  computeSignalsFromHeuristics,
  computeUcgsConfidence,
  mergeSignalOverrides,
  trustTierFromConfidence
} from "./signals";
import type {
  AiAgentId,
  DiscardedAgent,
  HeuristicInputs,
  HumanAgentId,
  HumanInjectionPoint,
  HumanInvokeRecord,
  HybridAgentId,
  HybridExecutionMode,
  HybridOrchestratorTrace,
  OrchestratorFlag,
  OrchestratorSignals,
  OutputEnvelope,
  RunHybridOrchestratorOptions
} from "./types";
import { HYBRID_ORCHESTRATOR_SPEC_VERSION } from "./types";

function scoreAgent(agent: HybridAgentId, signals: OrchestratorSignals): number {
  const weights = AFFINITY_WEIGHTS[agent];
  let sum = 0;
  for (const key of Object.keys(weights) as (keyof OrchestratorSignals)[]) {
    const w = weights[key];
    if (w === undefined) continue;
    sum += signals[key] * w;
  }
  return sum;
}

function buildHumanInvocations(
  mode: HybridExecutionMode,
  signals: OrchestratorSignals
): { records: HumanInvokeRecord[]; path: string[] } {
  const path: string[] = [];
  const records: HumanInvokeRecord[] = [];

  const sultanTrigger = signals.ambiguity + signals.novelty;
  const misiTrigger = signals.conflict + signals.communication_load;

  if (mode === "AUTOMATED") {
    path.push("mode=AUTOMATED: human interrupts suppressed.");
    return { records, path };
  }

  if (mode === "HUMAN_LED") {
    const sultanPoints: HumanInjectionPoint[] = ["pre_pipeline"];
    if (signals.ambiguity > 0.45) sultanPoints.push("mid_pipeline");
    records.push({
      agent: "SULTAN",
      points: sultanPoints,
      reason: "HUMAN_LED: human initiates flow (SULTAN pre/mid as needed)."
    });
    const misiPoints: HumanInjectionPoint[] = ["post_pipeline"];
    if (signals.conflict > 0.45) misiPoints.splice(0, 0, "mid_pipeline");
    records.push({
      agent: "MISI",
      points: misiPoints,
      reason: "HUMAN_LED: human initiates flow (MISI mid/post as needed)."
    });
    path.push("mode=HUMAN_LED: SULTAN and MISI scheduled.");
    return { records, path };
  }

  // AUGMENTED (default)
  if (sultanTrigger > SULTAN_TRIGGER_THRESHOLD) {
    const points: HumanInjectionPoint[] = ["pre_pipeline"];
    if (signals.ambiguity > 0.5) points.push("mid_pipeline");
    records.push({
      agent: "SULTAN",
      points,
      reason: `SULTAN_TRIGGER=${sultanTrigger.toFixed(3)} > ${SULTAN_TRIGGER_THRESHOLD}`
    });
    path.push(`invoke SULTAN (trigger ${sultanTrigger.toFixed(3)})`);
  }
  if (misiTrigger > MISI_TRIGGER_THRESHOLD) {
    const points: HumanInjectionPoint[] = [];
    if (signals.conflict > 0.5) points.push("mid_pipeline");
    points.push("post_pipeline");
    records.push({
      agent: "MISI",
      points,
      reason: `MISI_TRIGGER=${misiTrigger.toFixed(3)} > ${MISI_TRIGGER_THRESHOLD}`
    });
    path.push(`invoke MISI (trigger ${misiTrigger.toFixed(3)})`);
  }
  if (!records.length) {
    path.push("mode=AUGMENTED: no human thresholds exceeded.");
  }
  return { records, path };
}

function selectAndOrderStack(
  scores: Record<AiAgentId, number>,
  targetSize: number
): { stack: AiAgentId[]; discarded: DiscardedAgent[]; path: string[] } {
  const path: string[] = [];
  const discarded: DiscardedAgent[] = [];
  const k = Math.min(5, Math.max(3, targetSize));

  const ranked = [...AI_AGENT_IDS].sort((a, b) => scores[b] - scores[a]);
  path.push(`ranked AI agents: ${ranked.map((a) => `${a}:${scores[a].toFixed(4)}`).join(", ")}`);

  let selected = ranked.slice(0, k);

  if (selected.includes("HATORI") && !selected.some((a) => a === "CHAPPIE" || a === "CHIHIRO")) {
    selected = selected.filter((a) => a !== "HATORI");
    discarded.push({
      agent: "HATORI",
      reason: "HATORI cannot exist without CHAPPIE or CHIHIRO in stack."
    });
    path.push("discarded HATORI: missing CHAPPIE/CHIHIRO.");
    for (const a of ranked) {
      if (selected.length >= k) break;
      if (!selected.includes(a)) selected.push(a);
    }
  }

  const selectedSet = new Set(selected);
  const pipelineOrdered = PIPELINE_ORDER.filter((a) => selectedSet.has(a));
  const extras = selected
    .filter((a) => !PIPELINE_ORDER.includes(a))
    .sort((a, b) => scores[b] - scores[a]);

  const stack = [...pipelineOrdered, ...extras];
  path.push(`constraint order applied: pipeline=[${pipelineOrdered.join(",")}] extras=[${extras.join(",")}]`);

  return { stack, discarded, path };
}

function leadFromStack(stack: AiAgentId[], scores: Record<AiAgentId, number>): AiAgentId | "" {
  if (!stack.length) return "";
  let best = stack[0];
  let bestScore = scores[best];
  for (const a of stack) {
    if (scores[a] > bestScore) {
      best = a;
      bestScore = scores[a];
    }
  }
  return best;
}

function applyConsensus(
  consensus: HybridOrchestratorTrace["consensus_level"],
  baseTrust: "HIGH" | "MEDIUM" | "LOW",
  flags: OrchestratorFlag[]
): "HIGH" | "MEDIUM" | "LOW" {
  if (consensus === "UNANIMOUS") return baseTrust;
  if (consensus === "PARTIAL") {
    if (!flags.includes("DISAGREEMENT")) flags.push("DISAGREEMENT");
    if (baseTrust === "HIGH") return "MEDIUM";
    return baseTrust;
  }
  if (!flags.includes("CONSENSUS_FAILURE")) flags.push("CONSENSUS_FAILURE");
  return "LOW";
}

function applyLowTrustRouting(
  trust: "HIGH" | "MEDIUM" | "LOW",
  stack: AiAgentId[],
  path: string[],
  flags: OrchestratorFlag[]
) {
  if (trust !== "LOW") return;
  if (!flags.includes("LOW_CONFIDENCE")) flags.push("LOW_CONFIDENCE");
  path.push("UCGS LOW trust: force TRIBECA re-analysis or human interrupt.");
  if (!stack.includes("TRIBECA") && AI_AGENT_IDS.includes("TRIBECA")) {
    path.push("note: TRIBECA not in stack — recommend human interrupt or expand stack.");
  }
}

/**
 * Deterministic hybrid orchestrator run (spec v1.0).
 * Always returns a structured envelope + full trace.
 */
export function runHybridOrchestrator(options: RunHybridOrchestratorOptions = {}): OutputEnvelope {
  const mode: HybridExecutionMode = options.mode ?? "AUGMENTED";
  const consensus = options.consensus ?? "UNANIMOUS";
  const targetSize = options.stackTargetSize ?? 4;
  const text = options.text ?? "";
  const heuristics: HeuristicInputs = options.heuristics ?? {};

  const decision_path: string[] = [];
  const flags: OrchestratorFlag[] = [];

  if (options.systemFailure) {
    flags.push("SYSTEM_FAILURE");
    decision_path.push("caller reported systemFailure=true");
  }

  const hasOverrides =
    !!options.signalOverrides && Object.keys(options.signalOverrides).length > 0;
  const hasHeuristics = Object.values(heuristics).some(
    (v) => v !== undefined && v !== null && Number.isFinite(v as number)
  );
  const emptyInput = !text.trim() && !hasOverrides && !hasHeuristics;

  if (emptyInput) {
    flags.push("SKIPPED", "FALLBACK_USED");
    const zeroSignals: OrchestratorSignals = {
      ambiguity: 0,
      complexity: 0,
      novelty: 0,
      conflict: 0,
      confidence: 0,
      execution_load: 0,
      communication_load: 0
    };
    const trace: HybridOrchestratorTrace = {
      specVersion: HYBRID_ORCHESTRATOR_SPEC_VERSION,
      mode,
      signals: zeroSignals,
      agent_scores: Object.fromEntries(AI_AGENT_IDS.map((a) => [a, 0])),
      selected_stack: [],
      discarded_agents: [],
      lead_agent: "",
      human_invoked: [],
      confidence: 0.51,
      trust_tier: "MEDIUM",
      flags,
      decision_path: [...decision_path, "empty input: DEFAULT fallback (spec §9.1)"],
      consensus_level: consensus
    };
    return {
      label: "DEFAULT",
      confidence: 0.51,
      trust_tier: "MEDIUM",
      flags,
      metadata: trace
    };
  }

  let signals = computeSignalsFromHeuristics(heuristics, text);
  signals = mergeSignalOverrides(signals, options.signalOverrides);
  decision_path.push("signals computed and overrides merged.");

  const agent_scores: Record<string, number> = {};
  for (const id of AI_AGENT_IDS) {
    agent_scores[id] = scoreAgent(id, signals);
  }
  for (const id of ["SULTAN", "MISI"] as HumanAgentId[]) {
    agent_scores[id] = scoreAgent(id, signals);
  }

  const { stack, discarded, path: stackPath } = selectAndOrderStack(
    agent_scores as Record<AiAgentId, number>,
    targetSize
  );
  decision_path.push(...stackPath);

  const lead = leadFromStack(stack, agent_scores as Record<AiAgentId, number>);
  decision_path.push(`lead_agent selected: ${lead || "(none)"}`);

  const { records: human_invoked, path: humanPath } = buildHumanInvocations(mode, signals);
  decision_path.push(...humanPath);

  if (options.humanOverride && human_invoked.length && mode !== "AUTOMATED") {
    flags.push("HUMAN_OVERRIDE");
    decision_path.push("HUMAN_OVERRIDE flag set by caller.");
  }

  let ucgsConfidence = computeUcgsConfidence(signals);
  if (options.systemFailure) {
    ucgsConfidence = 0.5;
  }

  let trust_tier = trustTierFromConfidence(ucgsConfidence);
  trust_tier = applyConsensus(consensus, trust_tier, flags);
  applyLowTrustRouting(trust_tier, stack, decision_path, flags);

  const trace: HybridOrchestratorTrace = {
    specVersion: HYBRID_ORCHESTRATOR_SPEC_VERSION,
    mode,
    signals,
    agent_scores,
    selected_stack: stack,
    discarded_agents: discarded,
    lead_agent: lead,
    human_invoked,
    confidence: ucgsConfidence,
    trust_tier,
    flags: [...new Set(flags)],
    decision_path,
    consensus_level: consensus
  };

  const label = lead ? `${lead} RESULT` : "DEFAULT";

  return {
    label,
    confidence: ucgsConfidence,
    trust_tier,
    flags: trace.flags,
    metadata: trace
  };
}
