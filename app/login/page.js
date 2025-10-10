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
        <h1 className="text-5xl font-bold text-white mb-8">def Log_In():</h1>

        {/* Login Form */}
        <div className="bg-[#0a1225]/60 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-blue-900/20">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-6 py-4 rounded-2xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Email Field */}
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-mono z-10">
                email = "
              </span>
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-mono z-10">
                "
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-6 py-4 pl-[7rem] pr-[2rem] rounded-2xl bg-[#0d1b3a]/80 backdrop-blur-sm text-white text-lg focus:outline-none transition-all"
                required
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-mono z-10">
                password = "
              </span>
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-mono z-10">
                "
              </span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-6 py-4 pl-[9.5rem] pr-[2rem] rounded-2xl bg-[#0d1b3a]/80 backdrop-blur-sm text-white text-lg focus:outline-none transition-all"
                required
              />
            </div>

            {/* Return Statement */}
            <div className="relative mt-12">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-mono z-10">
                return email, password?
              </span>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 px-6 pl-[16rem] pr-20 rounded-full bg-[#0d1b3a]/80 hover:bg-[#0d1b3a] text-white text-lg transition-colors backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed text-left relative flex items-center"
              >
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-[#93cff0] hover:bg-[#7ab8d9] flex items-center justify-center transition-colors pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-[#0d1b3a]"
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
        </div>
      </div>
    </main>
  );
}
