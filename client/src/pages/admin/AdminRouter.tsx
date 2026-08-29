import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "../../components/layout/AdminLayout";
import CommandCenter from "./views/CommandCenter";
import AlertManagement from "./views/AlertManagement";
import IncidentTracking from "./views/IncidentTracking";
import ShelterManagement from "./views/ShelterManagement";
import AssistanceQueue from "./views/AssistanceQueue";
import VolunteerManagement from "./views/VolunteerManagement";
import TaskManagement from "./views/TaskManagement";
import Analytics from "./views/Analytics";
import AuditLogs from "./views/AuditLogs";
import Settings from "./views/Settings";

export default function AdminRouter() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<CommandCenter />} />
        <Route path="/alerts" element={<AlertManagement />} />
        <Route path="/incidents" element={<IncidentTracking />} />
        <Route path="/shelters" element={<ShelterManagement />} />
        <Route path="/assistance" element={<AssistanceQueue />} />
        <Route path="/volunteers" element={<VolunteerManagement />} />
        <Route path="/tasks" element={<TaskManagement />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/audit-logs" element={<AuditLogs />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
}
