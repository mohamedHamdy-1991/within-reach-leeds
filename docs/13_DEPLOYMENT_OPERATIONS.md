# Deployment and Operations

## Deployment shape

Static PWA on Cloudflare Pages or equivalent; API/PostGIS/Valhalla on a UK/EU-capable container platform selected by author. PMTiles/object storage with CDN and correct CORS/range requests. Production vendor choice remains replaceable and `AUTHOR_DECISION_REQUIRED`.

## CI gates

Lint/type/unit → contracts → data fixtures → integration → production build → E2E/a11y → security/SBOM → artifact manifest. Pull requests cannot deploy production. Staging deploy uses synthetic fixtures until a licensed data release is active.

## Release

Semantic application version + immutable data release + scoring version. Database migrations use expand/migrate/contract. Activate data by pointer/transaction; retain prior release for rollback. Publish changelog, attribution and known-data limitations.

## Observability

Health, latency/error/rate-limit metrics, pipeline freshness/schema failures, router queue/timeout, data release ID. No precise coordinates, full addresses or preference combinations in telemetry. Alert destinations require author configuration.

## Recovery

Nightly encrypted database backup, weekly restore test during pilot, versioned object data, documented RPO/RTO after host selection. Runbook covers router unavailable, geocoder unavailable, bad data release, expired certificate and privacy incident.

