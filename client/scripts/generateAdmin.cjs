const fs = require("fs");
const path = require("path");

const generateCrudPage = (
  name,
  endpoint,
  iconName,
  title,
  subtitle,
  columns,
  dataKey,
) => {
  return `import React, { useState, useEffect } from 'react';
import { useFetch } from '../../../hooks/useApi';
import api from '../../../services/api';
import { ${iconName}, Plus, Search, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ${name}() {
  const { data, loading, error, refetch } = useFetch<any>('${endpoint}');
  const [items, setItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (data && data.${dataKey}) {
      setItems(data.${dataKey});
    } else if (data && Array.isArray(data)) {
      setItems(data);
    }
  }, [data]);

  const filteredItems = items.filter((item: any) => 
    JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center text-slate-500">Loading ${title}...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Failed to load ${title}. Please try again.</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <${iconName} className="mr-2 h-6 w-6 text-slate-700" />
            ${title}
          </h1>
          <p className="text-slate-500">${subtitle}</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" /> Create New
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
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
            Total: {filteredItems.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
              <tr>
                ${columns.map((c) => `<th className="px-6 py-3">${c.label}</th>`).join("\n                ")}
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={${columns.length + 1}} className="px-6 py-8 text-center text-slate-500">
                    No records found.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item: any, idx: number) => (
                  <tr key={item.id || idx} className="bg-white border-b hover:bg-slate-50">
                    ${columns
                      .map((c) => {
                        if (c.type === "status") {
                          return `<td className="px-6 py-4">
                      <span className={\`px-2 py-1 text-xs font-bold rounded-full \${item.${c.key} === 'CRITICAL' || item.${c.key} === 'ACTIVE' || item.${c.key} === 'OPEN' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}\`}>
                        {item.${c.key}}
                      </span>
                    </td>`;
                        }
                        if (c.type === "date") {
                          return `<td className="px-6 py-4">{new Date(item.${c.key}).toLocaleDateString()}</td>`;
                        }
                        return `<td className="px-6 py-4 font-medium text-slate-900">{item.${c.key}}</td>`;
                      })
                      .join("\n                    ")}
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button variant="outline" size="sm" className="h-8 px-2 text-blue-600"><Edit className="h-4 w-4" /></Button>
                      <Button variant="outline" size="sm" className="h-8 px-2 text-red-600"><Trash2 className="h-4 w-4" /></Button>
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
`;
};

const pages = [
  {
    name: "AlertManagement",
    file: "client/src/pages/admin/views/AlertManagement.tsx",
    endpoint: "/alerts",
    iconName: "ShieldAlert",
    title: "Alert Management",
    subtitle:
      "Create, monitor and manage emergency alerts across affected areas.",
    dataKey: "alerts",
    columns: [
      { label: "Severity", key: "severity", type: "status" },
      { label: "Title", key: "title", type: "text" },
      { label: "Disaster Type", key: "disasterType", type: "text" },
      { label: "Status", key: "status", type: "status" },
      { label: "Created", key: "createdAt", type: "date" },
    ],
  },
  {
    name: "IncidentTracking",
    file: "client/src/pages/admin/views/IncidentTracking.tsx",
    endpoint: "/incidents",
    iconName: "Activity",
    title: "Incident Tracking",
    subtitle: "Monitor and coordinate active emergency incidents.",
    dataKey: "incidents",
    columns: [
      { label: "Severity", key: "severity", type: "status" },
      { label: "Title", key: "title", type: "text" },
      { label: "Type", key: "disasterType", type: "text" },
      { label: "Status", key: "status", type: "status" },
      { label: "Reported", key: "createdAt", type: "date" },
    ],
  },
  {
    name: "ShelterManagement",
    file: "client/src/pages/admin/views/ShelterManagement.tsx",
    endpoint: "/shelters",
    iconName: "Map",
    title: "Shelter Management",
    subtitle: "Manage relief centers and track capacity.",
    dataKey: "shelters",
    columns: [
      { label: "Name", key: "name", type: "text" },
      { label: "Status", key: "status", type: "status" },
      { label: "Capacity", key: "capacity", type: "text" },
      { label: "Occupied", key: "currentOccupancy", type: "text" },
      { label: "Updated", key: "updatedAt", type: "date" },
    ],
  },
  {
    name: "AssistanceQueue",
    file: "client/src/pages/admin/views/AssistanceQueue.tsx",
    endpoint: "/assistance",
    iconName: "CheckCircle",
    title: "Assistance Response Queue",
    subtitle: "Find people who need help and coordinate the response.",
    dataKey: "requests",
    columns: [
      { label: "Priority", key: "priority", type: "status" },
      { label: "Type", key: "requestType", type: "text" },
      { label: "Location", key: "location", type: "text" },
      { label: "Status", key: "status", type: "status" },
      { label: "Submitted", key: "createdAt", type: "date" },
    ],
  },
  {
    name: "VolunteerManagement",
    file: "client/src/pages/admin/views/VolunteerManagement.tsx",
    endpoint: "/volunteers",
    iconName: "Users",
    title: "Volunteer Operations",
    subtitle: "Manage volunteer personnel and assignments.",
    dataKey: "volunteers",
    columns: [
      { label: "Name", key: "user.name", type: "text" },
      { label: "Status", key: "status", type: "status" },
      { label: "Service Area", key: "serviceArea", type: "text" },
      { label: "Updated", key: "updatedAt", type: "date" },
    ],
  },
  {
    name: "TaskManagement",
    file: "client/src/pages/admin/views/TaskManagement.tsx",
    endpoint: "/tasks",
    iconName: "CheckCircle",
    title: "Task Management",
    subtitle: "Manage operational tasks and assignments.",
    dataKey: "tasks",
    columns: [
      { label: "Priority", key: "priority", type: "status" },
      { label: "Title", key: "title", type: "text" },
      { label: "Status", key: "status", type: "status" },
      { label: "Created", key: "createdAt", type: "date" },
    ],
  },
  {
    name: "AuditLogs",
    file: "client/src/pages/admin/views/AuditLogs.tsx",
    endpoint: "/audit-logs",
    iconName: "FileText",
    title: "Audit Logs",
    subtitle: "System-wide action tracking.",
    dataKey: "logs",
    columns: [
      { label: "Action", key: "action", type: "text" },
      { label: "Resource", key: "resource", type: "text" },
      { label: "User", key: "user.name", type: "text" },
      { label: "Timestamp", key: "createdAt", type: "date" },
    ],
  },
];

pages.forEach((p) => {
  const content = generateCrudPage(
    p.name,
    p.endpoint,
    p.iconName,
    p.title,
    p.subtitle,
    p.columns,
    p.dataKey,
  );
  fs.writeFileSync(path.join(__dirname, "..", "..", p.file), content);
  console.log("Created " + p.file);
});
