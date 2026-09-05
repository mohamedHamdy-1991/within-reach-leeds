/**
 * Deterministic route scoring from per-segment factors. Pure functions only;
 * no network, no city-specific logic (Leeds lives in config/).
 *
 * Factor shape mirrors contracts/route-factor.schema.json.
 */

export type FactorName = "steps" | "gradient" | "rest_gap" | "crossings" | "surface" | "unknown";

export type FactorStatus = "known_ok" | "known_barrier" | "partial" | "unknown";

export type Confidence = "verified" | "mapped" | "community_verified" | "inferred" | "unknown";

export type RouteFactor = {
  factor: FactorName;
  status: FactorStatus;
  value: unknown;
  unit: string | null;
  confidence: Confidence;
  costSeconds: number;
  explanation?: string;
};

export type RouteScore = {
  /** Total added cost in seconds; deterministic for identical factor lists. */
  costSeconds: number;
  /** True when any factor is unknown — the score must be disclosed as incomplete. */
  hasUnknowns: boolean;
  /** True when any factor is a known barrier. */
  hasBarriers: boolean;
};

/** Unknown factors contribute 0 cost but always set hasUnknowns (never infer). */
export function scoreRoute(factors: readonly RouteFactor[]): RouteScore {
  let costSeconds = 0;
  let hasUnknowns = false;
  let hasBarriers = false;
  for (const factor of factors) {
    if (factor.status === "unknown") hasUnknowns = true;
    if (factor.status === "known_barrier") hasBarriers = true;
    costSeconds += factor.costSeconds;
  }
  return { costSeconds, hasUnknowns, hasBarriers };
}
export * from "./restgap-parkmatch";
