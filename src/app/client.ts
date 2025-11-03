import axios from "axios";
export const API_BASE = import.meta.env.VITE_API_BASE;
export const http = axios.create({ baseURL: API_BASE });
http.interceptors.request.use((config) => {
  const uid = localStorage.getItem("userId") || "";
  if (uid) config.headers["X-User-Id"] = uid;
  return config;
});
