"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { authApi, ApiError } from "@/lib/api";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      setError("");
      setLoading(true);
      const response = await authApi.getGoogleAuthUrl();
      window.location.href = response.url;
    } catch (err) {
      setError("Failed to initialize Google login. Please try again.");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authApi.login(formData.email, formData.password);
      login(response.user, response.token);
      router.push("/challanges");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError("Invalid email or password");
        } else if (err.status === 0) {
          setError("Network error. Please check your connection.");
        } else {
          setError(err.message || "Login failed. Please try again.");
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
          def Log_In():
        </h1>

        {/* Login Form */}
        <div className="bg-[color-mix(in_srgb,var(--color-surface)_60%,transparent)] backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-[var(--color-border)]">
          {error && (
            <div className="bg-[color-mix(in_srgb,var(--color-danger)_25%,transparent)] border border-[var(--color-danger)] text-[var(--color-warning)] px-6 py-4 rounded-2xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Email Field */}
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] text-lg font-mono z-10">
                email = "
              </span>
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] text-lg font-mono z-10">
                "
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-6 py-4 pl-[7rem] pr-[2rem] rounded-2xl bg-[color-mix(in_srgb,var(--color-surface-2)_80%,transparent)] backdrop-blur-sm text-[var(--color-text)] text-lg focus:outline-none transition-all"
                required
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] text-lg font-mono z-10">
                password = "
              </span>
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] text-lg font-mono z-10">
                "
              </span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-6 py-4 pl-[9.5rem] pr-[2rem] rounded-2xl bg-[color-mix(in_srgb,var(--color-surface-2)_80%,transparent)] backdrop-blur-sm text-[var(--color-text)] text-lg focus:outline-none transition-all"
                required
              />
            </div>

            {/* Return Statement */}
            <div className="relative mt-12">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] text-lg font-mono z-10">
                return email, password?
              </span>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 px-6 pl-[16rem] pr-20 rounded-full bg-[color-mix(in_srgb,var(--color-surface-2)_80%,transparent)] hover:bg-[var(--color-surface-2)] text-[var(--color-text)] text-lg transition-colors backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed text-left relative flex items-center"
              >
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-[var(--color-primary-soft)] hover:bg-[var(--color-primary-glow)] flex items-center justify-center transition-colors pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-[var(--color-surface-2)]"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                    />
                  </svg>
                </span>
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-[var(--color-muted-strong)]"></div>
            <span className="text-[var(--color-text-muted)] font-mono">or</span>
            <div className="flex-1 h-px bg-[var(--color-muted-strong)]"></div>
          </div>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
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
            Continue with Google
          </button>
        </div>
      </div>
    </main>
  );
}
