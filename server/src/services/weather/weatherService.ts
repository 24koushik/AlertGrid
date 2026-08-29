import { redisService } from "../redisService";

export class WeatherService {
  async getWeather(lat: number, lon: number) {
    const cacheKey = `weather:om:${lat.toFixed(2)}:${lon.toFixed(2)}`;

    // Try Redis cache first (TTL 15 mins)
    const cached = await redisService.get(cacheKey);
    if (cached) return JSON.parse(cached);

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,showers,weather_code,wind_speed_10m,wind_direction_10m`;

      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) throw new Error("Open-Meteo returned error");

      const data = await res.json();

      const current = data.current;

      const weatherData = {
        temperature: current.temperature_2m,
        feelsLike: current.apparent_temperature,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        windDirection: current.wind_direction_10m,
        precipitation: current.precipitation,
        condition: "Clear", // We can map weather_code to strings if needed
        description: `WMO Code: ${current.weather_code}`,
      };

      // Simple WMO mapping
      const wmoMap: Record<number, string> = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Fog",
        48: "Depositing rime fog",
        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",
        61: "Slight rain",
        63: "Moderate rain",
        65: "Heavy rain",
        71: "Slight snow fall",
        73: "Moderate snow fall",
        75: "Heavy snow fall",
        80: "Slight rain showers",
        81: "Moderate rain showers",
        82: "Violent rain showers",
        95: "Thunderstorm",
        96: "Thunderstorm with slight hail",
        99: "Thunderstorm with heavy hail",
      };

      if (wmoMap[current.weather_code]) {
        weatherData.description = wmoMap[current.weather_code];
        if (current.weather_code < 40) weatherData.condition = "Clear/Cloudy";
        else if (current.weather_code < 70) weatherData.condition = "Rain";
        else if (current.weather_code < 80) weatherData.condition = "Snow";
        else if (current.weather_code < 90) weatherData.condition = "Showers";
        else weatherData.condition = "Thunderstorm";
      }

      await redisService.set(cacheKey, JSON.stringify(weatherData), 900); // 15 mins cache
      return weatherData;
    } catch (error: any) {
      console.error("Weather API Error:", error.message);
      throw new Error("EXTERNAL_API_ERROR");
    }
  }
}

export const weatherService = new WeatherService();
