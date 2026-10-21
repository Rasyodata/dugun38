import React, { createContext, useContext, useState, useCallback } from "react";
import { api, setToken, type SessionUser } from "./api";

interface AuthState {
  user: SessionUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  demoLogin: (role: "COUPLE" | "FIRM" | "ADMIN") => Promise<SessionUser>;
  logout: () => void;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const u = await api.login(email, password);
      setUser(u);
    } finally {
      setLoading(false);
    }
  }, []);

  const demoLogin = useCallback(async (role: "COUPLE" | "FIRM" | "ADMIN") => {
    setLoading(true);
    try {
      const u = await api.demoLogin(role);
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  return <Ctx.Provider value={{ user, loading, login, demoLogin, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth AuthProvider içinde kullanılmalı");
  return ctx;
}
