import { useNavigate } from "react-router-dom";
import { useApp } from "../state/app";
import { SYNTHETIC_ORIGIN } from "../fixtures/synthetic";
import { MapCanvas } from "../components/MapCanvas";

const TASKS = [
  { to: "/reach", strong: "Where can I go?", small: "See your comfortable reach.", icon: <><path d="M12 4C22 2 29 9 28 17s-7 12-16 11C4 27 2 21 4 14S5 5 12 4Z" /><path d="M13 10c6-1 10 3 9 8s-4 7-9 7-8-4-7-8 2-7 7-7Z" /><circle cx="14" cy="17" r="2" /></> },
  { to: "/route", strong: "Take me there", small: "Compare fastest and easier routes.", icon: <><circle cx="7" cy="25" r="3" /><circle cx="25" cy="7" r="3" /><path d="M9 23c2-7 5-3 8-9 2-4 3-6 6-6" /></> },
  { to: "/find", strong: "I need something", small: "Find toilets, seats and services.", icon: <><circle cx="14" cy="14" r="8" /><path d="m20 20 7 7M14 10v8M10 14h8" /></> },
  { to: "/parks", strong: "Find a park", small: "Match green space to what matters.", icon: <><path d="M16 29V13M16 15 9 22M16 18l7 6M7 19c-4-5 1-10 5-8-1-7 9-9 11-3 6-1 8 7 4 10" /></> },
] as const;

export function Home() {
  const { dataStatus, origin, setOrigin, announce } = useApp();
  const navigate = useNavigate();

  const requestLocation = () => {
    if (!("geolocation" in navigator)) {
      announce("This browser does not provide location. Enter a place or postcode instead.");
      return;
    }
    announce("Waiting for location permission");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setOrigin({
          label: "Current location",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          isDeviceLocation: true,
        });
        announce("Location ready for this session. It has not been saved.");
      },
      () => announce("Location is off. Enter a place or postcode instead."),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
    );
  };

  const submitPlace = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const value = (new FormData(form).get("place") as string | null)?.trim();
    if (!value) {
      announce("Enter a place or postcode first.");
      return;
    }
    // Phase 2 uses a bounded synthetic geocoder; the server-side proxy arrives in Phase 4.
    setOrigin({ ...SYNTHETIC_ORIGIN, label: value });
    announce(`${value} set as your starting point (preview geocoder).`);
    navigate("/reach");
  };

  return (
    <>
      <section className="control-panel" aria-labelledby="page-title" tabIndex={0}>
        <div className="intro">
          <h1 id="page-title">Explore Leeds</h1>
          <p>Choose a journey task while the map stays in view.</p>
        </div>

        <form className="place-form" onSubmit={submitPlace}>
          <label htmlFor="place">Start from a place or postcode</label>
          <div className="input-row">
            <input id="place" name="place" type="search" autoComplete="postal-code" placeholder="For example, LS1 3AD" defaultValue={origin && !origin.isDeviceLocation ? origin.label : ""} />
            <button className="icon-button" type="button" aria-label="Use my current location" title="Use my current location" onClick={requestLocation}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /><circle cx="12" cy="12" r="2" /></svg>
            </button>
          </div>
          <p className="field-help">Location is used for this session only. You can always type a place instead.</p>
        </form>

        <div className="task-list" aria-label="Choose what you want to do">
          {TASKS.map((task) => (
            <button
              key={task.to}
              className="task"
              type="button"
              onClick={() => {
                navigate(task.to);
              }}
            >
              <svg viewBox="0 0 32 32" aria-hidden="true">{task.icon}</svg>
              <span>
                <strong>{task.strong}</strong>
                <small>{task.small}</small>
              </span>
              <span className="arrow" aria-hidden="true">→</span>
            </button>
          ))}
        </div>

        <div className="data-note" id="data-note">
          <span className="status-dot" aria-hidden="true"></span>
          <p>
            <strong>
              {dataStatus.mode === "live"
                ? "Live API connected"
                : dataStatus.mode === "source-register"
                  ? "Leeds source register loaded"
                  : "Data status unavailable"}
            </strong>
            <span>
              {dataStatus.mode === "live"
                ? `Data release ${dataStatus.dataReleaseId ?? "pending"}`
                : dataStatus.mode === "source-register"
                  ? "No validated live accessibility release is active yet."
                  : "The interface remains available. Try again later."}
            </span>
          </p>
          <button className="text-button" type="button" onClick={() => navigate("/confidence")}>
            About the data
          </button>
        </div>
      </section>

      <MapHomeSection />
    </>
  );
}

function MapHomeSection() {
  const { dataStatus } = useApp();
  return (
    <MapCanvas
      mode="reach"
      textEquivalent={
        <dl>
          <div>
            <dt>Standard reach</dt>
            <dd>Illustrative outline</dd>
          </div>
          <div>
            <dt>Your reach</dt>
            <dd>Illustrative comfortable area</dd>
          </div>
          <div>
            <dt>Sources</dt>
            <dd>
              {dataStatus.mode === "unavailable"
                ? "Data status unavailable — the interface remains usable."
                : `${dataStatus.sources.length} registered sources; no live accessibility release yet.`}
            </dd>
          </div>
        </dl>
      }
    />
  );
}
