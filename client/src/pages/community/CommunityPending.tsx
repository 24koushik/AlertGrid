import React from "react";
import { useNavigate } from "react-router-dom";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CommunityPending() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border p-8 text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
          <Clock className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Membership Pending
          </h2>
          <p className="text-slate-500">
            Your request to join the community is currently under review by the
            community administrators. You will be notified once approved.
          </p>
        </div>
        <div className="pt-4 space-y-3">
          <Button onClick={() => window.location.reload()} className="w-full">
            Refresh Status
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/login")}
            className="w-full"
          >
            Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
}
