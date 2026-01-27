"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";

export default function SignUpPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGoogleSignup = async () => {
    try {
      setError("");
      setLoading(true);
      const response = await authApi.getGoogleAuthUrl();
      window.location.href = response.url;
    } catch (err) {
      setError("Failed to initialize Google signup. Please try again.");
      setLoading(false);
    }
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
        {/* Title outside the form */}
        <h1 className="text-5xl font-bold text-[var(--color-text)] mb-8">
          def Sign_Up():
        </h1>

        {/* Sign Up Form */}
        <div className="bg-[color-mix(in_srgb,var(--color-surface)_60%,transparent)] backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-[var(--color-border)]">
          {error && (
            <div className="bg-[color-mix(in_srgb,var(--color-danger)_25%,transparent)] border border-[var(--color-danger)] text-[var(--color-warning)] px-6 py-4 rounded-2xl mb-6">
              {error}
            </div>
          )}

          {/* Info message */}
          <div className="text-center mb-8">
            <p className="text-[var(--color-text)] text-lg mb-4">
              Sign up using your Gmail account
            </p>
            <p className="text-[var(--color-text-muted)] text-sm">
              After signing in with Google, you'll be asked to create a password
              so you can also log in with email and password.
            </p>
          </div>

          {/* Google Signup Button */}
          <button
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-[var(--color-neutral)] hover:bg-[color-mix(in_srgb,var(--color-neutral)_92%,var(--color-ink))] text-[var(--color-ink)] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="var(--color-primary)"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="var(--color-success)"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="var(--color-warning)"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="var(--color-accent)"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {loading ? "Loading..." : "Continue with Google"}
          </button>

          {/* Link to login */}
          <div className="text-center mt-6">
            <p className="text-[var(--color-text-muted)]">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-[var(--color-primary)] hover:text-[var(--color-primary-soft)]"
              >
                Log in
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
