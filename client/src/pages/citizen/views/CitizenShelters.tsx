import React, { useState, useEffect } from "react";
import { useFetch } from "../../../hooks/useApi";
import api from "../../../services/api";
import {
  Search,
  CheckCircle,
  Navigation,
  Users,
  MapPin,
  X,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ShelterMap from "../../../components/maps/ShelterMap";

export default function CitizenShelters() {
  const { data, loading, error, refetch } = useFetch<any>("/shelters");
  const [items, setItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedShelter, setSelectedShelter] = useState<any>(null);

  useEffect(() => {
    if (data && data.shelters) {
      setItems(data.shelters);
    } else if (data && Array.isArray(data)) {
      setItems(data);
    }
  }, [data]);

  const filteredItems = items.filter((item: any) =>
    JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading)
    return (
      <div className="p-8 text-center text-slate-500">
        Loading Safe Shelters...
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load Safe Shelters. Please try again.
      </div>
    );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <CheckCircle className="mr-2 h-6 w-6 text-slate-700" />
            Safe Shelters
          </h1>
          <p className="text-slate-500">
            Find relief centers and safe locations near you.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search shelters..."
              className="pl-9 pr-4 py-2 w-full text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Occupancy</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    No active shelters found.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item: any, idx: number) => {
                  const available =
                    item.capacity - (item.currentOccupancy || 0);
                  const isFull = available <= 0;

                  return (
                    <tr
                      key={item.id || idx}
                      className="bg-white border-b hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-bold rounded-full uppercase ${
                            item.status === "OPEN"
                              ? "bg-green-100 text-brand-emerald"
                              : item.status === "FULL"
                                ? "bg-brand-red/20 text-brand-red"
                                : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-slate-500">
                          <Users className="w-4 h-4 mr-2" />
                          <span
                            className={
                              isFull
                                ? "text-red-500 font-bold"
                                : "text-slate-900"
                            }
                          >
                            {item.currentOccupancy || 0}
                          </span>{" "}
                          / {item.capacity}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-brand-indigo hover:bg-brand-indigo/10"
                          onClick={() => setSelectedShelter(item)}
                        >
                          Details
                        </Button>
                        <Button
                          size="sm"
                          className="h-8 bg-brand-indigo text-white"
                          onClick={() =>
                            window.open(
                              `https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`,
                            )
                          }
                        >
                          <Navigation className="h-3 w-3 mr-1" />
                          Directions
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedShelter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
              <h2 className="font-bold text-lg flex items-center gap-2">
                {selectedShelter.name}
              </h2>
              <button
                onClick={() => setSelectedShelter(null)}
                className="text-slate-500 hover:text-slate-800 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col md:flex-row h-full overflow-hidden">
              <div className="w-full md:w-1/2 p-6 overflow-y-auto space-y-4">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase mb-1">
                    Status
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-bold rounded-full uppercase ${
                      selectedShelter.status === "OPEN"
                        ? "bg-green-100 text-brand-emerald"
                        : selectedShelter.status === "FULL"
                          ? "bg-brand-red/20 text-brand-red"
                          : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {selectedShelter.status}
                  </span>
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase mb-1 flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    Address
                  </div>
                  <p className="text-slate-800 text-sm font-medium">
                    {selectedShelter.address}
                  </p>
                </div>

                {selectedShelter.contactNumber && (
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase mb-1 flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      Contact
                    </div>
                    <p className="text-slate-800 text-sm font-medium">
                      {selectedShelter.contactNumber}
                    </p>
                  </div>
                )}

                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase mb-1 flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    Capacity Status
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-500">Available:</span>
                      <span className="font-bold text-slate-900">
                        {selectedShelter.capacity -
                          (selectedShelter.currentOccupancy || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-500">Occupied:</span>
                      <span className="font-medium text-slate-900">
                        {selectedShelter.currentOccupancy || 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Total Capacity:</span>
                      <span className="font-medium text-slate-900">
                        {selectedShelter.capacity}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedShelter.facilities &&
                  selectedShelter.facilities.length > 0 && (
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase mb-2">
                        Available Facilities
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedShelter.facilities.map(
                          (fac: string, i: number) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-brand-indigo/10 text-brand-indigo text-xs rounded-md border border-blue-100"
                            >
                              {fac}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  )}
              </div>

              <div className="w-full md:w-1/2 bg-slate-100 h-64 md:h-auto border-t md:border-t-0 md:border-l relative">
                <ShelterMap shelters={[selectedShelter]} />
              </div>
            </div>

            <div className="p-4 border-t bg-slate-50 flex justify-between items-center">
              <Button
                size="sm"
                className="bg-brand-indigo hover:bg-blue-700 text-white"
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${selectedShelter.latitude},${selectedShelter.longitude}`,
                  )
                }
              >
                <Navigation className="h-4 w-4 mr-2" />
                Get Directions
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedShelter(null)}
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
