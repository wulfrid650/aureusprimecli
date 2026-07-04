import axios, { AxiosHeaders } from "axios";
import { clearStoredAuthToken, getStoredAuthToken } from "@/lib/auth-token";

const defaultApiBase =
  process.env.NODE_ENV === "production"
    ? "https://api.aureusprime.com/api/v1"
    : "/api/v1";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || defaultApiBase,
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
