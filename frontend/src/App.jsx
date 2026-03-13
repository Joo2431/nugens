import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home    from "./pages/Home";
import About   from "./pages/About";
import Contact from "./pages/Contact";
import Blog    from "./pages/Blog";
import Careers from "./pages/Careers";
import Support from "./pages/Support";
import GenE    from "./pages/GenE";
import HyperX  from "./pages/HyperX";
import DigiHub from "./pages/DigiHub";
import AuthPage from "./pages/AuthPage";

const GenEChat       = lazy(() => import("./pages/GenEChat"));
const ResumesPage    = lazy(() => import("./pages/ResumesPage"));
const JobTrackerPage = lazy(() => import("./pages/JobTrackerPage"));
const PricingPage    = lazy(() => import("./pages/PricingPage"));

function PageSpinner() {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:"#fff" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:28,
          fontStyle:"italic", color:"#e8185d", letterSpacing:"-0.04em", marginBottom:12 }}>GEN-E</div>
        <div style={{ color:"#ccc", fontSize:13 }}>Loading…</div>
      </div>
    </div>
  );
}

function Layout({ children }) {
  return (<><Header /><main>{children}</main><Footer /></>);
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageSpinner />}>
        <Routes>
          {/* Public pages */}
          <Route path="/"         element={<Layout><Home /></Layout>} />
          <Route path="/about"    element={<Layout><About /></Layout>} />
          <Route path="/contact"  element={<Layout><Contact /></Layout>} />
          <Route path="/blog"     element={<Layout><Blog /></Layout>} />
          <Route path="/blog/:id" element={<Layout><Blog /></Layout>} />
          <Route path="/careers"  element={<Layout><Careers /></Layout>} />
          <Route path="/support"  element={<Layout><Support /></Layout>} />
          <Route path="/hyperx"   element={<Layout><HyperX /></Layout>} />
          <Route path="/digihub"  element={<Layout><DigiHub /></Layout>} />

          {/* Gen-E marketing page */}
          <Route path="/gene"     element={<Layout><GenE /></Layout>} />

          {/* Auth — no Header/Footer */}
          <Route path="/auth"     element={<AuthPage />} />
          <Route path="/login"    element={<Navigate to="/auth" replace />} />
          <Route path="/signup"   element={<Navigate to="/auth?mode=signup" replace />} />

          {/* Gen-E App — protected, full screen */}
          <Route path="/gen-e"    element={<ProtectedRoute><GenEChat /></ProtectedRoute>} />
          <Route path="/gen-e/*"  element={<ProtectedRoute><GenEChat /></ProtectedRoute>} />

          {/* Other protected pages */}
          <Route path="/resumes"  element={<ProtectedRoute><ResumesPage /></ProtectedRoute>} />
          <Route path="/jobs"     element={<ProtectedRoute><JobTrackerPage /></ProtectedRoute>} />
          <Route path="/pricing"  element={<PricingPage />} />

          <Route path="*"         element={<Layout><Home /></Layout>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}