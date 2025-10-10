"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { authApi, ApiError } from "@/lib/api";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNum: "",
    email: "",
    password: "",
    university: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const universities = [
    "King Saud University",
    "King Abdulaziz University",
    "King Fahd University of Petroleum and Minerals",
    "Imam Muhammad ibn Saud Islamic University",
    "Saudi Electronic University",
    "Shaqra University",
    "Majmaah University",
    "University of Jeddah",
    "Princess Nourah bint Abdulrahman University",
    "King Khalid University",
    "Umm Al-Qura University",
    "Imam Abdulrahman Bin Faisal University",
    "Qassim University",
    "University of Hail",
    "Taif University",
    "University of Tabuk",
    "Jazan University",
    "Najran University",
    "Northern Border University",
    "Prince Sultan University",
    "Alfaisal University",
    "University of Business and Technology",
    "Prince Mohammad Bin Fahd University",
    "Al Baha Private College of Sciences",
    "Batterjee Medical College for Sciences and Technology",
    "Buraidah Private Colleges",
    "Dar Al-Hekma College",
    "Jeddah International Private College",
    "Other",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authApi.signup(
        formData.fullName,
        formData.phoneNum,
        formData.email,
        formData.password,
        formData.university
      );
      login(response.user, response.token);
      router.push("/challanges");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 0) {
          setError("Network error. Please check your connection.");
        } else {
          setError(
            err.data?.message ||
              err.message ||
              "Sign up failed. Please try again."
          );
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
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Title outside the form */}
        <h1 className="text-5xl font-bold text-white mb-8">def Sign_Up():</h1>

        {/* Sign Up Form */}
        <div className="bg-[#0a1225]/60 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-blue-900/20">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-6 py-4 rounded-2xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* First Row: Full Name and Phone Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name Field */}
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-mono z-10">
                  full_name = "
                </span>
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-mono z-10">
                  "
                </span>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-6 py-4 pl-[9.5rem] pr-[2rem] rounded-2xl bg-[#0d1b3a]/80 backdrop-blur-sm text-white text-lg focus:outline-none transition-all"
                  required
                />
              </div>

              {/* Phone Number Field */}
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-mono z-10">
                  phone_num = "
                </span>
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-mono z-10">
                  "
                </span>
                <input
                  type="tel"
                  name="phoneNum"
                  value={formData.phoneNum}
                  onChange={handleChange}
                  className="w-full px-6 py-4 pl-[10rem] pr-[2rem] rounded-2xl bg-[#0d1b3a]/80 backdrop-blur-sm text-white text-lg focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Second Row: Email and Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            {/* Third Row: University */}
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-mono z-10">
                university = "
              </span>
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-mono z-10">
                "
              </span>
              <select
                name="university"
                value={formData.university}
                onChange={handleChange}
                className="w-full px-6 py-4 pl-[10.5rem] pr-[2rem] rounded-2xl bg-[#0d1b3a]/80 backdrop-blur-sm text-white text-lg font-mono focus:outline-none transition-all appearance-none cursor-pointer"
                required
              >
                <option
                  value=""
                  disabled
                  className="bg-[#0d1b3a] font-mono"
                ></option>
                {universities.map((uni, index) => (
                  <option
                    key={index}
                    value={uni}
                    className="bg-[#0d1b3a] font-mono"
                  >
                    {uni}
                  </option>
                ))}
              </select>
            </div>

            {/* Fourth Row: Return Statement */}
            <div className="relative mt-12">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-mono z-10">
                return full_name, phone_num, email, password, university?
              </span>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 px-6 pl-[36rem] pr-20 rounded-full bg-[#0d1b3a]/80 hover:bg-[#0d1b3a] text-white text-lg transition-colors backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed text-left relative flex items-center"
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
