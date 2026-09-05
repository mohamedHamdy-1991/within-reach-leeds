import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SafetyNotice } from "@within-reach/design-system";
import { useApp } from "../state/app";
import { fetchRoute } from "../api/client";
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
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [options, setOptions] = useState<RouteOptionSummary[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const effectiveOrigin = origin ?? { label: "Park Square, Leeds (example)", latitude: 53.8008, longitude: -1.5491 };

  const compare = async () => {
    if (!destination.trim()) {
      announce("Enter a destination first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Phase 5: the destination is geocoded server-side in the release index;
      // until geocode is wired to the form, use the Leeds centre as the demo destination.
      const results = await fetchRoute(
        [
          { latitude: effectiveOrigin.latitude, longitude: effectiveOrigin.longitude },
          { latitude: 53.7959, longitude: -1.5444 },
        ],
        null,
      );
      setOptions(results);
      announce(`${results.length} route options compared`);
    } catch (exc) {
      setError((exc as Error).message);
      setOptions(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-sheet">
      <div className="page-sheet-head">
        <button className="back-button" type="button" onClick={() => navigate("/")}>← Back</button>
        <span className="panel-step">Take me there</span>
      </div>
      <h1>Compare routes</h1>
      <p className="lead">
        From <strong>{effectiveOrigin.label}</strong>. The fastest option and an easier option are
        compared with the factors that matter — never a single unexplained score.
      </p>

      <div className="pref-group">
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
      </div>

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
                <h2>{option.label}</h2>
                <p>
                  {option.timeMinutes !== null ? `${option.timeMinutes} minutes` : "Time unavailable"}
                  {option.distanceMetres !== null ? ` · ${option.distanceMetres} metres` : ""}
                </p>
              </header>
              <table className="factor-table">
                <caption className="sr-only-caption">Factors for the {option.label} option</caption>
                <thead>
                  <tr><th scope="col">Factor</th><th scope="col">What we know</th></tr>
                </thead>
                <tbody>
                  {option.factors
                    .filter((factor) => showAll || factor.status !== "known_ok")
                    .map((factor) => (
                      <tr key={factor.factor}>
                        <th scope="row">{FACTOR_LABELS[factor.factor] ?? factor.factor}</th>
                        <td>
                          {factor.status === "unknown" ? "Unknown — " : ""}
                          {factor.explanation}
                        </td>
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
            Conditions can change; check the route and surroundings. Route data in this release is
            mapped, not verified, and per-step evidence is not yet loaded.
          </SafetyNotice>
        </section>
      )}
    </div>
  );
}
