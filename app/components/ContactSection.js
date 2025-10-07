"use client";

import { useState } from "react";

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section
      className="w-full h-screen relative overflow-hidden flex items-center"
      style={{
        backgroundImage: "url('/feedback.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="container mx-auto w-full max-w-5xl relative">
        {/* Heading */}
        <div className="mb-12 absolute right-8 md:right-12 lg:right-16 text-right">
          <h2 className="text-6xl md:text-7xl font-extrabold text-white mb-2">
            We would love
          </h2>
          <p className="text-3xl md:text-4xl font-light text-white/90">
            to hear from{" "}
            <span className="font-semibold text-[#040b1f]">you</span>
          </p>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="space-y-6 mt-48 px-4">
          {/* Name and Email Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white text-lg font-bold z-10">
                name = "
              </span>
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-white text-lg font-bold z-10">
                "
              </span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-6 py-4 pl-[7rem] rounded-2xl bg-[#93cff0] backdrop-blur-sm text-white text-lg focus:outline-none transition-all"
                required
              />
            </div>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white text-lg font-bold z-10">
                email = "
              </span>
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-white text-lg font-bold z-10">
                "
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-6 py-4 pl-[7rem] rounded-2xl bg-[#93cff0] backdrop-blur-sm text-white text-lg focus:outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Message Field */}
          <div className="relative">
            <span className="absolute left-6 top-[1.7rem] -translate-y-1/2 text-white text-lg font-bold z-10">
              return {' { "'}
            </span>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={6}
              className="w-full px-6 py-4 pl-[7rem] rounded-2xl bg-[#93cff0] backdrop-blur-sm text-white text-lg focus:outline-none transition-all resize-none"
              required
            />
            <div className="absolute bottom-4 right-4 text-white text-lg font-bold">
              {'" }'}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-semibold text-lg transition-all shadow-xl hover:shadow-2xl"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
