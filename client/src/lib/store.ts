import { create } from "zustand";
import { persist } from "zustand/middleware";

type Role = "ADMIN" | "PROJECT_MANAGER" | "SITE_ENGINEER" | "CLIENT" | "WORKER";

interface AuthState {
  token: string | null;
  role: Role | null;
  setAuth: (token: string, role: Role) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      role: null,
      setAuth: (token, role) => set({ token, role }),
      logout: () => set({ token: null, role: null })
    }),
    {
      name: "buildtrack-auth"
    }
  )
);
