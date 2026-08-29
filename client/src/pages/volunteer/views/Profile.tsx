import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/api";
import { User, Activity, MapPin, Phone, Mail, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/auth/me");
      setProfileData(res.data.user);
      setFormData({
        name: res.data.user.name,
        email: res.data.user.email,
        phone: res.data.user.phone || "",
        location: res.data.user.location || "",
      });
    } catch (err: any) {
      setError("Failed to load profile data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const res = await api.patch("/auth/profile", formData);
      setProfileData(res.data.user);
      setEditMode(false);
      alert("Profile updated successfully");
    } catch (err: any) {
      setError("Failed to update profile");
      console.error(err);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading profile...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        {editMode ? (
          <Button onClick={() => setEditMode(false)} variant="outline">
            Cancel
          </Button>
        ) : (
          <Button
            onClick={() => setEditMode(true)}
            className="bg-brand-indigo hover:bg-blue-700 text-white"
          >
            Edit Profile
          </Button>
        )}
      </div>

      {editMode ? (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Full Name
            </label>
            <input
              name="name"
              type="text"
              className="w-full rounded border border-gray-300 p-2"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              name="email"
              type="email"
              className="w-full rounded border border-gray-300 p-2"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Phone Number
            </label>
            <input
              name="phone"
              type="tel"
              className="w-full rounded border border-gray-300 p-2"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Location
            </label>
            <input
              name="location"
              type="text"
              className="w-full rounded border border-gray-300 p-2"
              value={formData.location}
              onChange={handleChange}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-brand-indigo hover:bg-blue-700 text-white"
          >
            Save Changes
          </Button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <User className="h-10 w-10 text-brand-indigo bg-brand-indigo/20 rounded-full p-2" />
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {profileData?.name}
              </h2>
              <p className="text-sm text-slate-500">{profileData?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border p-4">
              <h3 className="font-bold text-slate-900 mb-2">
                Contact Information
              </h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="h-4 w-4 text-brand-aqua" />
                  <span>{profileData?.phone || "Not provided"}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="h-4 w-4 text-brand-aqua" />
                  <span>{profileData?.email}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border p-4">
              <h3 className="font-bold text-slate-900 mb-2">Account Details</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Activity className="h-4 w-4 text-brand-aqua" />
                  <span>
                    Member since:{" "}
                    {new Date(profileData?.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="h-4 w-4 text-brand-aqua" />
                  <span>{profileData?.location || "Not provided"}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <ShieldAlert className="h-4 w-4 text-brand-aqua" />
                  <span>Role: {profileData?.role?.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
