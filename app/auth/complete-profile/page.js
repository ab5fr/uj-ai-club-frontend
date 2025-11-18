"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { authApi, ApiError } from "@/lib/api";

export default function CompleteProfilePage() {
  const [formData, setFormData] = useState({
    university: "",
    major: "",
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
    setLoading(true);

    try {
      const response = await authApi.completeProfile(
        formData.university,
        formData.major
      );
      updateUser(response.user);
      router.push("/challanges");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.message || "Failed to complete profile. Please try again."
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
        <h1 className="text-4xl font-bold text-white mb-4 text-center">
          Complete Your Profile
        </h1>
        <p className="text-gray-300 mb-8 text-center">
          Welcome, {user.fullName}! Please provide your university and major to
          complete your profile.
        </p>

        {/* Profile Completion Form */}
        <div className="bg-[#0a1225]/60 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-blue-900/20">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-6 py-4 rounded-2xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* University Field */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                University
              </label>
              <select
                name="university"
                value={formData.university}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-[#0d1b3a]/80 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                required
              >
                <option value="" disabled className="bg-[#0d1b3a]">
                  Select your university
                </option>
                {universities.map((uni, index) => (
                  <option key={index} value={uni} className="bg-[#0d1b3a]">
                    {uni}
                  </option>
                ))}
              </select>
            </div>

            {/* Major Field */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Major / Field of Study
              </label>
              <select
                name="major"
                value={formData.major}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-[#0d1b3a]/80 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                required
              >
                <option value="" disabled className="bg-[#0d1b3a]">
                  Select your major
                </option>
                {majors.map((major, index) => (
                  <option key={index} value={major} className="bg-[#0d1b3a]">
                    {major}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Completing Profile..." : "Complete Profile"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
