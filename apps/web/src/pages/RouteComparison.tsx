import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePanelDock, MinimiseButton } from "../components/GlassPanel";
import { SafetyNotice } from "@within-reach/design-system";
import { PlaceAutocomplete } from "../components/PlaceAutocomplete";
import { useApp } from "../state/app";
import { useMapController } from "../state/map";
import { fetchRoute, geocode } from "../api/client";
import type { RouteOptionSummary } from "../api/types";

const FACTOR_LABELS: Record<string, string> = {
  steps: "Steps",
  surface: "Surface",
  gradient: "Estimated gradient",
  crossings: "Crossings",
  rest_gap: "Rest gaps",
};

/** Google-Maps-like card styling per option, echoing the map line styles. */
const OPTION_CARD_STYLES: Record<string, { borderLeft: string; accent: string }> = {
  Fastest: { borderLeft: "6px dashed #171717", accent: "#171717" },
  Easiest: { borderLeft: "6px solid #2387C9", accent: "#2387C9" },
};

type Point = {
  label: string;
  latitude: number;
  longitude: number;
  /** Session-only device location is never persisted. */
  isDeviceLocation?: boolean;
};

function formatTime(minutes: number | null): string {
  return minutes !== null ? `${minutes} min` : "Time unavailable";
}

function formatDistance(metres: number | null): string {
  if (metres === null) return "distance unavailable";
  return metres >= 1000 ? `${(metres / 1000).toFixed(1)} km` : `${Math.round(metres)} m`;
}

/** One plain sentence comparing the returned options, or null if not comparable. */
function differenceSentence(options: RouteOptionSummary[]): string | null {
  if (options.length < 2) return null;
  const fastest = options.find((option) => option.label === "Fastest") ?? options[0];
  const easiest = options.find((option) => option.label === "Easiest") ?? options[1];
  if (!fastest || !easiest || fastest.id === easiest.id) return null;
  if (fastest.timeMinutes === null || easiest.timeMinutes === null) {
    return "Journey times are unavailable from the router right now.";
  }
  const extra = easiest.timeMinutes - fastest.timeMinutes;
  if (extra <= 0) return "The easiest option is no slower than the fastest today.";
  return `The easiest option takes ${extra} minute${extra === 1 ? "" : "s"} longer than the fastest.`;
}

export function RouteComparison() {
  const { origin, setOrigin: setAppOrigin, announce } = useApp();
  const ctl = useMapController();
  const navigate = useNavigate();
  const { minimized: panelMinimized } = usePanelDock("route-panel", "Take me there");

  const [fromPoint, setFromPoint] = useState<Point | null>(() =>
    origin ? { label: origin.label, latitude: origin.latitude, longitude: origin.longitude, isDeviceLocation: origin.isDeviceLocation } : null,
  );
  const [toPoint, setToPoint] = useState<Point | null>(null);
  /** Bumped whenever a field must re-show a new point (swap, device location). */
  const [fieldEpoch, setFieldEpoch] = useState(0);
  const [locating, setLocating] = useState(false);
  const [options, setOptions] = useState<RouteOptionSummary[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    ctl.clearOverlays(["origin", "places"]);
    if (fromPoint) ctl.setOrigin([fromPoint.longitude, fromPoint.latitude]);
  }, []);

  useEffect(() => {
    ctl.setTextOverlay(
      <div>
        {options && options.length > 0 ? (
          <>
            <p>
              Route options between {fromPoint?.label ?? "your start"} and {toPoint?.label ?? "your destination"}.
            </p>
            {options.map((option) => (
              <div key={option.id}>
                <h4>{option.label}</h4>
                <p>
                  {formatTime(option.timeMinutes)} · {formatDistance(option.distanceMetres)}
                </p>
                <ul>
                  {option.factors.map((factor) => (
                    <li key={factor.factor}>
                      {FACTOR_LABELS[factor.factor] ?? factor.factor}: {factor.status === "unknown" ? "Unknown — " : ""}
                      {factor.explanation}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </>
        ) : (
          <p>Compare routes to draw the fastest and easier options on the map.</p>
        )}
      </div>,
    );
  }, [options, fromPoint, toPoint]);

  /** Any change to start or destination invalidates the drawn comparison. */
  const resetResults = () => {
    setOptions(null);
    setError(null);
    ctl.setRoutes([]);
  };

  const applyFromPoint = (point: Point) => {
    resetResults();
    setFromPoint(point);
    setAppOrigin(point);
    ctl.setOrigin([point.longitude, point.latitude]);
  };

  const handleFromPick = (hit: { name: string; latitude: number; longitude: number }) => {
    applyFromPoint({ label: hit.name, latitude: hit.latitude, longitude: hit.longitude });
  };

  const handleToPick = (hit: { name: string; latitude: number; longitude: number }) => {
    resetResults();
    setToPoint({ label: hit.name, latitude: hit.latitude, longitude: hit.longitude });
  };

  /** Enter on the To field with no suggestion chosen: geocode the exact query. */
  const handleExactTo = async (value: string) => {
    const query = value.trim();
    if (!query) return;
    try {
      const hits = await geocode(query, 1);
      const hit = hits[0];
      if (!hit) {
        announce(`Nothing found for "${query}". Choose one of the suggestions instead.`);
        return;
      }
      resetResults();
      setToPoint({ label: hit.name, latitude: hit.latitude, longitude: hit.longitude });
      setFieldEpoch((epoch) => epoch + 1);
      announce(`${hit.name} selected as the destination.`);
    } catch {
      announce("The place search is unreachable right now. Try one of the live suggestions.");
    }
  };

  const useMyLocation = () => {
    if (!("geolocation" in navigator)) {
      announce("This device does not offer location services. Type a start point instead.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        applyFromPoint({
          label: "My location",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          isDeviceLocation: true,
        });
        setFieldEpoch((epoch) => epoch + 1);
        announce("Using your device location as the start. It is kept for this session only and never saved.");
      },
      () => {
        setLocating(false);
        announce("We could not get your device location. Check the permission, or type a start point.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  };

  const swap = () => {
    const previousFrom = fromPoint;
    resetResults();
    setFromPoint(toPoint);
    setToPoint(previousFrom);
    if (toPoint) {
      setAppOrigin(toPoint);
      ctl.setOrigin([toPoint.longitude, toPoint.latitude]);
    } else {
      setAppOrigin(null);
      ctl.setOrigin(null);
    }
    setFieldEpoch((epoch) => epoch + 1);
    announce(toPoint ? `Swapped. Starting from ${toPoint.label}.` : "Swapped. Choose a new destination.");
  };

  const compare = async () => {
    if (!fromPoint || !toPoint) {
      announce("Choose a start and a destination from the suggestions first.");
      return;
    }
    setLoading(true);
    setError(null);
    announce("Comparing routes…");
    try {
      const { options: resultOptions, lines } = await fetchRoute(
        [
          { latitude: fromPoint.latitude, longitude: fromPoint.longitude },
          { latitude: toPoint.latitude, longitude: toPoint.longitude },
        ],
        null,
      );
      if (resultOptions.length === 0) {
        throw new Error("The router could not find a walkable route between these two points.");
      }
      setOptions(resultOptions);
      ctl.setRoutes(lines);
      const fastest = resultOptions.find((option) => option.label === "Fastest") ?? resultOptions[0];
      announce(
        `${resultOptions.length} route options compared${
          fastest && fastest.timeMinutes !== null ? ` — fastest takes ${fastest.timeMinutes} minutes` : ""
        }.`,
      );
    } catch (exc) {
      const message = (exc as Error).message || "The router is unreachable.";
      setError(message);
      setOptions(null);
      ctl.setRoutes([]);
      announce(`${message} No route is shown rather than a guessed one.`);
    } finally {
      setLoading(false);
    }
  };

  if (panelMinimized) return null;
  return (
    <section className="control-panel panel-right" aria-labelledby="route-title">
      <div className="panel-bar">
        <button className="back-button" type="button" onClick={() => navigate("/")}>← Back</button>
        <strong id="route-title">Take me there</strong>
        <MinimiseButton id="route-panel" title="Take me there" />
      </div>
      <div className="glass-panel__body">
        <p className="lead" style={{ marginTop: 0 }}>
          Fastest vs easiest — with the factors that matter, never a single unexplained score.
        </p>

        <PlaceAutocomplete
          key={`from-${fieldEpoch}`}
          id="route-from"
          label="From"
          placeholder={fromPoint ? fromPoint.label : "Your starting point"}
          defaultValue={fromPoint?.label ?? ""}
          onPick={handleFromPick}
        />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, margin: "4px 0 10px" }}>
          <button className="chip-button" type="button" onClick={useMyLocation} disabled={locating}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="3.2" />
              <path d="M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4" />
            </svg>
            {locating ? "Finding you…" : "Use my location"}
          </button>
          <button className="chip-button" type="button" onClick={swap} aria-label="Swap start and destination">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 4v13M7 4 4 7M7 4l3 3" />
              <path d="M17 20V7m0 13 3-3m-3 3-3-3" />
            </svg>
            Swap
          </button>
        </div>

        <PlaceAutocomplete
          key={`to-${fieldEpoch}`}
          id="route-dest"
          label="To"
          placeholder="Where would you like to go?"
          defaultValue={toPoint?.label ?? ""}
          onPick={handleToPick}
          onExactQuery={handleExactTo}
        />

        <button className="primary" type="button" onClick={compare} disabled={loading} aria-busy={loading}>
          {loading ? "Comparing…" : "Compare routes"}
        </button>

        {error && (
          <div className="inline-warning" role="alert">
            {error} No route is shown rather than a guessed one.
          </div>
        )}

        {options && options.length > 0 && (
          <section aria-label="Route options">
            {differenceSentence(options) && (
              <p style={{ margin: "14px 0 0", fontWeight: 750, lineHeight: 1.4 }}>{differenceSentence(options)}</p>
            )}
            {options.map((option) => {
              const cardStyle = OPTION_CARD_STYLES[option.label] ?? { borderLeft: "6px solid var(--rule)", accent: "var(--ink)" };
              return (
                <article
                  key={option.id}
                  className="route-option"
                  style={{
                    border: "1px solid var(--rule)",
                    borderLeft: cardStyle.borderLeft,
                    borderRadius: 12,
                    background: "#fff",
                    margin: "12px 0 0",
                    padding: "12px 12px 8px",
                  }}
                >
                  <header style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                    <h2 style={{ margin: 0, fontSize: "1.7rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
                      {formatTime(option.timeMinutes)}
                    </h2>
                    <span style={{ fontWeight: 700, color: "var(--muted)" }}>{formatDistance(option.distanceMetres)}</span>
                    <span
                      className="badge"
                      style={{ color: cardStyle.accent, justifySelf: "start", marginLeft: "auto" }}
                    >
                      {option.label}
                    </span>
                  </header>
                  <table className="factor-table">
                    <thead>
                      <tr><th scope="col">Factor</th><th scope="col">What we know</th></tr>
                    </thead>
                    <tbody>
                      {option.factors
                        .filter((factor) => showAll || factor.status !== "known_ok")
                        .map((factor) => (
                          <tr key={factor.factor}>
                            <th scope="row">{FACTOR_LABELS[factor.factor] ?? factor.factor}</th>
                            <td>{factor.status === "unknown" ? "Unknown — " : ""}{factor.explanation}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </article>
              );
            })}
            <button className="text-button" type="button" aria-expanded={showAll} onClick={() => setShowAll((v) => !v)}>
              {showAll ? "Show only open questions" : "Compare all factors"}
            </button>
            <SafetyNotice title="Plan, don't navigate">
              Conditions can change; check the route and surroundings. Route data is mapped, not verified,
              and per-step evidence is not yet loaded.
            </SafetyNotice>
          </section>
        )}
      </div>
    </section>
  );
}
