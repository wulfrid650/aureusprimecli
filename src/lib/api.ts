import axios, { AxiosHeaders } from "axios";
import { clearStoredAuthToken, getStoredAuthToken } from "@/lib/auth-token";

const defaultApiBase =
  process.env.NODE_ENV === "production"
    ? "https://api.aureusprime.com/api/v1"
    : "/api/v1";
const configuredApiBase = process.env.NEXT_PUBLIC_API_URL?.trim() || "";
const apiBase = (
  /^https?:\/\//i.test(configuredApiBase) ? configuredApiBase : defaultApiBase
).replace(/\/+$/, "");

const api = axios.create({
  baseURL: apiBase,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window === "undefined") {
    return config;
  }

  const token = getStoredAuthToken();

  if (!token) {
    return config;
  }

  const headers = AxiosHeaders.from(config.headers);
  headers.set("Authorization", `Bearer ${token}`);
  config.headers = headers;

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      clearStoredAuthToken();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default api;
