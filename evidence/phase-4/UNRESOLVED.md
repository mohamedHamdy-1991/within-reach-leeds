1. A05 full proof (known steps never in hard step-avoid routes) needs DEM gradient factors + factor extraction from Valhalla responses — Phase 5 with the routing feature work; hard exclusion is already supported via Valhalla service_limits allow_hard_exclusions config.
2. Route factors (steps/surface/kerb) still come from OSM tags only; kerb data has no Leeds source yet — register gap, AUTHOR visibility at Phase 5 UI.
3. Postgres password in .env is a local dev placeholder; production secrets are author-owned (stop condition before any deployment).
4. pyosmium import relies on a suffixed symlink to the release payload (documented in script).
