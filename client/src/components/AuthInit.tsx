"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store";

const isTokenExpired = (token: string) => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return true;
    }
    return false;
  } catch {
    return true;
  }
};

export default function AuthInit() {
  useEffect(() => {
    const store = useAuthStore.getState();
    const existingToken = store.token;
    const envToken = process.env.NEXT_PUBLIC_DEMO_TOKEN?.trim();

    if (existingToken) {
      if (isTokenExpired(existingToken)) {
        store.logout();
        if (envToken && !isTokenExpired(envToken)) {
          store.setAuth(envToken, "ADMIN");
        }
      } else if (envToken && existingToken !== envToken && !isTokenExpired(envToken)) {
        // If the environment token has been refreshed/changed, update to match it
        store.setAuth(envToken, "ADMIN");
      }
      return;
    }

    if (envToken) {
      store.setAuth(envToken, "ADMIN");
    }
  }, []);

  return null;
}
