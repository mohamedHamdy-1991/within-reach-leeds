# Phase 3 Unresolved
1. leeds_prow quarantined (stale): needs Leeds City Council to publish a fresh PRW extract, or a documented freshness-policy exception — AUTHOR_DECISION_REQUIRED before PRW enters any release.
2. leeds_crossings / leeds_safe_places / leeds_changing_places: landing pages hold zips but freshness/licence verification per resource still needed; register marks them quarantined_pending_*.
3. Legacy public toilets remain prohibited_as_current (never acquired, by design).
4. Deep CRS/geometry validation (GeoPandas/pyproj) + DuckDB QA lands with the PostGIS publish step in Phase 4.
5. DEM (OS Terrain 50) download requires OS DataHub account selection step — deferred to Phase 4 gradient work; register marks it inferred-only.
