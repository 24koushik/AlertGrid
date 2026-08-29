import React, { useState, useEffect } from "react";
import { useFetch } from "../../../hooks/useApi";
import api from "../../../services/api";
import { Users, Search, MapPin, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VolunteerManagement() {
  const { data, loading, error, refetch } = useFetch<any>("/volunteers");
  const [items, setItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<any>(null);

  useEffect(() => {
    if (data && data.volunteers) setItems(data.volunteers);
    else if (data && Array.isArray(data)) setItems(data);
  }, [data]);

  const filteredItems = items.filter((item: any) =>
    JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const viewDetails = (volunteer: any) => {
    setSelectedVolunteer(volunteer);
    setDetailsModalOpen(true);
  };

  if (loading)
    return (
      <div className="p-8 text-center text-slate-500">
        Loading Volunteers...
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load Volunteers.
      </div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <Users className="mr-2 h-6 w-6 text-slate-700" />
            Volunteer Operations
          </h1>
          <p className="text-slate-500">
            Manage volunteer personnel and assignments.
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
            Total Volunteers: {filteredItems.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-3">Volunteer</th>
                <th className="px-6 py-3">Skills</th>
                <th className="px-6 py-3">Service Area</th>
                <th className="px-6 py-3">Status</th>
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
                    No volunteers found.
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
                        {item.name || "Unknown"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {item.email || ""}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {item.volunteerProfile?.skills
                          ?.slice(0, 2)
                          .map((skill: string) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 bg-brand-indigo/10 text-brand-indigo rounded-full text-[10px] font-medium border border-blue-100"
                            >
                              {skill}
                            </span>
                          ))}
                        {item.volunteerProfile?.skills?.length > 2 && (
                          <span className="text-xs text-slate-400">
                            +{item.volunteerProfile.skills.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {item.volunteerProfile?.serviceArea ? (
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                          {item.volunteerProfile.serviceArea}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">
                          Unspecified
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-[10px] font-bold rounded-full ${item.volunteerProfile?.status === "AVAILABLE" ? "bg-brand-emerald/10 text-brand-emerald" : item.volunteerProfile?.status === "BUSY" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"}`}
                      >
                        {item.volunteerProfile?.status || "UNKNOWN"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs text-brand-indigo"
                        onClick={() => viewDetails(item)}
                      >
                        Profile
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILS MODAL */}
      {detailsModalOpen && selectedVolunteer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">Volunteer Profile</h3>
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-brand-indigo/20 rounded-full flex items-center justify-center mx-auto mb-3 text-brand-indigo text-xl font-bold">
                  {selectedVolunteer.name?.charAt(0) || "V"}
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  {selectedVolunteer.name}
                </h2>
                <p className="text-sm text-slate-500">
                  {selectedVolunteer.email}
                </p>
                <div className="mt-2 inline-block">
                  <span
                    className={`px-2 py-1 text-xs font-bold rounded-full ${selectedVolunteer.volunteerProfile?.status === "AVAILABLE" ? "bg-brand-emerald/10 text-brand-emerald" : "bg-slate-100 text-slate-700"}`}
                  >
                    {selectedVolunteer.volunteerProfile?.status || "UNKNOWN"}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 mr-2 mt-0.5 text-slate-400" />
                  <div>
                    <p className="text-xs font-semibold text-slate-500">
                      Service Area
                    </p>
                    <p className="text-sm text-slate-900">
                      {selectedVolunteer.volunteerProfile?.serviceArea ||
                        "Anywhere"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-slate-400" />
                  <div>
                    <p className="text-xs font-semibold text-slate-500">
                      Skills & Qualifications
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedVolunteer.volunteerProfile?.skills?.map(
                        (skill: string) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs"
                          >
                            {skill}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t bg-slate-50 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setDetailsModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
