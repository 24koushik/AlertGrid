import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { CitizenLayout } from "../../components/layout/CitizenLayout";
import SafetyPortal from "./views/SafetyPortal";
import CitizenAlerts from "./views/CitizenAlerts";
import CitizenShelters from "./views/CitizenShelters";
import CitizenRequests from "./views/CitizenRequests";
import CitizenNotifications from "./views/CitizenNotifications";
import SafetyGuides from "./views/SafetyGuides";
import Settings from "./views/Settings";

export default function CitizenRouter() {
  return (
    <CitizenLayout>
      <Routes>
        <Route path="/" element={<SafetyPortal />} />
        <Route path="/alerts" element={<CitizenAlerts />} />
        <Route path="/shelters" element={<CitizenShelters />} />
        <Route path="/requests" element={<CitizenRequests />} />
        <Route path="/notifications" element={<CitizenNotifications />} />
        <Route path="/guides" element={<SafetyGuides />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/citizen" replace />} />
      </Routes>
    </CitizenLayout>
  );
}
