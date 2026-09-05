# Third-Party Data and Assets

This is a pre-implementation register, not a completed attribution statement. The worker must add exact dataset versions, licence URLs, required wording and derivative obligations before activation.

- OpenStreetMap contributors — ODbL 1.0 — routing/map data; visible attribution required.
- Leeds City Council / Data Mill North sources — listed OGL where applicable; verify each resource and use the publisher’s attribution statement.
- Ordnance Survey OpenData — verify current Open Government Licence acknowledgement.
- Atkinson Hyperlegible Next, Source Sans 3 and IBM Plex Mono — obtain from authoritative repositories, pin files, record SIL Open Font License text and hashes.
- MapLibre GL JS, Valhalla and all code dependencies — generate SPDX/CycloneDX SBOM and notices.

## Vendored fonts (Phase 1, 2026-09-05)

Both families obtained from `github.com/google/fonts` (authoritative mirror of the upstream projects), SIL Open Font License 1.1. Full licence texts vendored at `packages/design-system/fonts/OFL.txt` and `IBMPlexMono-OFL.txt` (SHA-256 `aca6a428…` and `7e6b2818…`). Variable-font TTFs kept under `fonts/source/`; Latin-subset woff2 shipped for production (subset via pyftsubset, unicode range U+0020-007E, U+00A0-00FF + common punctuation/arrows).

| File | SHA-256 |
|---|---|
| `AtkinsonHyperlegibleNext[wght].woff2` | `21ec6fc80b0157d45db42bfb51681e62738e8f23e07fb553ea6d103547de9376` |
| `AtkinsonHyperlegibleNext-Italic[wght].woff2` | `ea5f8c0c9519ed5cca4a4c3dc415a090f2faf2047d0c91f41bde29fef08cbe4a` |
| `IBMPlexMono-Regular.woff2` | `8e14e9307cd5648988ae133faee8774609ca3a97e68ca6263ecbfa53ed2c5d9e` |
| `IBMPlexMono-Bold.woff2` | `d30e019a40ae1e4b6b79b6fe1977bad183a44dda217a828528cc65d19dbc0831` |

Source Sans 3 was NOT vendored: DESIGN.md typography specifies only Atkinson Hyperlegible Next + IBM Plex Mono, so the register mention is unused for V1.

Do not use official Safe Places, Changing Places or council marks until their brand/usage permission is verified.

