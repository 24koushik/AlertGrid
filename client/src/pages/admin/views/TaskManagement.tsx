import React, { useState, useEffect } from "react";
import { useFetch } from "../../../hooks/useApi";
import api from "../../../services/api";
import {
  ClipboardList,
  Search,
  Plus,
  UserCircle,
  Play,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TaskManagement() {
  const { data, loading, error, refetch } = useFetch<any>("/tasks");
  const { data: volunteersData } = useFetch<any>("/volunteers");
  const [items, setItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    volunteerId: "",
    priority: "HIGH",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (data && data.tasks) setItems(data.tasks);
    else if (data && Array.isArray(data)) setItems(data);
  }, [data]);

  const volunteers = volunteersData?.volunteers || [];

  const handleCreate = async () => {
    if (!newTask.title) return;
    setSubmitting(true);
    try {
      await api.post("/tasks", newTask);
      setCreateModalOpen(false);
      refetch();
    } catch (err) {
      console.error(err);
      alert("Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/tasks/${id}/status`, { status });
      refetch();
    } catch (err) {
      console.error(err);
      alert("Failed to update task");
    }
  };

  const filteredItems = items.filter((item: any) =>
    JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading)
    return (
      <div className="p-8 text-center text-slate-500">Loading Tasks...</div>
    );
  if (error)
    return (
      <div className="p-8 text-center text-red-500">Failed to load Tasks.</div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <ClipboardList className="mr-2 h-6 w-6 text-slate-700" />
            Task Management
          </h1>
          <p className="text-slate-500">
            Manage operational tasks and assignments.
          </p>
        </div>
        <Button
          onClick={() => setCreateModalOpen(true)}
          className="bg-brand-indigo hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" /> Create Task
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
            Total Tasks: {filteredItems.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-3">Task</th>
                <th className="px-6 py-3">Assigned To</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Created</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    No tasks found.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item: any) => (
                  <tr
                    key={item.id}
                    className="bg-white border-b hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">
                        {item.title}
                      </div>
                      <div className="text-xs text-slate-500 truncate max-w-[200px]">
                        {item.description}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.volunteer ? (
                        <span className="flex items-center font-medium text-slate-700">
                          <UserCircle className="w-4 h-4 mr-1 text-slate-400" />
                          {item.volunteer.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-[10px] font-bold rounded-full ${item.status === "COMPLETED" ? "bg-brand-emerald/10 text-brand-emerald" : item.status === "IN_PROGRESS" ? "bg-brand-indigo/20 text-brand-indigo" : "bg-slate-100 text-slate-700"}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {item.status !== "COMPLETED" &&
                        item.status !== "CANCELLED" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs text-brand-indigo"
                              onClick={() =>
                                updateStatus(item.id, "IN_PROGRESS")
                              }
                            >
                              Start
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs text-brand-emerald"
                              onClick={() => updateStatus(item.id, "COMPLETED")}
                            >
                              Complete
                            </Button>
                          </>
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
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">Create New Task</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  placeholder="e.g. Distribute rations"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  rows={3}
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Assign Volunteer (Optional)
                </label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  value={newTask.volunteerId}
                  onChange={(e) =>
                    setNewTask({ ...newTask, volunteerId: e.target.value })
                  }
                >
                  <option value="">-- Leave Unassigned --</option>
                  {volunteers.map((v: any) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
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
                className="bg-brand-indigo hover:bg-blue-700 text-white"
                onClick={handleCreate}
                disabled={submitting}
              >
                {submitting ? "Creating..." : "Create Task"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
