import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import CitizenRouter from "./pages/citizen/CitizenRouter";
import AdminRouter from "./pages/admin/AdminRouter";
import VolunteerRouter from "./pages/volunteer/VolunteerRouter";

import CommunityCheck from "./components/layout/CommunityCheck";
import CommunitySelect from "./pages/community/CommunitySelect";
import CommunityPending from "./pages/community/CommunityPending";
import CommunityRegister from "./pages/community/CommunityRegister";

const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
};

const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === "ADMIN") return <Navigate to="/admin" replace />;
  if (user.role === "VOLUNTEER") return <Navigate to="/volunteer" replace />;

  // For CITIZEN, let CommunityCheck handle the redirect
  return <Navigate to="/citizen" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/community/select"
            element={
              <ProtectedRoute allowedRoles={["CITIZEN"]}>
                <CommunitySelect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/community/pending"
            element={
              <ProtectedRoute allowedRoles={["CITIZEN"]}>
                <CommunityPending />
              </ProtectedRoute>
            }
          />
          <Route
            path="/community/register"
            element={
              <ProtectedRoute allowedRoles={["CITIZEN"]}>
                <CommunityRegister />
              </ProtectedRoute>
            }
          />

          <Route
            path="/citizen/*"
            element={
              <ProtectedRoute allowedRoles={["CITIZEN"]}>
                <CommunityCheck>
                  <CitizenRouter />
                </CommunityCheck>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminRouter />
              </ProtectedRoute>
            }
          />

          <Route
            path="/volunteer/*"
            element={
              <ProtectedRoute allowedRoles={["VOLUNTEER"]}>
                <VolunteerRouter />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
