import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePanelDock, MinimiseButton } from "../components/GlassPanel";
import { useApp } from "../state/app";
import { useMapController } from "../state/map";
import { geocode, fetchPlaces } from "../api/client";
import { placePopup } from "../state/map";
import type { PlaceDto } from "../api/types";

export const CATEGORY_COLORS: Record<string, string> = {
  essentials: "#2387C9",
  community: "#7B5EA7",
  wellbeing: "#2E7D32",
  support: "#B42318",
};

const TASKS = [
  { to: "/reach", strong: "Where can I go?", small: "See your comfortable reach." },
  { to: "/route", strong: "Take me there", small: "Compare fastest and easier routes." },
  { to: "/find", strong: "I need something", small: "Find toilets, seats and services." },
  { to: "/parks", strong: "Find a park", small: "Match green space to what matters." },
] as const;

export function usePlacesOnMap(places: PlaceDto[] | null) {
  const ctl = useMapController();

  // Stable key: callers pass derived (filtered) arrays whose identity changes
  // every render; the effect must only re-run when the CONTENT changes.
  const placesKey = places === null ? "null" : places.map((p) => p.external_id).join(",");
  const placesRef = useRef(places);
  placesRef.current = places;

  useEffect(() => {
    const current = placesRef.current;
    if (!current) {
      ctl.setPlaces([]);
      return;
    }
    const features = current.map((place) => ({
      type: "Feature",
      properties: {
        title: place.name,
        l1: place.metres !== undefined ? `${place.kind} · about ${Math.round(place.metres)} m away` : place.kind,
        l2: `${place.confidence} — ${place.source_id} · ${place.retrieved_at}`,
        color: CATEGORY_COLORS[place.category] ?? "#555",
        lng: place.longitude,
        lat: place.latitude,
      },
      geometry: { type: "Point", coordinates: [place.longitude, place.latitude] },
    })) as GeoJSON.Feature[];
    ctl.setPlaces(features, placePopup as never);
  }, [placesKey]);
}

export function Home() {
  const { dataStatus, origin, setOrigin, announce } = useApp();
  const ctl = useMapController();
  const navigate = useNavigate();
  const { minimized: panelMinimized } = usePanelDock("explore-home", "Explore Leeds");
  const [places, setPlacesState] = useState<PlaceDto[] | null>(null);
  const [finding, setFinding] = useState(false);
  const announcedRef = useRef(false);

  usePlacesOnMap(places);

  useEffect(() => {
    ctl.clearOverlays([]);
    ctl.setOrigin([-1.5491, 53.8008]);
    fetchPlaces(53.8008, -1.5491, null, 50)
      .then(setPlacesState)
      .catch(() => setPlacesState([]));
  }, []);

  useEffect(() => {
    ctl.setTextOverlay(
      <div>
        <p>
          The whole screen is a live map. Blue and coloured dots are known places from the active
          release — click one for its evidence. Choose a task to draw real reach rings and routes.
        </p>
        <dl>
          <div><dt>Data status</dt><dd>
            {dataStatus.mode === "live"
              ? `Live API — ${dataStatus.dataReleaseId ?? "connected"}`
              : dataStatus.mode === "source-register"
                ? "Source register only; no live accessibility release"
                : "Data status unavailable"}
          </dd></div>
        </dl>
      </div>,
    );
  }, [dataStatus]);

  const requestLocation = () => {
    if (!("geolocation" in navigator)) {
      announce("This browser does not provide location. Enter a place or postcode instead.");
      return;
    }
    announce("Waiting for location permission");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setOrigin({
          label: "Current location",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          isDeviceLocation: true,
        });
        ctl.setOrigin([position.coords.longitude, position.coords.latitude]);
        announce("Location ready for this session. It has not been saved.");
      },
      () => announce("Location is off. Enter a place or postcode instead."),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
    );
  };

  const submitPlace = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = (new FormData(event.currentTarget).get("place") as string | null)?.trim();
    if (!value) {
      announce("Enter a place or postcode first.");
      return;
    }
    setFinding(true);
    try {
      const hits = await geocode(value, 1);
      const hit = hits[0];
      if (hit) {
        setOrigin({ label: hit.name, latitude: hit.latitude, longitude: hit.longitude });
        ctl.setOrigin([hit.longitude, hit.latitude]);
        announce(`${hit.name} set as your starting point.`);
      } else {
        setOrigin({ label: `${value} (approximate — city centre)`, latitude: 53.8008, longitude: -1.5491 });
        announce(`We couldn't find “${value}” in the release — using an approximate city-centre starting point instead.`);
      }
      navigate("/reach");
    } catch {
      announce("The geocoder is unreachable right now. Try again or use the example place in My Reach.");
    } finally {
      setFinding(false);
    }
  };


  if (panelMinimized) return null;
  return (
    <section className="control-panel" aria-labelledby="page-title">
      <div className="panel-bar">
        <h1 id="page-title" style={{ margin: 0, fontSize: "1.3rem" }}>Explore Leeds</h1>
        <MinimiseButton id="explore-home" title="Explore Leeds" />
      </div>
      <div className="glass-panel__body">
        <p className="lead" style={{ marginTop: 0 }}>
          The whole screen is a live map. Choose a journey task — the map stays with you.
          {!announcedRef.current ? "" : ""}
        </p>

        <form className="place-form" onSubmit={submitPlace}>
          <label htmlFor="place">Start from a place or postcode</label>
          <div className="input-row">
            <input id="place" name="place" type="search" autoComplete="postal-code" placeholder="For example, LS1 3AD" defaultValue={origin && !origin.isDeviceLocation ? origin.label.replace(" (approximate — city centre)", "") : ""} />
            <button className="icon-button" type="button" aria-label="Use my current location" title="Use my current location" onClick={requestLocation}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /><circle cx="12" cy="12" r="2" /></svg>
            </button>
          </div>
          <p className="field-help">Location is used for this session only. You can always type a place instead.</p>
        </form>

        <div className="task-list" aria-label="Choose what you want to do">
          {TASKS.map((task) => (
            <button key={task.to} className="task" type="button" onClick={() => navigate(task.to)}>
              <span>
                <strong>{task.strong}</strong>
                <small>{task.small}</small>
              </span>
              <span className="arrow" aria-hidden="true">→</span>
            </button>
          ))}
        </div>

        <div className="data-note" id="data-note">
          <span className="status-dot" aria-hidden="true"></span>
          <p>
            <strong>
              {dataStatus.mode === "live" ? "Live API connected" : dataStatus.mode === "source-register" ? "Leeds source register loaded" : "Data status unavailable"}
            </strong>
            <span>
              {dataStatus.mode === "live"
                ? `Releases: ${dataStatus.dataReleaseId ?? "pending"}`
                : dataStatus.mode === "source-register"
                  ? "No validated live accessibility release is active yet."
                  : "The interface remains available. Try again later."}
            </span>
          </p>
          <button className="text-button" type="button" onClick={() => navigate("/confidence")}>
            About the data
          </button>
        </div>
        {finding ? <p className="field-help" role="status">Finding that place…</p> : null}
      </div>
    </section>
  );
}
