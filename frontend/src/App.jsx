import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header         from "./components/header/Header";
import Footer         from "./components/footer/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home    from "./pages/Home";
import About   from "./pages/About";
import Contact from "./pages/Contact";
import Blog    from "./pages/Blog";
import Careers from "./pages/Careers";
import Support from "./pages/Support";
import GenE    from "./pages/genE/GenE";
import HyperX  from "./pages/hyperX/HyperX";
import DigiHub from "./pages/digihub/DigiHub";

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
      <Routes>
        <Route path="/"         element={<Layout><Home /></Layout>} />
        <Route path="/about"    element={<Layout><About /></Layout>} />
        <Route path="/contact"  element={<Layout><Contact /></Layout>} />
        <Route path="/blog"     element={<Layout><Blog /></Layout>} />
        <Route path="/blog/:id" element={<Layout><Blog /></Layout>} />
        <Route path="/careers"  element={<Layout><Careers /></Layout>} />
        <Route path="/support"  element={<Layout><Support /></Layout>} />
        <Route path="/gene"     element={<Layout><GenE /></Layout>} />
        <Route path="/gen-e"    element={<Layout><GenE /></Layout>} />
        <Route path="/hyperx"   element={<Layout><HyperX /></Layout>} />
        <Route path="/digihub"  element={<Layout><DigiHub /></Layout>} />

        <Route
          path="/gene/dashboard"
          element={<ProtectedRoute><Layout><GenE /></Layout></ProtectedRoute>}
        />

        <Route path="*" element={<Layout><Home /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}