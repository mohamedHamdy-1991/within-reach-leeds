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

function ConfidenceMark() {
  return (
    <svg width="40" height="40" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path
        d="M24 6c9.5-1.4 17.5 5.4 17.6 15.2.1 10.8-6.6 19.4-17.4 20.6C14 42.9 6.6 35.5 6.4 25.4 6.2 15 14.2 7.5 24 6Z"
        fill="none"
        stroke="var(--signal)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="5 6"
      />
      <circle cx="24" cy="24" r="13" fill="var(--ink)" />
      <circle cx="24" cy="18.6" r="2.4" fill="var(--paper)" />
      <rect x="22.3" y="22.4" width="3.4" height="10" rx="1.7" fill="var(--paper)" />
    </svg>
  );
}

const LABELS: { id: string; title: string; body: string }[] = [
  { id: "verified", title: "Verified", body: "Checked against the data owner's own records or a site visit recorded in the register." },
  { id: "mapped", title: "Mapped", body: "Present in a source we trust for this field, but not individually checked." },
  { id: "community_verified", title: "Community verified (reserved for V2)", body: "Confirmed by local people through a structured process. Not active in V1." },
  { id: "inferred", title: "Inferred", body: "Estimated by a documented method, such as DEM-derived gradient. Always labelled as an estimate." },
  { id: "unknown", title: "Unknown", body: "We do not know. Unknown never means accessible, and it is never shown as suitable." },
];

export function Confidence() {
  const { dataStatus } = useApp();
  const navigate = useNavigate();
  const { minimized: panelMinimized } = usePanelDock("confidence-panel", "About data");

  if (panelMinimized) return null;
  return (
    <section className="control-panel panel-right doc-panel" aria-labelledby="conf-title">
      <div className="page-sheet-head">
        <button className="back-button" type="button" onClick={() => navigate("/")}>← Back</button>
        <span className="panel-step">About data</span>
        <MinimiseButton id="confidence-panel" title="About data" />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "4px 0 12px" }}>
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
          <ConfidenceMark />
        </span>
        <h1 style={{ margin: 0 }}>What the data can tell you</h1>
      </div>
      <p className="lead">
        Source authority, freshness, completeness and field specificity are separate things. A recent
        source can still lack the field you need.
      </p>

      <section aria-labelledby="confidence-labels" style={CARD}>
        <h2 id="confidence-labels">Confidence labels</h2>
        <dl className="confidence-definitions">
          {LABELS.map((label) => (
            <div key={label.id}>
              <dt><strong>{label.title}</strong></dt>
              <dd>{label.body}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="register-heading" style={CARD}>
        <h2 id="register-heading">Leeds source register</h2>
        <p className="field-help">
          Status as loaded {dataStatus.mode === "live" ? "from the live API" : "from the local register (no live release active)"}.
        </p>
        <ul className="source-list">
          {dataStatus.sources.map((source) => (
            <li key={source.id}>
              <span>
                <strong>{source.label}</strong>
                <small>{source.status.replaceAll("_", " ")}</small>
              </span>
              <span className={`badge ${source.status.includes("prohibited") ? "blocked" : source.status.includes("quarantined") || source.status.includes("stale") ? "caution" : "candidate"}`}>
                {source.confidence}
              </span>
            </li>
          ))}
        </ul>
        <div className="inline-warning">
          Old official data is not automatically current. Quarantined sources cannot appear in live results.
        </div>
      </section>

      <p style={{ margin: "0 2px 4px" }}>
        Full source details, licences and limitations: <a href="/about">About data, privacy and accessibility</a>.
      </p>
    </section>
  );
}
