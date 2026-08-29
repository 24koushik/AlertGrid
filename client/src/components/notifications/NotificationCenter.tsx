import React, { useState, useEffect } from "react";
import { useFetch } from "../../hooks/useApi";
import api from "../../services/api";
import { socketService } from "../../services/socket";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  severity: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const { data, loading, refetch } = useFetch<{
    notifications: Notification[];
  }>("/notifications");
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (data?.notifications) {
      setNotifications(data.notifications);
    }
  }, [data]);

  useEffect(() => {
    const socket = socketService.connect();

    // Listen for new notifications or alerts
    socket?.on("notification:new", (newNotification: Notification) => {
      setNotifications((prev) => [newNotification, ...prev]);
    });

    socket?.on("alert:created", () => {
      refetch(); // Simply refetch notifications when an alert happens
    });

    socket?.on("task:assigned", () => {
      refetch();
    });

    return () => {
      socket?.off("notification:new");
      socket?.off("alert:created");
      socket?.off("task:assigned");
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    } catch (e) {
      console.error("Failed to mark read", e);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch(`/notifications/read-all`);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error("Failed to mark all read", e);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5 text-slate-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-lg border bg-white shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between border-b p-3 bg-slate-50">
            <h3 className="font-semibold text-slate-800">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-sm text-slate-500">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">
                No notifications
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 border-b last:border-0 ${!n.isRead ? "bg-blue-50/50" : ""}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4
                      className={`font-medium text-sm ${n.severity === "CRITICAL" ? "text-red-700 font-bold" : "text-slate-800"}`}
                    >
                      {n.title}
                    </h4>
                    {!n.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(n.id)}
                        className="text-[10px] text-slate-500 hover:text-slate-800"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mb-1">{n.message}</p>
                  <span className="text-[10px] text-slate-400">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
