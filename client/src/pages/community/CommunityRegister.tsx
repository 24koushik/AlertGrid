import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

export default function CommunityRegister() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    city: "",
    latitude: 13.0827,
    longitude: 80.2707,
    radius: 5,
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/communities", form);
      const res = await api.get("/auth/me");
      login(localStorage.getItem("token")!, res.data.user);
      navigate("/citizen");
    } catch (error) {
      console.error(error);
      alert("Failed to register community.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-2xl mx-auto space-y-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="pl-0 text-slate-500 hover:text-slate-900 bg-transparent hover:bg-transparent"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Selection
        </Button>

        <div className="bg-white p-8 rounded-xl border shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">
            Register a New Community
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Community Name
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. Anna Nagar Residents"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                required
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24"
                placeholder="Brief description of the area or purpose..."
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  City
                </label>
                <input
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full border p-2.5 rounded-lg"
                  placeholder="e.g. Chennai"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Coverage Radius (km)
                </label>
                <input
                  required
                  type="number"
                  step="0.1"
                  value={form.radius}
                  onChange={(e) =>
                    setForm({ ...form, radius: parseFloat(e.target.value) })
                  }
                  className="w-full border p-2.5 rounded-lg"
                />
              </div>
            </div>

            <div className="pt-4 border-t mt-6">
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 h-auto bg-blue-600 hover:bg-brand-indigo/90"
              >
                <Save className="mr-2 h-5 w-5" />
                {loading ? "Registering..." : "Register Community"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
