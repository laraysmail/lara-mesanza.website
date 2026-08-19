// Fetches the latest videos from a YouTube channel's public RSS feed at build time.
// No API key needed. Falls back to the given list if channelId is empty or the fetch fails,
// so a missing/temporarily-down feed never breaks the build.

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

  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
    if (!res.ok) return fallback;

    const xml = await res.text();
    // Over-fetch since some of these will be Shorts we filter back out below.
    const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].slice(0, limit * 3 + 5);

    const results = [];
    for (const m of entries) {
      if (results.length >= limit) break;
      const block = m[1];
      const videoId = block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
      if (videoId && (await isShort(videoId))) continue;

      const title = block.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '';
      const url = block.match(/<link rel="alternate" href="([^"]+)"/)?.[1] ?? '#';
      const thumbnail = block.match(/<media:thumbnail url="([^"]+)"/)?.[1] ?? null;
      results.push({ category: 'YouTube', title, url, thumbnail });
    }

    return results.length ? results : fallback;
  } catch (e) {
    return fallback;
  }
}
