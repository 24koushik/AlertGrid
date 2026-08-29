export interface WeatherData {
  temperature: number;
  rainfall: number;
  windSpeed: number;
  humidity: number;
  pressure: number;
  condition: string;
}

export interface IWeatherProvider {
  getWeatherByLocation(lat: number, lon: number): Promise<WeatherData>;
}

export class MockWeatherProvider implements IWeatherProvider {
  async getWeatherByLocation(lat: number, lon: number): Promise<WeatherData> {
    // Generate deterministic pseudo-random weather based on coordinates
    const seed = Math.abs(lat + lon);

    return {
      temperature: 20 + (seed % 15),
      rainfall: seed % 50,
      windSpeed: 10 + (seed % 100),
      humidity: 50 + (seed % 40),
      pressure: 980 + (seed % 40),
      condition: seed % 2 === 0 ? "Storm" : "Heavy Rain",
    };
  }
}
