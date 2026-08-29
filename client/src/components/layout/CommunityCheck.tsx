import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function CommunityCheck({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === "CITIZEN") {
    const memberships = user.memberships || [];
    const hasApproved = memberships.some((m) => m.status === "APPROVED");
    const hasPending = memberships.some((m) => m.status === "PENDING");

    if (!hasApproved && !hasPending) {
      return <Navigate to="/community/select" replace />;
    }

    if (!hasApproved && hasPending) {
      return <Navigate to="/community/pending" replace />;
    }
  }

  return <>{children}</>;
}
