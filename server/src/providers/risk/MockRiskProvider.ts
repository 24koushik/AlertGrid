import { WeatherData } from "../weather/MockWeatherProvider";
import { Severity } from "@prisma/client";

export interface RiskPrediction {
  disasterType: string;
  riskScore: number;
  riskLevel: Severity;
  confidence: number;
  reasons: string[];
}

export interface IRiskProvider {
  calculateRisk(
    weather: WeatherData,
    locationData: any,
  ): Promise<RiskPrediction>;
}

export class MockRiskProvider implements IRiskProvider {
  async calculateRisk(
    weather: WeatherData,
    locationData: any,
  ): Promise<RiskPrediction> {
    let score = 0;
    const reasons: string[] = [];

    if (weather.rainfall > 30) {
      score += 40;
      reasons.push("Heavy rainfall detected");
    }

    if (weather.windSpeed > 80) {
      score += 40;
      reasons.push("Severe wind speeds");
    }

    let riskLevel: Severity = "LOW";
    if (score >= 75) riskLevel = "CRITICAL";
    else if (score >= 50) riskLevel = "HIGH";
    else if (score >= 25) riskLevel = "MODERATE";

    return {
      disasterType: weather.windSpeed > 80 ? "Cyclone" : "Flood",
      riskScore: score,
      riskLevel,
      confidence: 0.85,
      reasons,
    };
  }
}
