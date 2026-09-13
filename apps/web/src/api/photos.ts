/** Wikipedia photo lookup for place names (free, key-less, CORS-enabled). */

const summaryCache = new Map<string, string | null>();

async function fetchWithTimeout(url: string, ms = 4500): Promise<Response | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const response = await fetch(url, { signal: controller.signal });
    return response.ok ? response : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Resolve a representative photo for a place name. Tries the exact article,
 * then a keyed search restricted to pageimages. Null when nothing found —
 * callers show a category fallback tile (never a fake photo).
 */
export async function fetchPlacePhoto(name: string): Promise<string | null> {
  const key = name.trim().toLowerCase();
  if (summaryCache.has(key)) return summaryCache.get(key) ?? null;

  const summary = await fetchWithTimeout(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}?redirect=true`,
  );
  let thumb = (summary ? ((await summary.clone().json().catch(() => null)) as { thumbnail?: { source?: string } } | null)?.thumbnail?.source : null) ?? null;

  if (!thumb) {
    const search = await fetchWithTimeout(
      `https://en.wikipedia.org/w/api.php?action=query&generator=search&gpssearch=${encodeURIComponent(
        name + " Leeds",
      )}&gpslimit=1&prop=pageimages&piprop=thumbnail&pithumbsize=320&format=json&origin=*`,
    );
    if (search) {
      const data = (await search.json().catch(() => null)) as { query?: { pages?: Record<string, { thumbnail?: { source?: string } }> } } | null;
      const pages = data?.query?.pages ? Object.values(data.query.pages) : [];
      thumb = pages[0]?.thumbnail?.source ?? null;
    }
  }

  summaryCache.set(key, thumb);
  return thumb;
}
