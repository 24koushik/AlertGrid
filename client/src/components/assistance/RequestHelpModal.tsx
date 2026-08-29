import React, { useState } from "react";
import api from "../../services/api";
import { Button } from "@/components/ui/button";
import { X, AlertCircle } from "lucide-react";

interface RequestHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RequestHelpModal({
  isOpen,
  onClose,
  onSuccess,
}: RequestHelpModalProps) {
  const [formData, setFormData] = useState({
    requestType: "MEDICAL",
    priority: "HIGH",
    description: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    let lat = 13.0827; // fallback
    let lng = 80.2707;

    try {
      if (navigator.geolocation) {
        const pos = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
            });
          },
        );
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      }
    } catch (err) {
      console.warn("Geolocation failed, using fallback.");
    }

    try {
      await api.post("/assistance", {
        ...formData,
        latitude: lat,
        longitude: lng,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        "Unable to submit request. Please try again or contact emergency services directly.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b bg-red-50 text-red-900">
          <h2 className="font-bold text-lg flex items-center">
            <AlertCircle className="mr-2 h-5 w-5" />
            Request Emergency Help
          </h2>
          <button
            onClick={onClose}
            className="text-red-700 hover:bg-red-100 p-1 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded text-sm border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Type of Assistance
            </label>
            <select
              className="w-full border-slate-300 rounded-md border p-2 focus:ring-red-500 focus:border-red-500"
              value={formData.requestType}
              onChange={(e) =>
                setFormData({ ...formData, requestType: e.target.value })
              }
            >
              <option value="MEDICAL">Medical Emergency</option>
              <option value="EVACUATION">Evacuation</option>
              <option value="RESCUE">Rescue</option>
              <option value="FOOD">Food / Rations</option>
              <option value="WATER">Drinking Water</option>
              <option value="SHELTER">Temporary Shelter</option>
              <option value="TRANSPORTATION">Transportation</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Urgency
            </label>
            <select
              className="w-full border-slate-300 rounded-md border p-2 focus:ring-red-500 focus:border-red-500"
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
            >
              <option value="CRITICAL">Critical (Life Threatening)</option>
              <option value="HIGH">High (Urgent Attention Required)</option>
              <option value="MEDIUM">Medium (Need assistance soon)</option>
              <option value="LOW">Low (Not immediate)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Your Location / Address
            </label>
            <input
              required
              type="text"
              placeholder="House no, Street, Landmark"
              className="w-full border-slate-300 rounded-md border p-2"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Brief Description
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe the situation..."
              className="w-full border-slate-300 rounded-md border p-2"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={loading}>
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
