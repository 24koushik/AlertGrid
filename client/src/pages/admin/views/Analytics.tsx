import React from "react";
import { useFetch } from "../../../hooks/useApi";
import {
  BarChart,
  Activity,
  AlertTriangle,
  Users,
  Map,
  Clock,
} from "lucide-react";

export default function Analytics() {
  const { data: summaryData, loading: summaryLoading } =
    useFetch<any>("/dashboard/summary");
  const { data: analyticsData, loading: analyticsLoading } = useFetch<any>(
    "/dashboard/analytics",
  );

  if (summaryLoading || analyticsLoading)
    return (
      <div className="p-8 text-center text-slate-500">Loading Analytics...</div>
    );

  const summary = summaryData?.summary || {};
  const analytics = analyticsData?.analytics || {};

  const maxIncidentType = Math.max(
    ...(analytics.incidentsByType?.map((i: any) => i._count) || [1]),
  );
  const maxRequestType = Math.max(
    ...(analytics.requestsByType?.map((r: any) => r._count) || [1]),
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center mb-6">
        <BarChart className="h-6 w-6 text-slate-700 mr-2" />
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl border border-l-4 border-l-red-500">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase">
              Critical Alerts
            </h3>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {summary.criticalAlerts || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-l-4 border-l-amber-500">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase">
              Active Incidents
            </h3>
            <Activity className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {summary.activeIncidents || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-l-4 border-l-green-500">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase">
              Open Shelters
            </h3>
            <Map className="h-5 w-5 text-brand-emerald" />
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {summary.openShelters || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-l-4 border-l-blue-500">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase">
              Available Volunteers
            </h3>
            <Users className="h-5 w-5 text-brand-aqua" />
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {summary.availableVolunteers || 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-slate-500" />
            Incidents by Type
          </h3>
          <div className="space-y-4">
            {analytics.incidentsByType?.map((item: any) => (
              <div key={item.disasterType}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">
                    {item.disasterType}
                  </span>
                  <span className="text-slate-500">{item._count}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div
                    className="bg-brand-indigo h-2.5 rounded-full"
                    style={{
                      width: `${(item._count / maxIncidentType) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
            {(!analytics.incidentsByType ||
              analytics.incidentsByType.length === 0) && (
              <p className="text-sm text-slate-500 italic">
                No incident data available.
              </p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-slate-500" />
            Assistance Requests by Need
          </h3>
          <div className="space-y-4">
            {analytics.requestsByType?.map((item: any) => (
              <div key={item.requestType}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">
                    {item.requestType}
                  </span>
                  <span className="text-slate-500">{item._count}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div
                    className="bg-emerald-500 h-2.5 rounded-full"
                    style={{
                      width: `${(item._count / maxRequestType) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
            {(!analytics.requestsByType ||
              analytics.requestsByType.length === 0) && (
              <p className="text-sm text-slate-500 italic">
                No request data available.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border">
        <h3 className="text-lg font-bold text-slate-900 mb-6">
          Task Completion Status
        </h3>
        <div className="flex flex-wrap gap-4">
          {analytics.tasksByStatus?.map((item: any) => (
            <div
              key={item.status}
              className="flex-1 min-w-[150px] p-4 bg-slate-50 rounded-lg border text-center"
            >
              <p className="text-xs font-semibold text-slate-500 mb-1">
                {item.status.replace("_", " ")}
              </p>
              <p className="text-2xl font-bold text-slate-900">{item._count}</p>
            </div>
          ))}
          {(!analytics.tasksByStatus ||
            analytics.tasksByStatus.length === 0) && (
            <p className="text-sm text-slate-500 italic w-full">
              No task data available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
