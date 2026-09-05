/**
 * Rest Gap computation (A08) — deterministic, hand-checkable.
 *
 * Rest points are projected onto the route by metre-along. Gaps are computed
 * start → first point, between consecutive points, and last point → end.
 * Unknown intervals (route sections with no known rest coverage) are reported
 * separately and never treated as rest coverage.
 */

export type RestPoint = {
  id: string;
  name: string;
  /** Metres along the route from the start. */
  metresAlongRoute: number;
  confidence: "verified" | "mapped" | "community_verified" | "inferred" | "unknown";
};

export type RestGap = {
  fromMetres: number;
  toMetres: number;
  gapMetres: number;
  known: boolean;
  afterRestPoint: string | null;
};

export type RestGapResult = {
  routeLengthMetres: number;
  gaps: RestGap[];
  longestKnownGapMetres: number | null;
  /** Total metres with no known rest coverage within the walking limit. */
  unknownCoverageMetres: number;
};

export const DEFAULT_REST_LIMIT_METRES = 800;

export function restGaps(
  routeLengthMetres: number,
  restPoints: readonly RestPoint[],
  restLimitMetres: number = DEFAULT_REST_LIMIT_METRES,
): RestGapResult {
  const sorted = [...restPoints].sort((a, b) => a.metresAlongRoute - b.metresAlongRoute);
  const gaps: RestGap[] = [];

  let cursor = 0;
  let previous: RestPoint | null = null;
  for (const point of sorted) {
    if (point.metresAlongRoute < cursor) continue; // duplicate/out-of-order guard
    if (point.metresAlongRoute - cursor > restLimitMetres) {
      gaps.push({
        fromMetres: cursor,
        toMetres: point.metresAlongRoute,
        gapMetres: point.metresAlongRoute - cursor,
        known: false,
        afterRestPoint: previous?.name ?? null,
      });
    }
    gaps.push({
      fromMetres: cursor,
      toMetres: point.metresAlongRoute,
      gapMetres: point.metresAlongRoute - cursor,
      known: true,
      afterRestPoint: previous?.name ?? null,
    });
    cursor = point.metresAlongRoute;
    previous = point;
  }
  if (routeLengthMetres > cursor) {
    const tail = routeLengthMetres - cursor;
    gaps.push({
      fromMetres: cursor,
      toMetres: routeLengthMetres,
      gapMetres: tail,
      known: tail <= restLimitMetres,
      afterRestPoint: previous?.name ?? null,
    });
  }

  const knownGaps = gaps.filter((g) => g.known);
  const unknownCoverageMetres = gaps.filter((g) => !g.known).reduce((sum, g) => sum + g.gapMetres, 0);
  return {
    routeLengthMetres,
    gaps,
    longestKnownGapMetres: knownGaps.length ? Math.max(...knownGaps.map((g) => g.gapMetres)) : null,
    unknownCoverageMetres,
  };
}

/**
 * ParkMatch classification (A09): every requested feature resolves to
 * known_match / known_mismatch / unknown — never inferred from other fields.
 */
export type ParkFeatureEvidence = boolean | null; // true/false = known, null = unknown

export type ParkRequirement = {
  featureId: string;
  label: string;
  required: boolean;
  evidence: ParkFeatureEvidence;
};

export type ParkMatchVerdict = "known_match" | "known_mismatch" | "partial" | "unknown";

export function classifyPark(requirements: readonly ParkRequirement[]): {
  verdict: ParkMatchVerdict;
  perFeature: ParkMatchVerdict[];
} {
  const perFeature = requirements.map((requirement) => {
    if (requirement.evidence === null) return "unknown" as const;
    if (!requirement.required) return "known_match" as const;
    return requirement.evidence ? ("known_match" as const) : ("known_mismatch" as const);
  });

  const requiredUnknown = requirements.some((r) => r.required && r.evidence === null);
  const anyMismatch = requirements.some((r) => r.required && r.evidence === false);

  let verdict: ParkMatchVerdict;
  if (anyMismatch) verdict = "known_mismatch";
  else if (requiredUnknown) verdict = "unknown";
  else if (requirements.some((r) => r.required)) verdict = "known_match";
  else verdict = "unknown";

  return { verdict, perFeature };
}
