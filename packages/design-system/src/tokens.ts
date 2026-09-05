/**
 * WITHIN REACH — Leeds design tokens (source of truth: design/tokens.json).
 * Values are duplicated in tokens.css for the browser; keep both in sync.
 */

export const color = {
  ink: "#171717",
  paper: "#F4F5F2",
  signal: "#F4CA28",
  signalPale: "#FFF4BD",
  blue: "#2387C9",
  amber: "#8C5200",
  red: "#B42318",
  rule: "#D9DDD8",
} as const;

export const space = {
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  6: "24px",
  8: "32px",
  12: "48px",
  16: "64px",
} as const;

export const radius = { control: "10px", panel: "14px" } as const;

export const target = { minimum: "44px", primary: "52px" } as const;

export const motion = {
  reach: "240ms",
  easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
} as const;

/** Status vocabulary from AGENTS.md — never colour alone, always word + symbol. */
export const PROVENANCE_LABELS = [
  "verified",
  "mapped",
  "community_verified",
  "inferred",
  "unknown",
] as const;

export type ProvenanceLabel = (typeof PROVENANCE_LABELS)[number];
