# Data Source Register

Live verification is mandatory before download. “Candidate” means technically relevant, not approved for publication.

| ID | Candidate source | Purpose | Licence/status | V1 decision |
|---|---|---|---|---|
| OSM | [OpenStreetMap/Geofabrik extract](https://download.geofabrik.de/europe/united-kingdom/england/yorkshire-and-the-humber.html) | streets, paths, steps, seats, surfaces, toilets | ODbL; attribution/share-alike obligations | use; preserve OSM IDs/timestamps |
| LCC-PROW | [Leeds Public Rights of Way](https://datamillnorth.org/dataset/leeds-public-rights-of-way-e5l9w) | definitive/claimed paths, furniture | OGL; old snapshot; not legal Definitive Map | overlay with strong date/accuracy warning |
| LCC-XING | [Pedestrian crossing points](https://datamillnorth.org/dataset/pedestrian-crossing-points-ep6gz) | signalled crossings | OGL; last-listed data old | candidate; freshness gate |
| LCC-SAFE | [Safe Places](https://datamillnorth.org/dataset/safe-places-23yj3) | help locations | OGL listing, 2019-era data | quarantine until current scheme validation |
| LCC-CP | [Changing Places toilets](https://datamillnorth.org/dataset/changing-places-toilets-in-leeds-24z8n) | facility category | OGL listing, old data | reconcile with current official facility source |
| LCC-WC | [Public toilets](https://datamillnorth.org/dataset/public-toilets-vq6yn) | toilets | explicitly no longer updated | do not publish as current; evidence only |
| OS-GS | [OS Open Greenspace](https://osdatahub.os.uk/data/downloads/open/OpenGreenspace) | parks and access points | OS OpenData/OGL terms | use after attribution check |
| OS-T50 | [OS Terrain 50](https://osdatahub.os.uk/data/downloads/open/Terrain50) | broad gradient estimate | OS OpenData/OGL; 50 m resolution | use as inferred approximation only |
| NHS-ODS | [NHS Organisation Data Service APIs](https://digital.nhs.uk/services/organisation-data-service/apis-for-the-organisation-data-service) | GP/pharmacy organisation data | verify endpoint/terms/fields | candidate |
| LEEDS-DIR | [Leeds Directory](https://www.leedsdirectory.org/) | wellbeing/community services | API and reuse terms require live confirmation | blocked until documented API terms/schema |
| OSM-TILES | [OSMF tile policy](https://operations.osmfoundation.org/policies/tiles/) | basemap display | community service forbids bulk/offline use | never use for production/offline package |

## Required manifest fields

`source_id`, title, landing URL, download URL, publisher, licence URL/version, required attribution, retrieved UTC, upstream modified date, HTTP validators, byte size, SHA-256, CRS, spatial extent, row/feature count, schema version, contact, refresh cadence, freshness threshold, privacy class, QA status and quarantine reason.

## Publication rule

A dataset becomes active only when acquisition is reproducible, licence/attribution is clear, schema passes, coordinates are within Leeds bounds, duplicate/null/error thresholds pass, freshness is acceptable for its claim, and a human-readable source note exists. Old authoritative data is not “Verified” merely because government published it.

