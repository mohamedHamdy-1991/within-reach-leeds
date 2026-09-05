# Design Authority — Reach Control Room

## Direction

An **Operate** interface derived from the user-supplied logistics tracking reference: a dark navigation rail, precise white planning surface, expansive pale map, yellow active controls and crisp route blue. Its character is an accessible civic control room—confident and immediately usable, without copying logistics content. The single product-specific expression remains the **Reach Field**: standard reach as a dashed outline and personal comfortable reach as a solid, translucent yellow field.

## First viewport

Desktop opens as three functional layers: a 184 px charcoal navigation rail, a 390–420 px white journey panel, and a map workspace filling the remainder. Mobile collapses the rail into a compact header and keeps the map above a task sheet. The four actions remain immediately available: `Where can I go?`, `Take me there`, `I need something`, `Find a park`.

## Design principles

- Map first; explanation appears beside the evidence it explains.
- One primary decision per sheet/screen.
- Persistent escape: Back, Close or Start over is always available.
- Text labels accompany icons.
- Confidence is a word plus symbol and source date, never colour alone.
- Rounded geometry is modest: functional controls 10–14 px; no pill-shaped containers except segmented choices/tags.
- Use whitespace and rules instead of nested cards.

## Typography

- Display/navigation: **Atkinson Hyperlegible Next**, 600–700.
- Body/UI: **Atkinson Hyperlegible Next**, 400–700, giving the reference’s compact operational rhythm a distinctive and accessible civic voice.
- Data: **IBM Plex Mono**, 500, only for distances, durations, gradients and source dates.
- Fonts must be self-hosted, subset, licensed and preloaded; system fallbacks must preserve layout.

## Palette

| Token | Hex | Use |
|---|---:|---|
| Ink | `#171717` | navigation rail, primary text |
| Paper | `#F4F5F2` | map ground |
| Signal yellow | `#F4CA28` | active action and personal reach |
| Signal pale | `#FFF4BD` | selected states/reach fill |
| Route blue | `#2387C9` | routes and information |
| Amber | `#8C5200` | caution/partial confidence text |
| Red | `#B42318` | known barrier/error only |
| Rule | `#D9DDD8` | separators and map UI borders |

All text/background pairs must pass WCAG AA; normal text target is 7:1 where practical. Never place white text on Amber. Map hues must remain distinguishable in common colour-vision deficiencies and every map state must also differ by line/pattern/icon.

## Layout

- Mobile: 4-column grid; 16 px margins; compact dark header, map, then task sheet at 44/60/92% states.
- Tablet: 8-column; 24 px margins; 360–420 px side sheet.
- Desktop: 12-column; 32 px margins; 420 px left panel + fluid map; maximum reading column 72 characters.
- Minimum target 44×44 CSS px; preferred primary target 52 px.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64.

## Component grammar

- `ActionTile`: icon, verb-led label, one-line consequence; no marketing copy.
- `PreferenceControl`: semantic radio/checkbox/select, current value always textual.
- `MapLegend`: collapsible, keyboard reachable, mirrors list result.
- `ResultRow`: name, time/distance, match evidence, confidence; entire row is not a hidden click target—use explicit action.
- `ConfidenceBadge`: symbol + label + date/source.
- `RouteOption`: Fastest/Easiest; Greenest is V2. Shows trade-offs before selection.
- `RestGapStrip`: linear journey diagram with distances and explicit unknown intervals.
- `BottomSheet`: drag is optional; buttons and headings provide full keyboard alternative.
- `SafetyNotice`: quiet inline block, not a dismissive modal.

## Motion

One orchestrated motion: when preferences change, the Reach Field contracts/expands over 240 ms and the count summary updates after geometry settles. Under `prefers-reduced-motion`, replace with an immediate state change and a polite live-region message. No parallax, bouncing pins or decorative map movement.

## Responsive behaviour

At ≤767 px, panels are bottom sheets and primary actions stay above browser safe areas. At ≥768 px, results become a side panel. At 200% zoom, two-column content becomes one; no horizontal scrolling except the map itself, and every map task has a list/form alternative.

## Absolute bans

No decorative gradients, glassmorphism, giant slogan hero, emoji as production icons, colour-only confidence, tiny map controls, medical silhouettes, wheelchair symbol as the product logo, copied logistics/truck imagery, or claims that a route is “safe/accessible” when data is incomplete.
