1. Rest Gap UI strip against real route geometry requires path progress/geometry from Valhalla trace_attributes + seat projection — designed (pure function ready), wiring deferred with the DEM/factor extraction pass.
2. Easiest route costing currently equals pedestrian defaults; true easiest profile needs step_limit/use_walkway costing options once per-edge step data is validated (register gap: no kerb/steps source for Leeds yet).
3. Place detail pages (/places/:id, /parks/:id) render evidence via /find & /parks rows in this build; dedicated detail routes remain from the page spec (P10/P12).
4. Accessible toilet / Changing Places needs dedicated sources (register: quarantined_pending_current_validation) — cannot be shown yet by design.
