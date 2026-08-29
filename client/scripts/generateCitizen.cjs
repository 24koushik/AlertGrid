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
import { ${iconName}, Search, CheckCircle } from 'lucide-react';
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
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <${iconName} className="mr-2 h-6 w-6 text-slate-700" />
            ${title}
          </h1>
          <p className="text-slate-500">${subtitle}</p>
        </div>
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
                    <td className="px-6 py-4 text-right">
                      <Button variant="outline" size="sm" className="h-8 text-blue-600">Details</Button>
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
    name: "CitizenAlerts",
    file: "client/src/pages/citizen/views/CitizenAlerts.tsx",
    endpoint: "/alerts",
    iconName: "ShieldAlert",
    title: "Emergency Alerts",
    subtitle: "Stay informed about critical updates in your area.",
    dataKey: "alerts",
    columns: [
      { label: "Severity", key: "severity", type: "status" },
      { label: "Title", key: "title", type: "text" },
      { label: "Published", key: "createdAt", type: "date" },
    ],
  },
  {
    name: "CitizenShelters",
    file: "client/src/pages/citizen/views/CitizenShelters.tsx",
    endpoint: "/shelters",
    iconName: "CheckCircle",
    title: "Safe Shelters",
    subtitle: "Find relief centers and safe locations near you.",
    dataKey: "shelters",
    columns: [
      { label: "Name", key: "name", type: "text" },
      { label: "Status", key: "status", type: "status" },
      { label: "Available Capacity", key: "capacity", type: "text" },
    ],
  },
  {
    name: "CitizenRequests",
    file: "client/src/pages/citizen/views/CitizenRequests.tsx",
    endpoint: "/assistance",
    iconName: "CheckCircle",
    title: "My Requests",
    subtitle: "Track your emergency assistance requests.",
    dataKey: "requests",
    columns: [
      { label: "Type", key: "requestType", type: "text" },
      { label: "Status", key: "status", type: "status" },
      { label: "Submitted", key: "createdAt", type: "date" },
    ],
  },
  {
    name: "CitizenNotifications",
    file: "client/src/pages/citizen/views/CitizenNotifications.tsx",
    endpoint: "/notifications",
    iconName: "CheckCircle",
    title: "Notifications",
    subtitle: "Your personal alerts and system messages.",
    dataKey: "notifications",
    columns: [
      { label: "Type", key: "type", type: "text" },
      { label: "Message", key: "message", type: "text" },
      { label: "Date", key: "createdAt", type: "date" },
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
