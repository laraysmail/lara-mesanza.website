// Fetches the latest videos from a YouTube channel's public RSS feed at build time.
// No API key needed. Falls back to the given list if channelId is empty or the fetch fails,
// so a missing/temporarily-down feed never breaks the build.
//
// In production this whole module only ever runs once, at build time - the deployed
// page is static HTML, so real visitors never wait on YouTube. This cache only matters
// for local dev, where Astro re-runs page frontmatter on every navigation: it keeps
// repeated preview reloads within a few minutes of each other instant instead of
// re-fetching and re-checking every video against YouTube again each time.
const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map();

async function cached(key, fn) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.time < CACHE_TTL_MS) return hit.value;
  const value = await fn();
  cache.set(key, { value, time: Date.now() });
  return value;
}

// The RSS feed doesn't flag Shorts vs. regular uploads. But requesting a video's
// /shorts/{id} URL redirects to /watch?v={id} for regular long-form videos, and stays
// at /shorts/{id} (no redirect) for actual Shorts — a free, reliable way to tell them apart.
async function isShort(videoId) {
  try {
    const res = await fetch(`https://www.youtube.com/shorts/${videoId}`, { redirect: 'follow' });
    return res.url.includes('/shorts/');
  } catch (e) {
    return false; // if the check itself fails, don't let it block an otherwise-good video
  }
}

export async function fetchLatestVideos(channelId, limit, fallback) {
  if (!channelId) return fallback;
  return cached(`videos:${channelId}:${limit}`, () => fetchLatestVideosUncached(channelId, limit, fallback));
}

async function fetchLatestVideosUncached(channelId, limit, fallback) {
  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
    if (!res.ok) return fallback;

    const xml = await res.text();
    // Over-fetch since some of these will be Shorts we filter back out below.
    const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].slice(0, limit * 3 + 5);

    const candidates = entries.map((m) => {
      const block = m[1];
      return {
        videoId: block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1],
        title: block.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '',
        url: block.match(/<link rel="alternate" href="([^"]+)"/)?.[1] ?? '#',
        thumbnail: block.match(/<media:thumbnail url="([^"]+)"/)?.[1] ?? null,
      };
    });

    // Check all candidates for Shorts in parallel instead of one request at a time -
    // a sequential loop here was the slow part of building this page.
    const shortFlags = await Promise.all(candidates.map((c) => (c.videoId ? isShort(c.videoId) : false)));

    const results = candidates
      .filter((_, i) => !shortFlags[i])
      .slice(0, limit)
      .map(({ videoId, ...v }) => ({ category: 'YouTube', ...v }));

    return results.length ? results : fallback;
  } catch (e) {
    return fallback;
  }
}

// Pulls a playlist's real cover thumbnail (the current first video's thumbnail,
// same image YouTube itself shows for the playlist) from its og:image meta tag.
// No API key needed - just the public playlist page's HTML.
async function fetchPlaylistThumbnail(url) {
  const match = url.match(/[?&]list=([^&]+)/);
  if (!match) return null;
  return cached(`playlist-thumb:${match[1]}`, () => fetchPlaylistThumbnailUncached(match[1]));
}

async function fetchPlaylistThumbnailUncached(playlistId) {
  try {
    const res = await fetch(`https://www.youtube.com/playlist?list=${playlistId}`);
    if (!res.ok) return null;
    const html = await res.text();
    return html.match(/property="og:image" content="([^"]+)"/)?.[1]?.replace(/&amp;/g, '&') ?? null;
  } catch (e) {
    return null;
  }
}

// Fills in `thumbnail` for every playlist that has a real YouTube URL, fetching
// all of them in parallel. Playlists already carrying a thumbnail (or with no
// real URL yet, e.g. "#") are left untouched.
export async function withPlaylistThumbnails(playlists) {
  const thumbnails = await Promise.all(
    playlists.map((p) => (p.thumbnail || !p.url || p.url === '#' ? null : fetchPlaylistThumbnail(p.url)))
  );
  return playlists.map((p, i) => ({ ...p, thumbnail: p.thumbnail ?? thumbnails[i] }));
}
