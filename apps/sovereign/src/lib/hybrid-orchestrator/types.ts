/** Hybrid Orchestrator v1 — types (see docs/architecture/HYBRID_ORCHESTRATOR_SPEC_V1.md). */

export const HYBRID_ORCHESTRATOR_SPEC_VERSION = "1.0" as const;

export type SignalId =
  | "ambiguity"
  | "complexity"
  | "novelty"
  | "conflict"
  | "confidence"
  | "execution_load"
  | "communication_load";

export type OrchestratorSignals = Record<SignalId, number>;

export type AiAgentId =
  | "TRIBECA"
  | "CHAPPIE"
  | "CHIHIRO"
  | "HATORI"
  | "KATJA"
  | "MEIMEI"
  | "AGNES";

export type HumanAgentId = "SULTAN" | "MISI";

export type HybridAgentId = AiAgentId | HumanAgentId;

export type HybridExecutionMode = "AUTOMATED" | "AUGMENTED" | "HUMAN_LED";

export type TrustTier = "HIGH" | "MEDIUM" | "LOW";

export type OrchestratorFlag =
  | "LOW_CONFIDENCE"
  | "DISAGREEMENT"
  | "CONSENSUS_FAILURE"
  | "FALLBACK_USED"
  | "SYSTEM_FAILURE"
  | "HUMAN_OVERRIDE"
  | "TAXONOMY_VIOLATION"
  | "SKIPPED";

export type ConsensusLevel = "UNANIMOUS" | "PARTIAL" | "NONE";

export type HumanInjectionPoint = "pre_pipeline" | "mid_pipeline" | "post_pipeline";

export type HumanInvokeRecord = {
  agent: HumanAgentId;
  points: HumanInjectionPoint[];
  reason: string;
};

/** Raw inputs used to derive v1 heuristics (all optional; clamped in engine). */
export type HeuristicInputs = {
  lackOfStructure?: number;
  vagueLanguage?: number;
  numberOfConstraints?: number;
  stepsRequired?: number;
  deviationFromKnownPatterns?: number;
  contradictionsDetected?: number;
  /** Initial certainty [0–1]; higher = user/model more certain. */
  initialCertainty?: number;
  systemDepth?: number;
  dependencies?: number;
  abstractionLevel?: number;
};

export type DiscardedAgent = {
  agent: HybridAgentId;
  reason: string;
};

export type HybridOrchestratorTrace = {
  specVersion: typeof HYBRID_ORCHESTRATOR_SPEC_VERSION;
  mode: HybridExecutionMode;
  signals: OrchestratorSignals;
  agent_scores: Record<string, number>;
  selected_stack: HybridAgentId[];
  discarded_agents: DiscardedAgent[];
  lead_agent: AiAgentId | "";
  human_invoked: HumanInvokeRecord[];
  confidence: number;
  trust_tier: TrustTier;
  flags: OrchestratorFlag[];
  decision_path: string[];
  consensus_level: ConsensusLevel;
};

export type OutputEnvelope = {
  label: string;
  confidence: number;
  trust_tier: TrustTier;
  flags: OrchestratorFlag[];
  metadata: HybridOrchestratorTrace;
};

export type RunHybridOrchestratorOptions = {
  /** Free-text input; empty triggers SKIPPED fallback unless signals provided. */
  text?: string;
  /** Explicit signal overrides (merged over computed heuristics). */
  signalOverrides?: Partial<OrchestratorSignals>;
  /** Raw heuristic dimensions (merged with text-derived heuristics when text set). */
  heuristics?: HeuristicInputs;
  mode?: HybridExecutionMode;
  consensus?: ConsensusLevel;
  /** Target stack size after ranking (hard rules may shrink). Default 4, min 3 max 5. */
  stackTargetSize?: number;
  /** Caller-reported failure → SYSTEM_FAILURE envelope. */
  systemFailure?: boolean;
  /** When true, records HUMAN_OVERRIDE if humans are injected outside AUTOMATED. */
  humanOverride?: boolean;
};
