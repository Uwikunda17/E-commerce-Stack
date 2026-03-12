import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface AdminContextType {
  token: string | null;
  isAdmin: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  apiFetch: (path: string, options?: RequestInit) => Promise<Response>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const STORAGE_KEY = "luxe_admin_token";

export function AdminProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    sessionStorage.getItem(STORAGE_KEY)
  );

  const login = useCallback(async (password: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) return false;
      const { token: t } = await res.json();
      setToken(t);
      sessionStorage.setItem(STORAGE_KEY, t);
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  const apiFetch = useCallback(
    (path: string, options: RequestInit = {}) => {
      return fetch(path, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
          "X-Admin-Token": token || "",
        },
      });
    },
    [token]
  );

  return (
    <AdminContext.Provider value={{ token, isAdmin: !!token, login, logout, apiFetch }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
