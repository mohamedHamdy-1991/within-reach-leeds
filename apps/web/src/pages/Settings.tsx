import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { usePanelDock, MinimiseButton } from "../components/GlassPanel";
import { useApp } from "../state/app";

const CARD: CSSProperties = {
  border: "1px solid var(--rule)",
  borderRadius: "12px",
  padding: "14px 16px",
  margin: "0 0 14px",
  background: "var(--surface)",
};

function SlidersMark() {
  return (
    <svg width="40" height="40" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <line x1="8" y1="13" x2="40" y2="13" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="8" y1="24" x2="40" y2="24" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="8" y1="35" x2="40" y2="35" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="31" cy="13" r="5" fill="var(--blue)" stroke="var(--surface)" strokeWidth="2" />
      <circle cx="16" cy="24" r="5" fill="var(--signal)" stroke="var(--surface)" strokeWidth="2" />
      <circle cx="26" cy="35" r="5" fill="var(--ink)" stroke="var(--surface)" strokeWidth="2" />
    </svg>
  );
}

export function Settings() {
  const { preferences, resetPreferences, announce } = useApp();
  const navigate = useNavigate();
  const { minimized: panelMinimized } = usePanelDock("settings-panel", "Settings");
  const [permission, setPermission] = useState<string>("unknown");
  const [recentPlaces, setRecentPlaces] = useState(false);

  useEffect(() => {
    if ("permissions" in navigator && navigator.permissions?.query) {
      navigator.permissions
        .query({ name: "geolocation" as PermissionName })
        .then((status) => setPermission(status.state))
        .catch(() => setPermission("unknown"));
    }
  }, []);

  const deleteLocalData = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
    resetPreferences();
    announce("Local data deleted. Preferences are back to defaults.");
  };

  if (panelMinimized) return null;
  return (
    <section className="control-panel panel-right doc-panel" aria-labelledby="settings-title">
      <div className="page-sheet-head">
        <button className="back-button" type="button" onClick={() => navigate("/")}>← Back</button>
        <span className="panel-step">Settings</span>
        <MinimiseButton id="settings-panel" title="Settings" />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "4px 0 14px" }}>
        <span
          aria-hidden="true"
          style={{
            flex: "none",
            width: 56,
            height: 56,
            display: "grid",
            placeItems: "center",
            borderRadius: "12px",
            background: "var(--signal-pale)",
            border: "1px solid var(--rule)",
          }}
        >
          <SlidersMark />
        </span>
        <h1 style={{ margin: 0 }}>Settings</h1>
      </div>

      <section className="pref-group" aria-labelledby="settings-prefs" style={CARD}>
        <h2 id="settings-prefs">Journey preferences</h2>
        <p>
          Currently set: {preferences.speed} pace, {preferences.steps.replaceAll("_", " ")}.{" "}
          <button className="text-button" type="button" onClick={() => navigate("/preferences")}>
            Edit preferences
          </button>
        </p>
      </section>

      <section className="pref-group" aria-labelledby="settings-location" style={CARD}>
        <h2 id="settings-location">Location permission</h2>
        <p>
          Browser reports: <strong>{permission}</strong>. To change it, use your browser's site settings —
          look for Location while viewing this page. Denying location keeps every task available through
          place and postcode entry.
        </p>
      </section>

      <section className="pref-group" aria-labelledby="settings-recent" style={CARD}>
        <h2 id="settings-recent">Recent places</h2>
        <label className="choice">
          <input type="checkbox" checked={recentPlaces} onChange={(e) => setRecentPlaces(e.target.checked)} />
          <span>
            <strong>Remember recent places on this device</strong>
            <small>Off by default. Nothing is remembered unless you turn this on.</small>
          </span>
        </label>
      </section>

      <section className="pref-group" aria-labelledby="settings-analytics" style={CARD}>
        <h2 id="settings-analytics">Analytics</h2>
        <p>
          This build contains no analytics and sends no usage data. When analytics are considered, they
          will be off by default and will never include precise coordinates, addresses or preference
          combinations.
        </p>
      </section>

      <section className="pref-group" aria-labelledby="settings-contrast" style={CARD}>
        <h2 id="settings-contrast">High contrast</h2>
        <p>Use the High contrast button in the side menu.</p>
      </section>

      <section className="pref-group" aria-labelledby="settings-delete" style={CARD}>
        <h2 id="settings-delete">Your data</h2>
        <button type="button" onClick={deleteLocalData}>Delete local data</button>
        <p className="field-help">Removes preferences and any session data stored on this device.</p>
      </section>
    </section>
  );
}
