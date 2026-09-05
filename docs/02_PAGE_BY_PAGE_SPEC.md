# Page-by-Page Specification

Every page needs loading, empty, partial-data, offline, permission-denied and server-error behaviour. Map results require an equivalent list/text representation.

## P01 Home `/`

The map is the permanent landing surface. Desktop shows the charcoal navigation rail and white task column beside it; mobile/tablet shows a full application-height map with the landing controls as a bottom sheet. Top: wordmark, city label, expandable menu and map controls. Search/location row and exactly four actions remain immediately available. Each action replaces the task column or opens a bottom sheet/context window while preserving the map state. First visit opens no blocking tutorial. If location is unknown, map centres on Leeds and the search field explains the next step.

## P02 Preferences `/preferences`

Heading: `How do you like to move?` Optional presets prefill controls but never lock them. Fields: walking/wheeling speed; maximum continuous movement 5/10/20/no preference; preferred rest interval; steps avoid completely/where possible/fine; hills flatter/moderate/no preference; controlled crossings; firm/smooth surface; accessible toilet important; Changing Places required. Show plain-language effect under each. Actions: Save preferences; Reset. No health question.

## P03 My Reach setup `/reach`

Origin chooser, 5/10/15/20/30 segmented control, current preference summary, `Show my reach`. Provide example when no origin. Disable only with a reason and link to correction.

## P04 Reach results `/reach/results`

Map contains standard and comfortable contours and origin. Header names time and place. Summary may say `Your comfortable reach covers 73% of the standard network area` only when both geometries pass coverage checks. Categories: Essentials, Community, Wellbeing, Support. Each count links to filtered list. Show unknown-network hatch and a `How this was calculated` disclosure. Controls: time, preferences, list/map.

## P05 Route setup `/route`

Origin/destination with swap, recent places only if local history enabled, current preference summary, `Compare routes`. Autocomplete is keyboard accessible and announces result count.

## P06 Route comparison `/route/results`

Two options only in V1: Fastest and Easiest. Each shows time, distance and the factors that matter. Never show a single unexplained score as the decision. Default visual emphasis may favour Easiest but cannot preselect it. Map line styles and text labels distinguish routes. `Compare all factors` opens a table.

## P07 Route detail `/route/:id`

Ordered text itinerary, overview map, route factors, Rest Gap strip, nearby relevant toilets/services and confidence section. Safety text: conditions can change; check the route and surroundings. No Start navigation button; use `View route`/`Print` only if implemented in scope.

## P08 Find need `/find`

Large labelled category controls: Seat, Toilet, Accessible toilet, Changing Places, Safe Place, Pharmacy, Community hub, Other services. The permanent stress path uses one tap from home, then shows nearest known results. “Nearest” means by route cost when routing works, not straight-line distance.

## P09 Place results `/places`

List first for assistive tech; optional map. Rows show name, travel time, facility evidence and confidence/date. Filters never hide all results without an explanatory empty state and clear-all action.

## P10 Place detail `/places/:id`

Name/address, category, reported facilities, source/provenance, last checked/retrieved, unknown fields, contact/opening link where sourced, `Compare route`. Do not reproduce copyrighted descriptions beyond licence.

## P11 ParkMatch `/parks`

Filters: flat/gentle known paths, regular benches, accessible toilet, Changing Places, accessible parking, café, play, quiet area, short route evidence, mobility-scooter evidence. Results use `Known match`, `Known mismatch`, `Unknown`; rank after hard exclusions. Never infer whole-park accessibility from an entrance or one path.

## P12 Park detail `/parks/:id`

Evidence matrix by requested feature, access points, main-path caveats, relevant toilets/seats and source dates. Map and list of known entrances. `Compare route` uses an evidence-backed entrance, otherwise asks the user to choose and labels uncertainty.

## P13 Confidence `/confidence`

Define Verified, Mapped, Community verified (reserved for V2), Inferred and Unknown. Explain that source authority, freshness, completeness and field specificity are separate. Link each source register entry.

## P14 Settings `/settings`

Edit preferences; location permission status with browser instructions; local recent places toggle off by default; analytics toggle off/default absent; delete local data; high-contrast and Easy Read hooks only when truly implemented. No fake toggles.

## P15 About data, privacy and accessibility

Source list, licences, refresh dates, known limitations, privacy notice, accessibility statement, contact placeholders clearly marked `AUTHOR_DECISION_REQUIRED` until supplied. These pages must be reachable without opening the map.
