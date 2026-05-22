import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { api, configuredApiUrl, hasConfiguredApiUrl, isDemoMode } from "@/lib/api";

interface LoginError {
  message: string;
  field?: "email" | "password" | "general";
}

export const useLogin = () => {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<LoginError | null>(null);

  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);

    try {
      if (isDemoMode) {
        const response = await api.post("/auth/login", {
          email: email.trim(),
          password
        });

        const token = response.data.token;
        const role = response.data.user?.role ?? "ADMIN";
        setAuth(token, role);
        setLoading(false);

        setTimeout(() => {
          router.push("/dashboard");
        }, 300);

        return true;
      }

      // Validation
      if (!email?.trim()) {
        setError({ message: "Email is required", field: "email" });
        setLoading(false);
        return false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError({ message: "Please enter a valid email address", field: "email" });
        setLoading(false);
        return false;
      }

      if (!password) {
        setError({ message: "Password is required", field: "password" });
        setLoading(false);
        return false;
      }

      if (password.length < 8) {
        setError({
          message: "Password must be at least 8 characters",
          field: "password"
        });
        setLoading(false);
        return false;
      }

      // API call
      const response = await api.post("/auth/login", {
        email: email.trim(),
        password
      });

      const token = response.data.token;
      const role = response.data.user?.role ?? "ADMIN";

      setAuth(token, role);
      setLoading(false);

      // Redirect after short delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 300);

      return true;
    } catch (err: any) {
      setLoading(false);

      if (err.response?.status === 401) {
        setError({ message: "Invalid email or password", field: "general" });
      } else if (err.response?.status === 400) {
        setError({ message: "Validation failed. Please check your input.", field: "general" });
      } else if (err.code === "ECONNREFUSED") {
        setError({ message: "Cannot connect to server. Please try again.", field: "general" });
      } else if (err.response?.data?.message) {
        setError({ message: err.response.data.message, field: "general" });
      } else {
        setError({ message: "Login failed. Please try again.", field: "general" });
      }

      return false;
    }
  };

  return {
    login,
    loading,
    error,
    clearError: () => setError(null)
  };
};
