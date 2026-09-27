import { useEffect, useState } from "react";

/**
 * Quiet offline banner with the identity offline-state art. The app shell
 * keeps working from the service worker; live-data features show their own
 * honest unavailable messages.
 */
export function OfflineNotice() {
  const [offline, setOffline] = useState(() => (typeof navigator === "undefined" ? false : !navigator.onLine));

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  if (!offline) return null;
  return (
    <aside className="offline-notice" role="status">
      <img src={`${import.meta.env.BASE_URL}generated/offline-state.png`} alt="" />
      <p>
        <strong>You're offline.</strong> The interface still works from this device. Reach rings,
        search and routes need the internet, so they are paused — nothing is guessed while offline.
      </p>
    </aside>
  );
}
