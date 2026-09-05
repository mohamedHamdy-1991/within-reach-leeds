import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useApp } from "../state/app";

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

const MOBILE_BREAKPOINT = "(max-width: 960px)";

/** Charcoal rail (desktop, expandable) and compact dark header with menu (mobile). */
export function AppShell() {
  const { highContrast, toggleHighContrast, announce } = useApp();
  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => {
    if (isMobile) {
      const open = !mobileOpen;
      setMobileOpen(open);
      announce(open ? "Navigation opened" : "Navigation closed");
      return;
    }
    const collapsed = expanded;
    setExpanded(!expanded);
    announce(collapsed ? "Navigation collapsed" : "Navigation expanded");
  };

  const navHidden = isMobile ? !mobileOpen : false;

  return (
    <div className="device-frame">
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <header className="topbar">
        <NavLink className="brand" to="/" aria-label="WITHIN REACH Leeds home">
          <svg className="brand-mark" viewBox="0 0 56 56" role="img" aria-label="Two reach boundaries around one starting point">
            <path className="brand-standard" d="M24 3C42 3 53 15 52 30c-1 14-12 23-28 23C9 53 2 43 4 30 6 17 9 4 24 3Z" />
            <path className="brand-comfort" d="M25 12c12-1 19 7 19 17 0 10-8 17-19 17-10 0-15-7-14-16 1-10 4-17 14-18Z" />
            <circle cx="27" cy="29" r="3" />
          </svg>
          <span>
            <strong>WITHIN REACH</strong>
            <small>— Leeds</small>
          </span>
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
      <main id="main" className="app-shell">
        <Outlet />
      </main>
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
