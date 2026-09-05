/**
 * Personal reach mathematics (Phase 2 implements the network reach call).
 * Pure, deterministic functions only — "20 minutes is not the same for everyone."
 */

export type MovementPace = "steady" | "relaxed" | "energetic";

export type ReachPreferences = {
  pace: MovementPace;
  /** Seconds the person is comfortable walking without a rest. */
  maxUnbrokenMinutes: number;
  avoidSteps: boolean;
};

/** Effective minutes walked within a nominal `budgetMinutes` window. */
export function effectiveReachMinutes(budgetMinutes: number, preferences: ReachPreferences): number {
  const paceFactor: Record<MovementPace, number> = { steady: 1, relaxed: 0.75, energetic: 1.15 };
  let minutes = budgetMinutes * paceFactor[preferences.pace];
  if (preferences.avoidSteps) minutes *= 0.9;
  return Math.max(0, Math.round(minutes * 10) / 10);
}

/** True when a journey of `journeyMinutes` exceeds the comfortable unbroken duration. */
export function needsRestStop(journeyMinutes: number, preferences: ReachPreferences): boolean {
  return journeyMinutes > preferences.maxUnbrokenMinutes;
}
