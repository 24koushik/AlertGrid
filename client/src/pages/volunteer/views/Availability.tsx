import React, { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/api";
import {
  User,
  Activity,
  MapPin,
  RefreshCw,
  CheckCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Availability() {
  const { user } = useAuth();
  const [availability, setAvailability] = useState(
    user?.role === "VOLUNTEER" ? "AVAILABLE" : "",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoading(true);
        if (user?.role === "VOLUNTEER") {
          const res = await api.get(`/volunteers/me`);
          setAvailability(res.data.profile?.status || "AVAILABLE");
        }
      } catch (err: any) {
        setError("Failed to load availability status");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "VOLUNTEER") {
      fetchAvailability();
    }
  }, [user]);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as string;
    try {
      setLoading(true);
      await api.put(`/volunteers/me`, { status: newStatus });
      setAvailability(newStatus);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError("Failed to update availability");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== "VOLUNTEER") {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold text-slate-900">
          Availability Settings
        </h2>
        <p className="text-slate-500">
          This page is only accessible to volunteers.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">
          Availability Settings
        </h1>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="text-sm"
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-brand-red/10 text-brand-red rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-brand-emerald/10 text-brand-emerald rounded">
          Availability updated successfully.
        </div>
      )}

      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Current Status</h2>
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              availability === "AVAILABLE"
                ? "bg-brand-emerald/10 text-green-800"
                : availability === "ASSIGNED"
                  ? "bg-brand-indigo/20 text-blue-800"
                  : availability === "BUSY"
                    ? "bg-brand-amber/10 text-brand-amber"
                    : "bg-brand-red/20 text-brand-red"
            }`}
          >
            {availability}
          </div>
        </div>

        <div className="space-y-4">
          <div className="border-t pt-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Update Availability
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={availability}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 p-2"
                >
                  <option value="AVAILABLE">Available for Assignment</option>
                  <option value="ASSIGNED">Assigned to Task</option>
                  <option value="BUSY">Currently Unavailable</option>
                  <option value="OFFLINE">Offline / Not Available</option>
                </select>
              </div>

              <div className="text-sm text-slate-500">
                <p>
                  <strong>AVAILABLE:</strong> You can be assigned to new tasks.
                </p>
                <p>
                  <strong>ASSIGNED:</strong> You are currently working on a
                  task.
                </p>
                <p>
                  <strong>BUSY:</strong> You are temporarily unavailable.
                </p>
                <p>
                  <strong>OFFLINE:</strong> You are not available for
                  assignment.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Volunteer Profile
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-brand-aqua" />
                <div>
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs text-slate-500">Full Name</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-brand-aqua" />
                <div>
                  <p className="font-medium">
                    {user?.location || "Not provided"}
                  </p>
                  <p className="text-xs text-slate-500">Location</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Activity className="h-5 w-5 text-brand-aqua" />
                <div>
                  <p className="font-medium">{user?.role?.toUpperCase()}</p>
                  <p className="text-xs text-slate-500">Account Role</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
