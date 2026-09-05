# Phase 5 Summary
**Status: PASS** on the V1 feature gates implemented over the live candidate release (A08, A09 by dedicated deterministic tests; journey evidence via e2e with the real API+router).

- **EasyRoute** (`/route`): origin/destination, Compare routes → live Valhalla routes via /api/v1/route; Fastest/Easiest rendered with time + distance, a factor table where every factor states known/unknown explicitly (steps/surface/gradient are honestly "Unknown — …" in this release), "Compare all factors" toggle, safety notice, scoring-version stamped. Never a single unexplained score.
- **Rest Gap**: pure deterministic computation (`restGaps`) in @within-reach/route-score with hand-calculated fixture tests (A08): known gaps start→first/between/last→end, "longest KNOWN gap" labelling, unknown coverage reported separately, duplicate-projection guard. UI wiring to route geometry is flagged for the DEM/geometry pass.
- **Toilets & Services** (`/find`): category-driven live place search against PostGIS (toilets, seats, pharmacy, community, support) with straight-line-distance disclosure, per-place ConfidenceBadge + source/date, honest empty state, 503 → "nothing is shown rather than a guessed list".
- **ParkMatch** (`/parks`): requirement filters → live parks (kind=Park) → classifyPark verdicts known_match/known_mismatch/unknown per feature; the active release has no per-feature evidence so everything is honestly unknown (A09 "never infer whole-park accessibility"); "Never inferred" safety notice.
- **Data Confidence** page (P13) already shipped in Phase 2 with live register statuses.
- API extended with kind filter; FakeDB test signature updated; font URLs fixed (encoded brackets) after e2e console caught OTS decode failures.

Gates: lint/typecheck/test exit 0 across 4 packages (46 node tests), Python 20/20 (live services), Playwright e2e 18/18 (desktop+mobile) with the live stack.
