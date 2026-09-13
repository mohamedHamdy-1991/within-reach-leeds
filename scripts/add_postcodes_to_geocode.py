#!/usr/bin/env python
"""Add postcode entries to the geocode index (from crossings + Changing Places attrs)."""
import asyncio, sys
from pathlib import Path
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

async def main() -> None:
    engine = create_async_engine("postgresql+asyncpg://wr:wr_local_dev_only@127.0.0.1:5432/withinreach")
    async with engine.begin() as conn:
        # Crossings carry Postcode in attrs; index each distinct postcode at its site.
        result = await conn.execute(text(
            """
            INSERT INTO wr.geocode_index (release_id, name, kind, geom)
            SELECT DISTINCT ON (release_id, upper(replace(attrs->>'Postcode', ' ', '')))
                   release_id, upper(replace(attrs->>'Postcode', ' ', '')), 'Postcode', geom
            FROM wr.places
            WHERE attrs->>'Postcode' IS NOT NULL AND attrs->>'Postcode' <> ''
            AND NOT EXISTS (
              SELECT 1 FROM wr.geocode_index g
              WHERE g.release_id = wr.places.release_id AND upper(g.name) = upper(replace(wr.places.attrs->>'Postcode', ' ', ''))
            )
            """
        ))
        n1 = result.rowcount
        result2 = await conn.execute(text(
            """
            INSERT INTO wr.geocode_index (release_id, name, kind, geom)
            SELECT DISTINCT ON (release_id, upper(replace(attrs->>'postcode', ' ', '')))
                   release_id, upper(replace(attrs->>'postcode', ' ', '')), 'Postcode', geom
            FROM wr.places
            WHERE attrs->>'postcode' IS NOT NULL AND attrs->>'postcode' <> ''
            AND NOT EXISTS (
              SELECT 1 FROM wr.geocode_index g
              WHERE g.release_id = wr.places.release_id AND upper(g.name) = upper(replace(wr.places.attrs->>'postcode', ' ', ''))
            )
            """
        ))
        n2 = result2.rowcount
    print(f"postcodes indexed: crossings-style {n1}, changing-places-style {n2}")

asyncio.run(main())
