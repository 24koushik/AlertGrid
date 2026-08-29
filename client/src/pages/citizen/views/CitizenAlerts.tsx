import React, { useState, useEffect } from "react";
import { useFetch } from "../../../hooks/useApi";
import api from "../../../services/api";
import { socketService } from "../../../services/socket";
import { ShieldAlert, Search, X, MapPin, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CitizenAlerts() {
  const { data, loading, error, refetch } = useFetch<any>("/alerts");
  const [items, setItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAlert, setSelectedAlert] = useState<any>(null);

  useEffect(() => {
    if (data && data.alerts) {
      setItems(data.alerts);
    } else if (data && Array.isArray(data)) {
      setItems(data);
    }
  }, [data]);

  useEffect(() => {
    const socket = socketService.connect();
    socket?.on("alert:created", () => {
      refetch();
    });
    return () => {
      socket?.off("alert:created");
    };
  }, [refetch]);

  const filteredItems = items.filter((item: any) =>
    JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading)
    return (
      <div className="p-8 text-center text-slate-500">
        Loading Emergency Alerts...
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load Emergency Alerts. Please try again.
      </div>
    );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <ShieldAlert className="mr-2 h-6 w-6 text-slate-700" />
            Emergency Alerts
          </h1>
          <p className="text-slate-500">
            Stay informed about critical updates in your area.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search alerts..."
              className="pl-9 pr-4 py-2 w-full text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-3">Severity</th>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Published</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    No active alerts found.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item: any, idx: number) => (
                  <tr
                    key={item.id || idx}
                    className="bg-white border-b hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-bold rounded-full uppercase ${
                          item.severity === "CRITICAL"
                            ? "bg-brand-red/20 text-brand-red"
                            : item.severity === "HIGH"
                              ? "bg-orange-100 text-brand-amber"
                              : "bg-brand-indigo/20 text-brand-indigo"
                        }`}
                      >
                        {item.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {item.title}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(
                        item.createdAt || item.startTime,
                      ).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-brand-indigo hover:bg-brand-indigo/10"
                        onClick={() => setSelectedAlert(item)}
                      >
                        Details
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div
              className={`p-4 border-b flex justify-between items-center ${
                selectedAlert.severity === "CRITICAL"
                  ? "bg-brand-red/10"
                  : selectedAlert.severity === "HIGH"
                    ? "bg-brand-amber/10"
                    : "bg-slate-50"
              }`}
            >
              <h2 className="font-bold text-lg flex items-center gap-2">
                {selectedAlert.severity === "CRITICAL" && (
                  <AlertTriangle className="text-brand-red h-5 w-5" />
                )}
                {selectedAlert.title}
              </h2>
              <button
                onClick={() => setSelectedAlert(null)}
                className="text-slate-500 hover:text-slate-800 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase mb-1">
                  Status
                </div>
                <div className="flex gap-2">
                  <span
                    className={`px-2 py-1 text-xs font-bold rounded-full uppercase ${
                      selectedAlert.severity === "CRITICAL"
                        ? "bg-brand-red/20 text-brand-red"
                        : selectedAlert.severity === "HIGH"
                          ? "bg-orange-100 text-brand-amber"
                          : "bg-brand-indigo/20 text-brand-indigo"
                    }`}
                  >
                    {selectedAlert.severity}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-bold rounded-full uppercase ${
                      selectedAlert.status === "ACTIVE"
                        ? "bg-green-100 text-brand-emerald"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {selectedAlert.status}
                  </span>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-500 uppercase mb-1">
                  Description
                </div>
                <p className="text-slate-800 text-sm whitespace-pre-wrap">
                  {selectedAlert.description}
                </p>
              </div>

              {selectedAlert.instructions && (
                <div className="bg-brand-indigo/10 p-4 rounded-lg border border-blue-100">
                  <div className="text-xs font-bold text-blue-800 uppercase mb-1">
                    Instructions
                  </div>
                  <p className="text-blue-900 text-sm whitespace-pre-wrap">
                    {selectedAlert.instructions}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase mb-1">
                    Disaster Type
                  </div>
                  <div className="text-sm font-medium text-slate-800">
                    {selectedAlert.disasterType}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase mb-1 flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    Affected Area
                  </div>
                  <div className="text-sm font-medium text-slate-800">
                    Radius: {selectedAlert.radius}km
                    <br />
                    Lat: {selectedAlert.latitude.toFixed(4)}, Lng:{" "}
                    {selectedAlert.longitude.toFixed(4)}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase mb-1">
                    Issued
                  </div>
                  <div className="text-sm font-medium text-slate-800">
                    {new Date(
                      selectedAlert.startTime || selectedAlert.createdAt,
                    ).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase mb-1">
                    Expires
                  </div>
                  <div className="text-sm font-medium text-slate-800">
                    {new Date(selectedAlert.expiryTime).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-slate-50 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedAlert(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
