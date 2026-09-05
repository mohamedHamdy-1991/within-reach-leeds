# Risk Register

| Risk | Severity | Control / stop condition |
|---|---:|---|
| missing access data presented as accessible | critical | unknown-by-default model; A06 |
| stale council datasets | high | freshness gates/quarantine; source date in UI |
| routing through known steps | critical | hard exclusion and fixture A05 |
| coarse DEM overclaims path slope | high | `inferred` label; never compliance claim |
| basemap/offline licence violation | high | self-hosted/permitted PMTiles; attribution review |
| precise location leakage | critical | no location logs/analytics; A13 |
| map-only inaccessible interaction | high | list/text parity; manual AT tests |
| false council/clinical endorsement | high | explicit copy guard and asset permissions |
| external SSD disconnect/corruption | high | fail-closed mount check, git remote, backups |
| Valhalla custom-cost mismatch | high | separate decomposable scorer, golden routes |
| source conflation hides conflicts | high | field-level lineage and retained alternatives |
| scope explosion | high | seven-feature lock; V2/V3 excluded |
| geocoder abuse/cost | medium | proxy, bounds, rate limits, caching without locations |
| performance on older phones | medium | bundle/map budgets and representative device test |

