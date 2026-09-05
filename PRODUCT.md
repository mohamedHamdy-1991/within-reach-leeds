# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated from the supplied brief: React + TypeScript + Vite PWA; MapLibre GL JS; FastAPI; PostgreSQL/PostGIS; Valhalla; Python geospatial pipeline; pnpm monorepo. Deployment adapters must remain replaceable.

## Users

Primary users are Leeds residents and visitors planning short everyday journeys whose needs are poorly represented by average walking times: older people, wheelchair or mobility-scooter users, people using walking aids, parents with pushchairs, people with limited stamina, and anyone preferring easier routes. Secondary users are relatives/carers planning a route with someone, and later—not V1—researchers and local decision-makers.

## Product Purpose

Show what a person can comfortably reach, provide transparent route choices, expose rest/facility gaps, and make uncertainty visible. Success is a user finding a suitable destination or route without needing an account and understanding what is known versus unknown.

## Positioning

Conventional catchments ask what an average pedestrian can reach. WITHIN REACH calculates a different network catchment and route cost from each person’s non-medical journey preferences. Its intellectual core is: **20 minutes is not the same for everyone.**

## Operating Context

Mobile-first use outdoors and at home; intermittent connectivity; one-handed operation; bright sunlight; stress or fatigue; assistive technology; printable/shareable planning later. V1 is a Leeds implementation of a city-configurable open-source product.

## Capabilities and Constraints

V1 is limited to seven capabilities: My Reach, EasyRoute, Rest Gap, Toilets, Services, ParkMatch and Data Confidence. All computation is deterministic; no runtime AI. Preferences are stored locally. The service must expose source dates, confidence and unknowns. V1 is planning, not turn-by-turn navigation and not a guarantee of physical accessibility.

## Brand Commitments

Name: `WITHIN REACH — Leeds`. Public proposition: `20 minutes isn’t the same for everyone.` Voice: calm, direct, dignified, non-medical, plain English. Ask “How do you like to move?” rather than asking about disability. Never describe the product as a disability app.

## Evidence on Hand

The source concept is condensed without changing its V1 decisions at `evidence/SOURCE_BRIEF_SUMMARY.md`; the original remains in the user-supplied attachment. Official sources are registered in `docs/05_DATA_SOURCE_REGISTER.md`. No user research, council partnership, clinical endorsement or production SLA has yet been demonstrated; the application must not imply any of these.

## Product Principles

1. Personalise the journey, not the person’s identity.
2. Unknown never means accessible.
3. Four primary actions, progressive disclosure elsewhere.
4. Show why a route was recommended.
5. Leeds is a configuration; the method is portable.

## Accessibility & Inclusion

WCAG 2.2 AA minimum, with keyboard operation, screen-reader semantics, visible focus, 200% text resize, no colour-only meaning, large targets, reduced motion, high-contrast compatibility, plain language and a non-map equivalent for every essential result.
