import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useApp } from "../state/app";
import { useMapController } from "../state/map";
import { RealMap } from "../map/RealMap";
import { DockProvider, PANEL_TITLES } from "./GlassPanel";
import { OfflineNotice } from "./OfflineNotice";

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

const MOBILE_BREAKPOINT = "(max-width: 960px)";

const NAV_ITEMS = [
  { to: "/reach", label: "My reach", icon: <><path d="M6 4h12l3 5-9 5-9-5 3-5Z" /><path d="M3 9v7l9 5 9-5V9M12 14v7" /></> },
  { to: "/route", label: "Routes", icon: <><circle cx="5" cy="19" r="2" /><circle cx="19" cy="5" r="2" /><path d="M7 18c3-8 6-3 9-10l1-1" /></> },
  { to: "/find", label: "Places", icon: <><circle cx="10" cy="10" r="6" /><path d="m15 15 5 5M10 7v6M7 10h6" /></> },
  { to: "/parks", label: "Parks", icon: <><path d="M12 22V9M12 12 7 17M12 14l5 4M5 14c-3-4 1-8 4-6 0-5 7-6 9-2 4 0 5 6 2 8" /></> },
] as const;

const NAV_SECONDARY = [
  { to: "/preferences", label: "Preferences", icon: <><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" /></> },
  { to: "/confidence", label: "About data", icon: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7h.01" /></> },
] as const;

/**
 * Full-screen real map with floating glass panels. The map is the permanent
 * canvas; navigation, panels and the dock float above it and the pointer
 * passes through empty areas so the map stays pannable everywhere.
 */
export function AppShell() {
  const { highContrast, toggleHighContrast, announce } = useApp();
  const ctl = useMapController();
  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showText, setShowText] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [minimized, setMinimized] = useState<Record<string, boolean>>({});
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Body classes the existing stylesheet reacts to.
  useEffect(() => {
    document.body.classList.toggle("map-fullscreen", fullscreen);
    document.body.classList.toggle("high-contrast", highContrast);
    return () => {
      document.body.classList.remove("map-fullscreen");
    };
  }, [fullscreen, highContrast]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && fullscreen) {
        setFullscreen(false);
        announce("Returned to journey planning");
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [fullscreen, announce]);

  const toggleMenu = () => {
    if (isMobile) {
      const open = !mobileOpen;
      setMobileOpen(open);
      announce(open ? "Navigation opened" : "Navigation closed");
      return;
    }
    setExpanded((v) => {
      announce(!v ? "Navigation collapsed" : "Navigation expanded");
      return !v;
    });
  };

  const toggleText = () => {
    const next = !showText;
    setShowText(next);
    announce(next ? "Text map view shown" : "Map view shown");
  };

  const toggleFullscreen = () => {
    const active = !fullscreen;
    setFullscreen(active);
    announce(active ? "Full screen map opened. Use Exit full map to return." : "Returned to journey planning");
  };

  const dock = {
    minimized,
    toggle: (id: string) => {
      setMinimized((state) => {
        const next = { ...state, [id]: !state[id] };
        announce(!state[id] ? "Panel minimised. Find it in the dock below." : "Panel restored.");
        return next;
      });
    },
  };

  const navHidden = isMobile ? !mobileOpen : false;

  return (
    <div className={`map-root${fullscreen ? " is-fullmap" : ""}${expanded ? "" : " rail-collapsed"}`}>
      <a className="skip-link" href="#main">Skip to main content</a>

      <RealMap />

      <header className="topbar rail-float">
        <NavLink className="brand" to="/" aria-label="WITHIN REACH Leeds home">
          <svg className="brand-mark" viewBox="0 0 56 56" role="img" aria-label="Two reach boundaries around one starting point">
            <path className="brand-standard" d="M24 3C42 3 53 15 52 30c-1 14-12 23-28 23C9 53 2 43 4 30 6 17 9 4 24 3Z" />
            <path className="brand-comfort" d="M25 12c12-1 19 7 19 17 0 10-8 17-19 17-10 0-15-7-14-16 1-10 4-17 14-18Z" />
            <circle cx="27" cy="29" r="3" />
          </svg>
          <span><strong>WITHIN REACH</strong><small>— Leeds</small></span>
        </NavLink>
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={isMobile ? mobileOpen : expanded}
          aria-label={isMobile ? (mobileOpen ? "Close navigation" : "Open navigation") : expanded ? "Collapse navigation" : "Expand navigation"}
          onClick={toggleMenu}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 7-5 5 5 5" /></svg>
        </button>
        <nav aria-label="Primary" hidden={navHidden}>
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className="rail-link" end={item.to === "/reach"}>
              <svg viewBox="0 0 24 24" aria-hidden="true">{item.icon}</svg>
              <span>{item.label}</span>
            </NavLink>
          ))}
          <span className="rail-rule" aria-hidden="true"></span>
          {NAV_SECONDARY.map((item) => (
            <NavLink key={item.to} to={item.to} className="rail-link">
              <svg viewBox="0 0 24 24" aria-hidden="true">{item.icon}</svg>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="rail-footer">
          <button className="contrast-rail" type="button" aria-pressed={highContrast} onClick={toggleHighContrast}>
            High contrast
          </button>
          <DataStatusBadge />
        </div>
      </header>

      <OfflineNotice />

      <div className="map-topbar">
        <button
          className="map-list-toggle"
          id="map-list-toggle"
          type="button"
          aria-pressed={showText}
          aria-label={showText ? "Show visual map" : "Show text map view"}
          onClick={toggleText}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h2M10 6h10M4 12h2M10 12h10M4 18h2M10 18h10" /></svg>
          <span>{showText ? "Show map" : "Text view"}</span>
        </button>
        <button
          className="map-list-toggle"
          id="fullscreen-map"
          type="button"
          aria-pressed={fullscreen}
          aria-label={fullscreen ? "Exit full screen map" : "Open full screen map"}
          onClick={toggleFullscreen}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" /></svg>
          <span>{fullscreen ? "Exit full map" : "Full map"}</span>
        </button>
      </div>

      <main id="main" className="stage">
        <DockProvider value={dock}>
          <Outlet />
        </DockProvider>
      </main>

      <div className="panel-dock" aria-label="Minimised panels">
        {Object.entries(PANEL_TITLES).map(([id, title]) =>
          minimized[id] ? (
            <button key={id} type="button" className="dock-chip" onClick={() => dock.toggle(id)}>
              {title}
            </button>
          ) : null,
        )}
      </div>

      <div className="text-overlay" role="region" aria-label="Map information in text" hidden={!showText}>
        <div className="text-overlay__head">
          <h3>Map information in text</h3>
          <button type="button" className="text-button" onClick={toggleText}>Close text view</button>
        </div>
        <div className="text-overlay__body">{ctl.textOverlay}</div>
      </div>
    </div>
  );
}

function DataStatusBadge() {
  const { dataStatus } = useApp();
  const label = dataStatus.mode === "live" ? "Live API" : dataStatus.mode === "source-register" ? "Source register" : "Data status unavailable";
  return (
    <span>
      <i className="rail-status" aria-hidden="true"></i>
      {label}
    </span>
  );
}

