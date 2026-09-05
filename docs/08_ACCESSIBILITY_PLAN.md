# Accessibility Plan

Target [WCAG 2.2 AA](https://www.w3.org/TR/WCAG22/) plus product-specific cognitive and mobility needs.

## Implementation requirements

- Semantic landmarks/headings; skip link; logical focus order; route-change focus management.
- All controls keyboard usable; no drag-only bottom sheet/map actions.
- Autocomplete follows ARIA combobox pattern and announces results.
- Map has accessible name, but essential content is duplicated as structured lists/tables.
- Visible focus ≥2 CSS px equivalent and not obscured; 44×44 px targets minimum.
- Text reflows at 320 CSS px and 200%; no clipped sheets or fixed-height text areas.
- Contrast AA; confidence/barriers use text, icon and pattern, not colour alone.
- Status updates use restrained live regions; errors use summary plus field association.
- Reduced motion; no auto-panning that steals context; user can stop map animation.
- Plain English, sentence case and consistent action names.
- Touch, switch, screen reader, voice control and high-contrast compatibility.
- Print route is text-led and does not require map colour.

## Test matrix

Automated: axe, eslint-jsx-a11y, semantic unit tests, Playwright keyboard/zoom/reduced-motion. Manual: VoiceOver Safari/iOS, NVDA Firefox/Windows, keyboard-only Chrome, 200%/400% zoom, Windows High Contrast, colour-vision simulation, sunlight/low-connectivity field check. Test with disabled and older participants; automated PASS is insufficient.

## Exit rule

No critical/serious axe failures; every V1 task completes without map, pointer or permission; manual issues logged with severity/owner. Publish an accessibility statement only after testing, with known limitations and contact supplied by author.

