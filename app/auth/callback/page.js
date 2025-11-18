"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthCallbackPage() {
  const [status, setStatus] = useState("processing");
  const [error, setError] = useState("");
  const [processed, setProcessed] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    // Prevent multiple executions
    if (processed) return;

    const handleCallback = async () => {
      // The backend handles OAuth and redirects here with token or error
      const token = searchParams.get("token");
      const user = searchParams.get("user");
      const needs_profile = searchParams.get("needs_profile_completion");
      const error = searchParams.get("error");

      if (error) {
        setError(decodeURIComponent(error));
        setStatus("error");
        setProcessed(true);
        return;
      }

      if (!token || !user) {
        setError("Invalid authentication response from server.");
        setStatus("error");
        setProcessed(true);
        return;
      }

      try {
        setStatus("processing");

        // Parse user data from URL parameter
        const userData = JSON.parse(decodeURIComponent(user));

        // Store token and user info
        login(userData, token);

        setProcessed(true);

        // Check if user needs to complete profile
        if (needs_profile === "true") {
          router.push("/auth/complete-profile");
        } else {
          router.push("/challanges");
        }
      } catch (err) {
        console.error("Auth callback parsing error:", err);
        setError("Failed to process authentication data.");
        setStatus("error");
        setProcessed(true);
      }
    };

    handleCallback();
  }, [searchParams, router, login, processed]);

  const handleRetry = () => {
    router.push("/login");
  };

  return (
    <main
      className="min-h-screen relative flex items-center justify-center pt-24"
      style={{
        backgroundImage: "url('/lbbg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-[#0a1225]/60 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-blue-900/20 text-center">
          {status === "processing" && (
            <>
              <div className="w-12 h-12 mx-auto mb-6">
                <svg
                  className="animate-spin w-12 h-12 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">
                Completing Authentication
              </h1>
              <p className="text-gray-300">
                Please wait while we process your Google authentication...
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-12 h-12 mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">
                Authentication Failed
              </h1>
              <p className="text-gray-300 mb-6">{error}</p>
              <button
                onClick={handleRetry}
                className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
              >
                Try Again
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
