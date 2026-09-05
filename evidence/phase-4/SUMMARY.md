# Phase 4 Summary
**Status: PASS** on the Phase 4 gates (A02 partial: bootstrap respects volume after colima fix; A05/A06 implemented at contract level and enforced in tests; A14 PASS incl. live services).

- **Storage infrastructure fix (recorded as FIXED):** Docker was colima, whose VM did not share the exFAT SSD. Colima config now mounts `/Volumes/Mo.Hamdy` (writable) — all container data stays on the SSD. Verified by probe writes.
- **PostGIS 16-3.4** (digest-pinned) runs with volume under `.runtime/postgres`; initial migration creates releases/places/geocode_index/scoring_versions with PostGIS + trgm indexes.
- **Valhalla** (digest-pinned `a7d0d02e…`) built admin DB + 77 MB pedestrian tiles from the released OSM West Yorkshire extract (BUILD_OK, 20 s) and serves /isochrone + /route on :8002. Live isochrone verified for Leeds centre.
- **1,335 real places** imported from the checksum-verified release into PostGIS (essentials 172, community 189, wellbeing 828, support 146) with provenance columns; geocode index populated.
- **API**: /healthz, /api/v1/meta, /api/v1/places (provenance + distance), /api/v1/geocode (bounded to release index), /api/v1/route (Valhalla alternatives + scoring version + safety copy), /api/v1/reach (Valhalla isochrone + standard-reach labelling). A14: pydantic schema validation, city-bounds rejection (422), rate limiting (429), oversized/undersized route rejection (422), router-unavailable returns 503 and explicitly does NOT fabricate results.
- **Tests**: 12/12 with live services (WR_LIVE_SERVICES=1); 17/17 offline across pipelines+services (fakes for DB/router).
