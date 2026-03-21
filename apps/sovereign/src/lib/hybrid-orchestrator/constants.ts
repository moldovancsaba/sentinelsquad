import type { AiAgentId, HumanAgentId, HybridAgentId, SignalId } from "./types";

/** SULTAN / MISI triggers (sum of two signals, not normalized). */
export const SULTAN_TRIGGER_THRESHOLD = 1.2;
export const MISI_TRIGGER_THRESHOLD = 1;

export const PIPELINE_ORDER: AiAgentId[] = ["TRIBECA", "CHAPPIE", "CHIHIRO", "HATORI"];

export const AI_AGENT_IDS: AiAgentId[] = [
  "TRIBECA",
  "CHAPPIE",
  "CHIHIRO",
  "HATORI",
  "KATJA",
  "MEIMEI",
  "AGNES"
];

export const HUMAN_AGENT_IDS: HumanAgentId[] = ["SULTAN", "MISI"];

/** Affinity weights: score = Σ signal[id] * weight */
export const AFFINITY_WEIGHTS: Record<HybridAgentId, Partial<Record<SignalId, number>>> = {
  SULTAN: {
    ambiguity: 0.8,
    novelty: 0.9,
    conflict: 0.4,
    complexity: 0.3
  },
  MISI: {
    conflict: 0.9,
    communication_load: 0.8,
    ambiguity: 0.3
  },
  TRIBECA: {
    ambiguity: 0.7,
    complexity: 0.6,
    confidence: -0.6
  },
  CHAPPIE: {
    complexity: 0.8,
    execution_load: 0.7,
    ambiguity: 0.4
  },
  CHIHIRO: {
    execution_load: 0.9,
    complexity: 0.6,
    confidence: 0.3
  },
  HATORI: {
    conflict: 0.7,
    execution_load: 0.6,
    confidence: -0.5
  },
  KATJA: {
    communication_load: 0.7,
    ambiguity: 0.5
  },
  MEIMEI: {
    communication_load: 0.8,
    complexity: 0.3
  },
  AGNES: {
    communication_load: 0.9,
    conflict: 0.4
  }
};
