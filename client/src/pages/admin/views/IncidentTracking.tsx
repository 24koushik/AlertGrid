import React, { useState, useEffect } from "react";
import { useFetch } from "../../../hooks/useApi";
import api from "../../../services/api";
import {
  Activity,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function IncidentTracking() {
  const { data, loading, error, refetch } = useFetch<any>("/incidents");
  const [items, setItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    disasterType: "Flood",
    severity: "HIGH",
    status: "ACTIVE",
    latitude: 13.0,
    longitude: 80.2,
    affectedArea: 10,
  });

  useEffect(() => {
    if (data && data.incidents) setItems(data.incidents);
    else if (data && Array.isArray(data)) setItems(data);
  }, [data]);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      disasterType: "Flood",
      severity: "HIGH",
      status: "ACTIVE",
      latitude: 13.0,
      longitude: 80.2,
      affectedArea: 10,
    });
    setModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      description: item.description,
      disasterType: item.disasterType || "Flood",
      severity: item.severity || "HIGH",
      status: item.status || "ACTIVE",
      latitude: item.latitude || 13.0,
      longitude: item.longitude || 80.2,
      affectedArea: item.affectedArea || 10,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/incidents/${editingId}`, formData);
      } else {
        await api.post("/incidents", formData);
      }
      setModalOpen(false);
      refetch();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save incident");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async (id: string) => {
    if (!confirm("Mark incident as RESOLVED?")) return;
    try {
      await api.patch(`/incidents/${id}/status`, { status: "RESOLVED" });
      refetch();
    } catch (err) {
      console.error(err);
      alert("Failed to resolve incident");
    }
  };

  const filteredItems = items.filter((item: any) =>
    JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading)
    return (
      <div className="p-8 text-center text-slate-500">
        Loading Incident Tracking...
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load Incident Tracking.
      </div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <Activity className="mr-2 h-6 w-6 text-slate-700" />
            Incident Tracking
          </h1>
          <p className="text-slate-500">
            Monitor and coordinate active emergency incidents.
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          className="bg-brand-indigo hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" /> Create New
        </Button>
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
          <div className="text-sm text-slate-500 font-medium">
            Total: {filteredItems.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-3">Severity</th>
                <th className="px-6 py-3">Incident Details</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Reported</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item: any) => (
                <tr
                  key={item.id}
                  className="bg-white border-b hover:bg-slate-50"
                >
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-[10px] font-bold rounded-full ${item.severity === "CRITICAL" ? "bg-brand-red/20 text-brand-red" : item.severity === "HIGH" ? "bg-brand-amber/10 text-brand-amber" : "bg-brand-indigo/20 text-brand-indigo"}`}
                    >
                      {item.severity || "HIGH"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{item.title}</div>
                    <div className="text-xs text-slate-500 truncate max-w-[250px]">
                      {item.description}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-[10px] font-bold rounded-full ${item.status === "RESOLVED" ? "bg-brand-emerald/10 text-brand-emerald" : item.status === "ACTIVE" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"}`}
                    >
                      {item.status || "ACTIVE"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => openEditModal(item)}
                    >
                      <Edit className="h-4 w-4 text-slate-600" />
                    </Button>
                    {item.status !== "RESOLVED" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleResolve(item.id)}
                      >
                        <CheckCircle className="h-4 w-4 text-brand-emerald" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">
                {editingId ? "Edit Incident" : "Log New Incident"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Title
                  </label>
                  <input
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <input
                    required
                    value={formData.disasterType}
                    onChange={(e) =>
                      setFormData({ ...formData, disasterType: e.target.value })
                    }
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full border p-2 rounded"
                  ></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Severity
                    </label>
                    <select
                      value={formData.severity}
                      onChange={(e) =>
                        setFormData({ ...formData, severity: e.target.value })
                      }
                      className="w-full border p-2 rounded"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full border p-2 rounded"
                    >
                      <option value="REPORTED">Reported</option>
                      <option value="VERIFIED">Verified</option>
                      <option value="ACTIVE">Active</option>
                      <option value="UNDER_CONTROL">Under Control</option>
                      <option value="RESOLVED">Resolved</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t bg-slate-50 flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-brand-indigo text-white hover:bg-blue-700"
                >
                  {submitting ? "Saving..." : "Save Incident"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
