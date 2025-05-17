import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./frontend/context/AuthContext";
import { ProtectedRoute } from "./frontend/components/auth/ProtectedRoute";
import { Login } from "./frontend/components/auth/Login";
import { Register } from "./frontend/components/auth/Register";
import { Dashboard } from "./frontend/pages/Dashboard";
import { Candidates } from "./frontend/pages/Candidates";
import { Settings } from "./frontend/pages/Settings";
import { Positions } from "./frontend/pages/Positions";
import "./frontend/styles/main.css";
import "./frontend/styles/theme.css";
import { useAuth } from "./frontend/context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<AuthRedirect />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidates"
            element={
              <ProtectedRoute>
                <Candidates />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/positions"
            element={
              <ProtectedRoute>
                <Positions />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// Helper component to redirect based on auth state
const AuthRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/login" replace />
  );
};

export default App;
