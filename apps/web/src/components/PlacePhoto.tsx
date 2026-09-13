import { useEffect, useState } from "react";
import { fetchPlacePhoto } from "../api/photos";

/**
 * Google-style place thumbnail: a real photo when one exists (Wikipedia
 * lookup), otherwise an identity-true category tile with the place initial.
 * Fallbacks are honest illustrations, never fake photos.
 */
const FALLBACK_COLORS: Record<string, string> = {
  Toilet: "#2387C9",
  "Changing Places toilet": "#2387C9",
  Pharmacy: "#2387C9",
  Seat: "#2E7D32",
  Park: "#2E7D32",
  "Green space": "#2E7D32",
  "Park entrance": "#2E7D32",
  "Community hub": "#7B5EA7",
  "Safe Place": "#B42318",
};

export function PlacePhoto({ name, kind }: { name: string; kind: string }) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchPlacePhoto(name).then((url) => {
      if (!cancelled) {
        setPhoto(url);
        setResolved(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [name]);

  if (!resolved) return <div className="place-photo place-photo--loading" aria-hidden="true" />;
  if (photo) return <img className="place-photo" src={photo} alt="" loading="lazy" />;
  const color = FALLBACK_COLORS[kind] ?? "#55606B";
  return (
    <div className="place-photo place-photo--fallback" style={{ background: `${color}1f` }} aria-hidden="true">
      <span style={{ color }}>{(name.trim()[0] ?? "•").toUpperCase()}</span>
    </div>
  );
}
