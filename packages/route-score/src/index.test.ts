import { describe, expect, it } from "vitest";
import { scoreRoute, type RouteFactor } from "./index";

const known: RouteFactor = {
  factor: "gradient",
  status: "known_ok",
  value: 2,
  unit: "percent",
  confidence: "mapped",
  costSeconds: 30,
};

const barrier: RouteFactor = {
  factor: "steps",
  status: "known_barrier",
  value: 12,
  unit: "steps",
  confidence: "verified",
  costSeconds: 120,
};

const unknown: RouteFactor = {
  factor: "surface",
  status: "unknown",
  value: null,
  unit: null,
  confidence: "unknown",
  costSeconds: 0,
};

describe("scoreRoute", () => {
  it("sums costs deterministically", () => {
    expect(scoreRoute([known, barrier]).costSeconds).toBe(150);
    expect(scoreRoute([known, barrier])).toEqual(scoreRoute([barrier, known]));
  });

  it("never converts unknown factors into cost or known status", () => {
    const result = scoreRoute([known, unknown]);
    expect(result.costSeconds).toBe(30);
    expect(result.hasUnknowns).toBe(true);
    expect(result.hasBarriers).toBe(false);
  });

  it("flags known barriers", () => {
    expect(scoreRoute([barrier]).hasBarriers).toBe(true);
  });

  it("handles an empty factor list", () => {
    expect(scoreRoute([])).toEqual({ costSeconds: 0, hasUnknowns: false, hasBarriers: false });
  });
});
