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

function LayersMark() {
  return (
    <svg width="40" height="40" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <rect x="12" y="6.5" width="28" height="11" rx="3.5" fill="var(--paper)" stroke="var(--ink)" strokeWidth="2" />
      <rect x="9" y="18" width="28" height="11" rx="3.5" fill="var(--blue)" stroke="var(--ink)" strokeWidth="2" />
      <rect x="6" y="29.5" width="28" height="11" rx="3.5" fill="var(--signal)" stroke="var(--ink)" strokeWidth="2" />
    </svg>
  );
}

export function About() {
  const { dataStatus } = useApp();
  const navigate = useNavigate();
  const { minimized: panelMinimized } = usePanelDock("about-panel", "About");

  if (panelMinimized) return null;
  return (
    <section className="control-panel panel-right doc-panel" aria-labelledby="about-title">
      <div className="page-sheet-head">
        <button className="back-button" type="button" onClick={() => navigate("/")}>← Back</button>
        <span className="panel-step">About</span>
        <MinimiseButton id="about-panel" title="About" />
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
          <LayersMark />
        </span>
        <h1 style={{ margin: 0 }}>About data, privacy and accessibility</h1>
      </div>

      <section aria-labelledby="about-sources" style={CARD}>
        <h2 id="about-sources">Sources and licences</h2>
        <ul className="source-list">
          {dataStatus.sources.map((source) => (
            <li key={source.id}>
              <span>
                <strong>{source.label}</strong>
                <small>status: {source.status.replaceAll("_", " ")}</small>
              </span>
            </li>
          ))}
        </ul>
        <p className="field-help">
          Map and routing data: © OpenStreetMap contributors, ODbL 1.0 — attribution required and
          given. Council and Ordnance Survey sources carry their own Open Government Licence
          statements. Full register: docs/05_DATA_SOURCE_REGISTER.md in the repository.
        </p>
        <p className="field-help">
          Routing engine: Valhalla. Map tiles in the interface preview are synthetic; production maps
          will use permitted PMTiles with the same attribution.
        </p>
      </section>

      <section aria-labelledby="about-privacy" style={CARD}>
        <h2 id="about-privacy">Privacy</h2>
        <p>
          No account. Preferences stay on this device. Location is requested only after "Use my location"
          and is used for the session only. No precise coordinates, addresses or preference combinations
          are logged or shared.
        </p>
      </section>

      <section aria-labelledby="about-accessibility" style={CARD}>
        <h2 id="about-accessibility">Accessibility</h2>
        <p>
          This interface targets WCAG 2.2 AA: keyboard operation, visible focus, screen-reader semantics,
          200% text resize, reduced motion, and a text equivalent for every map view. Report problems
          using the contact below.
        </p>
      </section>

      <section aria-labelledby="about-contact" style={CARD}>
        <h2 id="about-contact">Contact</h2>
        <p className="inline-warning">
          Contact details are pending. AUTHOR_DECISION_REQUIRED — the product owner must supply a legal
          entity, contact email and privacy-controller identity before public launch.
        </p>
      </section>

      <section aria-labelledby="about-limits" style={CARD}>
        <h2 id="about-limits">Known limitations</h2>
        <ul>
          <li>No live accessibility release is active; map geometry is a labelled preview.</li>
          <li>The legacy Leeds public-toilet dataset is prohibited as current and is never shown.</li>
          <li>Route results are planning assistance, not a guarantee of safety or accessibility.</li>
        </ul>
      </section>
    </section>
  );
}
