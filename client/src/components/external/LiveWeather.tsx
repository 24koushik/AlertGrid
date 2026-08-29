import React, { useEffect, useState } from "react";
import { Cloud, Droplets, Wind, AlertCircle } from "lucide-react";
import api from "../../services/api";

export function LiveWeather({ lat, lon }: { lat: number; lon: number }) {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/external/weather?lat=${lat}&lon=${lon}`);
        setWeather(res.data.weather);
        setError("");
      } catch (err: any) {
        if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else if (err.response?.status === 503) {
          setError("Live weather unavailable — API not configured.");
        } else {
          setError("Live weather temporarily unavailable.");
        }
      } finally {
        setLoading(false);
      }
    };
    if (lat && lon) fetchWeather();
  }, [lat, lon]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border p-4 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-10 bg-slate-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border p-4 flex items-start space-x-3 text-slate-500">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="bg-white rounded-xl border p-4">
      <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center">
        <Cloud className="w-4 h-4 mr-2" />
        Live Weather
        {weather.isStale && (
          <span className="ml-2 text-[10px] text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
            Cached (API Limit)
          </span>
        )}
      </h3>
      <div className="flex items-end space-x-2 mb-4">
        <span className="text-4xl font-bold text-slate-900">
          {Math.round(weather.temperature)}°C
        </span>
        <span className="text-sm text-slate-500 mb-1 capitalize">
          {weather.description}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center text-slate-600">
          <Droplets className="w-4 h-4 mr-2 text-blue-500" />
          {weather.humidity}% Humidity
        </div>
        <div className="flex items-center text-slate-600">
          <Wind className="w-4 h-4 mr-2 text-slate-500" />
          {weather.windSpeed} m/s Wind
        </div>
      </div>
    </div>
  );
}
