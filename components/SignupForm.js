// components/SignupForm.js

"use client";

import { useEffect, useState, useCallback } from "react";

import Button from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { getCsrfToken } from "@/utils/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SignupForm({
  userName,
  companyName,
  email,
  password,
  confirmPassword,
  error,
  onUserNameChange,
  onCompanyNameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  onShowLogin,
  onGoogleAuth, // REQUIRED to handle Google user state
  onAuthSuccess, // <-- add this prop
}) {
  const { handleSignup, setAuthError } = useAuth();
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);

  // Google callback handler
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
          throw new Error(data.error || "Google signup failed");
        }

        // Extract Google profile picture from ID token
        let pictureUrl = "";
        try {
          const base64Url = response.credential.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const padded =
            base64 + "=".repeat((4 - (base64.length % 4)) % 4);
          const payload = JSON.parse(atob(padded));
          pictureUrl = payload.picture || "";
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
        console.error("Google Signup Error:", err);
        toast.error(
          err.message || "Google signup failed. Please try again."
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [onGoogleAuth, onAuthSuccess]
  );

  // Initialize Google sign-in button
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
            "google-btn-signup"
          );
          if (googleBtnElement && !googleBtnElement.hasChildNodes()) {
            window.google.accounts.id.renderButton(googleBtnElement, {
              theme: "outline",
              size: "large",
              width: "100%",
              text: "signup_with",
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

  // Client-side password checks
  useEffect(() => {
    if (password) {
      const errors = [];
      if (password.length < 8) errors.push("At least 8 characters");
      if (!/[a-z]/.test(password)) errors.push("Lowercase letter");
      if (!/[A-Z]/.test(password)) errors.push("Uppercase letter");
      if (!/\d/.test(password)) errors.push("Number");
      if (!/[@$!%*?&]/.test(password)) errors.push("Special character");
      setPasswordErrors(errors);
    } else {
      setPasswordErrors([]);
    }
  }, [password]);

  // Manual signup handler
  const handleManualSignup = async (e) => {
    e.preventDefault();
    setAuthError(null);

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwordErrors.length > 0) {
      toast.error(
        "Please fix password requirements before continuing"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await handleSignup({
        userName,
        companyName,
        email,
        password,
        confirmPassword,
      });
      if (onAuthSuccess) {
        await onAuthSuccess();
      }
    } catch (err) {
      toast.error(err.message || "Signup failed. Please try again.");
      setAuthError(err.message || "Signup failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        Sign Up
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4 text-sm text-center">
          {typeof error === "string" ? error : error?.message || String(error)}
        </div>
      )}

      <form onSubmit={handleManualSignup} className="space-y-4">
        <div>
          <input
            type="text"
            value={userName}
            onChange={onUserNameChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            placeholder="Full Name"
            disabled={isSubmitting}
            minLength={2}
          />
        </div>

        <div>
          <input
            type="text"
            value={companyName}
            onChange={onCompanyNameChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Company (Optional)"
            disabled={isSubmitting}
          />
        </div>

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
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${passwordErrors.length > 0
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
              }`}
            required
            placeholder="Password"
            disabled={isSubmitting}
          />
          {password && passwordErrors.length > 0 && (
            <div className="mt-2 text-xs text-red-600">
              <p className="font-medium">Password must include:</p>
              <ul className="list-disc list-inside">
                {passwordErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <input
            type="password"
            value={confirmPassword}
            onChange={onConfirmPasswordChange}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${confirmPassword && password !== confirmPassword
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
              }`}
            required
            placeholder="Confirm Password"
            disabled={isSubmitting}
          />
          {confirmPassword && password !== confirmPassword && (
            <p className="mt-1 text-xs text-red-600">
              Passwords do not match
            </p>
          )}
        </div>

        <div className="flex justify-center">
          <Button
            type="submit"
            className="w-full h-12 text-lg !bg-[#ffff00]"
            style={{ fontSize: "20px", height: "60px" }}
            disabled={
              isSubmitting ||
              passwordErrors.length > 0 ||
              (confirmPassword && password !== confirmPassword)
            }
          >
            {isSubmitting ? "Creating Account..." : "Sign Up"}
          </Button>
        </div>
      </form>

      <div className="flex items-center my-6">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="mx-4 text-gray-500 text-sm">or</span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      <div className="flex justify-center">
        <div id="google-btn-signup" className="w-full max-w-xs"></div>
      </div>

      <p className="text-center mt-6 text-sm text-gray-600">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onShowLogin}
          className="text-blue-600 hover:text-blue-800 font-medium underline"
          disabled={isSubmitting}
        >
          Login
        </button>
      </p>
    </div>
  );
}
