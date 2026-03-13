import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const PINK = "#e8185d";
const DARK = "#0a0a0a";
const B = "#f0f0f0";

// ── Google Sign-In SDK loader ──────────────────────────
function loadGoogleScript(clientId, callback) {
  if (window.google?.accounts) { callback(); return; }
  const script = document.createElement("script");
  script.src = "https://accounts.google.com/gsi/client";
  script.async = true;
  script.defer = true;
  script.onload = callback;
  document.head.appendChild(script);
}

export default function AuthPage() {
  const [params] = useSearchParams();
  const [tab, setTab]     = useState(params.get("mode") === "register" ? "register" : "login");
  const [form, setForm]   = useState({ email: "", password: "", full_name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading]       = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, register, googleLogin, isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate(user?.onboarded ? "/gene/app" : "/onboarding", { replace: true });
    }
  }, [isLoggedIn]);

  // Init Google One Tap / Sign-In button
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    loadGoogleScript(clientId, () => {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredential,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Render button into our div
      const btnDiv = document.getElementById("google-signin-btn");
      if (btnDiv) {
        window.google.accounts.id.renderButton(btnDiv, {
          theme: "outline",
          size: "large",
          width: "100%",
          text: tab === "register" ? "signup_with" : "signin_with",
          shape: "rectangular",
        });
      }
    });
  }, [tab]);

  async function handleGoogleCredential(credentialResponse) {
    setGoogleLoading(true);
    setError("");
    try {
      const result = await googleLogin(credentialResponse.credential);
      if (result.is_new_user) {
        navigate("/onboarding");
      } else {
        navigate("/gene/app");
      }
    } catch (err) {
      setError(err.message || "Google sign-in failed. Please try again.");
    }
    setGoogleLoading(false);
  }

  function setField(key, val) { setForm(f => ({ ...f, [key]: val })); setError(""); }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (tab === "login") {
        await login(form.email, form.password);
        navigate("/gene/app");
      } else {
        if (form.password.length < 8) { setError("Password must be at least 8 characters"); setLoading(false); return; }
        await register(form.email, form.password, form.full_name);
        navigate("/onboarding");
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; }

        .auth-page {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          background: #fafafa; padding: 24px;
          background-image: linear-gradient(${B} 1px, transparent 1px),
                            linear-gradient(90deg, ${B} 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .auth-box {
          width: 100%; max-width: 420px; background: #fff;
          border: 1px solid ${B}; border-radius: 16px; padding: 36px;
          box-shadow: 0 4px 40px rgba(0,0,0,0.06);
        }
        .auth-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; }
        .auth-logo-dot { width: 32px; height: 32px; border-radius: 9px; background: ${PINK}; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 12px; font-weight: 800; }
        .auth-logo-text { font-size: 15px; font-weight: 700; color: ${DARK}; letter-spacing: -0.02em; }

        .auth-tabs { display: flex; gap: 0; margin-bottom: 22px; border: 1px solid ${B}; border-radius: 8px; padding: 3px; }
        .auth-tab { flex: 1; padding: 8px; border: none; background: none; border-radius: 6px; font-size: 13px; font-weight: 600; color: #9ca3af; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.15s; }
        .auth-tab.active { background: ${DARK}; color: #fff; }

        .auth-title { font-size: 18px; font-weight: 800; color: ${DARK}; letter-spacing: -0.03em; margin-bottom: 4px; }
        .auth-sub   { font-size: 13px; color: #9ca3af; margin-bottom: 20px; }

        /* Google button wrapper */
        .google-btn-wrap {
          margin-bottom: 16px; border-radius: 8px; overflow: hidden;
          border: 1px solid ${B}; min-height: 44px;
          display: flex; align-items: center; justify-content: center;
        }
        .google-btn-fallback {
          width: 100%; padding: 11px 16px; border-radius: 8px;
          border: 1px solid ${B}; background: #fff;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          font-size: 13.5px; font-weight: 600; color: #374151;
          cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
          transition: border-color 0.15s;
        }
        .google-btn-fallback:hover { border-color: #9ca3af; }
        .google-btn-fallback:disabled { opacity: 0.5; cursor: not-allowed; }

        .auth-divider { display: flex; align-items: center; gap: 10px; margin: 16px 0; }
        .auth-divider-line { flex: 1; height: 1px; background: ${B}; }
        .auth-divider-text { font-size: 12px; color: #9ca3af; }

        .auth-field { margin-bottom: 14px; }
        .auth-label { font-size: 12px; font-weight: 600; color: #374151; display: block; margin-bottom: 6px; }
        .auth-input { width: 100%; padding: 11px 14px; border: 1px solid ${B}; border-radius: 8px; font-size: 13.5px; font-family: 'Plus Jakarta Sans', sans-serif; color: ${DARK}; outline: none; transition: border-color 0.15s; }
        .auth-input:focus { border-color: #9ca3af; }

        .auth-btn { width: 100%; padding: 12px; border-radius: 8px; background: ${DARK}; color: #fff; font-size: 14px; font-weight: 700; border: none; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: opacity 0.15s; margin-top: 8px; letter-spacing: -0.01em; }
        .auth-btn:hover { opacity: 0.85; }
        .auth-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .auth-error { background: #fff1f4; border: 1px solid #fecdd3; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: ${PINK}; margin-bottom: 14px; }
        .auth-footer { text-align: center; font-size: 12.5px; color: #9ca3af; margin-top: 20px; }
        .auth-footer a { color: ${PINK}; text-decoration: none; font-weight: 600; }

        .auth-benefits { margin-bottom: 18px; display: flex; flex-direction: column; gap: 7px; }
        .auth-benefit { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #374151; }
        .auth-benefit-dot { width: 6px; height: 6px; border-radius: 50%; background: ${PINK}; flex-shrink: 0; }

        /* Google SDK overrides */
        #google-signin-btn > div { width: 100% !important; }
        #google-signin-btn iframe { width: 100% !important; }
      `}</style>

      <div className="auth-page">
        <div className="auth-box">
          {/* Logo */}
          <div className="auth-logo">
            <div className="auth-logo-dot">N</div>
            <div className="auth-logo-text">NuGens · Gen-E AI</div>
          </div>

          {/* Tabs */}
          <div className="auth-tabs">
            <button className={`auth-tab${tab === "login" ? " active" : ""}`}
              onClick={() => { setTab("login"); setError(""); }}>Sign in</button>
            <button className={`auth-tab${tab === "register" ? " active" : ""}`}
              onClick={() => { setTab("register"); setError(""); }}>Create account</button>
          </div>

          {tab === "register" && (
            <div className="auth-benefits">
              {["AI career analysis, free to start", "Resume scoring & ATS optimization", "Personalized 12-week roadmap"].map(b => (
                <div key={b} className="auth-benefit"><div className="auth-benefit-dot" />{b}</div>
              ))}
            </div>
          )}

          <div className="auth-title">{tab === "login" ? "Welcome back" : "Start your career journey"}</div>
          <div className="auth-sub">{tab === "login" ? "Sign in to your Gen-E account" : "Free account · No credit card needed"}</div>

          {error && <div className="auth-error">{error}</div>}

          {/* Google Sign-In — rendered by Google SDK */}
          {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
            <div className="google-btn-wrap">
              <div id="google-signin-btn" style={{ width: "100%" }} />
            </div>
          ) : (
            // Fallback if VITE_GOOGLE_CLIENT_ID not set
            <button
              className="google-btn-fallback"
              disabled={googleLoading}
              onClick={() => setError("Google Sign-In not configured. Please set VITE_GOOGLE_CLIENT_ID.")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {googleLoading ? "Signing in..." : `Continue with Google`}
            </button>
          )}

          <div className="auth-divider">
            <div className="auth-divider-line" />
            <span className="auth-divider-text">or continue with email</span>
            <div className="auth-divider-line" />
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit}>
            {tab === "register" && (
              <div className="auth-field">
                <label className="auth-label">Full name</label>
                <input className="auth-input" type="text" placeholder="Arjun Sharma"
                  value={form.full_name} onChange={e => setField("full_name", e.target.value)} required />
              </div>
            )}
            <div className="auth-field">
              <label className="auth-label">Email address</label>
              <input className="auth-input" type="email" placeholder="arjun@email.com"
                value={form.email} onChange={e => setField("email", e.target.value)} required />
            </div>
            <div className="auth-field">
              <label className="auth-label">
                Password {tab === "register" && <span style={{ color: "#9ca3af", fontWeight: 400 }}>(min 8 chars)</span>}
              </label>
              <input className="auth-input" type="password" placeholder="••••••••"
                value={form.password} onChange={e => setField("password", e.target.value)} required />
            </div>
            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? "Please wait..." : tab === "login" ? "Sign in →" : "Create account →"}
            </button>
          </form>

          <div className="auth-footer">
            {tab === "login"
              ? <>Don't have an account? <a href="#" onClick={e => { e.preventDefault(); setTab("register"); }}>Sign up free</a></>
              : <>Already have an account? <a href="#" onClick={e => { e.preventDefault(); setTab("login"); }}>Sign in</a></>
            }
            <br /><br />
            <Link to="/" style={{ color: "#9ca3af", textDecoration: "none" }}>← Back to NuGens</Link>
          </div>
        </div>
      </div>
    </>
  );
}
