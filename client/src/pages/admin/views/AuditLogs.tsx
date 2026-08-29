import React, { useState, useEffect } from "react";
import { useFetch } from "../../../hooks/useApi";
import { FileText, Search } from "lucide-react";

export default function AuditLogs() {
  const { data, loading, error } = useFetch<any>("/audit-logs");
  const [items, setItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (data && data.logs) {
      setItems(data.logs);
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
        Loading Audit Logs...
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load Audit Logs.
      </div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <FileText className="mr-2 h-6 w-6 text-slate-700" />
            System Audit Logs
          </h1>
          <p className="text-slate-500">
            Immutable record of system actions and events.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search logs..."
              className="pl-9 pr-4 py-2 w-full text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm text-slate-500 font-medium">
            Total Records: {filteredItems.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">Entity Type</th>
                <th className="px-6 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredItems.map((item: any) => (
                <tr key={item.id} className="bg-white hover:bg-slate-50">
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-700">
                      {item.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                      {item.entityType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 truncate max-w-xs">
                    {item.details ? JSON.stringify(item.details) : ""}
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    No audit logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
