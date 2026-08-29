import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useFetch } from "../../../hooks/useApi";
import DisasterMap from "../../../components/maps/DisasterMap";
import {
  MapPin,
  User,
  Activity,
  AlertCircle,
  Navigation,
  CheckCircle,
  ShieldAlert,
  Waves,
  Wind,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Haversine formula for distance
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function OperationsMap() {
  const { user } = useAuth();

  const {
    data: alertsData,
    loading: alertsLoading,
    error: alertsError,
  } = useFetch<any>("/alerts");
  const {
    data: sheltersData,
    loading: sheltersLoading,
    error: sheltersError,
  } = useFetch<any>("/shelters");
  const {
    data: incidentsData,
    loading: incidentsLoading,
    error: incidentsError,
  } = useFetch<any>("/incidents");
  const {
    data: tasksData,
    loading: tasksLoading,
    error: tasksError,
  } = useFetch<any>("/tasks");
  const {
    data: requestsData,
    loading: requestsLoading,
    error: requestsError,
  } = useFetch<any>("/assistance");

  const alerts = alertsData?.alerts || [];
  const shelters = sheltersData?.shelters || [];
  const incidents = incidentsData?.incidents || [];
  const tasks = tasksData?.tasks || [];
  const requests = requestsData?.requests || [];

  const hasApiError =
    !!alertsError ||
    !!sheltersError ||
    !!incidentsError ||
    !!tasksError ||
    !!requestsError;

  // Volunteer location (in a real app, this would come from user profile or device geolocation)
  const volunteerLat = user?.location
    ? parseFloat(user?.location?.split(",")[0] || "13.0827")
    : 13.0827;
  const volunteerLon = user?.location
    ? parseFloat(user?.location?.split(",")[1] || "80.2707")
    : 80.2707;

  if (hasApiError) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <MapPin className="mr-2 h-5 w-5 text-slate-400" />
            Operations Map
          </h1>
        </div>
        <div className="bg-brand-red/10 border border-brand-red/20 rounded-xl p-6 text-center">
          <AlertCircle className="h-8 w-8 mb-3 text-brand-red" />
          <h2 className="text-xl font-bold text-brand-red mb-2">
            Service Temporarily Unavailable
          </h2>
          <p className="text-brand-red mb-4">
            Unable to retrieve operational data. Please check connection.
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="border-brand-red/20 text-brand-red hover:bg-brand-red/20"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center">
          <MapPin className="mr-2 h-5 w-5 text-slate-400" />
          Operations Map
        </h1>
        <Button variant="outline" className="text-sm">
          <Navigation className="mr-2 h-4 w-4" /> Fullscreen
        </Button>
      </div>

      {/* Map Controls */}
      <div className="bg-white rounded-xl border p-4 mb-6 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 text-sm">
            <ShieldAlert className="h-4 w-4 text-brand-red" />
            <span>
              Active Alerts:{" "}
              {alerts.filter((a) => a.status === "ACTIVE").length}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Activity className="h-4 w-4 text-brand-aqua" />
            <span>
              Active Incidents:{" "}
              {
                incidents.filter(
                  (i) => i.status === "ACTIVE" || i.status === "UNDER_CONTROL",
                ).length
              }
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <User className="h-4 w-4 text-brand-emerald" />
            <span>Available Volunteers: {5}</span>{" "}
            {/* This would come from API */}
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="h-4 w-4 text-orange-500" />
            <span>
              Open Shelters:{" "}
              {shelters.filter((s) => s.status === "OPEN").length}
            </span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-white rounded-xl border h-[600px] overflow-hidden">
        <DisasterMap
          shelters={shelters}
          alerts={alerts}
          incidents={incidents}
          tasks={tasks}
          requests={requests}
          centerLoc={[volunteerLat, volunteerLon]}
          zoom={12}
        />
      </div>

      {/* Map Legend */}
      <div className="mt-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Map Legend</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 text-sm">
            <div className="h-4 w-4 bg-brand-indigo/100 rounded-full ring-2 ring-white" />
            <span>Your Location</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="h-4 w-4 bg-brand-emerald/100 rounded-full ring-2 ring-white" />
            <span>Open Shelter</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="h-4 w-4 bg-brand-red/100 rounded-full ring-2 ring-white" />
            <span>Full Shelter</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="h-4 w-4 bg-gray-500 rounded-full ring-2 ring-white" />
            <span>Closed Shelter</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="h-4 w-4 bg-yellow-500 rounded-full ring-2 ring-white" />
            <span>Emergency Only Shelter</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="h-4 w-4 bg-brand-red rounded-full ring-2 ring-white" />
            <span>Critical Incident</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="h-4 w-4 bg-brand-amber/100 rounded-full ring-2 ring-white" />
            <span>High Severity Incident</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="h-4 w-4 bg-yellow-400 rounded-full ring-2 ring-white" />
            <span>Moderate Incident</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="h-4 w-4 bg-blue-400 rounded-full ring-2 ring-white" />
            <span>Low Severity Incident</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="h-4 w-4 bg-brand-indigo/100 rounded-full ring-2 ring-white" />
            <span>In Progress Task</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="h-4 w-4 bg-brand-emerald/100 rounded-full ring-2 ring-white" />
            <span>Completed Task</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="h-4 w-4 bg-yellow-400 rounded-full ring-2 ring-white" />
            <span>Assigned Task</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="h-4 w-4 bg-gray-400 rounded-full ring-2 ring-white" />
            <span>Pending Task</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="h-4 w-4 bg-brand-red rounded-full ring-2 ring-white" />
            <span>Critical Assistance Request</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="h-4 w-4 bg-brand-amber/100 rounded-full ring-2 ring-white" />
            <span>High Priority Request</span>
          </div>
        </div>
      </div>
    </div>
  );
}
