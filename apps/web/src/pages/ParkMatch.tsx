import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ConfidenceBadge, EmptyState, SafetyNotice } from "@within-reach/design-system";
import { useApp } from "../state/app";
import { fetchPlaces } from "../api/client";
import type { PlaceDto } from "../api/types";
import { classifyPark, type ParkRequirement } from "@within-reach/route-score";

const REQUIREMENTS: { id: string; label: string; hint: string }[] = [
  { id: "paths", label: "Flat/gentle known paths", hint: "Evidence of a main path with known gradient" },
  { id: "benches", label: "Regular benches", hint: "Known seating along the way" },
  { id: "toilet", label: "Accessible toilet", hint: "Known toilet on site" },
  { id: "parking", label: "Accessible parking", hint: "Known accessible parking near an entrance" },
  { id: "cafe", label: "Café", hint: "Known café on site" },
];

export function ParkMatch() {
  const { origin, announce } = useApp();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [parks, setParks] = useState<PlaceDto[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveOrigin = origin ?? { label: "Park Square, Leeds (example)", latitude: 53.8008, longitude: -1.5491 };

  const toggle = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));

  const search = async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await fetchPlaces(effectiveOrigin.latitude, effectiveOrigin.longitude, "wellbeing", 10, "Park");
      setParks(results);
      announce(`${results.length} known parks found`);
    } catch (exc) {
      setError((exc as Error).message);
      setParks([]);
    } finally {
      setLoading(false);
    }
  };

  const rows = useMemo(() => {
    if (!parks) return [];
    return parks.map((park) => {
      // The active release has no per-feature park evidence: every requirement
      // is honestly unknown until a source provides it (A09).
      const requirements: ParkRequirement[] = REQUIREMENTS.map((requirement) => ({
        featureId: requirement.id,
        label: requirement.label,
        required: Boolean(selected[requirement.id]),
        evidence: null,
      }));
      const { verdict, perFeature } = classifyPark(requirements);
      return { park, requirements, verdict, perFeature };
    });
  }, [parks, selected]);

  return (
    <div className="page-sheet">
      <div className="page-sheet-head">
        <button className="back-button" type="button" onClick={() => navigate("/")}>← Back</button>
        <span className="panel-step">Find a park</span>
      </div>
      <h1>Find a park</h1>
      <p className="lead">
        Choose what matters. Every requirement is reported as a known match, a known mismatch, or
        unknown — never inferred from an entrance or one path.
      </p>

      <div className="pref-group">
        {REQUIREMENTS.map((requirement) => (
          <label className="choice" key={requirement.id}>
            <input type="checkbox" checked={Boolean(selected[requirement.id])} onChange={() => toggle(requirement.id)} />
            <span>
              <strong>{requirement.label}</strong>
              <small>{requirement.hint}</small>
            </span>
          </label>
        ))}
        <button className="primary" type="button" onClick={search} disabled={loading}>
          {loading ? "Searching…" : "Show park matches"}
        </button>
      </div>

      {error && (
        <div className="inline-warning" role="alert">
          {error} No results are shown rather than guessed ones.
        </div>
      )}

      {parks && parks.length === 0 && !error && (
        <EmptyState message="No known parks inside 2 km. That is an honest empty result, not an error." />
      )}

      {rows.length > 0 && (
        <section aria-label="Park matches">
          {rows.map(({ park, requirements, verdict, perFeature }) => (
            <article key={park.external_id} className="route-option">
              <header className="park-head">
                <h2>{park.name}</h2>
                <span className={`badge ${verdict === "known_match" ? "candidate" : verdict === "unknown" ? "caution" : "blocked"}`}>
                  {verdict.replaceAll("_", " ")}
                </span>
              </header>
              <table className="factor-table">
                <thead>
                  <tr><th scope="col">Requirement</th><th scope="col">Evidence</th></tr>
                </thead>
                <tbody>
                  {requirements.map((requirement, index) => (
                    <tr key={requirement.featureId}>
                      <th scope="row">{requirement.label}</th>
                      <td>
                        {perFeature[index] === "unknown"
                          ? "We don't have evidence for this yet."
                          : perFeature[index] === "known_match"
                            ? "Known match"
                            : "Known mismatch"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="field-help">
                <ConfidenceBadge label={park.confidence} meta={`${park.source_id} · ${park.retrieved_at}`} />
              </p>
            </article>
          ))}
          <SafetyNotice title="Never inferred">
            A park is never described as fully accessible from an entrance or a single path. Unknown
            stays unknown until a source documents it.
          </SafetyNotice>
        </section>
      )}
    </div>
  );
}
