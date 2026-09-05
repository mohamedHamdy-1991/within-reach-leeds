import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ConfidenceBadge, SafetyNotice } from "@within-reach/design-system";
import { useApp } from "../state/app";
import { computeReach, CATEGORY_LABELS, SYNTHETIC_ORIGIN, type CategoryId } from "../fixtures/synthetic";
import { MapCanvas } from "../components/MapCanvas";

const CATEGORIES: CategoryId[] = ["essentials", "community", "wellbeing", "support"];
const TIME_OPTIONS = [5, 10, 15, 20, 30] as const;

export function ReachResults() {
  const { preferences, origin, announce } = useApp();
  const navigate = useNavigate();
  const [minutes, setMinutes] = useState(20);
  const [showHow, setShowHow] = useState(false);

  const effectiveOrigin = origin ?? { ...SYNTHETIC_ORIGIN, label: "Park Square, Leeds (example)" };
  const reach = useMemo(
    () => computeReach(preferences, minutes),
    [preferences, minutes],
  );

  return (
    <>
      <section className="control-panel results-panel" aria-labelledby="page-title" tabIndex={0}>
        <div className="page-sheet-head">
          <button className="back-button" type="button" onClick={() => navigate("/reach")}>
            ← Back
          </button>
          <span className="panel-step">Reach results</span>
        </div>
        <div className="intro">
          <h1 id="page-title">
            {reach.personalMinutes} comfortable minutes from {effectiveOrigin.label}
          </h1>
          <p>Standard reach and your comfortable reach, from the same starting point.</p>
        </div>

        <fieldset className="pref-group">
          <legend>Travel time</legend>
          <div className="segmented" role="group" aria-label="Travel time">
            {TIME_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={n === minutes}
                onClick={() => {
                  setMinutes(n);
                  announce(`${n} minutes selected`);
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </fieldset>

        {reach.areaCoveragePercent !== null ? (
          <p className="coverage-line">
            Your comfortable reach covers{" "}
            <strong data-testid="coverage-percent">{reach.areaCoveragePercent}%</strong> of the standard
            network area.
          </p>
        ) : (
          <p className="coverage-line">The area comparison is withheld: the known network does not cover enough of this area.</p>
        )}

        <section aria-labelledby="counts-heading" className="counts-section">
          <h2 id="counts-heading">Places inside your comfortable reach</h2>
          <ul className="counts-list">
            {CATEGORIES.map((category) => (
              <li key={category}>
                <a href={`#list-${category}`}>
                  <strong>{CATEGORY_LABELS[category]}</strong> — {reach.counts[category]}{" "}
                  {reach.counts[category] === 1 ? "place" : "places"}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="detail-toggle">
          <button type="button" aria-expanded={showHow} onClick={() => setShowHow((v) => !v)}>
            How this was calculated
          </button>
          {showHow && (
            <div className="how-detail">
              <p>
                Standard reach: {reach.standardMetres} metres of network at an average walking speed
                (80 metres per minute). Your comfortable reach: {reach.personalMinutes} minutes × your
                preferences = {reach.personalMetres} metres.
              </p>
              <p>
                Known network coverage of the study area: 86%. Counts only include places inside your
                comfortable boundary with a source and confidence; places with unknown evidence stay listed
                but are labelled unknown.
              </p>
              <SafetyNotice title="Plan, don't navigate">
                This is planning assistance, not a guarantee of safety or accessibility. Conditions can
                change; check the route and surroundings before you set out.
              </SafetyNotice>
            </div>
          )}
        </section>

        <p className="field-help">
          Preferences shape this result.{" "}
          <Link to="/preferences">Change preferences</Link>
        </p>
      </section>

      <MapCanvas
        mode="reach"
        ariaLabel="Synthetic preview map showing standard and comfortable reach boundaries around the starting point. It is not live routing data."
        textEquivalent={
          <div className="text-equivalent" data-testid="reach-text-equivalent">
            <p>
              <strong>Your comfortable reach</strong> extends about {reach.personalMetres} metres from{" "}
              {effectiveOrigin.label}; the standard reach extends {reach.standardMetres} metres.
              {reach.areaCoveragePercent !== null && (
                <> That covers {reach.areaCoveragePercent}% of the standard network area.</>
              )}
            </p>
            {CATEGORIES.map((category) => {
              const places = reach.placesInReach.filter((p) => p.category === category);
              return (
                <section key={category} id={`list-${category}`} aria-label={CATEGORY_LABELS[category]}>
                  <h4>
                    {CATEGORY_LABELS[category]} ({places.length})
                  </h4>
                  {places.length === 0 ? (
                    <p>No known {CATEGORY_LABELS[category].toLowerCase()} places inside this boundary.</p>
                  ) : (
                    <ul>
                      {places.map((place) => (
                        <li key={place.id}>
                          <strong>{place.name}</strong> — {place.kind}, about {place.metres} metres.{" "}
                          <ConfidenceBadge label={place.confidence} meta={`${place.source} · ${place.retrieved}`} />
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
            <p className="field-help">Preview geometry on the map mirrors these numbers exactly (A07).</p>
          </div>
        }
      />
    </>
  );
}
