import { useNavigate } from "react-router-dom";
import { useApp } from "../state/app";

export function About() {
  const { dataStatus } = useApp();
  const navigate = useNavigate();

  return (
    <div className="page-sheet">
      <div className="page-sheet-head">
        <button className="back-button" type="button" onClick={() => navigate("/")}>← Back</button>
        <span className="panel-step">About</span>
      </div>
      <h1>About data, privacy and accessibility</h1>

      <section aria-labelledby="about-sources">
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

      <section aria-labelledby="about-privacy">
        <h2 id="about-privacy">Privacy</h2>
        <p>
          No account. Preferences stay on this device. Location is requested only after "Use my location"
          and is used for the session only. No precise coordinates, addresses or preference combinations
          are logged or shared.
        </p>
      </section>

      <section aria-labelledby="about-accessibility">
        <h2 id="about-accessibility">Accessibility</h2>
        <p>
          This interface targets WCAG 2.2 AA: keyboard operation, visible focus, screen-reader semantics,
          200% text resize, reduced motion, and a text equivalent for every map view. Report problems
          using the contact below.
        </p>
      </section>

      <section aria-labelledby="about-contact">
        <h2 id="about-contact">Contact</h2>
        <p className="inline-warning">
          Contact details are pending. AUTHOR_DECISION_REQUIRED — the product owner must supply a legal
          entity, contact email and privacy-controller identity before public launch.
        </p>
      </section>

      <section aria-labelledby="about-limits">
        <h2 id="about-limits">Known limitations</h2>
        <ul>
          <li>No live accessibility release is active; map geometry is a labelled preview.</li>
          <li>The legacy Leeds public-toilet dataset is prohibited as current and is never shown.</li>
          <li>Route results are planning assistance, not a guarantee of safety or accessibility.</li>
        </ul>
      </section>
    </div>
  );
}
