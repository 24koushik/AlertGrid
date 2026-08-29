import React, { useState, useEffect } from "react";
import { useFetch } from "../../../hooks/useApi";
import api from "../../../services/api";
import { Home, Plus, Search, Edit, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ShelterManagement() {
  const { data, loading, error, refetch } = useFetch<any>("/shelters");
  const [items, setItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    capacity: 100,
    currentOccupancy: 0,
    status: "OPEN",
    latitude: 13.0,
    longitude: 80.2,
  });

  useEffect(() => {
    if (data && data.shelters) setItems(data.shelters);
    else if (data && Array.isArray(data)) setItems(data);
  }, [data]);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      name: "",
      address: "",
      capacity: 100,
      currentOccupancy: 0,
      status: "OPEN",
      latitude: 13.0,
      longitude: 80.2,
    });
    setModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      address: item.address,
      capacity: item.capacity,
      currentOccupancy: item.currentOccupancy,
      status: item.status || "OPEN",
      latitude: item.latitude || 13.0,
      longitude: item.longitude || 80.2,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.currentOccupancy > formData.capacity) {
      alert("Occupancy cannot be greater than capacity");
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/shelters/${editingId}`, formData);
      } else {
        await api.post("/shelters", formData);
      }
      setModalOpen(false);
      refetch();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save shelter");
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
        Loading Shelter Management...
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load Shelters.
      </div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <Home className="mr-2 h-6 w-6 text-slate-700" />
            Shelter Management
          </h1>
          <p className="text-slate-500">
            Manage emergency shelters and capacity.
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          className="bg-brand-indigo hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Shelter
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
                <th className="px-6 py-3">Shelter Name</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Capacity</th>
                <th className="px-6 py-3">Occupancy</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item: any) => (
                <tr
                  key={item.id}
                  className="bg-white border-b hover:bg-slate-50"
                >
                  <td className="px-6 py-4 font-bold text-slate-900">
                    {item.name}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-[10px] font-bold rounded-full ${item.status === "OPEN" ? "bg-brand-emerald/10 text-brand-emerald" : "bg-brand-red/20 text-brand-red"}`}
                    >
                      {item.status || "OPEN"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{item.capacity}</td>
                  <td className="px-6 py-4 text-slate-500">
                    {item.currentOccupancy}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => openEditModal(item)}
                    >
                      <Edit className="h-4 w-4 text-slate-600" />
                    </Button>
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
                {editingId ? "Edit Shelter" : "Add Shelter"}
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
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Address
                  </label>
                  <input
                    required
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Capacity
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.capacity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          capacity: parseInt(e.target.value),
                        })
                      }
                      className="w-full border p-2 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Occupancy
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.currentOccupancy}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          currentOccupancy: parseInt(e.target.value),
                        })
                      }
                      className="w-full border p-2 rounded"
                    />
                  </div>
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
                    <option value="OPEN">Open</option>
                    <option value="FULL">Full</option>
                    <option value="CLOSED">Closed</option>
                  </select>
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
                  {submitting ? "Saving..." : "Save Shelter"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
