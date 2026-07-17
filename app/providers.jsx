// providers.jsx
"use client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRef } from "react";

export default function Providers({ children }) {
  // Use useRef to persist QueryClient across renders
  const queryClientRef = useRef();
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient();
  }
  return (
    <QueryClientProvider client={queryClientRef.current}>
      <ThemeProvider>
        <AuthProvider>
          {children}
          <ToastContainer position="top-center" autoClose={4000} />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
