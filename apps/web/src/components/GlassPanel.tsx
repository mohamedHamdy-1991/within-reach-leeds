import { createContext, useContext, type ReactNode } from "react";

type DockState = {
  minimized: Record<string, boolean>;
  toggle: (id: string) => void;
};

const DockContext = createContext<DockState>({
  minimized: {},
  toggle: () => undefined,
});

/** Static panel registry: the dock shows every panel, hidden or not. */
export const PANEL_TITLES: Record<string, string> = {
  "explore-home": "Explore Leeds",
  "my-reach": "My Reach",
  "route-panel": "Take me there",
  "find-panel": "I need something",
  "parks-panel": "Find a park",
  "prefs-panel": "Preferences",
  "confidence-panel": "About data",
  "settings-panel": "Settings",
  "about-panel": "About",
};

export const DockProvider = DockContext.Provider;
export const useDock = () => useContext(DockContext);

/**
 * Page-level dock registration for panels rendered as raw sections.
 * Registers the panel for as long as the page is mounted, even when the
 * section is hidden while minimised.
 */
export function usePanelDock(id: string, title: string): { minimized: boolean; toggle: () => void } {
  const dock = useDock();
  void title;
  return { minimized: Boolean(dock.minimized[id]), toggle: () => dock.toggle(id) };
}

/** The small "–" button that minimises a panel into the dock. */
export function MinimiseButton({ id, title }: { id: string; title: string }) {
  const { toggle } = usePanelDock(id, title);
  return (
    <button type="button" className="glass-min" aria-label={`Minimise ${title}`} title={`Minimise ${title}`} onClick={toggle}>
      –
    </button>
  );
}

/**
 * Floating frosted-glass panel. The map stays live underneath (the wrapper is
 * click-through; only the panel itself catches the pointer). Minimising pops
 * the panel into the dock at the bottom of the screen.
 */
export function GlassPanel({
  id,
  title,
  side = "left",
  wide = false,
  children,
  headExtra,
}: {
  id: string;
  title: string;
  side?: "left" | "right";
  wide?: boolean;
  children: ReactNode;
  headExtra?: ReactNode;
}) {
  const dock = useDock();

  if (dock.minimized[id]) return null;

  const classes = [
    "glass-panel",
    side === "right" ? "glass-panel--right" : "glass-panel--left",
    wide ? "glass-panel--wide" : "",
  ].join(" ");

  return (
    <section className={classes} aria-label={title}>
      <header className="glass-panel__head">
        <strong>{title}</strong>
        <span className="glass-panel__head-actions">
          {headExtra}
          <button
            type="button"
            className="glass-min"
            aria-label={`Minimise ${title}`}
            title={`Minimise ${title}`}
            onClick={() => dock.toggle(id)}
          >
            –
          </button>
        </span>
      </header>
      <div className="glass-panel__body">{children}</div>
    </section>
  );
}
