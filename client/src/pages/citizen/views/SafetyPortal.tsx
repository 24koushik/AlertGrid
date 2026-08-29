import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useFetch } from "../../../hooks/useApi";
import api from "../../../services/api";
import ShelterMap from "../../../components/maps/ShelterMap";
import { RequestHelpModal } from "../../../components/assistance/RequestHelpModal";
import { LiveWeather } from "../../../components/external/LiveWeather";
import { LiveNews } from "../../../components/external/LiveNews";
import {
  ShieldAlert,
  Info,
  MapPin,
  Navigation,
  Siren,
  CheckCircle,
  Search,
  AlertCircle,
  FileText,
  User,
  Activity,
  Wind,
  CloudRain,
  Shield,
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

export default function CitizenDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    data: alertsData,
    loading: alertsLoading,
    error: alertsError,
    refetch: refetchAlerts,
  } = useFetch<any>("/alerts");
  const {
    data: sheltersData,
    loading: sheltersLoading,
    error: sheltersError,
  } = useFetch<any>("/shelters");
  const { data: requestsData, loading: requestsLoading } =
    useFetch<any>("/assistance");

  useEffect(() => {
    let s: any = null;
    import("../../../services/socket").then(({ socketService }) => {
      s = socketService.connect();
      s?.on("alert:created", () => {
        refetchAlerts();
      });
    });
    return () => {
      if (s) {
        s.off("alert:created");
      }
    };
  }, [refetchAlerts]);

  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const alerts = alertsData?.alerts || alertsData || [];
  const shelters = sheltersData?.shelters || sheltersData || [];
  const requests = requestsData?.requests || requestsData || [];

  const hasApiError = !!alertsError || !!sheltersError;

  // 1. Calculate Priority Alert
  const severityOrder = { CRITICAL: 4, HIGH: 3, MODERATE: 2, LOW: 1 };
  const sortedAlerts = [...alerts].sort(
    (a, b) =>
      severityOrder[b.severity as keyof typeof severityOrder] -
      severityOrder[a.severity as keyof typeof severityOrder],
  );
  const highestAlert = sortedAlerts[0];

  let safetyStatus = "SAFE";
  let safetyMsg = "You're currently safe";
  let safetySubMsg =
    "No active emergency alerts have been reported in your immediate area.";

  if (highestAlert) {
    if (highestAlert.severity === "CRITICAL") {
      safetyStatus = "CRITICAL";
      safetyMsg = "Critical emergency alert";
      safetySubMsg = "Immediate action may be required. Follow local guidance.";
    } else if (highestAlert.severity === "HIGH") {
      safetyStatus = "HIGH";
      safetyMsg = "High risk in your area";
      safetySubMsg = "Please review the current emergency guidance.";
    } else {
      safetyStatus = "MODERATE";
      safetyMsg = "Stay alert";
      safetySubMsg = "Conditions in your area require precaution.";
    }
  }

  // 2. Nearest Shelter Logic
  const communityFallback = user?.memberships?.[0]?.community;
  const [userPos, setUserPos] = useState<{
    userLat: number;
    userLon: number;
  } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserPos({
            userLat: pos.coords.latitude,
            userLon: pos.coords.longitude,
          });
        },
        (error) => {
          console.log("Geolocation error/denied:", error.message);
          if (communityFallback) {
            setUserPos({
              userLat: communityFallback.latitude,
              userLon: communityFallback.longitude,
            });
          }
        },
      );
    } else if (communityFallback) {
      setUserPos({
        userLat: communityFallback.latitude,
        userLon: communityFallback.longitude,
      });
    }
  }, [communityFallback]);

  const openShelters = shelters.filter((s: any) => s.status === "OPEN");
  let nearestShelter: any = null;
  let minDistance = Infinity;

  if (userPos) {
    openShelters.forEach((s: any) => {
      const dist = getDistance(
        userPos.userLat,
        userPos.userLon,
        s.latitude,
        s.longitude,
      );
      if (dist < minDistance) {
        minDistance = dist;
        nearestShelter = { ...s, distance: dist.toFixed(1) };
      }
    });
  }

  if (hasApiError) {
    return (
      <div className="mx-auto max-w-3xl p-4 md:p-8 space-y-8 flex items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center w-full max-w-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-red">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-red-800 mb-2">
            Service Temporarily Unavailable
          </h2>
          <p className="text-brand-red mb-6">
            Unable to retrieve emergency data. Please check connection.
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="border-red-200 text-brand-red hover:bg-red-100"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <RequestHelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        onSuccess={() => {
          setIsHelpModalOpen(false);
          navigate("/citizen/requests");
        }}
      />

      <div className="mx-auto max-w-6xl p-4 md:p-6 space-y-6">
        {/* ROW 1: SAFETY STATUS + CRITICAL ALERT & QUICK ACTIONS */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div
            className={`col-span-1 lg:col-span-2 rounded-xl border shadow-sm overflow-hidden flex flex-col md:flex-row ${safetyStatus === "SAFE" ? "bg-brand-emerald/10 border-brand-emerald/20" : safetyStatus === "CRITICAL" ? "bg-brand-red border-brand-red text-white" : "bg-brand-amber/10 border-brand-amber/20"}`}
          >
            <div className="p-6 md:p-8 flex-1 flex items-start gap-4">
              <div
                className={`mt-1 rounded-full p-3 ${
                  safetyStatus === "SAFE"
                    ? "bg-brand-emerald/20 text-brand-emerald"
                    : safetyStatus === "CRITICAL"
                      ? "bg-brand-red text-white shadow-inner"
                      : "bg-brand-amber/20 text-brand-amber"
                }`}
              >
                {safetyStatus === "SAFE" ? (
                  <Shield className="h-8 w-8" />
                ) : (
                  <AlertCircle className="h-8 w-8" />
                )}
              </div>
              <div>
                <h2
                  className={`text-sm font-bold tracking-wider uppercase mb-1 ${safetyStatus === "CRITICAL" ? "text-white/80" : "text-slate-500"}`}
                >
                  Your Safety Status
                </h2>
                <h3
                  className={`text-2xl md:text-3xl font-bold mb-2 ${safetyStatus === "CRITICAL" ? "text-white" : "text-slate-900"}`}
                >
                  {safetyMsg}
                </h3>
                <p
                  className={`font-medium ${safetyStatus === "CRITICAL" ? "text-white/90" : "text-slate-700"}`}
                >
                  {safetySubMsg}
                </p>

                {highestAlert && safetyStatus === "CRITICAL" && (
                  <div className="mt-4 bg-black/20 rounded-lg p-3 border border-white/20 text-white flex items-center justify-between">
                    <div className="flex items-center">
                      <Siren className="h-4 w-4 text-brand-red mr-2" />
                      <span className="font-semibold text-sm">
                        {highestAlert.title}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-black/20 h-8"
                      onClick={() => navigate("/citizen/alerts")}
                    >
                      Details
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div
              className={`flex flex-row md:flex-col border-t md:border-t-0 md:border-l min-w-[200px] ${safetyStatus === "CRITICAL" ? "border-brand-red/30 bg-black/10" : "border-slate-200 bg-white/50"}`}
            >
              <button
                className={`flex-1 flex flex-col items-center justify-center p-4 transition-colors group ${safetyStatus === "CRITICAL" ? "hover:bg-black/20" : "hover:bg-slate-50"}`}
                onClick={() => setIsHelpModalOpen(true)}
              >
                <Siren
                  className={`h-8 w-8 mb-2 ${safetyStatus === "CRITICAL" ? "text-brand-red group-hover:text-white/80" : "text-brand-red"}`}
                />
                <span
                  className={`font-bold text-sm text-center ${safetyStatus === "CRITICAL" ? "text-white/90" : "text-brand-red"}`}
                >
                  Request Help
                </span>
              </button>
              <div
                className={`h-px w-full md:w-auto md:h-px ${safetyStatus === "CRITICAL" ? "bg-red-800" : "bg-slate-200"}`}
              ></div>
              <button
                className={`flex-1 flex flex-col items-center justify-center p-4 transition-colors group ${safetyStatus === "CRITICAL" ? "hover:bg-black/20" : "hover:bg-slate-50"}`}
                onClick={() => navigate("/citizen/shelters")}
              >
                <Navigation
                  className={`h-8 w-8 mb-2 ${safetyStatus === "CRITICAL" ? "text-blue-400 group-hover:text-blue-300" : "text-brand-indigo"}`}
                />
                <span
                  className={`font-bold text-sm text-center ${safetyStatus === "CRITICAL" ? "text-blue-100" : "text-brand-indigo"}`}
                >
                  Find Shelter
                </span>
              </button>
            </div>
          </div>

          <div className="col-span-1 rounded-xl border border-slate-200 shadow-sm bg-white overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h2 className="font-bold text-sm uppercase tracking-wider text-slate-700 flex items-center">
                <CloudRain className="w-4 h-4 mr-2 text-brand-aqua" />
                Live Environmental Data
              </h2>
            </div>
            <div className="flex-1 p-0">
              {userPos ? (
                <LiveWeather lat={userPos.userLat} lon={userPos.userLon} />
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-sm p-6 text-center">
                  Location services required for precise environmental
                  intelligence.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ROW 2: DISASTER INTELLIGENCE & MAP */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-1 lg:col-span-2 rounded-xl border border-slate-200 shadow-sm bg-white overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h2 className="font-bold text-sm uppercase tracking-wider text-slate-700 flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-slate-500" />
                Interactive Operations Map
              </h2>
            </div>
            <div className="flex-1 min-h-[400px] bg-slate-100 relative">
              <ShelterMap
                shelters={shelters}
                alerts={alerts}
                communityLoc={
                  userPos ? [userPos.userLat, userPos.userLon] : undefined
                }
              />
            </div>
          </div>

          <div className="col-span-1 rounded-xl border border-slate-200 shadow-sm bg-white overflow-hidden flex flex-col h-[400px] lg:h-auto">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h2 className="font-bold text-sm uppercase tracking-wider text-slate-700 flex items-center">
                <Activity className="w-4 h-4 mr-2 text-red-500" />
                Live Disaster Intelligence
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              <LiveNews communityName={communityFallback?.name || "Chennai"} />
            </div>
          </div>
        </section>

        {/* ROW 3: ACTIVE ALERTS & REQUESTS */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ACTIVE ALERTS LIST */}
          <div className="rounded-xl border border-slate-200 shadow-sm bg-white overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h2 className="font-bold text-sm uppercase tracking-wider text-slate-700 flex items-center">
                <ShieldAlert className="w-4 h-4 mr-2 text-slate-500" />
                Active Alerts
              </h2>
              <Button
                variant="link"
                size="sm"
                className="text-brand-indigo h-auto p-0"
                onClick={() => navigate("/citizen/alerts")}
              >
                View All
              </Button>
            </div>
            <div className="p-0">
              {alertsLoading ? (
                <div className="p-4 space-y-3 animate-pulse">
                  <div className="h-16 bg-slate-100 rounded w-full"></div>
                  <div className="h-16 bg-slate-100 rounded w-full"></div>
                </div>
              ) : sortedAlerts.length === 0 ? (
                <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                  <CheckCircle className="h-8 w-8 text-brand-emerald mb-2" />
                  <p className="font-medium text-sm">
                    No active alerts detected
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {sortedAlerts.slice(0, 4).map((alert: any) => (
                    <div
                      key={alert.id}
                      className="p-4 flex items-start hover:bg-slate-50 transition-colors"
                    >
                      <div
                        className={`mt-1 mr-3 w-2 h-2 rounded-full flex-shrink-0 ${alert.severity === "CRITICAL" ? "bg-brand-red animate-pulse" : alert.severity === "HIGH" ? "bg-brand-amber" : "bg-brand-indigo/50"}`}
                      ></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${alert.severity === "CRITICAL" ? "bg-red-100 text-brand-red" : alert.severity === "HIGH" ? "bg-brand-amber/10 text-brand-amber" : "bg-blue-100 text-brand-indigo"}`}
                          >
                            {alert.severity}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(
                              alert.createdAt || alert.startTime,
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 leading-tight mb-1">
                          {alert.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {alert.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* EMERGENCY REQUESTS */}
          <div className="rounded-xl border border-slate-200 shadow-sm bg-white overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h2 className="font-bold text-sm uppercase tracking-wider text-slate-700 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-slate-500" />
                My Emergency Requests
              </h2>
              <Button
                variant="link"
                size="sm"
                className="text-brand-indigo h-auto p-0"
                onClick={() => navigate("/citizen/requests")}
              >
                View History
              </Button>
            </div>
            <div className="p-0">
              {requestsLoading ? (
                <div className="p-4 space-y-3 animate-pulse">
                  <div className="h-12 bg-slate-100 rounded w-full"></div>
                </div>
              ) : requests.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                    <FileText className="h-5 w-5 text-slate-400" />
                  </div>
                  <h3 className="font-medium text-sm text-slate-900 mb-1">
                    No active requests
                  </h3>
                  <p className="text-xs text-slate-500 mb-4 max-w-xs mx-auto">
                    You currently have no emergency assistance requests in the
                    queue.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-brand-red border-red-200 hover:bg-red-50 hover:border-brand-red/30 transition-colors"
                    onClick={() => setIsHelpModalOpen(true)}
                  >
                    Request Emergency Help
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {requests.slice(0, 4).map((req: any) => (
                    <div
                      key={req.id}
                      className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => navigate("/citizen/requests")}
                    >
                      <div>
                        <div className="font-semibold text-slate-900 text-sm mb-0.5">
                          {req.requestType} Request
                        </div>
                        <div className="text-xs text-slate-500 flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {req.location
                            ?.split(",")
                            .map((c: string) => parseFloat(c).toFixed(3))
                            .join(", ")}
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                            req.status === "RESOLVED"
                              ? "bg-brand-emerald/10 text-brand-emerald"
                              : req.status === "ASSIGNED" ||
                                  req.status === "IN_PROGRESS"
                                ? "bg-blue-100 text-brand-indigo"
                                : req.status === "CANCELLED"
                                  ? "bg-slate-100 text-slate-700"
                                  : "bg-orange-100 text-brand-amber border border-orange-200"
                          }`}
                        >
                          {req.status.replace("_", " ")}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ROW 4: NEAREST SHELTER & PREPAREDNESS */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-200 shadow-sm bg-white overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h2 className="font-bold text-sm uppercase tracking-wider text-slate-700 flex items-center">
                <Navigation className="w-4 h-4 mr-2 text-slate-500" />
                Nearest Available Shelter
              </h2>
            </div>
            <div className="p-5">
              {sheltersLoading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </div>
              ) : !nearestShelter ? (
                <div className="text-center text-slate-500 py-4">
                  <Info className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm">No open shelters found nearby.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 mb-1 flex items-center">
                        {nearestShelter.name}
                        <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 bg-brand-emerald/10 text-brand-emerald rounded uppercase">
                          {nearestShelter.status}
                        </span>
                      </h3>
                      <p className="text-sm text-slate-600">
                        {nearestShelter.address}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center text-sm">
                      <Navigation className="h-4 w-4 text-brand-aqua mr-2" />
                      <span className="font-bold text-slate-800 mr-1">
                        {nearestShelter.distance} km
                      </span>{" "}
                      <span className="text-slate-500">away</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <User className="h-4 w-4 text-brand-aqua mr-2" />
                      <span className="font-bold text-slate-800 mr-1">
                        {nearestShelter.capacity -
                          (nearestShelter.currentOccupancy || 0)}
                      </span>{" "}
                      <span className="text-slate-500">available</span>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-1">
                    <Button
                      size="sm"
                      className="flex-1 bg-slate-900 hover:bg-slate-800 text-white"
                      onClick={() =>
                        window.open(
                          `https://www.google.com/maps/dir/?api=1&destination=${nearestShelter.latitude},${nearestShelter.longitude}`,
                        )
                      }
                    >
                      Get Directions
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-slate-300 text-slate-700"
                      onClick={() => navigate("/citizen/shelters")}
                    >
                      Shelter Map
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 shadow-sm bg-white overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h2 className="font-bold text-sm uppercase tracking-wider text-slate-700 flex items-center">
                <Info className="w-4 h-4 mr-2 text-slate-500" />
                Community Preparedness
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div
                className="rounded-lg border border-slate-200 p-4 hover:border-brand-indigo/30 transition-colors cursor-pointer group bg-white"
                onClick={() => navigate("/citizen/guides")}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-brand-indigo">
                    Flood Evacuation Protocol
                  </h3>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    GUIDE
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Essential steps for safe evacuation during rapid water rising
                  events.
                </p>
              </div>

              <div
                className="rounded-lg border border-slate-200 p-4 hover:border-brand-indigo/30 transition-colors cursor-pointer group bg-white"
                onClick={() => navigate("/citizen/guides")}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-brand-indigo">
                    72-Hour Emergency Kit
                  </h3>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    CHECKLIST
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Required supplies for sheltering in place including water,
                  medication, and comms.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
