import axios from "axios";
import { useAuthStore } from "@/lib/store";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "") ?? "";

export const api = axios.create({
  baseURL: "/api"
});

export const hasConfiguredApiUrl = Boolean(API_URL);
export const configuredApiUrl = API_URL || "http://localhost:5001";

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
