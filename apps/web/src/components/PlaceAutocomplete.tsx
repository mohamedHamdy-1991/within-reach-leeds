import { useEffect, useRef, useState } from "react";
import { geocode, type GeocodeHit } from "../api/client";
import { useApp } from "../state/app";

export type PlaceAutocompleteProps = {
  id: string;
  label: string;
  placeholder: string;
  onPick: (hit: GeocodeHit) => void;
  onExactQuery?: (value: string) => void;
  defaultValue?: string;
  special?: { match: RegExp; label: string; onTrigger: () => void };
};

/**
 * Google-Maps-style origin/destination field: debounced live hints from the
 * bounded release geocoder, keyboard-navigable listbox, first hint = best
 * match. Optional special keyword (e.g. "where am I") triggers device
 * location instead of search.
 */
export function PlaceAutocomplete({ id, label, placeholder, onPick, onExactQuery, defaultValue, special }: PlaceAutocompleteProps) {
  const { announce } = useApp();
  const [value, setValue] = useState(defaultValue ?? "");
  const [hints, setHints] = useState<GeocodeHit[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestId = useRef(0);
  // A picked hint becomes the value; re-searching it would reopen the
  // dropdown over the action buttons (Google closes on pick too).
  const pickedNameRef = useRef<string | null>(null);

  useEffect(() => {
    const query = value.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2 || query === pickedNameRef.current) {
      setHints([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const thisRequest = ++requestId.current;
      try {
        const results = await geocode(query, 6);
        if (thisRequest !== requestId.current) return;
        setHints(results);
        setOpen(results.length > 0);
        setActiveIndex(-1);
        if (results.length > 0) announce(`${results.length} suggestions`);
      } catch {
        if (thisRequest === requestId.current) {
          setHints([]);
          setOpen(false);
        }
      }
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, announce]);

  useEffect(() => {
    const onOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  // Close on input blur (slightly delayed: options commit on mousedown first).
  const onBlurInput = () => {
    window.setTimeout(() => setOpen(false), 150);
  };

  const choose = (hit: GeocodeHit) => {
    pickedNameRef.current = hit.name;
    setValue(hit.name);
    setOpen(false);
    setHints([]);
    onPick(hit);
    announce(`${hit.name} selected`);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const query = value.trim();
    if (event.key === "Enter") {
      event.preventDefault();
      if (special && special.match.test(query)) {
        special.onTrigger();
        return;
      }
      if (open && activeIndex >= 0 && hints[activeIndex]) {
        choose(hints[activeIndex]!);
        return;
      }
      if (open && hints[0]) {
        choose(hints[0]);
        return;
      }
      onExactQuery?.(query);
      return;
    }
    if (event.key === "ArrowDown" && open) {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, hints.length - 1));
    }
    if (event.key === "ArrowUp" && open) {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    }
    if (event.key === "Escape") setOpen(false);
  };

  return (
    <div className="autocomplete" ref={containerRef}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="search"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-hints`}
        aria-autocomplete="list"
        aria-activedescendant={activeIndex >= 0 ? `${id}-hint-${activeIndex}` : undefined}
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onFocus={() => hints.length > 0 && setOpen(true)}
        onKeyDown={onKeyDown}
        onBlur={onBlurInput}
      />
      <ul id={`${id}-hints`} role="listbox" aria-label="Suggestions" className="autocomplete-list" hidden={!open}>
        {hints.map((hint, index) => (
          <li
            key={`${hint.name}-${index}`}
            id={`${id}-hint-${index}`}
            role="option"
            aria-selected={index === activeIndex}
            className={index === activeIndex ? "active" : ""}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseDown={(event) => {
              event.preventDefault();
              choose(hint);
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10Z" /><circle cx="12" cy="11" r="2.2" /></svg>
            <span>
              <strong>{hint.name}</strong>
              <small>{hint.kind}</small>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
