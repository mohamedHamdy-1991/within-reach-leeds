-- WITHIN REACH initial spatial schema (Phase 4).
-- City-agnostic: Leeds lives in config/, never in DDL beyond the data itself.

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE SCHEMA IF NOT EXISTS wr;

-- Versioned data releases (immutable, activated by id).
CREATE TABLE IF NOT EXISTS wr.releases (
    release_id   text PRIMARY KEY,
    activated_at timestamptz,
    manifest     jsonb NOT NULL,
    created_at   timestamptz NOT NULL DEFAULT now()
);

-- Places loaded from a validated release; provenance is mandatory.
CREATE TABLE IF NOT EXISTS wr.places (
    place_id     bigserial PRIMARY KEY,
    release_id   text NOT NULL REFERENCES wr.releases(release_id),
    external_id  text NOT NULL,
    name         text NOT NULL,
    category     text NOT NULL,
    kind         text NOT NULL,
    geom         geometry(Point, 4326) NOT NULL,
    confidence   text NOT NULL CHECK (confidence IN ('verified','mapped','community_verified','inferred','unknown')),
    source_id    text NOT NULL,
    retrieved_at text NOT NULL,
    attrs        jsonb NOT NULL DEFAULT '{}'::jsonb,
    UNIQUE (release_id, external_id)
);
CREATE INDEX IF NOT EXISTS places_geom_gix ON wr.places USING gist (geom);
CREATE INDEX IF NOT EXISTS places_category_idx ON wr.places (category);
CREATE INDEX IF NOT EXISTS places_name_trgm ON wr.places USING gin (name gin_trgm_ops);

-- Bounded geocoding table: only named features inside the configured city bbox.
CREATE TABLE IF NOT EXISTS wr.geocode_index (
    geocode_id bigserial PRIMARY KEY,
    release_id text NOT NULL REFERENCES wr.releases(release_id),
    name       text NOT NULL,
    kind       text NOT NULL,
    geom       geometry(Point, 4326) NOT NULL
);
CREATE INDEX IF NOT EXISTS geocode_name_trgm ON wr.geocode_index USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS geocode_geom_gix ON wr.geocode_index USING gist (geom);

-- Scoring version registry (weights live in versioned config, never UI code).
CREATE TABLE IF NOT EXISTS wr.scoring_versions (
    scoring_version text PRIMARY KEY,
    weights         jsonb NOT NULL,
    created_at      timestamptz NOT NULL DEFAULT now()
);
