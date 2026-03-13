import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ProtectedRoute({ children }) {
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    // Loading spinner
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#fff" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 28, fontStyle: "italic", color: "#e8185d", letterSpacing: "-0.04em", marginBottom: 12 }}>GEN-E</div>
          <div style={{ color: "#ccc", fontSize: 13 }}>Loading…</div>
        </div>
      </div>
    );
  }

  if (!session) return <Navigate to="/auth" replace />;
  return children;
}
