export type PlaceDto = {
  external_id: string;
  name: string;
  category: string;
  kind: string;
  latitude: number;
  longitude: number;
  confidence: "verified" | "mapped" | "community_verified" | "inferred" | "unknown";
  source_id: string;
  retrieved_at: string;
  metres?: number;
  release_id?: string;
  attrs?: Record<string, unknown> | null;
};

export type MetaDto = {
  mode: string;
  dataReleaseId: string | null;
  message: string;
  sources?: { source_id?: string; licence?: string }[];
  placeCounts?: Record<string, number>;
};

export type RouteOptionSummary = {
  id: string;
  label: "Fastest" | "Easiest";
  timeMinutes: number | null;
  distanceMetres: number | null;
  factors: RouteFactorDto[];
};

export type RouteFactorDto = {
  factor: string;
  status: "known_ok" | "known_barrier" | "partial" | "unknown";
  confidence: "verified" | "mapped" | "community_verified" | "inferred" | "unknown";
  cost_seconds: number;
  explanation: string | null;
};
