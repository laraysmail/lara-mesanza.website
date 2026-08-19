// Fetches the latest videos from a YouTube channel's public RSS feed at build time.
// No API key needed. Falls back to the given list if channelId is empty or the fetch fails,
// so a missing/temporarily-down feed never breaks the build.
export async function fetchLatestVideos(channelId, limit, fallback) {
  if (!channelId) return fallback;

  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
    if (!res.ok) return fallback;

    const xml = await res.text();
    const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].slice(0, limit);
    const parsed = entries.map((m) => {
      const block = m[1];
      const title = block.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '';
      const url = block.match(/<link rel="alternate" href="([^"]+)"/)?.[1] ?? '#';
      const thumbnail = block.match(/<media:thumbnail url="([^"]+)"/)?.[1] ?? null;
      return { category: 'YouTube', title, url, thumbnail };
    });

    return parsed.length ? parsed : fallback;
  } catch (e) {
    return fallback;
  }
}
