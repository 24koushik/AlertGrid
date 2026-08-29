import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Users, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

export default function CommunitySelect() {
  const [communities, setCommunities] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCommunities();
  }, [search]);

  const fetchCommunities = async () => {
    try {
      const res = await api.get(`/communities?q=${search}`);
      setCommunities(res.data.communities || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (communityId: string) => {
    try {
      await api.post(`/communities/${communityId}/join`);
      // refresh user info
      const res = await api.get("/auth/me");
      login(localStorage.getItem("token")!, res.data.user);
      navigate("/citizen");
    } catch (error) {
      console.error(error);
      alert("Failed to join community.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-slate-900">
            Find Your Community
          </h1>
          <p className="text-slate-500 max-w-lg mx-auto">
            Join a local emergency response community to receive targeted alerts
            and coordinate with your neighbors.
          </p>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or city..."
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            onClick={() => navigate("/community/register")}
            className="py-3 h-auto bg-blue-600 hover:bg-brand-indigo/90"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Register New
          </Button>
        </div>

        {loading ? (
          <div className="text-center p-12 text-slate-500">
            Loading communities...
          </div>
        ) : communities.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-xl border border-dashed border-slate-300 text-slate-500">
            No communities found matching your search.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {communities.map((c) => (
              <div
                key={c.id}
                className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">
                      {c.name}
                    </h3>
                    <div className="flex items-center text-slate-500 text-sm mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {c.city} • {c.radius}km radius
                    </div>
                  </div>
                  <div className="flex items-center text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs font-semibold">
                    <Users className="h-3 w-3 mr-1" />
                    {c._count?.memberships || 0} Members
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-6 line-clamp-2">
                  {c.description}
                </p>
                <Button
                  onClick={() => handleJoin(c.id)}
                  className="w-full bg-slate-900 text-white hover:bg-slate-800"
                >
                  Join Community
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
