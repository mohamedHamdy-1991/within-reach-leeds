# Data Governance and Licensing

## Provenance model

Confidence is field-level, not record-level. `verified` means a current authoritative source explicitly states that field. `mapped` means sourced from OSM or comparable mapping. `community_verified` is reserved until V2 moderation exists. `inferred` is calculated/estimated. `unknown` is absence or unresolved conflict.

Freshness, authority, completeness and precision must be displayed separately. A seven-year-old council record may have authority but poor freshness. Conflicts retain both values and a resolution note.

## Raw-data controls

- Store downloads immutably under `data/raw/<source>/<retrieved_at>/`.
- Record SHA-256 before extraction; never edit raw files.
- Reject path traversal, unexpected archive size/count, wrong MIME, CRS ambiguity and coordinates outside expected bounds.
- Generate a machine-readable data manifest and a release manifest.
- Quarantined sources never enter user-facing queries.

## Licensing

Maintain `THIRD_PARTY_DATA.md` and on-map attribution. OSM-derived databases require ODbL review, attribution and analysis of whether distributed derivatives trigger share-alike. OGL/OS acknowledgements must follow exact source wording. Do not copy third-party logos or Safe Places/Changing Places marks without permission. Do not publish an open-source licence for the repository until the author selects it.

## Retention

Keep immutable releases needed to reproduce published results; define retention before production. Remove transient downloads/caches only through a manifest-backed cleanup command that refuses targets outside this project. No user precise-location retention in V1.

