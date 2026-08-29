export async function fetchPublicFeed(
  url: string,
  options: { timeout?: number } = {},
) {
  const { timeout = 10000 } = options;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeout) });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return await res.json();
    } else {
      return await res.text(); // For XML/RSS feeds
    }
  } catch (error: any) {
    console.error(`[PublicFeedClient] Failed to fetch ${url}:`, error.message);
    throw error;
  }
}
