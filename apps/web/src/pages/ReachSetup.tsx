import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../state/app";
import { SYNTHETIC_ORIGIN } from "../fixtures/synthetic";

const TIME_OPTIONS = [5, 10, 15, 20, 30] as const;

export function ReachSetup() {
  const { origin, setOrigin, preferences, announce } = useApp();
  const navigate = useNavigate();
  const [minutes, setMinutes] = useState(20);

  const summary = [
    preferences.speed === "slow" ? "steady pace" : preferences.speed === "fast" ? "brisk pace" : "comfortable pace",
    preferences.steps === "avoid_completely" ? "steps avoided completely" : preferences.steps === "avoid_where_possible" ? "steps avoided where possible" : "steps fine",
    preferences.maxContinuousMinutes === "none" ? null : `rest within ${preferences.maxContinuousMinutes} minutes`,
  ].filter(Boolean) as string[];

  return (
    <div className="page-sheet">
      <div className="page-sheet-head">
        <button className="back-button" type="button" onClick={() => navigate("/")}>
          ← Back
        </button>
        <span className="panel-step">My reach</span>
      </div>
      <h1>Where can I go?</h1>
      <p className="lead">
        Choose a time. Your journey preferences will shape a different reachable area.
      </p>

      <fieldset className="pref-group">
        <legend>Starting point</legend>
        {origin ? (
          <p className="origin-summary">
            Starting from <strong>{origin.label}</strong>
            {origin.isDeviceLocation ? " (this session only)" : ""}.{" "}
            <button className="text-button" type="button" onClick={() => navigate("/")}>
              Change
            </button>
          </p>
        ) : (
          <div className="inline-warning">
            <strong>No starting point yet.</strong>
            <br />
            Set a place or postcode on the map screen, or try the example place.
            <br />
            <button
              className="text-button"
              type="button"
              onClick={() => {
                setOrigin({ ...SYNTHETIC_ORIGIN, label: "Park Square, Leeds (example)" });
                announce("Example starting point set");
              }}
            >
              Use the example place
            </button>
          </div>
        )}
      </fieldset>

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

      <fieldset className="pref-group">
        <legend>Your preferences</legend>
        <p className="origin-summary">{summary.join(", ")}.{" "}
          <Link to="/preferences">Change preferences</Link>
        </p>
      </fieldset>

      <button
        className="primary"
        type="button"
        disabled={!origin}
        onClick={() => navigate("/reach/results")}
        title={origin ? undefined : "Set a starting point first"}
      >
        Show my reach
      </button>
      {!origin && (
        <p className="field-help">
          The button is off because there is no starting point yet — that is the only reason.
        </p>
      )}
    </div>
  );
}
