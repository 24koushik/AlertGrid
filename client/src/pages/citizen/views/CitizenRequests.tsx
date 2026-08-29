import React, { useState, useEffect } from "react";
import { useFetch } from "../../../hooks/useApi";
import api from "../../../services/api";
import { Search, CheckCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../../context/AuthContext";

export default function CitizenRequests() {
  const { data, loading, error, refetch } = useFetch<any>("/assistance");
  const [items, setItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const [newRequest, setNewRequest] = useState({
    requestType: "Evacuation",
    description: "",
    location: "",
    priority: "HIGH",
  });

  useEffect(() => {
    if (data && data.requests) setItems(data.requests);
    else if (data && Array.isArray(data)) setItems(data);
  }, [data]);

  useEffect(() => {
    import("../../../services/socket").then(({ socketService }) => {
      const s = socketService.connect();
      s?.on("assistance:updated", () => refetch());
    });
  }, [refetch]);

  const handleCreate = async () => {
    if (!newRequest.description || !newRequest.location) return;
    setSubmitting(true);
    try {
      await api.post("/assistance", {
        ...newRequest,
        userId: user?.id,
        latitude: 13.0827,
        longitude: 80.2707,
      });
      setCreateModalOpen(false);
      refetch();
    } catch (err) {
      console.error(err);
      alert("Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = items.filter((item: any) =>
    JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading)
    return (
      <div className="p-8 text-center text-slate-500">
        Loading My Requests...
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load My Requests.
      </div>
    );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <CheckCircle className="mr-2 h-6 w-6 text-slate-700" />
            My Requests
          </h1>
          <p className="text-slate-500">
            Track your emergency assistance requests.
          </p>
        </div>
        <Button
          onClick={() => setCreateModalOpen(true)}
          className="bg-brand-red hover:bg-red-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" /> Request Help
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
            Total Requests: {filteredItems.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-3">Priority</th>
                <th className="px-6 py-3">Type & Details</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    No requests found.
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
                        className={`px-2 py-1 text-[10px] font-bold rounded-full ${item.priority === "CRITICAL" ? "bg-brand-red/20 text-brand-red" : item.priority === "HIGH" ? "bg-amber-100 text-amber-700" : "bg-brand-indigo/20 text-brand-indigo"}`}
                      >
                        {item.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">
                        {item.requestType}
                      </div>
                      <div className="text-xs text-slate-500 truncate max-w-[200px]">
                        {item.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 truncate max-w-[200px]">
                      {item.location}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-[10px] font-bold rounded-full ${item.status === "RESOLVED" ? "bg-green-100 text-brand-emerald" : item.status === "ASSIGNED" ? "bg-brand-indigo/20 text-brand-indigo" : "bg-slate-100 text-slate-700"}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(item.createdAt).toLocaleString()}
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
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-brand-red">
                Request Emergency Assistance
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Assistance Type
                  </label>
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    value={newRequest.requestType}
                    onChange={(e) =>
                      setNewRequest({
                        ...newRequest,
                        requestType: e.target.value,
                      })
                    }
                  >
                    <option value="Evacuation">Evacuation</option>
                    <option value="Medical">Medical Aid</option>
                    <option value="Food/Water">Food & Water</option>
                    <option value="Shelter">Shelter Needed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    value={newRequest.priority}
                    onChange={(e) =>
                      setNewRequest({ ...newRequest, priority: e.target.value })
                    }
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">
                      CRITICAL (Life-Threatening)
                    </option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Location / Address
                </label>
                <input
                  type="text"
                  className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  value={newRequest.location}
                  onChange={(e) =>
                    setNewRequest({ ...newRequest, location: e.target.value })
                  }
                  placeholder="Where do you need help?"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Situation Description
                </label>
                <textarea
                  className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  value={newRequest.description}
                  onChange={(e) =>
                    setNewRequest({
                      ...newRequest,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  placeholder="Describe your situation and number of people affected..."
                ></textarea>
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
                {submitting ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
