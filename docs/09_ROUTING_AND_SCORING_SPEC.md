# Routing and Scoring Specification

## Principle

Generate admissible alternatives with Valhalla, then calculate transparent generalised cost. Known hard constraints remove an edge; unknowns add disclosed uncertainty rather than becoming zero cost.

## Generalised edge cost

`C(e,u) = time(e,u) + Pg + Ps + Pr + Pc + Pf + Pu`

- `Pg`: gradient penalty from sampled/declared slope and preference.
- `Ps`: steps penalty; infinite when user selects avoid completely and edge is known steps.
- `Pr`: penalty when cumulative distance since last known rest point exceeds preferred interval.
- `Pc`: difficult/unknown crossing penalty.
- `Pf`: unsuitable/unknown surface penalty.
- `Pu`: missing-data penalty proportional to critical fields and user needs.

Weights live in versioned configuration, not UI code. Store the scoring-version ID with every result. Initial weights are hypotheses and must be calibrated through route audits/user research; do not claim validation.

## Presets

Presets only initialise editable settings. Wheelchair: steps hard-excluded; gradient/surface/kerb unknown penalised strongly. Limited stamina: rest-gap and gradient weighted strongly. Pushchair: steps strongly avoided; surface moderate. Easy journey: fewer barriers/turns with modest unknown penalty. Presets never imply medical suitability.

## Rest Gap

Project known rest points onto route within a bounded lateral distance. Include only features classified as usable rest points with provenance. Compute start → first, between points and last → destination. If seat coverage is incomplete, label longest value `longest known gap` and separately report unknown coverage. Bus shelters do not count as seats unless seating is explicit.

## Gradient

DEM-derived values are estimates. Smooth/filter sampling to avoid raster stair-step artefacts; record DEM, resolution and method. Do not use Terrain 50 to claim kerb/path compliance. Display `estimated maximum gradient` with coverage.

## Reach

Standard reach uses baseline pedestrian cost. Comfortable reach uses selected profile and network only. Percentage comparison is withheld if either geometry fails validity, network coverage is below configured threshold, or origin snapping is unreliable. Return polygons plus category counts and coverage metrics.

## Confidence

Route confidence is a factor table, not a universal safety score. If a display score is later used, it must be labelled `data confidence`, be decomposable, and never combine suitability with data completeness. V1 displays completeness percentages and known/unknown factors.

## Determinism tests

Same data release + scoring version + request yields identical route ordering and factor outputs. Fixtures must cover known stairs, missing kerb, steep estimate, no seats, duplicate seat, inaccessible entrance, boundary origins and router failure.

