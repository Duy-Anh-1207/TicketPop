// src/Auth/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import type { LoginData } from "../../types/Auth";
type AuthContextType = {
  user: LoginData | null;
  setUser: (u: LoginData | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<LoginData | null>(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user?.token) {
      axios.defaults.headers.common.Authorization = `Bearer ${user.token}`;
    } else {
      delete axios.defaults.headers.common.Authorization;
    }
  }, [user]);

  const setUser = (u: LoginData | null) => {
    setUserState(u);
    if (u) {
      localStorage.setItem("user", JSON.stringify(u));
      localStorage.setItem("token", u.token);
      axios.defaults.headers.common.Authorization = `Bearer ${u.token}`;
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      delete axios.defaults.headers.common.Authorization;
    }
  };

  const logout = () => {
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, setUser, logout }}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
