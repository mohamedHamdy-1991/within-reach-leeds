# Information Architecture

## Routes

| Route | Purpose | Primary action |
|---|---|---|
| `/` | map home + four actions | choose task |
| `/preferences` | journey preferences | save preferences |
| `/reach` | time/profile setup | show my reach |
| `/reach/results` | map + reachable services | view a place |
| `/route` | origin/destination | compare routes |
| `/route/results` | Fastest/Easiest comparison | use/view route |
| `/route/:id` | factor detail + text itinerary | return to comparison |
| `/find` | need categories | find nearest |
| `/places` | filtered list/map | view place |
| `/places/:id` | facility evidence | compare route |
| `/parks` | requirements | show park matches |
| `/parks/:id` | evidence by requested feature | compare route |
| `/confidence` | provenance vocabulary | back |
| `/settings` | preferences, privacy, storage | save/delete local data |
| `/accessibility` | accessibility help/statement | back |
| `/about-data` | sources, dates, licences, limits | inspect source |

## Global navigation

Home, Preferences, About the data, Accessibility, Privacy. Task routes use a visible Back and Start over. Mobile does not use a five-tab app bar; the four home actions are the task launcher.

## State ownership

URL owns origin/destination IDs, active task, time limit, filters and selected result where safe. IndexedDB owns preferences, consent choices and optional recent places. Server owns canonical datasets and generated route result IDs with short TTL. Precise coordinates must not be placed in analytics events or durable URLs.

