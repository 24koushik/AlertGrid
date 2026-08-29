import { fetchPublicFeed } from "../external/publicFeedClient";
import { XMLParser } from "fast-xml-parser";

export class GdacsService {
  async fetchLatestDisasters() {
    try {
      // Fetch 24h RSS feed from GDACS
      const url = "https://www.gdacs.org/xml/rss_24h.xml";
      const xmlData = await fetchPublicFeed(url, { timeout: 10000 });

      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
      });
      const parsed = parser.parse(xmlData);

      const items = parsed?.rss?.channel?.item;
      if (!items) return [];

      const events = Array.isArray(items) ? items : [items];

      return events.map((item: any) => {
        // Map GDACS alert levels to our severity
        const alertLevel = item["gdacs:alertlevel"]; // Green, Orange, Red
        let severity = "MODERATE";
        if (alertLevel === "Orange") severity = "HIGH";
        if (alertLevel === "Red") severity = "CRITICAL";

        // GDACS Event types: EQ (Earthquake), TC (Cyclone), FL (Flood), VO (Volcano)
        let eventType = "OTHER";
        const typeStr = item["gdacs:eventtype"];
        if (typeStr === "EQ") eventType = "EARTHQUAKE";
        else if (typeStr === "TC") eventType = "CYCLONE";
        else if (typeStr === "FL") eventType = "FLOOD";

        return {
          source: "GDACS",
          sourceEventId: item["gdacs:eventid"]?.toString() || item.guid,
          eventType,
          severity,
          title: item.title,
          description: item.description,
          latitude: parseFloat(item["geo:Point"]?.["geo:lat"] || 0),
          longitude: parseFloat(item["geo:Point"]?.["geo:long"] || 0),
          issuedAt: new Date(item.pubDate),
          url: item.link,
        };
      });
    } catch (error) {
      console.error("[GdacsService] Error:", error);
      return [];
    }
  }
}

export const gdacsService = new GdacsService();
