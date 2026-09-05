import { effectiveReachMinutes } from "@within-reach/reach-engine";
import type { Preferences } from "../state/app";

/**
 * SYNTHETIC FIXTURES ONLY. These numbers are deterministic test data for the
 * Phase 2 vertical slice. They are labelled as previews everywhere they are
 * shown and must be replaced by the validated API release (Phase 4/5).
 */

export const STANDARD_WALK_METRES_PER_MINUTE = 80;
export const STANDARD_REACH_MINUTES = 20;
/** Below this share of the network covered by known data, the comparison % is withheld. */
export const NETWORK_COVERAGE_THRESHOLD = 0.8;

export const SYNTHETIC_ORIGIN = {
  label: "Park Square, Leeds",
  latitude: 53.8008,
  longitude: -1.5491,
};

export type CategoryId = "essentials" | "community" | "wellbeing" | "support";

export const CATEGORY_LABELS: Record<CategoryId, string> = {
  essentials: "Essentials",
  community: "Community",
  wellbeing: "Wellbeing",
  support: "Support",
};

export type SyntheticPlace = {
  id: string;
  name: string;
  category: CategoryId;
  kind: string;
  /** Straight-line metres from the synthetic origin; routing replaces this in Phase 5. */
  metres: number;
  confidence: "verified" | "mapped" | "community_verified" | "inferred" | "unknown";
  source: string;
  retrieved: string;
};

export const SYNTHETIC_PLACES: SyntheticPlace[] = [
  { id: "toilet-city-square", name: "City Square toilets", category: "essentials", kind: "Toilet", metres: 420, confidence: "mapped", source: "OpenStreetMap extract", retrieved: "2026-08" },
  { id: "pharmacy-albion", name: "Albion Street pharmacy", category: "essentials", kind: "Pharmacy", metres: 610, confidence: "verified", source: "NHS repository (fixture)", retrieved: "2026-08" },
  { id: "toilet-merrion", name: "Merrion Centre accessible toilet", category: "essentials", kind: "Accessible toilet", metres: 950, confidence: "unknown", source: "Unverified report", retrieved: "—" },
  { id: "hub-community-centre", name: "Community hub, Woodhouse Lane", category: "community", kind: "Community hub", metres: 1250, confidence: "mapped", source: "OpenStreetMap extract", retrieved: "2026-08" },
  { id: "library-central", name: "Central library", category: "community", kind: "Community hub", metres: 700, confidence: "mapped", source: "OpenStreetMap extract", retrieved: "2026-08" },
  { id: "bench-park-square", name: "Park Square seats", category: "wellbeing", kind: "Seat", metres: 60, confidence: "verified", source: "Field survey (fixture)", retrieved: "2026-09" },
  { id: "park-woodhouse-moor", name: "Woodhouse Moor edge", category: "wellbeing", kind: "Park entrance", metres: 1450, confidence: "mapped", source: "OpenStreetMap extract", retrieved: "2026-08" },
  { id: "safe-place-leeds-station", name: "Safe Place, Leeds station", category: "support", kind: "Safe Place", metres: 1100, confidence: "unknown", source: "Quarantined register", retrieved: "—" },
  { id: "cafe-park-row", name: "Café, Park Row", category: "wellbeing", kind: "Café", metres: 380, confidence: "mapped", source: "OpenStreetMap extract", retrieved: "2026-08" },
  { id: "toilet-kirkgate", name: "Kirkgate Market toilets", category: "essentials", kind: "Toilet", metres: 890, confidence: "mapped", source: "OpenStreetMap extract", retrieved: "2026-08" },
];

/** Synthetic known-network coverage share of the study area (fixture constant). */
export const SYNTHETIC_NETWORK_COVERAGE = 0.86;

export type ReachComputation = {
  budgetMinutes: number;
  personalMinutes: number;
  standardMetres: number;
  personalMetres: number;
  /** personalMetres / standardMetres; the displayed % is this squared. */
  ratio: number;
  areaCoveragePercent: number | null;
  networkCoverageValid: boolean;
  counts: Record<CategoryId, number>;
  placesInReach: SyntheticPlace[];
};

/** Deterministic: identical preferences + budget always produce identical output. */
export function computeReach(preferences: Preferences, budgetMinutes: number): ReachComputation {
  const standardMetres = STANDARD_REACH_MINUTES * STANDARD_WALK_METRES_PER_MINUTE;
  const personalMinutes = effectiveReachMinutes(budgetMinutes, {
    pace:
      preferences.speed === "slow" ? "relaxed" : preferences.speed === "fast" ? "energetic" : "steady",
    maxUnbrokenMinutes:
      preferences.maxContinuousMinutes === "none" ? 60 : preferences.maxContinuousMinutes,
    avoidSteps: preferences.steps === "avoid_completely",
  });
  const personalMetres = Math.round((personalMinutes / STANDARD_REACH_MINUTES) * standardMetres);
  const ratio = personalMetres / standardMetres;
  const networkCoverageValid = SYNTHETIC_NETWORK_COVERAGE >= NETWORK_COVERAGE_THRESHOLD;
  const placesInReach = SYNTHETIC_PLACES.filter((place) => place.metres <= personalMetres);
  const counts: Record<CategoryId, number> = { essentials: 0, community: 0, wellbeing: 0, support: 0 };
  for (const place of placesInReach) counts[place.category] += 1;
  return {
    budgetMinutes,
    personalMinutes,
    standardMetres,
    personalMetres,
    ratio,
    areaCoveragePercent: networkCoverageValid ? Math.round(ratio * ratio * 100) : null,
    networkCoverageValid,
    counts,
    placesInReach,
  };
}
