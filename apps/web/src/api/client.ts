import type { MetaDto, PlaceDto, RouteOptionSummary } from "./types";

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

export async function fetchRoute(
  waypoints: { latitude: number; longitude: number }[],
  preferences: Record<string, unknown> | null,
): Promise<RouteOptionSummary[]> {
  const response = await fetch(`${API_BASE}/route`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ waypoints, costing: "pedestrian", preferences }),
  });
  const body = await response.json();
  if (!response.ok) {
    throw new Error((body as { detail?: string }).detail ?? `API ${response.status}`);
  }
  return summariseRoutes(body);
}

type ValhallaTrip = {
  summary?: { length?: number; time?: number };
  legs?: { summary?: { length?: number; time?: number } }[];
};

/** Deterministic projection of the Valhalla response onto our option model. */
export function summariseRoutes(payload: {
  route?: { trip?: ValhallaTrip; alternatives?: { trip?: ValhallaTrip }[] };
}): RouteOptionSummary[] {
  const options: RouteOptionSummary[] = [];
  const primary = payload.route?.trip;
  const alternatives = payload.route?.alternatives ?? [];
  const trips = [primary, ...alternatives.map((a) => a.trip)].filter(Boolean) as ValhallaTrip[];
  const labels: RouteOptionSummary["label"][] = ["Fastest", "Easiest"];

  trips.slice(0, 2).forEach((trip, index) => {
    const timeSeconds = trip.summary?.time ?? (trip.legs ?? []).reduce((sum, leg) => sum + (leg.summary?.time ?? 0), 0);
    const lengthKm = trip.summary?.length ?? (trip.legs ?? []).reduce((sum, leg) => sum + (leg.summary?.length ?? 0), 0);
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
  });
  return options;
}
