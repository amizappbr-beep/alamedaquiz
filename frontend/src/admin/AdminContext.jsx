import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const TOKEN_KEY = "alameda500_admin_token_v1";

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [me, setMe] = useState(null); // null = checking, false = logged out, obj = logged in
  const [loading, setLoading] = useState(true);

  const axiosAdmin = useMemo(() => {
    const instance = axios.create({ baseURL: API });
    instance.interceptors.request.use((config) => {
      const t = localStorage.getItem(TOKEN_KEY);
      if (t) config.headers.Authorization = `Bearer ${t}`;
      return config;
    });
    instance.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setMe(false);
        }
        return Promise.reject(err);
      }
    );
    return instance;
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await axios.post(`${API}/admin/login`, { email, password });
    localStorage.setItem(TOKEN_KEY, data.access_token);
    setToken(data.access_token);
    setMe({ email: data.email, role: "admin" });
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setMe(false);
  }, []);

  useEffect(() => {
    if (!token) {
      setMe(false);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data } = await axiosAdmin.get("/admin/me");
        if (!cancelled) setMe(data);
      } catch {
        if (!cancelled) setMe(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, axiosAdmin]);

  const value = useMemo(
    () => ({ me, loading, login, logout, axiosAdmin }),
    [me, loading, login, logout, axiosAdmin]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}

export { API };
