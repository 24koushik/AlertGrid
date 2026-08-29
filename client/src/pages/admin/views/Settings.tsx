import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/api";
import {
  Settings as SettingsIcon,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  ShieldAlert,
  Edit2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Settings() {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    location: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        location: user.location || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.patch("/auth/profile", formData);
      // Update auth context with new user data
      // We don't have a specific update method, but we can reuse the token
      login(localStorage.getItem("token") || "", res.data.user);

      setSuccess(true);
      setEditMode(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Settings save error:", err);
      alert("Failed to save settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center">
          <SettingsIcon className="h-6 w-6 text-slate-700 mr-2" />
          <h1 className="text-2xl font-bold text-slate-900">
            Account Settings
          </h1>
        </div>
        {!editMode ? (
          <Button
            onClick={() => setEditMode(true)}
            className="bg-brand-indigo hover:bg-blue-700 text-white"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <Button
            onClick={() => {
              setEditMode(false);
              setFormData({
                name: user?.name || "",
                phone: user?.phone || "",
                location: user?.location || "",
              });
            }}
            variant="outline"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        )}
      </div>

      {success && (
        <div className="bg-brand-emerald/10 border border-brand-emerald/20 text-brand-emerald px-4 py-3 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          Settings saved successfully.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Profile Information
          </h3>

          {editMode ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address (Read-only)
                </label>
                <input
                  type="email"
                  className="w-full border bg-slate-50 text-slate-500 rounded-md px-3 py-2 text-sm cursor-not-allowed"
                  value={user?.email || ""}
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-indigo hover:bg-blue-700 text-white mt-4"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : "Save Settings"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-slate-50">
                <p className="text-sm text-slate-500">
                  Your profile information is up to date.
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  Click <strong>Edit Profile</strong> to update your contact
                  details or location.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border p-6 h-fit">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Account Details
          </h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-sm">
              <User className="h-5 w-5 text-brand-aqua" />
              <div>
                <p className="font-medium text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500">Full Name</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-sm">
              <Mail className="h-5 w-5 text-brand-aqua" />
              <div>
                <p className="font-medium text-slate-900">{user?.email}</p>
                <p className="text-xs text-slate-500">Email Address</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-sm">
              <Phone className="h-5 w-5 text-brand-aqua" />
              <div>
                <p className="font-medium text-slate-900">
                  {user?.phone || "Not provided"}
                </p>
                <p className="text-xs text-slate-500">Phone Number</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-sm">
              <MapPin className="h-5 w-5 text-brand-aqua" />
              <div>
                <p className="font-medium text-slate-900">
                  {user?.location || "Not provided"}
                </p>
                <p className="text-xs text-slate-500">Location</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-sm">
              <ShieldAlert className="h-5 w-5 text-brand-aqua" />
              <div>
                <p className="font-medium text-slate-900">
                  {user?.role?.toUpperCase()}
                </p>
                <p className="text-xs text-slate-500">Account Role</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Ensure CheckCircle is imported for the success message
import { CheckCircle } from "lucide-react";
