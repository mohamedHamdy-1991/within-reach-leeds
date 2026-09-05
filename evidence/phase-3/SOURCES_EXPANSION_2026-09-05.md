# Source expansion: existing Data Mill North + PhD OGL outputs (2026-09-05)

**Author decision D-SRC-01 (Mohamed, 2026-09-05): "use the existing data for now for Data Mill North"** + use his PhD-published GIS outputs. Recorded here and in DECISIONS_AND_ASSUMPTIONS.md.

## 1. Data Mill North — release `dmn-accepted-stale-2026-09-05` (ACCEPTED-STALE)
| Source | Records | Loaded as | Notes |
|---|---|---|---|
| Pedestrian crossing points (ep6gz) | 666 sites | kind=Crossing, confidence=verified, retrieved_at="2019-02 (stale, accepted)" | GeoJSON w/ ward + installation type |
| Safe Places Feb 2019 (23yj3) | 201 | kind=Safe Place, support | CSV cp1252; lat/lon present |
| Changing Places Feb 2019 (24z8n) | 27 of 33 | kind=Changing Places toilet, essentials | 6 rows had invalid easting/northing (honestly skipped) |

Freshness gate overridden ONLY by the recorded author decision; every loaded place carries `accepted_stale: true` + publisher dataset date, surfaced through the API (`retrieved_at`) so the app shows the age.

## 2. PhD OGL published outputs — release `phd-ogl-2026-09-05-candidate`
Located via the ArcGIS map dump in OneDrive (`Desktop/GIS_Map_Dump.txt` → `Work/Ph.D/Publications/green/DSP_AWS_Published_Outputs_OGL`), hydrated and copied into `data/raw/phd_green_outputs/2026-09-05` (Module1.gdb 2.3 GB, Module3.gdb 1.3 GB + publishing metadata):

| Layer | Records (Leeds clip) | Destination |
|---|---|---|
| Accessible_GI_OGL (polygons, EPSG:27700) | 1,882 sites | places kind=Green space (centroid) |
| Access_Points_OGL (points) | 8,396 entrances | places kind=Green space entrance, attrs access_type/accessible_for |
| PRoW_Network_OGL (lines) | 6,478 segments | new `wr.paths` table (migration 002) with access-type evidence |

Licence: OGL-UK-3.0 (author-published `_OGL` outputs). Integrity: 2D-forced geometries; per-layer counts in `phd_green_load_report.json`. Honest labels: PRoW `Accessible_for` = Pedestrian/Horse/Cycle classes — NOT wheelchair suitability; never rendered as such.

## 3. Live totals after expansion
11,922 places across 3 releases (wellbeing 11,106 / support 1,013 / essentials 199 / community 189). API `dataReleaseId` now lists all three. Verified live near Park Square: crossing 10 m, Changing Places 80 m, Safe Place 79 m, green space 42 m.

## Known follow-ups
- Green-space polygons carry generated names ("Green space (x ha)") — join OS Open Greenspace names next pass.
- Entrances are separate rows; per-park entrance listing (spatial join) is the next UI step.
- PRoW network ready for route evidence (flat/gentle known paths) once DEM gradient lands.
