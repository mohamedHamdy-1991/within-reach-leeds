# Static experience shell

This is a dependency-free, host-anywhere implementation base. It uses semantic HTML, CSS and small vanilla JavaScript so it can be reviewed before the React migration. It loads `/api/v1/meta` when available and otherwise displays `data/leeds.json`, derived from the existing source register. Preview geometry is explicitly illustrative.

## Run

From the external project root:

```sh
./scripts/check_external_volume.sh
cd apps/web
python3 -m http.server 4173
```

Open `http://localhost:4173`. Do not open `index.html` directly because service workers and local JSON fetches require HTTP.

## Host

Upload the contents of `apps/web` to any static host. Configure unknown routes to return `index.html` only after real client-side routing is added. HTTPS is required for geolocation and PWA installation outside localhost.

## Migration rule

When migrating to React/Vite, preserve the DOM semantics, visual states, copy, local-only preference/location posture, source-register fallback and map/text parity. Do not replace this with a marketing hero.

