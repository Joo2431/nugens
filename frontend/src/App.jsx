import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";

// ── Public pages ──────────────────────────────────────
import Home    from "./pages/Home";
import About   from "./pages/About";
import Contact from "./pages/Contact";
import Blog    from "./pages/Blog";
import Careers from "./pages/Careers";
import Support from "./pages/Support";

// ── Product marketing pages ───────────────────────────
import GenE   from "./pages/genE/GenE";
import HyperX  from "./pages/hyperX/HyperX";
import DigiHub from "./pages/digihub/DigiHub";

// ── Auth pages ────────────────────────────────────────
import AuthPage   from "./pages/auth/AuthPage";
import Onboarding from "./pages/auth/Onboarding";

// ── Protected app (lazy) ──────────────────────────────
const GenEApp = lazy(() => import("./pages/genE/GenEApp"));

function PageLoader() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{ width: 24, height: 24, border: "2px solid #f0f0f0", borderTopColor: "#e8185d", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Layout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>

            {/* ── Public ───────────────────────────── */}
            <Route path="/"         element={<Layout><Home /></Layout>} />
            <Route path="/about"    element={<Layout><About /></Layout>} />
            <Route path="/contact"  element={<Layout><Contact /></Layout>} />
            <Route path="/blog"     element={<Layout><Blog /></Layout>} />
            <Route path="/blog/:id" element={<Layout><Blog /></Layout>} />
            <Route path="/careers"  element={<Layout><Careers /></Layout>} />
            <Route path="/support"  element={<Layout><Support /></Layout>} />

            {/* ── Product pages ─────────────────────── */}
            <Route path="/gene"    element={<Layout><GenE /></Layout>} />
            <Route path="/gen-e"   element={<Navigate to="/gene" replace />} />
            <Route path="/hyperx"  element={<Layout><HyperX /></Layout>} />
            <Route path="/digihub" element={<Layout><DigiHub /></Layout>} />

            {/* ── Auth (no Header/Footer) ───────────── */}
            <Route path="/auth"     element={<AuthPage />} />
            <Route path="/login"    element={<Navigate to="/auth" replace />} />
            <Route path="/register" element={<Navigate to="/auth?mode=register" replace />} />

            <Route path="/onboarding" element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            } />

            {/* ── Gen-E App (protected, no Header/Footer) ── */}
            <Route path="/gene/app" element={
              <ProtectedRoute>
                <GenEApp />
              </ProtectedRoute>
            } />

            {/* ── Fallback ──────────────────────────── */}
            <Route path="*" element={<Layout><Home /></Layout>} />

          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}