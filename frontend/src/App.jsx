import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layout components — note subfolder paths
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";

// Pages — flat files (About, Blog, Careers, Contact, Support)
import About    from "./pages/About";
import Blog     from "./pages/Blog";
import Careers  from "./pages/Careers";
import Contact  from "./pages/Contact";
import Support  from "./pages/Support";

// Pages — subfolder files (already existed in project)
import Home     from "./pages/home/Home";
import GenE     from "./pages/genE/GenE";
import DigiHub  from "./pages/digihub/DigiHub";

// TODO: add these when ready
// import HyperX  from "./pages/hyperX/HyperX";
// import Units   from "./pages/units/Units";

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
      <Layout>
        <Routes>
          <Route path="/"         element={<Home />} />
          <Route path="/about"    element={<About />} />
          <Route path="/contact"  element={<Contact />} />
          <Route path="/blog"     element={<Blog />} />
          <Route path="/blog/:id" element={<Blog />} />
          <Route path="/careers"  element={<Careers />} />
          <Route path="/support"  element={<Support />} />

          {/* Product pages */}
          <Route path="/gene"     element={<GenE />} />
          <Route path="/digihub"  element={<DigiHub />} />
          <Route path="/hyperx"   element={<Home />} /> {/* swap when HyperX page ready */}
          <Route path="/units"    element={<Home />} /> {/* swap when Units page ready */}

          {/* 404 fallback */}
          <Route path="*"         element={<Home />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}