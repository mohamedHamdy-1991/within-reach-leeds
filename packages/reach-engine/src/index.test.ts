import { describe, expect, it } from "vitest";
import { effectiveReachMinutes, needsRestStop } from "./index";

const steady = { pace: "steady", maxUnbrokenMinutes: 20, avoidSteps: false } as const;
const relaxed = { pace: "relaxed", maxUnbrokenMinutes: 10, avoidSteps: true } as const;

describe("effectiveReachMinutes", () => {
  it("keeps a steady pace unchanged", () => {
    expect(effectiveReachMinutes(20, steady)).toBe(20);
  });

  it("contracts reach for a relaxed step-avoiding person", () => {
    expect(effectiveReachMinutes(20, relaxed)).toBe(13.5);
  });

  it("is deterministic for identical inputs", () => {
    expect(effectiveReachMinutes(20, relaxed)).toBe(effectiveReachMinutes(20, relaxed));
  });
});

describe("needsRestStop", () => {
  it("flags journeys longer than the comfortable unbroken duration", () => {
    expect(needsRestStop(15, relaxed)).toBe(true);
    expect(needsRestStop(9, relaxed)).toBe(false);
  });
});
