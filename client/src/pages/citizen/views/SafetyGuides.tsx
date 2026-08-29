import React from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  FileText,
  Activity,
  Wind,
  Waves,
  AlertCircle,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SafetyGuides() {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Safety Guides</h1>
      </div>

      <div className="space-y-6">
        {/* Flood Guide */}
        <div className="bg-white rounded-xl border p-6 hover:border-blue-300 transition-colors cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-primary">
              <FileText className="mr-2 h-4 w-4" /> During a Flood
            </h3>
          </div>
          <p className="text-sm text-slate-600">
            Move to higher ground immediately. Avoid walking or driving through
            floodwaters. Turn off electricity at the main switch if safe to do
            so. Stay tuned to local authorities for updates and evacuation
            orders.
          </p>
        </div>

        {/* Cyclone Guide */}
        <div className="bg-white rounded-xl border p-6 hover:border-blue-300 transition-colors cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-primary">
              <Activity className="mr-2 h-4 w-4" /> During a Cyclone
            </h3>
          </div>
          <p className="text-sm text-slate-600">
            Secure loose outdoor items and board up windows. Stockpile drinking
            water, non-perishable food, batteries, and medicine. Stay indoors
            away from windows. Evacuate if advised by authorities. Have an
            emergency kit ready.
          </p>
        </div>

        {/* Earthquake Guide */}
        <div className="bg-white rounded-xl border p-6 hover:border-blue-300 transition-colors cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-primary">
              <Wind className="mr-2 h-4 w-4" /> During an Earthquake
            </h3>
          </div>
          <p className="text-sm text-slate-600">
            Drop, cover, and hold on. Stay away from windows and heavy
            furniture. If indoors, stay inside until shaking stops. If outdoors,
            move to an open area away from buildings, trees, and power lines. Be
            prepared for aftershocks.
          </p>
        </div>

        {/* Storm Guide */}
        <div className="bg-white rounded-xl border p-6 hover:border-blue-300 transition-colors cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-primary">
              <Waves className="mr-2 h-4 w-4" /> During a Storm
            </h3>
          </div>
          <p className="text-sm text-slate-600">
            Stay indoors and avoid travel if possible. Secure outdoor objects
            that could be blown away. Avoid using electrical appliances during
            thunderstorms. Watch for flash floods in low-lying areas. Listen to
            local emergency broadcasts.
          </p>
        </div>

        {/* Heatwave Guide */}
        <div className="bg-white rounded-xl border p-6 hover:border-blue-300 transition-colors cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-primary">
              <AlertCircle className="mr-2 h-4 w-4" /> During a Heatwave
            </h3>
          </div>
          <p className="text-sm text-slate-600">
            Stay hydrated and avoid strenuous activity during peak heat hours.
            Wear lightweight, light-colored clothing. Use air conditioning or
            fans. Check on elderly neighbors and those with health conditions.
            Never leave children or pets in parked vehicles.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <Button variant="outline" asChild>
          <a
            href="https://ndma.gov.in"
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit National Disaster Management Authority for more resources
          </a>
        </Button>
      </div>
    </div>
  );
}
