# Phase 3 Summary
**Status: PASS.** Pipeline foundation implemented and proven on real data:
- Immutable raw store with per-version retrieval metadata; size-capped, checksummed, overwrite-refusing downloads (8/8 unit tests).
- Validation gates: OSM PBF structure, GeoJSON parse/CRS/bbox vs Leeds bounds, data-age freshness, licence admissibility.
- Quarantine (fail-closed, machine-readable reason) and immutable, checksum-verified versioned releases.
- Real run: OSM West Yorkshire 51.6 MB extract → all gates PASS → candidate release published (publisher md5 cross-verified). The run also caught and fixed a real validator bug.
- Real run: Leeds PRW Rec_Routes.zip → QUARANTINED for data age (533 days > 365-day policy), matching its register stale-warning status. Stale official data demonstrably cannot reach a release (A11).
- Honest limitation: only the OSM source reaches a candidate release; all council layers remain quarantined/pending until fresh copies exist. Activation requires the Phase 4 QA gates.
