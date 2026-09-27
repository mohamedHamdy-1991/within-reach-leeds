import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePanelDock, MinimiseButton } from "../components/GlassPanel";
import { ConfidenceBadge, EmptyState, LoadingState, SafetyNotice } from "@within-reach/design-system";
import { useApp } from "../state/app";
import { useMapController, placePopup } from "../state/map";
import { fetchPlaces } from "../api/client";
import type { PlaceDto } from "../api/types";
import { usePlacesOnMap } from "./Home";
import { PlacePhoto } from "../components/PlacePhoto";

const NEEDS: { id: string; label: string; category: string | null; kind?: string; hint: string }[] = [
  { id: "toilet", label: "Toilet", category: "essentials", hint: "Publicly accessible toilets in the release" },
  { id: "changing", label: "Changing Places", category: "essentials", kind: "Changing Places toilet", hint: "Registered Changing Places (Feb 2019 council register)" },
  { id: "safe", label: "Safe Place", category: "support", kind: "Safe Place", hint: "Council Safe Places register (Feb 2019)" },
  { id: "seat", label: "Seat", category: "wellbeing", hint: "Benches and resting places" },
  { id: "green", label: "Green space", category: "wellbeing", kind: "Green space", hint: "Publicly accessible green spaces (PhD OGL outputs)" },
  { id: "pharmacy", label: "Pharmacy", category: "essentials", hint: "Pharmacies known to the release" },
  { id: "community", label: "Community hub", category: "community", hint: "Libraries and community centres" },
  { id: "support", label: "Support and health", category: "support", hint: "Police, health and social facilities" },
];

export function FindNeed() {
  const { origin, dataStatus, announce } = useApp();
  const ctl = useMapController();
  const navigate = useNavigate();
  const { minimized: panelMinimized } = usePanelDock("find-panel", "I need something");
  const [need, setNeed] = useState<string | null>(null);
  const [places, setPlacesState] = useState<PlaceDto[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  usePlacesOnMap(places);

  const effectiveOrigin = origin ?? { label: "Park Square, Leeds (example)", latitude: 53.8008, longitude: -1.5491 };

  useEffect(() => {
    ctl.clearOverlays(["origin", "rings", "personal", "routes"]);
    ctl.setOrigin([effectiveOrigin.longitude, effectiveOrigin.latitude]);
  }, []);

  useEffect(() => {
    if (!need) return;
    const selected = NEEDS.find((n) => n.id === need);
    setLoading(true);
    setError(null);
    fetchPlaces(effectiveOrigin.latitude, effectiveOrigin.longitude, selected?.category ?? null, 15, selected?.kind)
      .then((results) => {
        setPlacesState(results);
        announce(`${results.length} known places found`);
      })
      .catch((exc: Error) => {
        setError(exc.message);
        setPlacesState([]);
      })
      .finally(() => setLoading(false));
  }, [need]);

  useEffect(() => {
    ctl.setTextOverlay(
      places ? (
        <ol>
          {places.map((place) => (
            <li key={place.external_id}>
              <strong>{place.name}</strong> — {place.kind}
              {place.metres !== undefined ? `, about ${Math.round(place.metres)} m` : ""}.{" "}
              <ConfidenceBadge label={place.confidence} meta={`${place.source_id} · ${place.retrieved_at}`} />
            </li>
          ))}
        </ol>
      ) : (
        <p>Choose a need to see the nearest known places.</p>
      ),
    );
  }, [places]);

  if (panelMinimized) return null;
  return (
    <section className="control-panel panel-right" aria-labelledby="find-title">
      <div className="panel-bar">
        <button className="back-button" type="button" onClick={() => navigate("/")}>← Back</button>
        <strong id="find-title">I need something</strong>
        <MinimiseButton id="find-panel" title="I need something" />
      </div>
      <div className="glass-panel__body">
        <p className="lead" style={{ marginTop: 0 }}>
          Starting from <strong>{effectiveOrigin.label}</strong>. Results are the nearest KNOWN places —
          we never invent one. Click a row to open it on the map.
        </p>

        <div className="task-list find-needs" role="group" aria-label="Choose what you need">
          {NEEDS.map((item) => (
            <button key={item.id} className="task" type="button" aria-pressed={need === item.id} onClick={() => setNeed(item.id)}>
              <span>
                <strong>{item.label}</strong>
                <small>{item.hint}</small>
              </span>
            </button>
          ))}
        </div>

        {need && loading && <LoadingState message="Checking the data release" illustration={`${import.meta.env.BASE_URL}generated/loading-state.png`} />}

        {need && error && (
          <EmptyState
            message={`We couldn't check the data release (${error}). Nothing is shown rather than a guessed list.`}
            action={<button className="text-button" type="button" onClick={() => setNeed(null)}>Try again</button>}
          />
        )}

        {need && !loading && !error && places && places.length === 0 && (
          <EmptyState message="No known places of this kind inside 2 km of your starting point. That is an honest empty result, not an error." illustration={`${import.meta.env.BASE_URL}generated/empty-state.png`} />
        )}

        {need && !loading && !error && places && places.length > 0 && (
          <section aria-label="Nearest known places">
            <ol className="place-results">
              {places.map((place) => (
                <li key={place.external_id}>
                  <button
                    type="button"
                    className="place-row-button"
                    onClick={() => {
                      ctl.openPopup(placePopup(place));
                      announce(`${place.name} shown on the map`);
                    }}
                  >
                    <PlacePhoto name={place.name} kind={place.kind} />
                    <span className="place-row-main">
                      <strong>{place.name}</strong>
                      <small>
                        {place.kind}
                        {place.metres !== undefined ? ` · ${Math.round(place.metres)} m` : ""}
                      </small>
                      <small className="place-row-meta">{place.source_id} · {place.retrieved_at}</small>
                    </span>
                    <span className={`place-conf place-conf--${place.confidence}`}>{place.confidence}</span>
                  </button>
                </li>
              ))}
            </ol>
            <SafetyNotice title="Before you set out">
              Opening hours and current status are not in the active release. Check before travelling.
              {dataStatus.dataReleaseId ? ` Data releases: ${dataStatus.dataReleaseId}.` : ""}
            </SafetyNotice>
          </section>
        )}
      </div>
    </section>
  );
}
