-- Phase: PhD OGL published outputs (Module 1 + Module 3).
-- Rights-of-way and access paths with access-type evidence.

CREATE TABLE IF NOT EXISTS wr.paths (
    path_id       bigserial PRIMARY KEY,
    release_id    text NOT NULL REFERENCES wr.releases(release_id),
    external_id   text NOT NULL,
    access_type   text,
    accessible_for text,
    geom          geometry(MultiLineString, 4326) NOT NULL,
    confidence    text NOT NULL CHECK (confidence IN ('verified','mapped','community_verified','inferred','unknown')),
    source_id     text NOT NULL,
    UNIQUE (release_id, external_id)
);
CREATE INDEX IF NOT EXISTS paths_geom_gix ON wr.paths USING gist (geom);
