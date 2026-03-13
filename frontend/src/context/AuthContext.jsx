import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { auth, tokenStore } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]             = useState(tokenStore.getUser());
  const [loading, setLoading]       = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Hydrate user from stored token on mount
  useEffect(() => {
    async function hydrate() {
      if (tokenStore.isLoggedIn()) {
        try {
          const data = await auth.me();
          setUser(data.user);
          tokenStore.set(tokenStore.get(), data.user);
        } catch {
          tokenStore.clear();
          setUser(null);
        }
      }
      setLoading(false);
      setInitialized(true);
    }
    hydrate();

    // Listen for token expiry
    const onLogout = () => setUser(null);
    window.addEventListener("auth:logout", onLogout);
    return () => window.removeEventListener("auth:logout", onLogout);
  }, []);

  // ── Email login ───────────────────────────────────
  const login = useCallback(async (email, password) => {
    const data = await auth.login({ email, password });
    tokenStore.set(data.token, data.user);
    setUser(data.user);
    return data.user;
  }, []);

  // ── Email register ────────────────────────────────
  const register = useCallback(async (email, password, full_name) => {
    const data = await auth.register({ email, password, full_name });
    tokenStore.set(data.token, data.user);
    setUser(data.user);
    return data.user;
  }, []);

  // ── Google login ──────────────────────────────────
  const googleLogin = useCallback(async (id_token) => {
    const data = await auth.googleAuth(id_token);
    tokenStore.set(data.token, data.user);
    setUser(data.user);
    return data; // includes is_new_user
  }, []);

  // ── Logout ────────────────────────────────────────
  const logout = useCallback(async () => {
    try { await auth.logout(); } catch {}
    tokenStore.clear();
    setUser(null);
  }, []);

  // ── Update local user state ───────────────────────
  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      tokenStore.set(tokenStore.get(), updated);
      return updated;
    });
  }, []);

  // ── Onboarding ────────────────────────────────────
  const completeOnboarding = useCallback(async (data) => {
    await auth.onboarding(data);
    updateUser({ onboarded: true, profile_complete: 75 });
  }, [updateUser]);

  return (
    <AuthContext.Provider value={{
      user, loading, initialized,
      isLoggedIn: !!user,
      login, register, googleLogin, logout,
      updateUser, completeOnboarding,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
