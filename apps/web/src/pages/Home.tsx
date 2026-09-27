import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePanelDock, MinimiseButton } from "../components/GlassPanel";
import { useApp } from "../state/app";
import { useMapController } from "../state/map";
import { geocode, fetchPlaces } from "../api/client";
import { PlaceAutocomplete } from "../components/PlaceAutocomplete";
import { placePopup } from "../state/map";
import type { PlaceDto } from "../api/types";


/* Identity-true vector illustrations for the action tiles (drawn in-repo). */
function IllustrationReach() {
  return (
    <svg viewBox="0 0 96 60" aria-hidden="true" className="tile-art">
      <path d="M48 30c14 0 25 8 25 19S62 58 48 58 23 51 23 40s11-10 25-10Z" fill="#F4CA28" opacity="0.35" />
      <ellipse cx="48" cy="40" rx="25" ry="17" fill="none" stroke="#171717" strokeWidth="2" strokeDasharray="5 4" opacity="0.55" />
      <ellipse cx="48" cy="40" rx="14" ry="9.5" fill="#F4CA28" opacity="0.55" stroke="#B8860B" strokeWidth="2.5" />
      <circle cx="48" cy="40" r="3.5" fill="#171717" />
      <circle cx="62" cy="33" r="2.4" fill="#2387C9" stroke="#fff" strokeWidth="1.4" />
      <circle cx="38" cy="46" r="2.4" fill="#2387C9" stroke="#fff" strokeWidth="1.4" />
    </svg>
  );
}
function IllustrationRoute() {
  return (
    <svg viewBox="0 0 96 60" aria-hidden="true" className="tile-art">
      <path d="M12 50c18 2 22-30 40-30 14 0 16 14 32 12" fill="none" stroke="#2387C9" strokeWidth="5" strokeLinecap="round" />
      <path d="M12 50c18 2 22-30 40-30 14 0 16 14 32 12" fill="none" stroke="#171717" strokeWidth="2" strokeDasharray="6 5" opacity="0.6" transform="translate(0,-9)" />
      <circle cx="12" cy="50" r="5" fill="#171717" stroke="#fff" strokeWidth="2.4" />
      <circle cx="84" cy="32" r="5" fill="#2387C9" stroke="#fff" strokeWidth="2.4" />
    </svg>
  );
}
function IllustrationNeed() {
  return (
    <svg viewBox="0 0 96 60" aria-hidden="true" className="tile-art">
      <circle cx="40" cy="26" r="14" fill="#fff" stroke="#171717" strokeWidth="3" />
      <path d="m51 37 12 12" stroke="#171717" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M40 20v12M34 26h12" stroke="#F4CA28" strokeWidth="3.4" strokeLinecap="round" />
      <circle cx="76" cy="18" r="5" fill="#2E7D32" stroke="#fff" strokeWidth="2" />
      <circle cx="20" cy="44" r="5" fill="#B42318" stroke="#fff" strokeWidth="2" />
    </svg>
  );
}
function IllustrationPark() {
  return (
    <svg viewBox="0 0 96 60" aria-hidden="true" className="tile-art">
      <path d="M30 58c-10-3-16-10-15-17C8 34 16 28 25 30c0-9 10-14 18-9 7-4 16 1 15 9 9-2 17 4 16 12-1 7-7 14-17 16Z" fill="#2E7D32" opacity="0.8" />
      <rect x="44" y="42" width="6" height="16" rx="2.5" fill="#171717" />
      <circle cx="70" cy="50" r="3" fill="#F4CA28" stroke="#B8860B" strokeWidth="1.6" />
      <path d="M8 56h80" stroke="#D9DDD8" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export const CATEGORY_COLORS: Record<string, string> = {
  essentials: "#2387C9",
  community: "#7B5EA7",
  wellbeing: "#2E7D32",
  support: "#B42318",
};

const TASKS = [
  { to: "/reach", strong: "Where can I go?", small: "See your comfortable reach.", Art: IllustrationReach },
  { to: "/route", strong: "Take me there", small: "Compare fastest and easier routes.", Art: IllustrationRoute },
  { to: "/find", strong: "I need something", small: "Find toilets, seats and services.", Art: IllustrationNeed },
  { to: "/parks", strong: "Find a park", small: "Match green space to what matters.", Art: IllustrationPark },
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
  const { dataStatus, setOrigin, announce } = useApp();
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

  const flashLocation = (longitude: number, latitude: number) => {
    ctl.setUserLocation([longitude, latitude]);
    announce("You are the pulsing blue dot on the map. This is for this session only — not saved.");
  };

  const requestLocation = () => {
    if (!("geolocation" in navigator)) {
      announce("This browser does not provide location. Enter a place or postcode instead.");
      return;
    }
    announce("Waiting for location permission");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setOrigin({ label: "Current location", latitude, longitude, isDeviceLocation: true });
        ctl.setOrigin([longitude, latitude]);
        flashLocation(longitude, latitude);
      },
      () => announce("Location is off. Enter a place or postcode instead."),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
    );
  };

  const togglePickPin = () => {
    const on = !ctl.pickMode;
    ctl.setPickMode(on);
    announce(on ? "Tap the map to drop your pin." : "Pin dropping cancelled.");
  };

  const whereAmI = async () => {
    // 1) try device location; 2) otherwise fall back to the released city centre with a pin.
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setOrigin({ label: "Where am I — my location", latitude, longitude, isDeviceLocation: true });
          ctl.setOrigin([longitude, latitude]);
          flashLocation(longitude, latitude);
          navigate("/reach");
        },
        async () => {
          const hits = await geocode("Leeds", 1).catch(() => []);
          const hit = hits[0];
          const point = hit ? { latitude: hit.latitude, longitude: hit.longitude } : { latitude: 53.8008, longitude: -1.5491 };
          setOrigin({ label: "Where am I — Leeds centre pin (location denied)", ...point });
          ctl.setOrigin([point.longitude, point.latitude]);
          flashLocation(point.longitude, point.latitude);
          navigate("/reach");
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
      );
    } else {
      announce("This browser does not provide location.");
    }
  };

  const submitPlaceQuery = async (raw: string) => {
    const value = raw.trim();
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
      <img
        src={`${import.meta.env.BASE_URL}generated/hero-band.png`}
        alt=""
        className="hero-band"
      />
      <div className="glass-panel__body">
        <p className="lead" style={{ marginTop: 0 }}>
          The whole screen is a live map. Choose a journey task — the map stays with you.
          {!announcedRef.current ? "" : ""}
        </p>

        <div className="place-form">
          <PlaceAutocomplete
            id="place"
            label="Start from a place or postcode"
            placeholder="Search like Google Maps — try “Leeds”, “LS1”, “Kirkgate”…"
            onPick={(hit) => {
              setOrigin({ label: hit.name, latitude: hit.latitude, longitude: hit.longitude });
              ctl.setOrigin([hit.longitude, hit.latitude]);
              navigate("/reach");
            }}
            onExactQuery={(query) => submitPlaceQuery(query)}
            special={{ match: /^where am i\??$/i, label: "Where am I?", onTrigger: whereAmI }}
          />
          <div className="input-row action-chip-row">
            <button className={`chip-button${ctl.pickMode ? " chip-button--active" : ""}`} type="button" onClick={togglePickPin} aria-pressed={ctl.pickMode}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10Z" /><circle cx="12" cy="11" r="2.2" /></svg>
              {ctl.pickMode ? "Tap the map…" : "Drop pin"}
            </button>
            <button className="chip-button" type="button" onClick={whereAmI}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3" /></svg>
              Where am I?
            </button>
            <button className="chip-button" type="button" onClick={requestLocation}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /><circle cx="12" cy="12" r="2" /></svg>
              Use my location
            </button>
          </div>
          <p className="field-help">Location is used for this session only. You can always type a place instead.</p>
        </div>

        <div className="task-list hero-tiles" aria-label="Choose what you want to do">
          {TASKS.map(({ to, strong, small, Art }) => (
            <button key={to} className="hero-tile" type="button" onClick={() => navigate(to)}>
              <Art />
              <span className="hero-tile__text">
                <strong>{strong}</strong>
                <small>{small}</small>
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
