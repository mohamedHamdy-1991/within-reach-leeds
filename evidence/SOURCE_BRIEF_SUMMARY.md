# Source Brief Summary

The supplied concept combines a personalised 20-minute-neighbourhood map and easier/rest-aware routing under the name **WITHIN REACH — Leeds** and proposition **20 minutes isn’t the same for everyone**.

The differentiator is the contrast between an average pedestrian’s network catchment and a person’s comfortable reach based on editable, non-medical preferences: speed, continuous movement time, rest spacing, steps, hills, crossings, surface and toilets. Key V1 outputs are a standard/personal reach comparison, Fastest versus Easiest route, longest known rest gap, relevant toilets/services, park requirement matching and visible data confidence.

The wider concept includes V2 community verification, park loops, journey confidence, public transport, simpler/family/shared journeys, Easy Read and offline areas; and V3 accessibility-gap/intervention analytics. These are intentionally excluded from V1.

The brief recommends React/TypeScript/MapLibre PWA, FastAPI/PostGIS, Valhalla and a Python geospatial pipeline, with Leeds implemented through city configuration so other cities can fork the method. It explicitly rejects runtime AI, accounts and medical data, and requires WCAG 2.2 AA plus deterministic scoring and transparent unknown data.

This summary is subordinate to `PRODUCT.md`, `AGENTS.md` and the detailed implementation documents. It contains no endorsement or validation claim.

