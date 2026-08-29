import { redisService } from "../redisService";

interface CacheEntry {
  data: any;
  expiresAt: number;
}

export class WeatherService {
  private memoryCache = new Map<string, CacheEntry>();
  private openWeatherRateLimitUntil = 0;
  private inFlightRequests = new Map<string, Promise<any>>();

  async getWeather(lat: number, lon: number) {
    if (!process.env.OPENWEATHER_API_KEY) {
      throw new Error("API_NOT_CONFIGURED");
    }

    // 1. Normalize coordinates to 3 decimal places (approx 111m precision)
    const normLat = Number(lat.toFixed(3));
    const normLon = Number(lon.toFixed(3));
    const cacheKey = `weather:ow:${normLat.toFixed(3)}:${normLon.toFixed(3)}`;
    const now = Date.now();

    console.log(`[WeatherService] Normalized coordinates: ${normLat},${normLon}`);

    // 2. Try Redis cache first
    try {
      const cached = await redisService.get(cacheKey);
      if (cached) {
        console.log(`[WeatherService] Cache HIT (Redis) for ${cacheKey}`);
        const parsed = JSON.parse(cached);
        this.memoryCache.set(cacheKey, { data: parsed, expiresAt: now + 900 * 1000 });
        return parsed;
      }
    } catch (e) {
      console.warn(`[WeatherService] Redis get failed for ${cacheKey}`);
    }

    // 3. Try Memory cache
    const memCached = this.memoryCache.get(cacheKey);
    if (memCached && memCached.expiresAt > now) {
      console.log(`[WeatherService] Cache HIT (Memory) for ${cacheKey}`);
      return memCached.data;
    }

    // 4. Request Deduplication (In-flight coalescing)
    if (this.inFlightRequests.has(cacheKey)) {
      console.log(`[WeatherService] Deduplicating request. Waiting for in-flight OpenWeather request for ${cacheKey}...`);
      return this.inFlightRequests.get(cacheKey);
    }

    const fetchPromise = this._fetchWeatherWithFallback(normLat, normLon, cacheKey, memCached);
    this.inFlightRequests.set(cacheKey, fetchPromise);

    try {
      const result = await fetchPromise;
      return result;
    } finally {
      this.inFlightRequests.delete(cacheKey);
    }
  }

  private async _fetchWeatherWithFallback(lat: number, lon: number, cacheKey: string, memCached?: CacheEntry) {
    const now = Date.now();
    console.log(`[WeatherService] Cache MISS for ${cacheKey}. Fetching from OpenWeather...`);

    // Check Cooldown Backoff
    if (now < this.openWeatherRateLimitUntil) {
      console.warn(`[WeatherService] OpenWeather 429 - entering cooldown (or currently in cooldown). Skipping fetch.`);
      if (memCached) {
        console.log(`[WeatherService] Returning STALE memory cache fallback for ${cacheKey}`);
        return { ...memCached.data, isStale: true };
      }
      throw new Error("RATE_LIMIT_EXCEEDED");
    }

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;

      const res = await fetch(url, { 
        signal: AbortSignal.timeout(5000),
        headers: {
          "Accept": "application/json",
          "User-Agent": "AlertGrid/1.0"
        }
      });
      
      if (!res.ok) {
        // Redact the URL to avoid logging the API key
        const safeUrl = url.replace(process.env.OPENWEATHER_API_KEY!, "HIDDEN_KEY");
        const errBody = await res.text().catch(() => "could not read body");
        console.error(`[WeatherService] OpenWeather Error! HTTP ${res.status} | URL: ${safeUrl} | Lat: ${lat}, Lon: ${lon} | Body: ${errBody}`);
        
        // Handle 429 Rate Limit Explicitly
        if (res.status === 429) {
          console.warn(`[WeatherService] OpenWeather 429 Quota Exhausted! Setting 60m cooldown.`);
          this.openWeatherRateLimitUntil = now + 60 * 60 * 1000; // 1 hour cooldown
          // Return stale cache if available
          if (memCached) {
             console.log(`[WeatherService] Returning STALE memory cache fallback for ${cacheKey}`);
             return { ...memCached.data, isStale: true };
          }
          throw new Error("RATE_LIMIT_EXCEEDED");
        }
        
        throw new Error(`OpenWeather returned error: ${res.status}`);
      }

      const data = await res.json();

      const weatherData = {
        temperature: data.main?.temp || 0,
        feelsLike: data.main?.feels_like || 0,
        humidity: data.main?.humidity || 0,
        windSpeed: data.wind?.speed || 0,
        windDirection: data.wind?.deg || 0,
        precipitation: data.rain && data.rain["1h"] ? data.rain["1h"] : 0,
        condition: data.weather && data.weather[0] ? data.weather[0].main : "Clear", 
        description: data.weather && data.weather[0] ? data.weather[0].description : "clear sky",
      };

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
