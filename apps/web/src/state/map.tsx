import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { PopupTarget } from "../map/RealMap";
import type { Feature } from "geojson";

export type PlaceFeatureProps = {
  title: string;
  l1?: string;
  l2?: string;
  l3?: string;
  color: string;
  selected?: boolean;
  lng: number;
  lat: number;
};

export type RouteLine = {
  coordinates: [number, number][];
  color: string;
  width: number;
  dashed: boolean;
};

type MapController = {
  ready: boolean;
  markReady: () => void;
  rings: Feature[];
  personalRing: Feature[];
  places: Feature[];
  routes: Feature[];
  origin: [number, number] | null;
  selectedPopup: PopupTarget | null;
  setRings: (features: Feature[]) => void;
  setPersonalRing: (features: Feature[]) => void;
  setPlaces: (features: Feature[], popupFor?: (props: PlaceFeatureProps) => PopupTarget | null) => void;
  setRoutes: (lines: RouteLine[]) => void;
  setOrigin: (origin: [number, number] | null) => void;
  openPopup: (target: PopupTarget) => void;
  clearOverlays: (keep: Array<"rings" | "personal" | "places" | "routes" | "origin">) => void;
  /** Overlay panel content shown by the global Text view (map/text parity). */
  textOverlay: ReactNode;
  setTextOverlay: (node: ReactNode) => void;
  placePopupFor: ((props: PlaceFeatureProps) => PopupTarget | null) | null;
};

const noop = () => undefined;

/**
 * Map controller context. Without a mounted map (unit tests, SSR) every
 * setter is a safe no-op, so pages render identically.
 */
const MapContext = createContext<MapController>({
  ready: false,
  markReady: noop,
  rings: [],
  personalRing: [],
  places: [],
  routes: [],
  origin: null,
  selectedPopup: null,
  setRings: noop,
  setPersonalRing: noop,
  setPlaces: noop,
  setRoutes: noop,
  setOrigin: noop,
  openPopup: noop,
  clearOverlays: noop,
  textOverlay: null,
  setTextOverlay: noop,
  placePopupFor: null,
});

export function MapProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [rings, setRingsState] = useState<Feature[]>([]);
  const [personalRing, setPersonalState] = useState<Feature[]>([]);
  const [places, setPlacesState] = useState<Feature[]>([]);
  const [routes, setRoutesState] = useState<Feature[]>([]);
  const [origin, setOriginState] = useState<[number, number] | null>(null);
  const [selectedPopup, setSelectedPopup] = useState<PopupTarget | null>(null);
  const [textOverlay, setTextOverlay] = useState<ReactNode>(null);
  const popupForRef = useRef<((props: PlaceFeatureProps) => PopupTarget | null) | null>(null);

  const setPlaces = useCallback((features: Feature[], popupFor?: (props: PlaceFeatureProps) => PopupTarget | null) => {
    popupForRef.current = popupFor ?? null;
    setPlacesState(features);
  }, []);

  const value = useMemo<MapController>(
    () => ({
      ready,
      markReady: () => setReady(true),
      rings,
      personalRing,
      places,
      routes,
      origin,
      selectedPopup,
      setRings: (features) => setRingsState(features),
      setPersonalRing: (features) => setPersonalState(features),
      setPlaces,
      setRoutes: (lines) =>
        setRoutesState(
          lines.map((line) => ({
            type: "Feature",
            properties: { color: line.color, width: line.width, dashed: line.dashed },
            geometry: { type: "LineString", coordinates: line.coordinates },
          })) as Feature[],
        ),
      setOrigin: (ll) => setOriginState(ll),
      openPopup: (target) => setSelectedPopup(target),
      clearOverlays: (keep) => {
        if (!keep.includes("rings")) setRingsState([]);
        if (!keep.includes("personal")) setPersonalState([]);
        if (!keep.includes("places")) { setPlacesState([]); popupForRef.current = null; }
        if (!keep.includes("routes")) setRoutesState([]);
        if (!keep.includes("origin")) setOriginState(null);
        setSelectedPopup(null);
      },
      textOverlay,
      setTextOverlay,
      placePopupFor: popupForRef.current,
    }),
    [ready, rings, personalRing, places, routes, origin, selectedPopup, textOverlay, setPlaces],
  );

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}

export function useMapController(): MapController {
  return useContext(MapContext);
}

/** Build a provenance popup target from a place API row. */
export function placePopup(
  place: { name: string; kind: string; confidence: string; source_id: string; retrieved_at: string; longitude: number; latitude: number; metres?: number },
): PopupTarget {
  return {
    longitude: place.longitude,
    latitude: place.latitude,
    title: place.name,
    lines: [
      place.metres !== undefined ? `${place.kind} · about ${Math.round(place.metres)} m away` : place.kind,
      `${place.confidence} — ${place.source_id} · ${place.retrieved_at}`,
    ],
  };
}
