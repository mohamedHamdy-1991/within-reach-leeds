import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePanelDock, MinimiseButton } from "../components/GlassPanel";
import { ConfidenceBadge, SafetyNotice } from "@within-reach/design-system";
import { useApp, DEFAULT_PREFERENCES } from "../state/app";
import { useMapController } from "../state/map";
import { fetchReachRings, fetchPlaces } from "../api/client";
import { computeReach, CATEGORY_LABELS, type CategoryId } from "../fixtures/synthetic";
import { usePlacesOnMap, CATEGORY_COLORS } from "./Home";
import type { PlaceDto } from "../api/types";

const TIME_OPTIONS = [5, 10, 15, 20, 30] as const;
const RING_SET = [5, 10, 15, 20, 30];
const CATEGORIES: CategoryId[] = ["essentials", "community", "wellbeing", "support"];

type Tab = "plan" | "results" | "confidence";

export function ReachView({ initialTab = "plan" }: { initialTab?: Tab }) {
  const { origin, setOrigin, preferences, announce } = useApp();
  const ctl = useMapController();
  const navigate = useNavigate();
  const { minimized: panelMinimized } = usePanelDock("my-reach", "My Reach");
  const [tab, setTab] = useState<Tab>(initialTab);
  const [minutes, setMinutes] = useState(20);
  const [showHow, setShowHow] = useState(false);
  const [ringsError, setRingsError] = useState<string | null>(null);
  const [places, setPlacesState] = useState<PlaceDto[] | null>(null);
  const [hiddenCategories, setHiddenCategories] = useState<Set<CategoryId>>(new Set());
  const ringsKeyRef = useRef<string | null>(null);

  const reach = useMemo(() => computeReach(preferences, minutes), [preferences, minutes]);
  const effectiveOrigin = origin ?? { label: "Park Square, Leeds (example)", latitude: 53.8008, longitude: -1.5491 };

  usePlacesOnMap(
    places === null ? places : places.filter((place) => !hiddenCategories.has(place.category as CategoryId)),
  );

  // Real reach rings from the router (cached per origin) + personal ring.
  useEffect(() => {
    const key = `${effectiveOrigin.latitude},${effectiveOrigin.longitude}`;
    if (ringsKeyRef.current === key) return;
    ringsKeyRef.current = key;
    setRingsError(null);
    ctl.setOrigin([effectiveOrigin.longitude, effectiveOrigin.latitude]);
    fetchReachRings(effectiveOrigin.latitude, effectiveOrigin.longitude, RING_SET)
      .then(({ features }) => {
        const decorated = features.map((feature) => ({
          ...feature,
          properties: {
            ...(feature.properties ?? {}),
            opacity: [5, 10, 15, 20, 30].includes(Number(feature.properties?.contour)) ? 0.06 : 0.06,
            selected: Number(feature.properties?.contour) === minutes,
          },
        }));
        ctl.setRings(decorated);
        announce(`Reach rings drawn for ${RING_SET.join(", ")} minutes`);
      })
      .catch((error: Error) => setRingsError(error.message));
  }, [effectiveOrigin.latitude, effectiveOrigin.longitude]);

  // Re-emphasise the selected ring without refetching.
  useEffect(() => {
    ctl.setRings(
      ctl.rings.map((feature) => ({
        ...feature,
        properties: { ...(feature.properties ?? {}), selected: Number(feature.properties?.contour) === minutes },
      })),
    );
  }, [minutes]);

  useEffect(() => {
    fetchPlaces(effectiveOrigin.latitude, effectiveOrigin.longitude, null, 50)
      .then(setPlacesState)
      .catch(() => setPlacesState([]));
  }, [effectiveOrigin.latitude, effectiveOrigin.longitude]);

  // Personal comfortable ring (real isochrone at personal minutes).
  useEffect(() => {
    const personal = Math.max(1, Math.min(60, Math.round(reach.personalMinutes)));
    let cancelled = false;
    fetchReachRings(effectiveOrigin.latitude, effectiveOrigin.longitude, [personal])
      .then(({ features }) => {
        if (!cancelled) ctl.setPersonalRing(features);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [reach.personalMinutes, effectiveOrigin.latitude, effectiveOrigin.longitude]);

  const counts = useMemo(() => {
    const byCategory: Record<CategoryId, number> = { essentials: 0, community: 0, wellbeing: 0, support: 0 };
    for (const place of places ?? []) {
      const category = place.category as CategoryId;
      if (category in byCategory) byCategory[category] += 1;
    }
    return byCategory;
  }, [places]);

  const coveragePercent = reach.ratio > 0 ? Math.round(reach.ratio * 100) : 0;

  useEffect(() => {
    ctl.setTextOverlay(
      <div data-testid="reach-text-overlay">
        <p>
          <strong>Your comfortable reach</strong> is about {reach.personalMinutes} network minutes from{" "}
          {effectiveOrigin.label} — {coveragePercent}% of the standard {minutes}-minute time budget. Dashed
          rings show the standard {RING_SET.join("/")}-minute reaches; the solid yellow ring is your
          comfortable reach, drawn on the real walking network.
        </p>
        {CATEGORIES.map((category) => {
          const inCategory = (places ?? []).filter((place) => place.category === category);
          return (
            <section key={category} aria-label={CATEGORY_LABELS[category]}>
              <h4>
                {CATEGORY_LABELS[category]} ({inCategory.length})
              </h4>
              {inCategory.length === 0 ? (
                <p>No known {CATEGORY_LABELS[category].toLowerCase()} places near this starting point.</p>
              ) : (
                <ul>
                  {inCategory.map((place) => (
                    <li key={place.external_id}>
                      <strong>{place.name}</strong> — {place.kind}
                      {place.metres !== undefined ? `, about ${Math.round(place.metres)} metres` : ""}.{" "}
                      <ConfidenceBadge label={place.confidence} meta={`${place.source_id} · ${place.retrieved_at}`} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>,
    );
  }, [places, reach.personalMinutes, coveragePercent, minutes]);

  const summary = [
    preferences.speed === "slow" ? "steady pace" : preferences.speed === "fast" ? "brisk pace" : "comfortable pace",
    preferences.steps === "avoid_completely" ? "steps avoided completely" : preferences.steps === "avoid_where_possible" ? "steps avoided where possible" : "steps fine",
  ].join(", ");

  if (panelMinimized) return null;
  return (
    <section className={`control-panel${tab === "plan" ? "" : " panel-right"}`} aria-labelledby="reach-title">
      <div className="panel-bar">
        <button className="back-button" type="button" onClick={() => navigate("/")}>← Back</button>
        <strong id="reach-title">My Reach</strong>
        <MinimiseButton id="my-reach" title="My Reach" />
      </div>
      <div className="glass-panel__body">
        <div className="journey-tabs-live" role="tablist" aria-label="My Reach sections">
          {(
            [
              ["plan", "Plan"],
              ["results", "Results"],
              ["confidence", "Confidence"],
            ] as const
          ).map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </div>

        {tab === "plan" && (
          <div role="tabpanel">
            <h1 style={{ fontSize: "1.25rem", margin: "8px 0" }}>How far can you go?</h1>
            {origin ? (
              <p className="origin-summary">
                Starting from <strong>{origin.label}</strong>
                {origin.isDeviceLocation ? " (this session only)" : ""}.{" "}
                <button className="text-button" type="button" onClick={() => navigate("/")}>Change</button>
              </p>
            ) : (
              <div className="inline-warning">
                <strong>No starting point yet.</strong>
                <br />
                <button
                  className="text-button"
                  type="button"
                  onClick={() => {
                    navigate("/");
                  }}
                >
                  Set one on the home panel
                </button>{" "}
                or use the example:{" "}
                <button
                  className="text-button"
                  type="button"
                  onClick={() => {
                    setOrigin({ label: "Park Square, Leeds (example)", latitude: 53.8008, longitude: -1.5491 });
                    announce("Example starting point set");
                  }}
                >
                  use Park Square
                </button>
              </div>
            )}
            <fieldset className="pref-group">
              <legend>Travel time</legend>
              <div className="segmented" role="group" aria-label="Travel time">
                {TIME_OPTIONS.map((n) => (
                  <button key={n} type="button" aria-pressed={n === minutes} onClick={() => { setMinutes(n); announce(`${n} minutes selected`); }}>
                    {n}
                  </button>
                ))}
              </div>
            </fieldset>
            <p className="field-help">Your preferences: {summary}. <Link to="/preferences">Change preferences</Link></p>
            <button className="primary" type="button" disabled={!origin} onClick={() => { setTab("results"); announce("Results shown"); }}>
              Show my reach
            </button>
            {!origin && <p className="field-help">Disabled only because there is no starting point yet.</p>}
            {ringsError && <div className="inline-warning" role="alert">The router could not draw rings ({ringsError}). Nothing is shown rather than a guessed boundary.</div>}
          </div>
        )}

        {tab === "results" && (
          <div role="tabpanel" data-testid="reach-text-equivalent">
            <h1 style={{ fontSize: "1.25rem", margin: "8px 0" }}>
              {reach.personalMinutes} comfortable minutes from {effectiveOrigin.label}
            </h1>
            <p className="coverage-line">
              Your comfortable time budget is <strong>{coveragePercent}%</strong> of the standard{" "}
              {minutes}-minute walk. Solid yellow ring = you; dashed rings = standard {RING_SET.join("/")} minutes.
            </p>

            <fieldset className="pref-group">
              <legend>Emphasise a ring</legend>
              <div className="segmented" role="group" aria-label="Emphasised ring">
                {TIME_OPTIONS.map((n) => (
                  <button key={n} type="button" aria-pressed={n === minutes} onClick={() => { setMinutes(n); announce(`${n} minute ring emphasised`); }}>
                    {n}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="pref-group">
              <legend>Known places nearby (click a dot on the map)</legend>
              <div className="chip-row">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className="filter-chip"
                    aria-pressed={!hiddenCategories.has(category)}
                    onClick={() =>
                      setHiddenCategories((hidden) => {
                        const next = new Set(hidden);
                        if (next.has(category)) next.delete(category);
                        else next.add(category);
                        return next;
                      })
                    }
                  >
                    <i style={{ background: CATEGORY_COLORS[category] }} aria-hidden="true"></i>
                    {CATEGORY_LABELS[category]} ({counts[category]})
                  </button>
                ))}
              </div>
              <ol className="place-results">
                {(places ?? [])
                  .filter((place) => !hiddenCategories.has(place.category as CategoryId))
                  .slice(0, 12)
                  .map((place) => (
                    <li key={place.external_id}>
                      <button
                        type="button"
                        className="place-row-button"
                        onClick={() =>
                          ctl.openPopup({
                            longitude: place.longitude,
                            latitude: place.latitude,
                            title: place.name,
                            lines: [
                              place.metres !== undefined ? `${place.kind} · about ${Math.round(place.metres)} m` : place.kind,
                              `${place.confidence} — ${place.source_id} · ${place.retrieved_at}`,
                            ],
                          })
                        }
                      >
                        <span>
                          <strong>{place.name}</strong>
                          <small>{place.kind}{place.metres !== undefined ? ` · ~${Math.round(place.metres)} m` : ""}</small>
                        </span>
                        <ConfidenceBadge label={place.confidence} meta={`${place.source_id} · ${place.retrieved_at}`} />
                      </button>
                    </li>
                  ))}
              </ol>
              {places !== null && places.length === 0 && <p className="field-help">No known places near this starting point — an honest empty result.</p>}
            </fieldset>

            {ringsError && (
              <div className="inline-warning" role="alert">
                The router could not draw rings ({ringsError}). Nothing is shown rather than a guessed boundary.
              </div>
            )}
            <SafetyNotice title="Plan, don't navigate">
              Planning assistance, not a guarantee. Rings come from the real walking network; accessibility
              along them is not yet verified.
            </SafetyNotice>
          </div>
        )}

        {tab === "confidence" && (
          <div role="tabpanel">
            <h1 style={{ fontSize: "1.25rem", margin: "8px 0" }}>How this was calculated</h1>
            <button type="button" aria-expanded={showHow} onClick={() => setShowHow((v) => !v)}>
              {showHow ? "Hide the detail" : "Show the detail"}
            </button>
            {showHow && (
              <div className="how-detail">
                <p>
                  Standard rings: real isochrones on the walking network at {RING_SET.join("/")} minutes
                  (Valhalla router, release {`osm-west-yorkshire-2026-09-05-candidate`}).
                  Your comfortable ring: the same network at {reach.personalMinutes} minutes after your
                  preferences ({summary}).
                </p>
                <p>
                  Time-budget share: {coveragePercent}% of the standard {minutes}-minute budget. Area
                  percentages are only quoted when network coverage passes its validity check.
                </p>
                <p>Preferences: {summary}. <Link to="/preferences">Change preferences</Link></p>
              </div>
            )}
            <SafetyNotice title="Plan, don't navigate">
              This is planning assistance, not a guarantee of safety or accessibility. Conditions can
              change; check the route and surroundings before you set out.
            </SafetyNotice>
            <p className="field-help">Defaults: {DEFAULT_PREFERENCES.speed} pace.</p>
          </div>
        )}
      </div>
    </section>
  );
}
