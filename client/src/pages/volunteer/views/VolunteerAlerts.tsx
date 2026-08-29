import React, { useState, useEffect } from "react";
import { useFetch } from "../../../hooks/useApi";
import api from "../../../services/api";
import { socketService } from "../../../services/socket";
import { ShieldAlert, Search, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VolunteerAlerts() {
  const { data, loading, error, refetch } = useFetch<any>("/alerts");
  const [items, setItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

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
        Loading Active Alerts...
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load Active Alerts. Please try again.
      </div>
    );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <ShieldAlert className="mr-2 h-6 w-6 text-slate-700" />
            Active Alerts
          </h1>
          <p className="text-slate-500">Emergency alerts in your area.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
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
                <th className="px-6 py-3">Created</th>
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
                    No records found.
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
                        className={`px-2 py-1 text-xs font-bold rounded-full ${item.severity === "CRITICAL" || item.severity === "ACTIVE" || item.severity === "OPEN" ? "bg-brand-red/20 text-brand-red" : "bg-slate-100 text-slate-700"}`}
                      >
                        {item.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {item.title}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-brand-indigo"
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
