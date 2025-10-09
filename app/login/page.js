"use client";

import { useState } from "react";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Login attempted:", formData);
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
      <div className="container mx-auto px-4 max-w-lg">
        {/* Login Form */}
        <div className="bg-[#0a1225]/40 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-blue-900/20">
          <h1 className="text-5xl font-bold text-white mb-12 text-center">
            def Log_In():
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Email Field */}
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white text-lg font-mono">
                email = "
              </span>
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-white text-lg font-mono">
                "
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-6 py-4 pl-[7rem] pr-[2rem] rounded-2xl bg-[#93cff0]/20 backdrop-blur-sm text-white text-lg focus:outline-none transition-all"
                required
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white text-lg font-mono">
                password = "
              </span>
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-white text-lg font-mono">
                "
              </span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-6 py-4 pl-[9.5rem] pr-[2rem] rounded-2xl bg-[#93cff0]/20 backdrop-blur-sm text-white text-lg focus:outline-none transition-all"
                required
              />
            </div>

            {/* Return Statement */}
            <div className="relative mt-12">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white text-lg font-mono">
                return
              </span>
              <button
                type="submit"
                className="w-full px-6 py-4 pl-[7rem] rounded-2xl bg-[#93cff0]/20 hover:bg-[#93cff0]/30 text-white text-lg font-bold transition-colors backdrop-blur-sm"
              >
                email, password;
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
