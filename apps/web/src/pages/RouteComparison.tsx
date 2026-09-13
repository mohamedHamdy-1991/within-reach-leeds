import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePanelDock, MinimiseButton } from "../components/GlassPanel";
import { SafetyNotice } from "@within-reach/design-system";
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

export function RouteComparison() {
  const { origin, announce } = useApp();
  const ctl = useMapController();
  const navigate = useNavigate();
  const { minimized: panelMinimized } = usePanelDock("route-panel", "Take me there");
  const [destination, setDestination] = useState("");
  const [options, setOptions] = useState<RouteOptionSummary[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const effectiveOrigin = origin ?? { label: "Park Square, Leeds (example)", latitude: 53.8008, longitude: -1.5491 };

  useEffect(() => {
    ctl.clearOverlays(["origin", "places"]);
    ctl.setOrigin([effectiveOrigin.longitude, effectiveOrigin.latitude]);
  }, []);

  useEffect(() => {
    ctl.setTextOverlay(
      <div>
        {options ? (
          <>
            <p>Two route options between {effectiveOrigin.label} and your destination.</p>
            {options.map((option) => (
              <div key={option.id}>
                <h4>{option.label}</h4>
                <p>
                  {option.timeMinutes !== null ? `${option.timeMinutes} minutes` : "Time unavailable"}
                  {option.distanceMetres !== null ? ` · ${option.distanceMetres} metres` : ""}
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
  }, [options]);

  const compare = async () => {
    if (!destination.trim()) {
      announce("Enter a destination first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const hits = await geocode(destination, 1);
      const hit = hits[0];
      const destinationPoint = hit
        ? { latitude: hit.latitude, longitude: hit.longitude }
        : { latitude: 53.7959, longitude: -1.5444 };
      const { options: resultOptions, lines } = await fetchRoute(
        [
          { latitude: effectiveOrigin.latitude, longitude: effectiveOrigin.longitude },
          destinationPoint,
        ],
        null,
      );
      setOptions(resultOptions);
      ctl.setRoutes(lines);
      announce(`${resultOptions.length} route options compared`);
    } catch (exc) {
      setError((exc as Error).message);
      setOptions(null);
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
          From <strong>{effectiveOrigin.label}</strong>. Fastest vs easier — with the factors that matter,
          never a single unexplained score.
        </p>

        <label className="panel-label" htmlFor="route-dest">Destination</label>
        <input
          id="route-dest"
          className="panel-input"
          value={destination}
          onChange={(event) => setDestination(event.target.value)}
          placeholder="Where would you like to go?"
        />
        <button className="primary" type="button" onClick={compare} disabled={loading}>
          {loading ? "Comparing…" : "Compare routes"}
        </button>

        {error && (
          <div className="inline-warning" role="alert">
            {error} No route is shown rather than a guessed one.
          </div>
        )}

        {options && options.length > 0 && (
          <section aria-label="Route options">
            {options.map((option) => (
              <article key={option.id} className="route-option">
                <header>
                  <h2 style={{ fontSize: "1.05rem", margin: "10px 0 2px" }}>{option.label}</h2>
                  <p style={{ margin: 0 }}>
                    {option.timeMinutes !== null ? `${option.timeMinutes} minutes` : "Time unavailable"}
                    {option.distanceMetres !== null ? ` · ${option.distanceMetres} metres` : ""}
                  </p>
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
            ))}
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
