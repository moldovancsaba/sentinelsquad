import type { HeuristicInputs, OrchestratorSignals } from "./types";

export function clamp01(x: number): number {
  if (!Number.isFinite(x)) return 0;
  return Math.min(1, Math.max(0, x));
}

type ResolvedHeuristics = Required<HeuristicInputs>;

function mergeHeuristicWithText(h: HeuristicInputs, text: string): ResolvedHeuristics {
  const t = text.trim();
  const words = t ? t.split(/\s+/).filter(Boolean).length : 0;
  const lower = t.toLowerCase();
  const vagueHits = (
    lower.match(
      /\b(maybe|unclear|not sure|unsure|approximate|roughly|kind of|sort of|ambiguous|confused|don't know|do not know)\b/g
    ) || []
  ).length;
  const qMarks = (t.match(/\?/g) || []).length;
  const vagueLanguage = clamp01(
    h.vagueLanguage ?? Math.min(1, vagueHits * 0.12 + qMarks * 0.06)
  );
  const lackOfStructure = clamp01(
    h.lackOfStructure ??
      (words === 0 ? 0.35 : words < 6 ? 0.5 : words < 20 ? 0.25 : 0.15)
  );
  const numberOfConstraints = clamp01(
    h.numberOfConstraints ??
      Math.min(1, ((lower.match(/\b(must|should|required|always|never|cannot|don't|do not)\b/g) || []).length * 0.08))
  );
  const stepsRequired = clamp01(
    h.stepsRequired ??
      Math.min(1, ((lower.match(/\b(then|first|second|next|finally|step)\b/g) || []).length * 0.1))
  );
  const deviationFromKnownPatterns = clamp01(
    h.deviationFromKnownPatterns ??
      Math.min(1, words > 0 ? (1 - Math.min(1, words / 120)) * 0.4 : 0.2)
  );
  const contradictionsDetected = clamp01(
    h.contradictionsDetected ??
      Math.min(1, ((lower.match(/\b(but however|although|contradict|conflict|both yes and no)\b/g) || []).length * 0.25))
  );
  const systemDepth = clamp01(h.systemDepth ?? Math.min(1, words / 200));
  const dependencies = clamp01(
    h.dependencies ??
      Math.min(1, ((lower.match(/\b(api|database|service|integration|dependency|infra)\b/g) || []).length * 0.12))
  );
  const abstractionLevel = clamp01(
    h.abstractionLevel ??
      Math.min(1, ((lower.match(/\b(architecture|framework|strategy|abstract|general|principle)\b/g) || []).length * 0.15))
  );
  const initialCertainty = h.initialCertainty != null ? clamp01(h.initialCertainty) : 0.55;

  return {
    lackOfStructure,
    vagueLanguage,
    numberOfConstraints,
    stepsRequired,
    deviationFromKnownPatterns,
    contradictionsDetected,
    initialCertainty,
    systemDepth,
    dependencies,
    abstractionLevel
  };
}

/**
 * Deterministic v1 signal vector from heuristics + optional text (spec §2.3).
 */
export function computeSignalsFromHeuristics(
  heuristics: HeuristicInputs,
  text: string
): OrchestratorSignals {
  const h: ResolvedHeuristics = mergeHeuristicWithText(heuristics, text);

  const ambiguity = clamp01((h.lackOfStructure + h.vagueLanguage) / 2);
  const complexity = clamp01((h.numberOfConstraints + h.stepsRequired) / 2);
  const novelty = clamp01(h.deviationFromKnownPatterns);
  const conflict = clamp01(h.contradictionsDetected);
  const execution_load = clamp01((h.systemDepth + h.dependencies) / 2);
  const communication_load = clamp01((h.abstractionLevel + ambiguity) / 2);
  const confidence = clamp01(
    0.5 * (1 - (ambiguity + conflict) / 2) + 0.5 * h.initialCertainty
  );

  return {
    ambiguity,
    complexity,
    novelty,
    conflict,
    confidence,
    execution_load,
    communication_load
  };
}

export function mergeSignalOverrides(
  base: OrchestratorSignals,
  overrides?: Partial<OrchestratorSignals>
): OrchestratorSignals {
  if (!overrides) return base;
  const out = { ...base };
  for (const k of Object.keys(overrides) as (keyof OrchestratorSignals)[]) {
    if (overrides[k] !== undefined) out[k] = clamp01(overrides[k] as number);
  }
  return out;
}

/** UCGS governance confidence (spec §7.1), distinct from affinity `confidence` signal usage. */
export function computeUcgsConfidence(signals: OrchestratorSignals): number {
  return clamp01(
    1 - (0.4 * signals.ambiguity + 0.3 * signals.conflict + 0.3 * signals.novelty)
  );
}

export function trustTierFromConfidence(confidence: number): "HIGH" | "MEDIUM" | "LOW" {
  if (confidence >= 0.75) return "HIGH";
  if (confidence >= 0.5) return "MEDIUM";
  return "LOW";
}
