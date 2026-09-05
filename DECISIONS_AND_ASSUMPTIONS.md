# Decisions and Assumptions

## Locked

- Product name: WITHIN REACH — Leeds.
- V1 is a responsive web PWA, not native applications.
- No account and no runtime AI.
- Preferences are functional journey settings, not health data, and default to device-only storage.
- Deterministic route scoring wraps/extends a routing engine; it does not invent a routing engine from scratch.
- All heavy development and data storage remains on `/Volumes/Mo.Hamdy`.
- Visual direction is the **Leeds wayfinding field** described in `DESIGN.md`: quiet civic precision with one signature personalised reach contour.

## Inferred from the brief; validate through usability research

- The primary first-run task is “Where can I go?” from current location or a typed place/postcode.
- Mobile portrait is the dominant viewport; desktop supports planning and comparison.
- English is V1, but layout and data structures must be localisation-ready.
- No council co-brand or official endorsement exists.
- Public launch uses self-hosted/permitted vector tiles rather than community tile services.

## Author-owned before public launch

- Legal entity/name, contact email, privacy-controller identity and registered address.
- Repository licence choice for original code.
- Production host, domain, budget and monitoring destination.
- Whether public analytics are enabled; default is off.
- Approval of public safety/legal wording after specialist review.

## Decision log format

Append only: `YYYY-MM-DD | ID | decision | evidence | files affected | reversible?`.

