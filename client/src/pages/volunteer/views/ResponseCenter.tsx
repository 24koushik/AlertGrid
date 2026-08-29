import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useFetch } from "../../../hooks/useApi";
import api from "../../../services/api";
import {
  CheckCircle,
  Clock,
  MapPin,
  ShieldAlert,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { socketService } from "../../../services/socket";

export default function ResponseCenter() {
  const { user } = useAuth();

  // State for volunteer profile (status)
  const [status, setStatus] = useState<string>("AVAILABLE");
  const [loadingStatus, setLoadingStatus] = useState(false);

  // Fetch tasks and alerts
  const { data: tasksData, refetch: refetchTasks } = useFetch<any>("/tasks");
  const { data: alertsData, refetch: refetchAlerts } = useFetch<any>("/alerts");

  // Categorize tasks
  const allTasks =
    tasksData?.tasks || (Array.isArray(tasksData) ? tasksData : []);
  const pendingTasks = allTasks.filter((t: any) => t.status === "ASSIGNED");
  const activeTasks = allTasks.filter(
    (t: any) => t.status === "ACCEPTED" || t.status === "IN_PROGRESS",
  );
  const currentTask = activeTasks.length > 0 ? activeTasks[0] : null;

  const activeAlerts =
    alertsData?.alerts || (Array.isArray(alertsData) ? alertsData : []);

  useEffect(() => {
    // Initial fetch of volunteer profile status
    const fetchStatus = async () => {
      try {
        const res = await api.get("/volunteers/me");
        if (res.data?.profile?.status) {
          setStatus(res.data.profile.status);
        }
      } catch (err) {
        console.error("Failed to fetch volunteer profile status:", err);
      }
    };
    fetchStatus();

    // Socket.io for real-time updates
    const socket = socketService.connect();
    socket?.on("task:assigned", () => refetchTasks());
    socket?.on("task:updated", () => refetchTasks());
    socket?.on("alert:created", () => refetchAlerts());

    return () => {
      socket?.off("task:assigned");
      socket?.off("task:updated");
      socket?.off("alert:created");
    };
  }, []);

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      setLoadingStatus(true);
      await api.put("/volunteers/me", { status: newStatus });
      setStatus(newStatus);
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update status");
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleTaskAction = async (taskId: string, newStatus: string) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      refetchTasks();
    } catch (err: any) {
      console.error("Task action failed:", err);
      alert(err.response?.data?.message || "Failed to update task status");
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <h1 className="text-2xl font-bold text-slate-900">Response Center</h1>

        <div className="flex items-center space-x-2 bg-white rounded-lg p-1 border">
          <button
            disabled={loadingStatus}
            onClick={() => handleUpdateStatus("AVAILABLE")}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${status === "AVAILABLE" ? "bg-brand-emerald/10 text-brand-emerald" : "text-slate-500 hover:bg-slate-100"}`}
          >
            AVAILABLE
          </button>
          <button
            disabled={loadingStatus}
            onClick={() => handleUpdateStatus("BUSY")}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${status === "BUSY" ? "bg-amber-100 text-amber-700" : "text-slate-500 hover:bg-slate-100"}`}
          >
            BUSY
          </button>
          <button
            disabled={loadingStatus}
            onClick={() => handleUpdateStatus("OFFLINE")}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${status === "OFFLINE" ? "bg-slate-200 text-slate-700" : "text-slate-500 hover:bg-slate-100"}`}
          >
            OFFLINE
          </button>
        </div>
      </div>

      {/* CURRENT ASSIGNMENT */}
      <section className="bg-white rounded-xl border overflow-hidden">
        <div className="p-4 border-b bg-brand-emerald/10 flex justify-between items-center">
          <h2 className="font-bold text-green-900 flex items-center uppercase tracking-wider text-sm">
            <CheckCircle className="w-4 h-4 mr-2 text-brand-emerald" />
            Current Assignment
          </h2>
          {currentTask && (
            <span className="bg-green-200 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
              {currentTask.status}
            </span>
          )}
        </div>

        <div className="p-6">
          {!currentTask ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                No active assignment
              </h3>
              <p className="text-slate-500">
                You are currently on standby. Monitor the tasks queue below.
              </p>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  {currentTask.title}
                </h3>
                <p className="text-slate-600 mb-4">{currentTask.description}</p>

                <div className="flex flex-wrap gap-4 text-sm text-slate-700 mb-6">
                  {currentTask.location && (
                    <div className="flex items-center bg-slate-50 px-3 py-1.5 rounded border">
                      <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                      {currentTask.location}
                    </div>
                  )}
                  <div className="flex items-center bg-slate-50 px-3 py-1.5 rounded border">
                    <Clock className="w-4 h-4 mr-2 text-slate-400" />
                    Dispatched:{" "}
                    {new Date(currentTask.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="md:w-48 flex flex-col gap-3 justify-center border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6">
                {currentTask.status === "ACCEPTED" && (
                  <Button
                    onClick={() =>
                      handleTaskAction(currentTask.id, "IN_PROGRESS")
                    }
                    className="w-full bg-brand-indigo hover:bg-blue-700 text-white"
                  >
                    Start Progress
                  </Button>
                )}
                {currentTask.status === "IN_PROGRESS" && (
                  <Button
                    onClick={() =>
                      handleTaskAction(currentTask.id, "COMPLETED")
                    }
                    className="w-full text-brand-emerald border-brand-emerald/20 hover:bg-brand-emerald/10"
                    variant="outline"
                  >
                    Mark Complete
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PENDING TASKS QUEUE */}
        <section className="bg-white rounded-xl border overflow-hidden">
          <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
            <h2 className="font-bold text-slate-800 flex items-center text-sm uppercase tracking-wider">
              <Clock className="w-4 h-4 mr-2 text-slate-400" />
              Pending Assignments
            </h2>
            <span className="text-xs font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
              {pendingTasks.length}
            </span>
          </div>
          <div className="divide-y max-h-[400px] overflow-y-auto">
            {pendingTasks.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                No pending assignments.
              </div>
            ) : (
              pendingTasks.map((task: any) => (
                <div
                  key={task.id}
                  className="p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-slate-900">
                      {task.title}
                    </span>
                    <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                      {task.priority || "HIGH"}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-slate-500 mb-3">
                    <MapPin className="w-3 h-3 mr-1" />{" "}
                    {task.location || "Location not specified"}
                  </div>
                  <Button
                    onClick={() => handleTaskAction(task.id, "ACCEPTED")}
                    size="sm"
                    variant="outline"
                    className="w-full text-xs h-7"
                  >
                    Accept Task
                  </Button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ACTIVE ALERTS */}
        <section className="bg-white rounded-xl border overflow-hidden">
          <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
            <h2 className="font-bold text-slate-800 flex items-center text-sm uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 mr-2 text-slate-400" />
              Active Alerts
            </h2>
          </div>
          <div className="divide-y max-h-[400px] overflow-y-auto">
            {activeAlerts.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                No active alerts.
              </div>
            ) : (
              activeAlerts.map((alert: any) => (
                <div key={alert.id} className="p-4 flex items-start space-x-3">
                  <div
                    className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${alert.severity === "CRITICAL" ? "bg-brand-red/100" : "bg-amber-500"}`}
                  ></div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 mb-1">
                      {alert.title}
                    </h3>
                    <div className="flex items-center text-xs text-slate-500">
                      <span className="font-semibold text-slate-700 mr-2">
                        {alert.type || "Alert"}
                      </span>
                      <span>{new Date(alert.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
