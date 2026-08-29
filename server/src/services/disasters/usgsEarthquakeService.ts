import { fetchPublicFeed } from "../external/publicFeedClient";

export class UsgsEarthquakeService {
  async fetchLatestEarthquakes() {
    try {
      // Fetch earthquakes of magnitude 2.5+ from the past day
      const url =
        "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson";
      const data = await fetchPublicFeed(url, { timeout: 10000 });

      if (!data || !data.features) return [];

      return data.features.map((feature: any) => ({
        source: "USGS",
        sourceEventId: feature.id,
        eventType: "EARTHQUAKE",
        severity:
          feature.properties.mag >= 6
            ? "CRITICAL"
            : feature.properties.mag >= 4.5
              ? "HIGH"
              : "MODERATE",
        title: feature.properties.title,
        description: `Magnitude ${feature.properties.mag} earthquake located at ${feature.properties.place}.`,
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
        issuedAt: new Date(feature.properties.time),
        url: feature.properties.url,
      }));
    } catch (error) {
      console.error("[UsgsEarthquakeService] Error:", error);
      return [];
    }
  }
}

export const usgsEarthquakeService = new UsgsEarthquakeService();
