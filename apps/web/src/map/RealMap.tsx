import maplibregl from "maplibre-gl";
import type { Feature, FeatureCollection } from "geojson";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import { useMapController } from "../state/map";

export type PopupTarget = {
  longitude: number;
  latitude: number;
  title: string;
  lines: string[];
};

/**
 * Full-screen real map (MapLibre GL JS + OpenStreetMap raster tiles).
 * Dev/testing uses public OSM tiles; production swaps to permitted PMTiles
 * with the same attribution (AGENTS.md build rule).
 *
 * All overlays (reach rings, personal ring, places, routes, origin) are
 * GeoJSON sources that scale and pan with the map.
 */
export function RealMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const ctl = useMapController();

  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors · routing by Valhalla",
          },
        },
        layers: [{ id: "osm", type: "raster", source: "osm" }],
      },
      center: [-1.5491, 53.8008],
      zoom: 12.5,
      attributionControl: false,
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }));

    map.on("load", () => {
      // Reach rings (standard 5–30 minute set).
      map.addSource("rings", { type: "geojson", data: emptyFC() });
      map.addLayer({
        id: "rings-fill", type: "fill", source: "rings",
        paint: {
          "fill-color": "#F4CA28",
          "fill-opacity": ["coalesce", ["get", "opacity"], 0.06],
        },
      });
      map.addLayer({
        id: "rings-line", type: "line", source: "rings",
        paint: {
          "line-color": "#8a6d00",
          "line-width": ["case", ["get", "selected"], 4, 1.5],
          "line-dasharray": [3, 2],
        },
        layout: { "line-join": "round" },
      });

      // Personal comfortable reach.
      map.addSource("personal", { type: "geojson", data: emptyFC() });
      map.addLayer({
        id: "personal-fill", type: "fill", source: "personal",
        paint: { "fill-color": "#F4CA28", "fill-opacity": 0.42 },
      });
      map.addLayer({
        id: "personal-line", type: "line", source: "personal",
        paint: { "line-color": "#B8860B", "line-width": 5 },
      });

      // Places.
      map.addSource("places", { type: "geojson", data: emptyFC() });
      map.addLayer({
        id: "places-halo", type: "circle", source: "places",
        paint: {
          "circle-radius": ["case", ["get", "selected"], 16, 11],
          "circle-color": "#ffffff",
          "circle-opacity": 0.55,
        },
      });
      map.addLayer({
        id: "places-dot", type: "circle", source: "places",
        paint: {
          "circle-radius": ["case", ["get", "selected"], 9, 6.5],
          "circle-color": ["get", "color"],
          "circle-stroke-width": 2.5,
          "circle-stroke-color": "#ffffff",
        },
      });

      // Routes.
      map.addSource("routes", { type: "geojson", data: emptyFC() });
      map.addLayer({
        id: "route-casing", type: "line", source: "routes",
        paint: { "line-color": "#ffffff", "line-width": ["+", ["get", "width"], 3] },
        layout: { "line-join": "round", "line-cap": "round" },
      });
      map.addLayer({
        id: "route-line", type: "line", source: "routes",
        paint: {
          "line-color": ["get", "color"],
          "line-width": ["get", "width"],
          "line-dasharray": ["case", ["get", "dashed"], ["literal", [2, 2]], ["literal", [1, 0]]],
        },
        layout: { "line-join": "round", "line-cap": "round" },
      });

      map.on("click", "places-dot", (event) => {
        const feature = event.features?.[0];
        if (!feature) return;
        const props = feature.properties as { title?: string; l1?: string; l2?: string; l3?: string; lng?: number; lat?: number };
        if (props.lng == null || props.lat == null) return;
        showPopup({ longitude: props.lng, latitude: props.lat, title: props.title ?? "", lines: [props.l1, props.l2, props.l3].filter(Boolean) as string[] });
      });
      map.on("mouseenter", "places-dot", () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "places-dot", () => { map.getCanvas().style.cursor = ""; });

      ctl.markReady();
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Overlay sync effects.
  useEffect(() => { setSource("rings", { type: "FeatureCollection", features: ctl.rings }); }, [ctl.rings]);
  useEffect(() => {
    setSource("personal", { type: "FeatureCollection", features: ctl.personalRing });
    if (ctl.personalRing.length > 0) fitBounds(ctl.personalRing);
  }, [ctl.personalRing]);
  useEffect(() => { setSource("places", { type: "FeatureCollection", features: ctl.places }); }, [ctl.places]);
  useEffect(() => { setSource("routes", { type: "FeatureCollection", features: ctl.routes }); }, [ctl.routes]);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ctl.ready) return;
    if (ctl.origin) {
      map.flyTo({ center: ctl.origin, zoom: Math.max(map.getZoom(), 13), duration: 900 });
    }
  }, [ctl.origin, ctl.ready]);

  useEffect(() => {
    if (ctl.selectedPopup) showPopup(ctl.selectedPopup);
    else popupRef.current?.remove();
  }, [ctl.selectedPopup]);

  function showPopup(target: PopupTarget) {
    const map = mapRef.current;
    if (!map) return;
    popupRef.current?.remove();
    const html = `<div class="wr-popup"><strong>${escapeHtml(target.title)}</strong>${target.lines
      .map((line) => `<span>${escapeHtml(line)}</span>`)
      .join("")}<em>Planning data — not a guarantee</em></div>`;
    popupRef.current = new maplibregl.Popup({ offset: 18, maxWidth: "280px" })
      .setLngLat([target.longitude, target.latitude])
      .setHTML(html)
      .addTo(map);
  }

  function setSource(id: string, data: FeatureCollection) {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    (map.getSource(id) as maplibregl.GeoJSONSource | undefined)?.setData(data);
  }

  function fitBounds(features: Feature[]) {
    const map = mapRef.current;
    if (!map) return;
    const bounds = new maplibregl.LngLatBounds();
    let any = false;
    for (const feature of features) {
      const geom = feature.geometry;
      const add = (lng: number, lat: number) => { bounds.extend([lng, lat]); any = true; };
      if (geom.type === "Polygon") {
        for (const ring of geom.coordinates as number[][][]) for (const pair of ring) if (typeof pair[0] === "number" && typeof pair[1] === "number") add(pair[0], pair[1]);
      } else if (geom.type === "MultiPolygon") {
        for (const poly of geom.coordinates as number[][][][]) for (const ring of poly) for (const pair of ring) if (typeof pair[0] === "number" && typeof pair[1] === "number") add(pair[0], pair[1]);
      }
    }
    if (any) map.fitBounds(bounds, { padding: 90, duration: 900 });
  }

  return <div ref={containerRef} className="real-map" aria-hidden="true" />;
}

function emptyFC(): FeatureCollection {
  return { type: "FeatureCollection", features: [] };
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch] ?? ch));
}
