import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [triggerLogoAnimation, setTriggerLogoAnimation] = useState(false);

  // ── On mount: check if there is an active session ───────────────
  useEffect(() => {
    authAPI
      .me()
      .then((res) => {
        if (res.success) setUser(res.data);
      })
      .catch(() => {
        // Not logged in — that's fine
      })
      .finally(() => setLoading(false));
  }, []);

  // ── login ────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    if (res.success) {
      setUser(res.data);
      return { ok: true, user: res.data };
    }
    return { ok: false, message: res.message };
  };

  // ── signup ───────────────────────────────────────────────────────
  const signup = async (name, email, password, role) => {
    const res = await authAPI.signup(name, email, password, role);
    if (res.success) {
      setUser(res.data);
      return { ok: true, user: res.data };
    }
    return { ok: false, message: res.message };
  };

  // ── logout ───────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (_) {
      // ignore server errors on logout
    }
    setUser(null);
  };

  const isAuthenticated = !!user;

  const playLogoAnimation = () => {
    setTriggerLogoAnimation(true);
    setTimeout(() => setTriggerLogoAnimation(false), 1500);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated,
        loading,
        triggerLogoAnimation,
        playLogoAnimation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
