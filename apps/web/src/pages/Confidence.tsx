import { useNavigate } from "react-router-dom";
import { useApp } from "../state/app";

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

  return (
    <div className="page-sheet">
      <div className="page-sheet-head">
        <button className="back-button" type="button" onClick={() => navigate("/")}>← Back</button>
        <span className="panel-step">About data</span>
      </div>
      <h1>What the data can tell you</h1>
      <p className="lead">
        Source authority, freshness, completeness and field specificity are separate things. A recent
        source can still lack the field you need.
      </p>

      <section aria-labelledby="confidence-labels">
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

      <section aria-labelledby="register-heading">
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

      <p>
        Full source details, licences and limitations: <a href="/about">About data, privacy and accessibility</a>.
      </p>
    </div>
  );
}
