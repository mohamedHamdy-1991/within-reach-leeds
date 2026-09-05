import type { ProvenanceLabel } from "../tokens";

/**
 * Confidence is a word plus symbol plus source/date — never colour alone.
 * "unknown" must never be rendered as accessible.
 */
const SYMBOLS: Record<ProvenanceLabel, string> = {
  verified: "✓",
  mapped: "◐",
  community_verified: "✓✓",
  inferred: "≈",
  unknown: "?",
};

export type ConfidenceBadgeProps = {
  label: ProvenanceLabel;
  /** Human phrase shown instead of the raw vocabulary word, e.g. "Checked by the data owner". */
  phrase?: string;
  /** Source name and/or date, e.g. "Leeds City Council · 2026-06". */
  meta?: string;
};

export function ConfidenceBadge({ label, phrase, meta }: ConfidenceBadgeProps) {
  return (
    <span className={`wr-confidence-badge wr-confidence-badge--${label}`}>
      <span className="wr-confidence-badge__symbol" aria-hidden="true">
        {SYMBOLS[label]}
      </span>
      <span className="wr-confidence-badge__label">{phrase ?? label.replace(/_/g, " ")}</span>
      {meta ? <span className="wr-confidence-badge__meta">· {meta}</span> : null}
    </span>
  );
}
