import React, { useState, useEffect } from "react";
import { useFetch } from "../../../hooks/useApi";
import api from "../../../services/api";
import { ShieldAlert, Plus, Search, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../../context/AuthContext";

export default function AlertManagement() {
  const { data, loading, error, refetch } = useFetch<any>("/alerts");
  const [items, setItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { user } = useAuth();

  const [newAlert, setNewAlert] = useState({
    title: "",
    description: "",
    disasterType: "Flood",
    severity: "HIGH",
    latitude: 13.0827,
    longitude: 80.2707,
    radius: 10,
    instructions: "",
    expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 16),
  });

  useEffect(() => {
    if (data && data.alerts) setItems(data.alerts);
    else if (data && Array.isArray(data)) setItems(data);
  }, [data]);

  const handleCreate = async () => {
    if (!newAlert.title || !newAlert.description) return;
    setSubmitting(true);
    try {
      await api.post("/alerts", {
        ...newAlert,
        expiryTime: new Date(newAlert.expiryTime).toISOString(),
        createdById: user?.id,
      });
      setCreateModalOpen(false);
      refetch();
    } catch (err) {
      console.error(err);
      alert("Failed to create alert");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm("Are you sure you want to deactivate this alert?")) return;
    try {
      await api.patch(`/alerts/${id}`, { status: "CANCELLED" });
      refetch();
    } catch (err) {
      console.error(err);
      alert("Failed to deactivate alert");
    }
  };

  const filteredItems = items.filter((item: any) =>
    JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading)
    return (
      <div className="p-8 text-center text-slate-500">Loading Alerts...</div>
    );
  if (error)
    return (
      <div className="p-8 text-center text-red-500">Failed to load Alerts.</div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <ShieldAlert className="mr-2 h-6 w-6 text-slate-700" />
            Alert Management
          </h1>
          <p className="text-slate-500">
            Create, monitor and manage emergency alerts across affected areas.
          </p>
        </div>
        <Button
          onClick={() => setCreateModalOpen(true)}
          className="bg-brand-indigo hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" /> Broadcast Alert
        </Button>
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
          <div className="text-sm text-slate-500 font-medium">
            Active Alerts:{" "}
            {filteredItems.filter((i) => i.status === "ACTIVE").length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-3">Severity</th>
                <th className="px-6 py-3">Title & Details</th>
                <th className="px-6 py-3">Disaster Type</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Created</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    No alerts found.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item: any) => (
                  <tr
                    key={item.id}
                    className="bg-white border-b hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-[10px] font-bold rounded-full ${item.severity === "CRITICAL" ? "bg-brand-red/20 text-brand-red" : item.severity === "HIGH" ? "bg-amber-100 text-amber-700" : "bg-brand-indigo/20 text-brand-indigo"}`}
                      >
                        {item.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">
                        {item.title}
                      </div>
                      <div className="text-xs text-slate-500 truncate max-w-[250px]">
                        {item.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {item.disasterType}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-[10px] font-bold rounded-full ${item.status === "ACTIVE" ? "bg-brand-emerald/10 text-brand-emerald" : "bg-slate-100 text-slate-700"}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.status === "ACTIVE" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs text-brand-red hover:bg-brand-red/10"
                          onClick={() => handleDeactivate(item.id)}
                        >
                          Deactivate
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">Broadcast New Alert</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  value={newAlert.title}
                  onChange={(e) =>
                    setNewAlert({ ...newAlert, title: e.target.value })
                  }
                  placeholder="e.g. Extreme Flood Warning"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Severity
                  </label>
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    value={newAlert.severity}
                    onChange={(e) =>
                      setNewAlert({ ...newAlert, severity: e.target.value })
                    }
                  >
                    <option value="LOW">LOW</option>
                    <option value="MODERATE">MODERATE</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Disaster Type
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    value={newAlert.disasterType}
                    onChange={(e) =>
                      setNewAlert({ ...newAlert, disasterType: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  value={newAlert.description}
                  onChange={(e) =>
                    setNewAlert({ ...newAlert, description: e.target.value })
                  }
                  rows={3}
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Instructions for Citizens
                </label>
                <textarea
                  className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  value={newAlert.instructions}
                  onChange={(e) =>
                    setNewAlert({ ...newAlert, instructions: e.target.value })
                  }
                  rows={2}
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Expiry Time
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    value={newAlert.expiryTime}
                    onChange={(e) =>
                      setNewAlert({ ...newAlert, expiryTime: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Radius (km)
                  </label>
                  <input
                    type="number"
                    className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    value={newAlert.radius}
                    onChange={(e) =>
                      setNewAlert({
                        ...newAlert,
                        radius: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <div className="p-4 border-t bg-slate-50 flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-brand-red hover:bg-red-700 text-white"
                onClick={handleCreate}
                disabled={submitting}
              >
                {submitting ? "Broadcasting..." : "Broadcast Alert"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
