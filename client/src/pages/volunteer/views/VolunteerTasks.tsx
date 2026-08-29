import React, { useState, useEffect } from "react";
import { useFetch } from "../../../hooks/useApi";
import api from "../../../services/api";
import { Search, CheckCircle, Clock, Play, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VolunteerTasks() {
  const { data, loading, error, refetch } = useFetch<any>("/tasks");
  const [items, setItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (data && data.tasks) {
      setItems(data.tasks);
    } else if (data && Array.isArray(data)) {
      setItems(data);
    }
  }, [data]);

  useEffect(() => {
    import("../../../services/socket").then(({ socketService }) => {
      const s = socketService.connect();
      s?.on("task:assigned", () => refetch());
      s?.on("task:updated", () => refetch());
    });
  }, [refetch]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/tasks/${id}/status`, { status });
      refetch();
    } catch (err) {
      console.error(err);
      alert("Failed to update task status");
    }
  };

  const filteredItems = items.filter((item: any) =>
    JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading)
    return (
      <div className="p-8 text-center text-slate-500">Loading My Tasks...</div>
    );
  if (error)
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load My Tasks.
      </div>
    );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <CheckCircle className="mr-2 h-6 w-6 text-slate-700" />
            My Tasks
          </h1>
          <p className="text-slate-500">
            Manage your assigned tasks and missions.
          </p>
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
          <div className="text-sm text-slate-500 font-medium">
            Active Tasks:{" "}
            {filteredItems.filter((i) => i.status !== "COMPLETED").length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-3">Priority</th>
                <th className="px-6 py-3">Task Details</th>
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
                    No tasks assigned to you right now.
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
                        className={`px-2 py-1 text-[10px] font-bold rounded-full ${item.priority === "CRITICAL" ? "bg-brand-red/20 text-brand-red" : "bg-amber-100 text-amber-700"}`}
                      >
                        {item.priority || "NORMAL"}
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
                      {item.status === "ASSIGNED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs text-brand-indigo"
                          onClick={() => updateStatus(item.id, "ACCEPTED")}
                        >
                          <Check className="h-3 w-3 mr-1" /> Accept
                        </Button>
                      )}
                      {item.status === "ACCEPTED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs text-amber-600"
                          onClick={() => updateStatus(item.id, "IN_PROGRESS")}
                        >
                          <Play className="h-3 w-3 mr-1" /> Start
                        </Button>
                      )}
                      {item.status === "IN_PROGRESS" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs text-brand-emerald border-brand-emerald/20 bg-brand-emerald/10"
                          onClick={() => updateStatus(item.id, "COMPLETED")}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" /> Complete
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
    </div>
  );
}
