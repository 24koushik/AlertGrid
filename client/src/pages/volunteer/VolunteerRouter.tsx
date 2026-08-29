import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { VolunteerLayout } from "../../components/layout/VolunteerLayout";
import ResponseCenter from "./views/ResponseCenter";
import VolunteerAlerts from "./views/VolunteerAlerts";
import VolunteerTasks from "./views/VolunteerTasks";
import VolunteerAssistance from "./views/VolunteerAssistance";
import OperationsMap from "./views/OperationsMap";
import Availability from "./views/Availability";
import Profile from "./views/Profile";

export default function VolunteerRouter() {
  return (
    <VolunteerLayout>
      <Routes>
        <Route path="/" element={<ResponseCenter />} />
        <Route path="/alerts" element={<VolunteerAlerts />} />
        <Route path="/tasks" element={<VolunteerTasks />} />
        <Route path="/assistance" element={<VolunteerAssistance />} />
        <Route path="/map" element={<OperationsMap />} />
        <Route path="/availability" element={<Availability />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/volunteer" replace />} />
      </Routes>
    </VolunteerLayout>
  );
}
