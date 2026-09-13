import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePanelDock, MinimiseButton } from "../components/GlassPanel";
import type { Preferences } from "../state/app";
import { DEFAULT_PREFERENCES, useApp } from "../state/app";

/** Presets prefill but never lock; they never imply medical suitability. */
const PRESETS: { id: string; label: string; partial: Partial<Preferences> }[] = [
  { id: "wheelchair", label: "Wheelchair", partial: { steps: "avoid_completely", hills: "prefer_flatter", surface: "prefer_firm_smooth", speed: "comfortable" } },
  { id: "stamina", label: "Limited stamina", partial: { maxContinuousMinutes: 10, hills: "prefer_flatter", speed: "slow" } },
  { id: "pushchair", label: "Pushchair", partial: { steps: "avoid_where_possible", surface: "prefer_firm_smooth" } },
  { id: "easy", label: "Easy journey", partial: { steps: "avoid_where_possible", hills: "prefer_flatter", maxContinuousMinutes: 20 } },
];

export function Preferences() {
  const { preferences, setPreferences, resetPreferences, announce } = useApp();
  const navigate = useNavigate();
  const { minimized: panelMinimized } = usePanelDock("prefs-panel", "Preferences");
  const [draft, setDraft] = useState<Preferences>(preferences);

  const update = (partial: Partial<Preferences>) => setDraft((d) => ({ ...d, ...partial }));

  if (panelMinimized) return null;
  return (
    <section className="control-panel panel-right doc-panel" aria-labelledby="prefs-title">
      <div className="page-sheet-head">
        <button className="back-button" type="button" onClick={() => navigate("/")}>
          ← Back
        </button>
        <span className="panel-step">Journey choices</span>
        <MinimiseButton id="prefs-panel" title="Preferences" />
      </div>
      <h1>How do you like to move?</h1>
      <p className="lead">
        These are journey choices, not medical questions. They stay on this device.
      </p>

      <fieldset className="pref-group">
        <legend>Preset (optional)</legend>
        <div className="preset-row">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className="preset-chip"
              onClick={() => {
                update(preset.partial);
                announce(`${preset.label} preset applied — adjust anything you like.`);
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <p className="field-help">A preset fills in starting values. Nothing is locked in.</p>
      </fieldset>

      <fieldset className="pref-group">
        <legend>Walking or wheeling speed</legend>
        {(
          [
            ["slow", "Steady and unhurried", "Shorter reach; more time for hills and crossings"],
            ["comfortable", "Comfortable", "Your everyday speed"],
            ["fast", "Brisk", "Longer reach than average"],
          ] as const
        ).map(([value, label, effect]) => (
          <label className="choice" key={value}>
            <input
              type="radio"
              name="speed"
              checked={draft.speed === value}
              onChange={() => update({ speed: value })}
            />
            <span>
              <strong>{label}</strong>
              <small>{effect}</small>
            </span>
          </label>
        ))}
      </fieldset>

      <fieldset className="pref-group">
        <legend>Maximum continuous movement</legend>
        {([5, 10, 20, "none"] as const).map((value) => (
          <label className="choice" key={String(value)}>
            <input
              type="radio"
              name="max-continuous"
              checked={draft.maxContinuousMinutes === value}
              onChange={() => update({ maxContinuousMinutes: value })}
            />
            <span>
              <strong>{value === "none" ? "No preference" : `${value} minutes`}</strong>
              <small>
                {value === "none"
                  ? "We will not shorten journeys for continuous movement"
                  : `We will look for rest opportunities within ${value} minutes`}
              </small>
            </span>
          </label>
        ))}
      </fieldset>

      <fieldset className="pref-group">
        <legend>Steps</legend>
        {(
          [
            ["avoid_completely", "Avoid completely", "Known steps will never be used in your routes"],
            ["avoid_where_possible", "Avoid where possible", "Known steps add cost so easier ways come first"],
            ["fine", "Fine", "Steps do not change the route cost"],
          ] as const
        ).map(([value, label, effect]) => (
          <label className="choice" key={value}>
            <input type="radio" name="steps" checked={draft.steps === value} onChange={() => update({ steps: value })} />
            <span>
              <strong>{label}</strong>
              <small>{effect}</small>
            </span>
          </label>
        ))}
        <p className="field-help">When we don't know whether a path has steps, we say so — we never assume it is step-free.</p>
      </fieldset>

      <fieldset className="pref-group">
        <legend>Hills</legend>
        {(
          [
            ["prefer_flatter", "Prefer flatter", "Estimated hills add route cost"],
            ["moderate_ok", "Moderate is fine", "Only steep hills add cost"],
            ["no_preference", "No preference", "Hills do not change the route cost"],
          ] as const
        ).map(([value, label, effect]) => (
          <label className="choice" key={value}>
            <input type="radio" name="hills" checked={draft.hills === value} onChange={() => update({ hills: value })} />
            <span>
              <strong>{label}</strong>
              <small>{effect}</small>
            </span>
          </label>
        ))}
      </fieldset>

      <fieldset className="pref-group">
        <legend>Journey extras</legend>
        <label className="choice">
          <input type="checkbox" checked={draft.controlledCrossings} onChange={(e) => update({ controlledCrossings: e.target.checked })} />
          <span>
            <strong>Prefer controlled crossings</strong>
            <small>Uncontrolled or unknown crossings add route cost</small>
          </span>
        </label>
        <label className="choice">
          <input type="checkbox" checked={draft.surface === "prefer_firm_smooth"} onChange={(e) => update({ surface: e.target.checked ? "prefer_firm_smooth" : "no_preference" })} />
          <span>
            <strong>Firm, smooth surfaces matter</strong>
            <small>Unknown or rough surfaces add route cost</small>
          </span>
        </label>
        <label className="choice">
          <input type="checkbox" checked={draft.accessibleToilet} onChange={(e) => update({ accessibleToilet: e.target.checked })} />
          <span>
            <strong>Accessible toilet is important</strong>
            <small>Show known facilities along the journey</small>
          </span>
        </label>
        <label className="choice">
          <input type="checkbox" checked={draft.changingPlaces} onChange={(e) => update({ changingPlaces: e.target.checked })} />
          <span>
            <strong>Changing Places toilet required</strong>
            <small>Only verified Changing Places will satisfy this filter</small>
          </span>
        </label>
      </fieldset>

      <div className="actions-row">
        <button
          className="primary"
          type="button"
          onClick={() => {
            setPreferences(draft);
            announce("Journey preferences saved on this device");
            navigate("/");
          }}
        >
          Save preferences
        </button>
        <button
          type="button"
          onClick={() => {
            setDraft(DEFAULT_PREFERENCES);
            resetPreferences();
            announce("Preferences reset to defaults");
          }}
        >
          Reset
        </button>
      </div>
    </section>
  );
}
