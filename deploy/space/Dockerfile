# WITHIN REACH — hosted API + router (single container, free tier)
# Parity with the Mac stack: same FastAPI app, same pinned Valhalla,
# same validated data (as an in-memory bundle instead of Postgres).
# ------------------------------------------------------------------
FROM ghcr.io/valhalla/valhalla@sha256:a7d0d02ed5ce4f2817105b443eb58494a5757fc6b48780a39c9cc62740296432

RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 python3-pip \
 && rm -rf /var/lib/apt/lists/* \
 && pip3 install --no-cache-dir --break-system-packages "fastapi>=0.115" "uvicorn[standard]>=0.32" "httpx>=0.27" "pydantic>=2"

WORKDIR /app
COPY api/app /app/app
COPY api/deploy_static /app/deploy_static
COPY api/places-bundle.json.gz /app/api/places-bundle.json.gz
COPY valhalla/config.json /custom_files/config.json
COPY valhalla/valhalla-tiles /custom_files/valhalla-tiles

ENV DATA_BACKEND=json \
    PLACES_BUNDLE=/app/api/places-bundle.json.gz \
    VALHALLA_URL=http://127.0.0.1:8002 \
    PORT=7860

EXPOSE 7860
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh
CMD ["/app/start.sh"]
