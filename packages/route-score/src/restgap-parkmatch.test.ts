import { describe, expect, it } from "vitest";
import { classifyPark, restGaps, type ParkRequirement, type RestPoint } from "./restgap-parkmatch";

describe("restGaps (A08 — hand-calculated fixture)", () => {
  const points: RestPoint[] = [
    { id: "s1", name: "Seat A", metresAlongRoute: 300, confidence: "verified" },
    { id: "s2", name: "Seat B", metresAlongRoute: 950, confidence: "mapped" },
  ];

  it("matches hand calculation on a 1500 m route with an 800 m rest limit", () => {
    const result = restGaps(1500, points, 800);
    // start→Seat A 300 m (known), A→B 650 m (known), B→end 550 m (known)
    expect(result.gaps.map((g) => [g.gapMetres, g.known])).toEqual([
      [300, true],
      [650, true],
      [550, true],
    ]);
    expect(result.longestKnownGapMetres).toBe(650);
    expect(result.unknownCoverageMetres).toBe(0);
  });

  it("labels the longest value longest KNOWN gap and reports unknown coverage separately", () => {
    const sparse: RestPoint[] = [{ id: "s1", name: "Seat A", metresAlongRoute: 100, confidence: "verified" }];
    const result = restGaps(2000, sparse, 800);
    // start→A 100 m known; A→end 1900 m exceeds the 800 m limit → unknown interval
    expect(result.longestKnownGapMetres).toBe(100);
    expect(result.unknownCoverageMetres).toBe(1900);
    expect(result.gaps.find((g) => !g.known)).toMatchObject({ fromMetres: 100, toMetres: 2000 });
  });

  it("returns all-unknown coverage when no rest points exist", () => {
    const result = restGaps(1000, [], 800);
    expect(result.longestKnownGapMetres).toBeNull();
    expect(result.unknownCoverageMetres).toBe(1000);
  });

  it("ignores duplicate projections", () => {
    const dupes: RestPoint[] = [
      { id: "a", name: "A", metresAlongRoute: 500, confidence: "mapped" },
      { id: "b", name: "B", metresAlongRoute: 500, confidence: "mapped" },
    ];
    const result = restGaps(1000, dupes, 800);
    expect(result.gaps.filter((g) => g.known && g.gapMetres === 0).length).toBeLessThanOrEqual(1);
  });
});

describe("classifyPark (A09)", () => {
  const req = (featureId: string, required: boolean, evidence: boolean | null): ParkRequirement => ({
    featureId,
    label: featureId,
    required,
    evidence,
  });

  it("separates known match, known mismatch and unknown", () => {
    const all = classifyPark([req("benches", true, true), req("toilet", true, true)]);
    expect(all.verdict).toBe("known_match");

    const mismatch = classifyPark([req("benches", true, true), req("toilet", true, false)]);
    expect(mismatch.verdict).toBe("known_mismatch");
    expect(mismatch.perFeature).toEqual(["known_match", "known_mismatch"]);

    const unknown = classifyPark([req("benches", true, true), req("scooter", true, null)]);
    expect(unknown.verdict).toBe("unknown");
    expect(unknown.perFeature).toEqual(["known_match", "unknown"]);
  });

  it("never infers whole-park accessibility from one path", () => {
    // One known feature cannot satisfy unknown required features.
    const result = classifyPark([req("paths", true, true), req("toilet", true, null)]);
    expect(result.verdict).toBe("unknown");
  });

  it("reports unknown when nothing was requested", () => {
    expect(classifyPark([]).verdict).toBe("unknown");
  });
});
