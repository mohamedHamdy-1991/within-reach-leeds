import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReachPreferences } from "@within-reach/reach-engine";

export type Preferences = {
  speed: "slow" | "comfortable" | "fast";
  maxContinuousMinutes: 5 | 10 | 20 | "none";
  restIntervalMetres: number | null;
  steps: "avoid_completely" | "avoid_where_possible" | "fine";
  hills: "prefer_flatter" | "moderate_ok" | "no_preference";
  controlledCrossings: boolean;
  surface: "prefer_firm_smooth" | "no_preference";
  accessibleToilet: boolean;
  changingPlaces: boolean;
};

export const DEFAULT_PREFERENCES: Preferences = {
  speed: "comfortable",
  maxContinuousMinutes: 20,
  restIntervalMetres: null,
  steps: "avoid_where_possible",
  hills: "prefer_flatter",
  controlledCrossings: true,
  surface: "prefer_firm_smooth",
  accessibleToilet: false,
  changingPlaces: false,
};

const STORAGE_KEY = "within-reach-preferences-v1";

export function loadPreferences(): Preferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...(JSON.parse(raw) as Partial<Preferences>) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export type Origin = {
  label: string;
  latitude: number;
  longitude: number;
  /** Session-only current location is never persisted. */
  isDeviceLocation?: boolean;
};

export type DataStatus = {
  mode: "live" | "source-register" | "unavailable";
  dataReleaseId: string | null;
  message: string;
  sources: SourceEntry[];
};

export type SourceEntry = {
  id: string;
  label: string;
  status: string;
  confidence: "verified" | "mapped" | "community_verified" | "inferred" | "unknown";
};

type AppState = {
  preferences: Preferences;
  setPreferences: (next: Preferences) => void;
  resetPreferences: () => void;
  origin: Origin | null;
  setOrigin: (origin: Origin | null) => void;
  dataStatus: DataStatus;
  highContrast: boolean;
  toggleHighContrast: () => void;
  announce: (message: string) => void;
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferencesState] = useState<Preferences>(loadPreferences);
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [dataStatus, setDataStatus] = useState<DataStatus>({
    mode: "unavailable",
    dataReleaseId: null,
    message: "Checking the configured Leeds sources.",
    sources: [],
  });
  const [highContrast, setHighContrast] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [liveMessage, setLiveMessage] = useState("");

  const announce = useCallback((message: string) => {
    setLiveMessage("");
    // Force a screen-reader re-announcement even for identical text.
    requestAnimationFrame(() => setLiveMessage(message));
    setAnnouncement(message);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/v1/meta", { headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error("API unavailable");
        const api = (await response.json()) as {
          dataReleaseId?: string;
          sources?: SourceEntry[];
          message?: string;
        };
        if (cancelled) return;
        setDataStatus({
          mode: "live",
          dataReleaseId: api.dataReleaseId ?? null,
          message: api.message ?? "Live API connected",
          sources: api.sources ?? [],
        });
      } catch {
        if (cancelled) return;
        const { default: register } = await import("../fixtures-static/leeds.json");
        setDataStatus({
          mode: "source-register",
          dataReleaseId: null,
          message: "No validated live accessibility release is active yet.",
          sources: register.sources as SourceEntry[],
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("high-contrast", highContrast);
  }, [highContrast]);

  const value = useMemo<AppState>(
    () => ({
      preferences,
      setPreferences: (next) => {
        setPreferencesState(next);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // Storage may be unavailable (private mode); preferences stay for the session.
        }
      },
      resetPreferences: () => {
        setPreferencesState(DEFAULT_PREFERENCES);
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          // ignore
        }
      },
      origin,
      setOrigin,
      dataStatus,
      highContrast,
      toggleHighContrast: () => setHighContrast((v) => !v),
      announce,
    }),
    [preferences, origin, dataStatus, highContrast, announce],
  );

  return (
    <AppContext.Provider value={value}>
      {children}
      <div className="sr-status" role="status" aria-live="polite">
        {liveMessage || announcement}
      </div>
    </AppContext.Provider>
  );
}

export function useApp(): AppState {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
}

/** Maps stored preferences to the pure reach-engine input. */
export function toReachPreferences(p: Preferences): ReachPreferences {
  return {
    pace: p.speed === "slow" ? "relaxed" : p.speed === "fast" ? "energetic" : "steady",
    maxUnbrokenMinutes: p.maxContinuousMinutes === "none" ? 60 : p.maxContinuousMinutes,
    avoidSteps: p.steps === "avoid_completely",
  };
}
