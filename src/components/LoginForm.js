// components/LoginForm.js

"use client";

import { useEffect, useState, useCallback } from "react";

import Button from "@/components/ui/Button";

import { useAuth } from "@/contexts/AuthContext";

import { getCsrfToken } from "@/utils/api";

import { toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

export default function LoginForm({
  email,
  password,
  error,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onShowSignup,
  onGoogleAuth,
  onAuthSuccess, // <-- add this prop
}) {
  const { handleLogin, setAuthError } = useAuth();
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleCallback = useCallback(
    async (response) => {
      if (!response.credential) {
        console.error("No credential received from Google");
        return;
      }

      try {
        setIsSubmitting(true);
        const csrfToken = await getCsrfToken();

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-CSRF-Token": csrfToken,
            },
            credentials: "include",
            body: JSON.stringify({ token: response.credential }),
          }
        );

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || "Google login failed");
          return;
        }

        // Extract profile picture from ID token
        let pictureUrl = "";
        try {
          const base64Url = response.credential.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
          const payload = JSON.parse(atob(padded));
          pictureUrl = payload.picture;
        } catch (e) {
          pictureUrl = "https://ui-avatars.com/api/?name=User";
        }

        if (onGoogleAuth) {
          await onGoogleAuth(data.user, pictureUrl);
        }
        if (onAuthSuccess) {
          await onAuthSuccess();
        }
      } catch (err) {
        console.error("Google Login Error:", err);
        toast.error("Google login failed. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [onGoogleAuth, onAuthSuccess]
  );

  useEffect(() => {
    const initializeGoogle = () => {
      if (typeof window !== "undefined" && window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            callback: handleGoogleCallback,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          const googleBtnElement = document.getElementById(
            "google-btn-login"
          );
          if (googleBtnElement && !googleBtnElement.hasChildNodes()) {
            window.google.accounts.id.renderButton(googleBtnElement, {
              theme: "outline",
              size: "large",
              width: "100%",
              text: "signin_with",
              shape: "rectangular",
            });
            setGoogleLoaded(true);
          }
        } catch (error) {
          console.error("Google initialization error:", error);
        }
      } else {
        setTimeout(initializeGoogle, 500);
      }
    };

    initializeGoogle();
  }, [handleGoogleCallback]);

  const handleManualLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError(null);
    try {
      await handleLogin({ email, password });
      if (onAuthSuccess) {
        await onAuthSuccess();
      }
    } catch (err) {
      toast.error(err.message || "Login failed. Please try again.");
      setAuthError(err.message || "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  let errorMessage = null;
  if (error) {
    errorMessage = typeof error === "string" ? error : error?.message || String(error);
  }
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        Login
      </h2>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4 text-sm text-center">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleManualLogin} className="space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={onEmailChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            placeholder="Email"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <input
            type="password"
            value={password}
            onChange={onPasswordChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            placeholder="Password"
            disabled={isSubmitting}
          />
        </div>
        <div className="flex justify-center">
        <Button
            type="submit"
            className="w-full h-12 text-lg !bg-[#ffff00]"
            style={{ fontSize: "20px", height: "60px" }}
            disabled={
              isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Login"}
        </Button>
        </div>
      </form>

      <div className="flex items-center my-6">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="mx-4 text-gray-500 text-sm">or</span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      <div className="flex justify-center">
        <div id="google-btn-login" className="w-full max-w-xs"></div>
      </div>

      <p className="text-center mt-6 text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={onShowSignup}
          className="text-blue-600 hover:text-blue-800 font-medium underline"
          disabled={isSubmitting}
        >
          Sign Up
        </button>
      </p>
    </div>
  );
}
