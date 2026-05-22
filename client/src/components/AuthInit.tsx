"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store";

export default function AuthInit() {
  useEffect(() => {
    const existingToken = useAuthStore.getState().token;
    if (existingToken) {
      return;
    }

    const token = process.env.NEXT_PUBLIC_DEMO_TOKEN?.trim() || "demo-admin-token";
    if (token) {
      useAuthStore.getState().setAuth(token, "ADMIN");
    }
  }, []);

  return null;
}
