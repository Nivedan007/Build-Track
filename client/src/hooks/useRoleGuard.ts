"use client";

import { useMemo } from "react";
import { useAuthStore } from "@/lib/store";

type Role = "ADMIN" | "PROJECT_MANAGER" | "SITE_ENGINEER" | "CLIENT" | "WORKER";

export function useRoleGuard(allowedRoles: Role[]) {
  const role = useAuthStore((s) => s.role);

  return useMemo(() => {
    if (!role) {
      return {
        allowed: false,
        reason: "Please login to access this module."
      };
    }

    if (!allowedRoles.includes(role)) {
      return {
        allowed: false,
        reason: "You do not have permission to view this module."
      };
    }

    return {
      allowed: true,
      reason: ""
    };
  }, [allowedRoles, role]);
}
