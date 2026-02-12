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
    "King Saud University",
    "Princess Nourah Bint Abdulrahman University",
    "Imam Mohammad Ibn Saud Islamic University",
    "Prince Sultan University",
    "Arab Open University",
    "Al Yamamah University",
    "Dar Al Uloom University",
    "Alfaisal University",
    "AlMaarefa University",
    "Prince Sattam Bin Abdulaziz University",
    "Majmaah University",
    "Shaqra University",
    "Saudi Electronic University",
    "King Abdulaziz University",
    "Umm Al-Qura University",
    "Effat University",
    "Dar Al-Hekma University",
    "University of Business and Technology",
    "Taif University",
    "King Abdullah University of Science and Technology",
    "University of Jeddah",
    "Islamic University of Medina",
    "Taibah University",
    "Prince Mugrin University",
    "King Fahd University of Petroleum and Minerals",
    "Imam Abdulrahman Bin Faisal University",
    "King Faisal University",
    "University of Hafr Al Batin",
    "Prince Mohammad University",
    "King Khalid University",
    "Qassim University",
    "Sulaiman Al Rajhi University",
    "Al Jouf University",
    "Jazan University",
    "University of Hail",
    "Al Baha University",
    "Najran University",
    "Northern Border University",
    "University of Tabuk",
    "Fahd bin Sultan University",
    "King Saud bin Abdulaziz University for Health Sciences",
    "University of Bisha",
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
