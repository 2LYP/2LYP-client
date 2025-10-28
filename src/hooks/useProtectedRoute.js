// hooks/useProtectedRoute.js
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function useProtectedRoute(redirectTo = "/") {
  const { user, isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push(redirectTo);
    }
  }, [user, isAuthLoading, router, redirectTo]);
}
