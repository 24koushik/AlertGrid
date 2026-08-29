import React, { useState, useEffect } from "react";
import { useFetch } from "../../../hooks/useApi";
import api from "../../../services/api";
import { FileText, Search, UserCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AssistanceQueue() {
  const { data, loading, error, refetch } = useFetch<any>("/assistance");
  const { data: volunteersData } = useFetch<any>("/volunteers");
  const [items, setItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);

  useEffect(() => {
    if (data && data.requests) setItems(data.requests);
    else if (data && Array.isArray(data)) setItems(data);
  }, [data]);

  useEffect(() => {
    const socket = (api as any).getSocket ? (api as any).getSocket() : null;
    // Let's import socketService and listen
    import("../../../services/socket").then(({ socketService }) => {
      const s = socketService.connect();
      s?.on("assistance:created", () => refetch());
      s?.on("assistance:updated", () => refetch());
    });
  }, [refetch]);

  const volunteers = volunteersData?.volunteers || [];

  const handleAssign = async () => {
    if (!selectedRequest || !selectedVolunteer) return;
    setAssignLoading(true);
    try {
      // Actually, assistance requests might not have a direct volunteer assignment endpoint unless we create a task.
      // But let's assume we can patch the assistance request directly if the API supports it, or create a Task.
      // The instructions say: "Assistance created -> Admin queue updates. Volunteer assigned -> Volunteer task list updates."
      // So assigning a volunteer to an assistance request likely means creating a task for that volunteer.

      const res = await api.post("/tasks", {
        title: `Response: ${selectedRequest.requestType}`,
        description: selectedRequest.description,
        incidentId: selectedRequest.incidentId || undefined,
        volunteerId: selectedVolunteer,
        priority: selectedRequest.priority,
      });

      // Update the request status
      await api.patch(`/assistance/${selectedRequest.id}/status`, {
        status: "ASSIGNED",
      });

      setAssignModalOpen(false);
      refetch();
    } catch (err) {
      console.error(err);
      alert("Failed to assign volunteer");
    } finally {
      setAssignLoading(false);
    }
  };

  const filteredItems = items.filter((item: any) =>
    JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading)
    return (
      <div className="p-8 text-center text-slate-500">
        Loading Assistance Queue...
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load Assistance Queue.
      </div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <FileText className="mr-2 h-6 w-6 text-slate-700" />
            Assistance Response Queue
          </h1>
          <p className="text-slate-500">
            Find people who need help and coordinate the response.
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
            Total Requests: {filteredItems.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-3">Priority</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Submitted</th>
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
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {item.requestType}
                    </td>
                    <td className="px-6 py-4 text-slate-600 truncate max-w-[200px]">
                      {item.location}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.status === "SUBMITTED" && (
                        <Button
                          size="sm"
                          className="h-8 bg-brand-indigo text-white hover:bg-blue-700"
                          onClick={() => {
                            setSelectedRequest(item);
                            setAssignModalOpen(true);
                          }}
                        >
                          <UserCheck className="h-4 w-4 mr-1" /> Assign
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

      {/* ASSIGN MODAL */}
      {assignModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">Assign Volunteer</h3>
              <button
                onClick={() => setAssignModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-1">
                  Request Details
                </p>
                <div className="bg-slate-50 p-3 rounded-lg border text-sm text-slate-600">
                  <p>
                    <span className="font-medium text-slate-900">Type:</span>{" "}
                    {selectedRequest?.requestType}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">
                      Location:
                    </span>{" "}
                    {selectedRequest?.location}
                  </p>
                  <p className="mt-2 text-xs">{selectedRequest?.description}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Select Volunteer
                </label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  value={selectedVolunteer}
                  onChange={(e) => setSelectedVolunteer(e.target.value)}
                >
                  <option value="">-- Choose a volunteer --</option>
                  {volunteers.map((v: any) => (
                    <option key={v.id} value={v.id}>
                      {v.name || "Volunteer"} (
                      {v.volunteerProfile?.status || "AVAILABLE"})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-4 border-t bg-slate-50 flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setAssignModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-brand-indigo hover:bg-blue-700 text-white"
                onClick={handleAssign}
                disabled={assignLoading || !selectedVolunteer}
              >
                {assignLoading ? "Assigning..." : "Confirm Assignment"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
