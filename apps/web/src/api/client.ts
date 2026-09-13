import type { MetaDto, PlaceDto, RouteOptionSummary } from "./types";
import type { Feature } from "geojson";

const API_BASE = "/api/v1";

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    const detail = await response.json().catch(() => ({}));
    throw new Error((detail as { detail?: string }).detail ?? `API ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchMeta(): Promise<MetaDto> {
  return getJson<MetaDto>("/meta");
}

export async function fetchPlaces(
  latitude: number,
  longitude: number,
  category: string | null,
  limit = 20,
  kind?: string,
): Promise<PlaceDto[]> {
  const params = new URLSearchParams({ latitude: String(latitude), longitude: String(longitude), limit: String(limit) });
  if (category) params.set("category", category);
  if (kind) params.set("kind", kind);
  const body = await getJson<{ places: PlaceDto[] }>(`/places?${params.toString()}`);
  return body.places;
}

export type GeocodeHit = { name: string; kind: string; latitude: number; longitude: number };

export async function geocode(q: string, limit = 5): Promise<GeocodeHit[]> {
  const body = await getJson<{ results: GeocodeHit[] }>(`/geocode?q=${encodeURIComponent(q)}&limit=${limit}`);
  return body.results;
}

/** Multi-ring standard reach (real Valhalla isochrones). */
export async function fetchReachRings(
  latitude: number,
  longitude: number,
  minutes: number[],
): Promise<{ features: Feature[]; contours: number[] }> {
  const response = await fetch(`${API_BASE}/reach?minutes=${minutes.join(",")}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ latitude, longitude }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error((body as { detail?: string }).detail ?? `API ${response.status}`);
  if (body.error) throw new Error(body.message ?? "router error");
  return { features: body.geometry.features as Feature[], contours: body.contours as number[] };
}

/** Decode a Valhalla/Google-style encoded polyline (precision 1e-6). */
export function decodePolyline(encoded: string): [number, number][] {
  const factor = 1e6;
  const coordinates: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lon = 0;
  while (index < encoded.length) {
    let result = 1;
    let shift = 0;
    let b: number;
    do {
      b = encoded.charCodeAt(index++) - 63 - 1;
      result += b << shift;
      shift += 5;
    } while (b >= 0x1f);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    result = 1;
    shift = 0;
    do {
      b = encoded.charCodeAt(index++) - 63 - 1;
      result += b << shift;
      shift += 5;
    } while (b >= 0x1f);
    lon += result & 1 ? ~(result >> 1) : result >> 1;
    coordinates.push([lon / factor, lat / factor]);
  }
  return coordinates;
}

type ValhallaTrip = { shape?: string; summary?: { length?: number; time?: number } };

/** Route comparison: per-option summaries AND decoded map lines. */
export async function fetchRoute(
  waypoints: { latitude: number; longitude: number }[],
  preferences: Record<string, unknown> | null,
): Promise<{ options: RouteOptionSummary[]; lines: { coordinates: [number, number][]; color: string; width: number; dashed: boolean }[] }> {
  const response = await fetch(`${API_BASE}/route`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ waypoints, costing: "pedestrian", preferences }),
  });
  const body = await response.json();
  if (!response.ok) {
    throw new Error((body as { detail?: string }).detail ?? `API ${response.status}`);
  }
  if (body.error) throw new Error(body.message ?? "router error");
  const payload = body as { route?: { trip?: ValhallaTrip; alternates?: { trip?: ValhallaTrip }[]; alternatives?: { trip?: ValhallaTrip }[] } };

  const trips = [
    payload.route?.trip,
    ...((payload.route?.alternates ?? payload.route?.alternatives ?? []).map((a) => a.trip)),
  ].filter(Boolean) as ValhallaTrip[];
  const labels: RouteOptionSummary["label"][] = ["Fastest", "Easiest"];
  const styles = [
    { color: "#171717", width: 4, dashed: true },
    { color: "#2387C9", width: 6, dashed: false },
  ];
  const options: RouteOptionSummary[] = [];
  const lines: { coordinates: [number, number][]; color: string; width: number; dashed: boolean }[] = [];
  trips.slice(0, 2).forEach((trip, index) => {
    const style = styles[index] ?? styles[0]!;
    const timeSeconds = trip.summary?.time ?? 0;
    const lengthKm = trip.summary?.length ?? 0;
    options.push({
      id: `option-${index}`,
      label: labels[index] ?? "Fastest",
      timeMinutes: timeSeconds ? Math.round(timeSeconds / 60) : null,
      distanceMetres: lengthKm ? Math.round(lengthKm * 1000) : null,
      factors: [
        { factor: "steps", status: "unknown", confidence: "unknown", cost_seconds: 0, explanation: "Per-step data is not in the active release yet — we don't know whether this route has steps." },
        { factor: "surface", status: "unknown", confidence: "unknown", cost_seconds: 0, explanation: "Path surface is not in the active release yet." },
        { factor: "gradient", status: "unknown", confidence: "inferred", cost_seconds: 0, explanation: "Estimated gradient needs the DEM pass (planned)." },
      ],
    });
    if (trip.shape) lines.push({ coordinates: decodePolyline(trip.shape), ...style });
  });
  return { options, lines };
}

