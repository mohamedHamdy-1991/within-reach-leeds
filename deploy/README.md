# Cloud backend (free) — makes the GitHub Pages site fully functional

A single free **Hugging Face Space** container runs the same API + the same
pinned Valhalla router as the Mac, with the validated 12,507-place dataset
baked in. Parity was proven locally: multi-ring isochrones, routing,
postcode search and place lookup all identical (see DECISIONS_AND_ASSUMPTIONS.md).

## One-time setup (Mohamed, ~3 minutes)
1. Go to huggingface.co → **Sign in with GitHub**.
2. New **Space** → name it `within-reach-api` → SDK: **Docker** → Public → Create.
3. Files tab → **Add file → Upload files** → drag in the CONTENTS of
   `deploy/space/` (Dockerfile, README.md, start.sh, api/, valhalla/)
   — or the provided `within-reach-api-space.zip` extracted.
   The Space builds (~2 min) and turns green.
4. The API is then at: `https://<your-HF-username>-within-reach-api.hf.space`
   (check it: add `/healthz`).
5. Tell ZCode the Space URL — the Pages frontend is rebuilt pointed at it
   and the hosted site gains live reach rings, search and routes.

## Refreshing the data
Re-run the bundle export + local container test, then upload the changed
files to the Space. Data honesty rules are identical to the local stack.
