import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PINK = "#e8185d";

function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#fafafa" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 32, height: 32, border: "2px solid #f0f0f0", borderTopColor: PINK, borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 12px" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ fontSize: 13, color: "#9ca3af", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Loading Gen-E...</div>
      </div>
    </div>
  );
}

export default function ProtectedRoute({ children }) {
  const { isLoggedIn, loading, initialized } = useAuth();
  const location = useLocation();

  if (!initialized || loading) return <Spinner />;

  if (!isLoggedIn) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
}
