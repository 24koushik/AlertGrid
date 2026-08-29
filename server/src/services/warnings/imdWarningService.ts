import { fetchPublicFeed } from "../external/publicFeedClient";
import { redisService } from "../redisService";

export class ImdWarningService {
  async getWarnings(region: string) {
    const cacheKey = `warnings:imd:${region.toLowerCase().replace(/[^a-z0-9]/g, "")}`;

    const cached = await redisService.get(cacheKey);
    if (cached) return JSON.parse(cached);

    try {
      // IMD provides CAP XML feeds for warnings (e.g. at https://sachet.ndma.gov.in/cap_public_website/ or IMD RSS).
      // However, a reliable, unified, public, CORS-enabled JSON/XML feed without specific access credentials
      // or heavy HTML scraping is not consistently available.
      // As requested by the prompt, we document this limitation here and rely on GDACS and USGS
      // as our primary keyless public disaster data sources.

      const imdFeedUrl = process.env.IMD_CAP_FEED_URL;
      if (!imdFeedUrl) {
        return []; // Graceful empty state, documented limitation.
      }

      const xmlData = await fetchPublicFeed(imdFeedUrl, { timeout: 5000 });
      // Stub parsing logic for CAP XML
      let warnings: any[] = [];

      await redisService.set(cacheKey, JSON.stringify(warnings), 1800);
      return warnings;
    } catch (error: any) {
      console.error("IMD Warning API Error:", error.message);
      return [];
    }
  }
}

export const imdWarningService = new ImdWarningService();
