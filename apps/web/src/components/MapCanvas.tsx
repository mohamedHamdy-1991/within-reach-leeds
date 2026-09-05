import { useEffect, useRef, useState, type ReactNode } from "react";
import { useApp } from "../state/app";

export type MapMode = "reach" | "route" | "need" | "park";

const MAP_MODES: Record<
  MapMode,
  {
    heading: string;
    title: string;
    state: string;
    legend: [string, string];
    steps: [string, string][];
    textSummary: string;
  }
> = {
  reach: {
    heading: "Leeds comfortable reach",
    title: "Reach preview",
    state: "Personalised",
    legend: ["Standard reach", "Your reach"],
    steps: [
      ["Starting point", "Set a place or use your location"],
      ["Standard reach", "Average network boundary"],
      ["Your reach", "Adjusted by journey preferences"],
    ],
    textSummary:
      "Two boundaries around one starting point: a wider standard reach and a smaller comfortable reach.",
  },
  route: {
    heading: "Leeds route comparison",
    title: "Route preview",
    state: "Two options",
    legend: ["Fastest", "Easier"],
    steps: [
      ["Starting point", "Set a place or use your location"],
      ["Easier route", "Blue line explains the trade-offs"],
      ["Destination", "Waiting for validated route data"],
    ],
    textSummary: "Two route lines: the fastest in dashed ink, the easier option as a solid blue line.",
  },
  need: {
    heading: "Places near your reach",
    title: "Place search",
    state: "Known data",
    legend: ["Search area", "Known places"],
    steps: [
      ["Choose a need", "Seat, toilet, service or support"],
      ["Check evidence", "Source, freshness and confidence"],
      ["Compare a route", "Nearest by route cost when available"],
    ],
    textSummary: "Known places are marked near your reach; each carries its own evidence and confidence.",
  },
  park: {
    heading: "Leeds park matching",
    title: "Park preview",
    state: "Requirements",
    legend: ["Your reach", "Park match"],
    steps: [
      ["Choose features", "Paths, benches, toilets and parking"],
      ["Review unknowns", "Missing details stay visible"],
      ["Compare access", "Use an evidence-backed entrance"],
    ],
    textSummary: "A park area is highlighted; its known features and unknowns are listed in text.",
  },
};

export type MapCanvasProps = {
  mode: MapMode;
  /** Text/list equivalent rendered inside the text-map view (A07). */
  textEquivalent: ReactNode;
  ariaLabel?: string;
};

export function MapCanvas({ mode, textEquivalent, ariaLabel }: MapCanvasProps) {
  const { announce } = useApp();
  const modeInfo = MAP_MODES[mode];
  const [showText, setShowText] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const textViewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.dataset.mapMode = mode;
    return () => {
      delete document.body.dataset.mapMode;
    };
  }, [mode]);

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

  const toggleText = () => {
    const next = !showText;
    setShowText(next);
    if (next) {
      requestAnimationFrame(() => textViewRef.current?.focus());
    }
    announce(next ? "Text map view shown" : "Map view shown");
  };

  const toggleFullscreen = () => {
    const active = !fullscreen;
    setFullscreen(active);
    announce(active ? "Full screen map opened. Use Exit full map to return." : "Returned to journey planning");
  };

  return (
    <section className={`map-stage${fullscreen ? " map-fullscreen-stage" : ""}`} aria-labelledby="map-heading">
      <div className="map-toolbar">
        <div>
          <span className="map-label">Interface preview</span>
          <h2 id="map-heading">{modeInfo.heading}</h2>
        </div>
        <div className="map-actions">
          <button
            className="map-list-toggle"
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
            type="button"
            aria-pressed={fullscreen}
            aria-label={fullscreen ? "Exit full screen map" : "Open full screen map"}
            onClick={toggleFullscreen}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" /></svg>
            <span>{fullscreen ? "Exit full map" : "Full map"}</span>
          </button>
        </div>
      </div>

      <div
        className="map-canvas"
        id="map-canvas"
        role="img"
        aria-label={ariaLabel ?? "Illustrative map preview showing standard and comfortable reach boundaries. It is not live routing data."}
        hidden={showText}
      >
        <svg viewBox="0 0 900 760" aria-hidden="true" focusable="false">
          <rect width="900" height="760" fill="#EEF1EC" />
          <g className="map-water"><path d="M-40 622C121 539 230 703 384 622s293-111 560-49v123H-40Z" /></g>
          <g className="map-green">
            <path d="M82 61c99-31 161 54 127 133S48 217 40 139 45 73 82 61Z" />
            <path d="M659 77c87-20 164 47 125 126s-137 67-169 9 1-125 44-135Z" />
            <path d="M627 526c103-27 183 31 170 113s-136 103-204 34-26-131 34-147Z" />
          </g>
          <g className="map-roads">
            <path d="M-20 310 196 260 348 290 560 230 920 287" />
            <path d="M56 30 192 199 238 386 186 776" />
            <path d="M453-30 421 139 494 320 466 570 527 788" />
            <path d="M729-40 662 168 700 354 628 523 694 790" />
            <path d="M-30 487 161 458 328 509 518 455 701 479 930 437" />
            <path d="M100 724 282 615 430 639 604 602 824 684" />
          </g>
          <g className="map-minor">
            <path d="M126 146 350 88 599 126 790 251" />
            <path d="M84 392 289 345 464 382 679 323 842 354" />
            <path d="M249 47 285 202 376 414 351 688" />
            <path d="M570 25 541 181 607 393 565 730" />
            <path d="M15 554 258 536 441 560 643 535 875 579" />
          </g>
          <path className="standard-field" d="M320 103C496 69 681 176 703 354c25 200-112 337-304 337-177 0-308-119-285-291 24-176 41-264 206-297Z" />
          <path className="comfort-field" d="M341 184c124-19 254 61 262 184 9 138-85 230-222 226-124-4-209-89-193-207 18-125 39-185 153-203Z" />
          <path className="demo-route route-fast" d="M192 592 269 541 319 464 392 368 477 316 566 235 704 188" />
          <path className="demo-route route-easy" d="M192 592 252 568 338 529 407 454 392 368 501 341 566 235 704 188" />
          <path className="park-focus" d="M589 500c91-34 166 11 173 77s-58 111-142 105-126-58-105-112 35-55 74-70Z" />
          <g className="preview-pins"><circle cx="392" cy="368" r="9" /><circle cx="291" cy="442" r="7" /><circle cx="507" cy="285" r="7" /><circle cx="483" cy="508" r="7" /></g>
          <g className="route-points"><circle cx="192" cy="592" r="11" /><circle cx="704" cy="188" r="11" /></g>
          <g className="need-halos"><circle cx="291" cy="442" r="22" /><circle cx="507" cy="285" r="22" /><circle cx="483" cy="508" r="22" /></g>
          <g className="origin"><circle cx="392" cy="368" r="20" /><circle cx="392" cy="368" r="7" /></g>
        </svg>
        <div className="map-legend" aria-hidden="true">
          <span><i className="line standard"></i><b>{modeInfo.legend[0]}</b></span>
          <span><i className="line comfort"></i><b>{modeInfo.legend[1]}</b></span>
        </div>
        <p className="preview-warning">Preview geometry only — live routing is not connected.</p>
        <p className="map-attribution">© OpenStreetMap contributors (ODbL) · council data © Leeds City Council (OGL)</p>
        <aside className="journey-card" aria-label="Journey analysis preview">
          <div className="journey-card-head">
            <span>{modeInfo.title}</span>
            <strong>{modeInfo.state}</strong>
          </div>
          <div className="journey-tabs" aria-hidden="true">
            <span>Overview</span>
            <span className="active">{mode === "reach" ? "Route" : "Task"}</span>
            <span>Confidence</span>
          </div>
          <ol className="journey-steps">
            {modeInfo.steps.map(([title, detail]) => (
              <li key={title}><i></i><span><strong>{title}</strong><small>{detail}</small></span></li>
            ))}
          </ol>
        </aside>
      </div>

      <div className="text-map-view" hidden={!showText} tabIndex={0} ref={textViewRef}>
        <h3>Map information in text</h3>
        <p>{modeInfo.textSummary}</p>
        <dl>
          <div><dt>Map mode</dt><dd>{modeInfo.legend.join(" and ")}</dd></div>
          <div><dt>Data status</dt><dd>Preview only — no live accessibility result</dd></div>
        </dl>
        {textEquivalent}
      </div>
    </section>
  );
}
