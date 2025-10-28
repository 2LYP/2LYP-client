// contexts/AuthContext.js
"use client";

import { createContext, useContext, useCallback, useEffect, useState } from "react";
import { clearTokens } from "@/utils/tokenManager";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCsrfToken, initCsrf } from "@/utils/api";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();

  // Prefetch CSRF token on mount
  useEffect(() => {
    initCsrf();
  }, []);

  // Global state
  const [authError, setAuthError] = useState(null);
  const [user, setUser] = useState(null);

  // Fetch user profile using React Query
  const {
    data: userData,
    isLoading: isAuthLoading,
    refetch: refetchUser,
    isError: isAuthError,
    error: authErrorQuery,
  } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/profile`, {
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          await refreshToken(); // Try refreshing
          const retryRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/profile`, {
            credentials: "include",
          });

          if (!retryRes.ok) {
            clearTokens();
            return null;
          }
          return (await retryRes.json()).user;
        }
        return null;
      }

      return (await res.json()).user;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    onSuccess: (data) => setUser(data),
    onError: () => setUser(null),
  });

  // Refresh token
  const refreshToken = useCallback(async () => {
    try {
      await getCsrfToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
          "X-CSRF-Token": axios.defaults.headers.post["X-CSRF-Token"],
        },
      });

      if (!response.ok) {
        clearTokens();
        return false;
      }

      await queryClient.invalidateQueries(["auth", "user"]);
      return true;
    } catch {
      clearTokens();
      return false;
    }
  }, [queryClient]);

  // Logout
  const logout = useCallback(async () => {
    try {
      await getCsrfToken();
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          "X-CSRF-Token": axios.defaults.headers.post["X-CSRF-Token"],
        },
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearTokens();
      queryClient.resetQueries(["auth", "user"]);
    }
  }, [queryClient]);

  // Login
  const handleLogin = useCallback(
    async (input) => {
      let credentials = input;

      if (input && input.preventDefault) {
        input.preventDefault();
        const form = input.target;
        credentials = {
          email: form.email?.value || "",
          password: form.password?.value || "",
        };
      }

      setAuthError(null);
      await getCsrfToken();

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": axios.defaults.headers.post["X-CSRF-Token"],
        },
        credentials: "include",
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const data = await response.json();
        setAuthError(data.error || "Login failed");
        throw new Error(data.error || "Login failed");
      }

      await queryClient.invalidateQueries(["auth", "user"]);
      setAuthError(null);
      return true;
    },
    [queryClient]
  );

  // Signup
  const handleSignup = useCallback(
    async (input) => {
      let credentials = input;

      if (input && input.preventDefault) {
        input.preventDefault();
        const form = input.target;
        credentials = {
          userName: form.userName?.value || "",
          companyName: form.companyName?.value || "",
          email: form.email?.value || "",
          password: form.password?.value || "",
          confirmPassword: form.confirmPassword?.value || "",
        };
      }

      setAuthError(null);
      await getCsrfToken();

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": axios.defaults.headers.post["X-CSRF-Token"],
        },
        credentials: "include",
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const data = await response.json();
        setAuthError(data.error || "Signup failed");
        throw new Error(data.error || "Signup failed");
      }

      await queryClient.invalidateQueries(["auth", "user"]);
      setAuthError(null);
      return true;
    },
    [queryClient]
  );

  const value = {
    user: userData || user,
    setUser,
    isAuthLoading,
    isAuthError,
    authError: authError || authErrorQuery,
    setAuthError,
    logout,
    refreshToken,
    refetchUser,
    handleLogin,
    handleSignup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
