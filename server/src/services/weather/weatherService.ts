import { redisService } from "../redisService";

interface CacheEntry {
  data: any;
  expiresAt: number;
}

export class WeatherService {
  private memoryCache = new Map<string, CacheEntry>();
  private openMeteoRateLimitUntil = 0;

  async getWeather(lat: number, lon: number) {
    const cacheKey = `weather:om:${lat.toFixed(2)}:${lon.toFixed(2)}`;
    const now = Date.now();

    // 1. Try Redis cache first
    try {
      const cached = await redisService.get(cacheKey);
      if (cached) {
        console.log(`[WeatherService] Cache HIT (Redis) for ${cacheKey}`);
        const parsed = JSON.parse(cached);
        // Sync to memory cache for fallback in case Redis drops later
        this.memoryCache.set(cacheKey, { data: parsed, expiresAt: now + 900 * 1000 });
        return parsed;
      }
    } catch (e) {
      console.warn(`[WeatherService] Redis get failed for ${cacheKey}`);
    }

    // 2. Try Memory cache (as primary if Redis is unavailable, or as fallback)
    const memCached = this.memoryCache.get(cacheKey);
    if (memCached && memCached.expiresAt > now) {
      console.log(`[WeatherService] Cache HIT (Memory) for ${cacheKey}`);
      return memCached.data;
    }

    console.log(`[WeatherService] Cache MISS for ${cacheKey}. Fetching from Open-Meteo...`);

    // Check Cooldown Backoff
    if (now < this.openMeteoRateLimitUntil) {
      console.warn(`[WeatherService] Open-Meteo currently in cooldown. Skipping fetch.`);
      if (memCached) {
        console.log(`[WeatherService] Returning STALE memory cache fallback for ${cacheKey}`);
        return { ...memCached.data, isStale: true };
      }
      throw new Error("RATE_LIMIT_EXCEEDED");
    }

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,showers,weather_code,wind_speed_10m,wind_direction_10m`;

      const res = await fetch(url, { 
        signal: AbortSignal.timeout(5000),
        headers: {
          "Accept": "application/json",
          "User-Agent": "AlertGrid/1.0 (https://alert-grid-six.vercel.app)"
        }
      });
      
      if (!res.ok) {
        const errBody = await res.text().catch(() => "could not read body");
        console.error(`[WeatherService] Open-Meteo Error! HTTP ${res.status} | URL: ${url} | Lat: ${lat}, Lon: ${lon} | Body: ${errBody}`);
        
        // Handle 429 Rate Limit Explicitly
        if (res.status === 429) {
          console.warn(`[WeatherService] Open-Meteo 429 Quota Exhausted! Setting 60m cooldown.`);
          this.openMeteoRateLimitUntil = now + 60 * 60 * 1000; // 1 hour cooldown
          // Return stale cache if available
          if (memCached) {
             console.log(`[WeatherService] Returning STALE memory cache fallback for ${cacheKey}`);
             return { ...memCached.data, isStale: true };
          }
          throw new Error("RATE_LIMIT_EXCEEDED");
        }
        
        throw new Error(`Open-Meteo returned error: ${res.status}`);
      }

      const data = await res.json();
      const current = data.current;

      const weatherData = {
        temperature: current.temperature_2m,
        feelsLike: current.apparent_temperature,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        windDirection: current.wind_direction_10m,
        precipitation: current.precipitation,
        condition: "Clear", 
        description: `WMO Code: ${current.weather_code}`,
      };

      const wmoMap: Record<number, string> = {
        0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
        45: "Fog", 48: "Depositing rime fog", 51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
        61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain", 71: "Slight snow fall", 73: "Moderate snow fall",
        75: "Heavy snow fall", 80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
        95: "Thunderstorm", 96: "Thunderstorm with slight hail", 99: "Thunderstorm with heavy hail",
      };

      if (wmoMap[current.weather_code]) {
        weatherData.description = wmoMap[current.weather_code];
        if (current.weather_code < 40) weatherData.condition = "Clear/Cloudy";
        else if (current.weather_code < 70) weatherData.condition = "Rain";
        else if (current.weather_code < 80) weatherData.condition = "Snow";
        else if (current.weather_code < 90) weatherData.condition = "Showers";
        else weatherData.condition = "Thunderstorm";
      }

      // Save to memory cache (15 mins TTL)
      this.memoryCache.set(cacheKey, { data: weatherData, expiresAt: now + 900 * 1000 });
      
      // Save to Redis (15 mins TTL)
      try {
        await redisService.set(cacheKey, JSON.stringify(weatherData), 900);
      } catch (e) {
        console.warn(`[WeatherService] Redis set failed for ${cacheKey}`);
      }
      
      return weatherData;
    } catch (error: any) {
      console.error("Weather API Error:", error.message);
      if (error.message === "RATE_LIMIT_EXCEEDED") {
         throw new Error("RATE_LIMIT_EXCEEDED");
      }
      throw new Error("EXTERNAL_API_ERROR");
    }
  }
}

export const weatherService = new WeatherService();
