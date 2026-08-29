import React, { useState, useEffect } from "react";
import { useFetch } from "../../../hooks/useApi";
import api from "../../../services/api";
import { Search, Bell, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CitizenNotifications() {
  const { data, loading, error, refetch } = useFetch<any>("/notifications");
  const [items, setItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (data && data.notifications) {
      setItems(data.notifications);
    } else if (data && Array.isArray(data)) {
      setItems(data);
    }
  }, [data]);

  const filteredItems = items.filter((item: any) =>
    JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleMarkRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      refetch();
    } catch (err) {
      console.error("Failed to mark notification read", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      refetch();
    } catch (err) {
      console.error("Failed to mark all read", err);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-slate-500">
        Loading Notifications...
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load Notifications. Please try again.
      </div>
    );

  const unreadCount = items.filter((i) => !i.isRead).length;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <Bell className="mr-2 h-6 w-6 text-slate-700" />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-3 bg-brand-red/20 text-brand-red text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount} New
              </span>
            )}
          </h1>
          <p className="text-slate-500">
            Your personal alerts and system messages.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            onClick={handleMarkAllRead}
            variant="outline"
            className="bg-white hover:bg-slate-50"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search notifications..."
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
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Message</th>
                <th className="px-6 py-3">Date</th>
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
                    No notifications found.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item: any, idx: number) => (
                  <tr
                    key={item.id || idx}
                    className={`border-b hover:bg-slate-50 transition-colors ${!item.isRead ? "bg-brand-indigo/10/30" : "bg-white"}`}
                  >
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-bold rounded-full uppercase ${
                          item.type === "ALERT"
                            ? "bg-brand-red/20 text-brand-red"
                            : item.type === "TASK"
                              ? "bg-brand-indigo/20 text-brand-indigo"
                              : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className={`text-slate-900 ${!item.isRead ? "font-bold" : "font-medium"}`}
                      >
                        {item.title}
                      </div>
                      <div className="text-slate-600 mt-1">{item.message}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!item.isRead ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-brand-indigo border-brand-indigo/20 hover:bg-brand-indigo/10"
                          onClick={() => handleMarkRead(item.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark Read
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">
                          READ
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
