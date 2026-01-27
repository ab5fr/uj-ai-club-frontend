"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { authApi, ApiError } from "@/lib/api";

export default function CompleteProfilePage() {
  const [formData, setFormData] = useState({
    university: "",
    major: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, updateUser } = useAuth();

  const universities = [
    "University of Johannesburg",
    "University of the Witwatersrand",
    "University of Cape Town",
    "Stellenbosch University",
    "University of Pretoria",
    "Rhodes University",
    "University of KwaZulu-Natal",
    "Nelson Mandela University",
    "University of the Free State",
    "North-West University",
    "University of Limpopo",
    "University of Venda",
    "Walter Sisulu University",
    "Tshwane University of Technology",
    "Cape Peninsula University of Technology",
    "Durban University of Technology",
    "Vaal University of Technology",
    "Central University of Technology",
    "Mangosuthu University of Technology",
    "Other",
  ];

  const majors = [
    "Computer Science",
    "Information Technology",
    "Software Engineering",
    "Data Science",
    "Artificial Intelligence",
    "Machine Learning",
    "Cybersecurity",
    "Information Systems",
    "Computer Engineering",
    "Electrical Engineering",
    "Mathematics",
    "Statistics",
    "Physics",
    "Engineering",
    "Business",
    "Economics",
    "Other",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate password
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.completeProfile(
        formData.university,
        formData.major,
        formData.password,
      );
      if (updateUser) {
        updateUser(response.user);
      }
      router.push("/challanges");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.message || "Failed to complete profile. Please try again.",
        );
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

  // Redirect if user is not authenticated
  if (!user) {
    router.push("/login");
    return null;
  }

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
        {/* Title */}
        <h1 className="text-4xl font-bold text-[var(--color-text)] mb-4 text-center">
          Complete Your Profile
        </h1>
        <p className="text-[var(--color-text-muted)] mb-8 text-center">
          Welcome, {user.fullName}! Please complete your profile to continue.
        </p>

        {/* Profile Completion Form */}
        <div className="bg-[color-mix(in_srgb,var(--color-surface)_60%,transparent)] backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-[var(--color-border)]">
          {error && (
            <div className="bg-[color-mix(in_srgb,var(--color-danger)_25%,transparent)] border border-[var(--color-danger)] text-[var(--color-warning)] px-6 py-4 rounded-2xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password Field */}
            <div>
              <label className="block text-[var(--color-text-muted)] text-sm font-medium mb-2">
                Create Password{" "}
                <span className="text-[var(--color-danger)]">*</span>
              </label>
              <p className="text-[var(--color-text-muted)] text-xs mb-2">
                Set a password so you can also log in with email and password
              </p>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                className="w-full px-4 py-3 rounded-xl bg-[color-mix(in_srgb,var(--color-surface-2)_80%,transparent)] backdrop-blur-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                required
                minLength={6}
              />
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-[var(--color-text-muted)] text-sm font-medium mb-2">
                Confirm Password{" "}
                <span className="text-[var(--color-danger)]">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className="w-full px-4 py-3 rounded-xl bg-[color-mix(in_srgb,var(--color-surface-2)_80%,transparent)] backdrop-blur-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                required
                minLength={6}
              />
            </div>

            {/* Divider */}
            <div className="border-t border-[var(--color-border)] my-6"></div>

            {/* University Field */}
            <div>
              <label className="block text-[var(--color-text-muted)] text-sm font-medium mb-2">
                University
              </label>
              <select
                name="university"
                value={formData.university}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-[color-mix(in_srgb,var(--color-surface-2)_80%,transparent)] backdrop-blur-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                required
              >
                <option
                  value=""
                  disabled
                  className="bg-[var(--color-surface-2)]"
                >
                  Select your university
                </option>
                {universities.map((uni, index) => (
                  <option
                    key={index}
                    value={uni}
                    className="bg-[var(--color-surface-2)]"
                  >
                    {uni}
                  </option>
                ))}
              </select>
            </div>

            {/* Major Field */}
            <div>
              <label className="block text-[var(--color-text-muted)] text-sm font-medium mb-2">
                Major / Field of Study
              </label>
              <select
                name="major"
                value={formData.major}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-[color-mix(in_srgb,var(--color-surface-2)_80%,transparent)] backdrop-blur-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                required
              >
                <option
                  value=""
                  disabled
                  className="bg-[var(--color-surface-2)]"
                >
                  Select your major
                </option>
                {majors.map((major, index) => (
                  <option
                    key={index}
                    value={major}
                    className="bg-[var(--color-surface-2)]"
                  >
                    {major}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-strong)] text-[var(--color-text)] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Completing Profile..." : "Complete Profile"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
