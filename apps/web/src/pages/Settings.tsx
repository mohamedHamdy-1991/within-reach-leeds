import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../state/app";

export function Settings() {
  const { preferences, resetPreferences, announce } = useApp();
  const navigate = useNavigate();
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

  return (
    <div className="page-sheet">
      <div className="page-sheet-head">
        <button className="back-button" type="button" onClick={() => navigate("/")}>← Back</button>
        <span className="panel-step">Settings</span>
      </div>
      <h1>Settings</h1>

      <section className="pref-group" aria-labelledby="settings-prefs">
        <h2 id="settings-prefs">Journey preferences</h2>
        <p>
          Currently set: {preferences.speed} pace, {preferences.steps.replaceAll("_", " ")}.{" "}
          <button className="text-button" type="button" onClick={() => navigate("/preferences")}>
            Edit preferences
          </button>
        </p>
      </section>

      <section className="pref-group" aria-labelledby="settings-location">
        <h2 id="settings-location">Location permission</h2>
        <p>
          Browser reports: <strong>{permission}</strong>. To change it, use your browser's site settings —
          look for Location while viewing this page. Denying location keeps every task available through
          place and postcode entry.
        </p>
      </section>

      <section className="pref-group" aria-labelledby="settings-recent">
        <h2 id="settings-recent">Recent places</h2>
        <label className="choice">
          <input type="checkbox" checked={recentPlaces} onChange={(e) => setRecentPlaces(e.target.checked)} />
          <span>
            <strong>Remember recent places on this device</strong>
            <small>Off by default. Nothing is remembered unless you turn this on.</small>
          </span>
        </label>
      </section>

      <section className="pref-group" aria-labelledby="settings-analytics">
        <h2 id="settings-analytics">Analytics</h2>
        <p>
          This build contains no analytics and sends no usage data. When analytics are considered, they
          will be off by default and will never include precise coordinates, addresses or preference
          combinations.
        </p>
      </section>

      <section className="pref-group" aria-labelledby="settings-contrast">
        <h2 id="settings-contrast">High contrast</h2>
        <p>Use the High contrast button in the side menu.</p>
      </section>

      <section className="pref-group" aria-labelledby="settings-delete">
        <h2 id="settings-delete">Your data</h2>
        <button type="button" onClick={deleteLocalData}>Delete local data</button>
        <p className="field-help">Removes preferences and any session data stored on this device.</p>
      </section>
    </div>
  );
}
