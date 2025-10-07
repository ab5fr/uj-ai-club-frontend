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
    <section className="w-full h-screen relative overflow-hidden flex items-center bg-gradient-to-br from-cyan-400 via-sky-300 to-blue-400">
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
            <input
              type="text"
              name="name"
              placeholder="name ="
              value={formData.name}
              onChange={handleChange}
              className="w-full px-6 py-4 rounded-2xl bg-white/30 backdrop-blur-sm border-2 border-white/40 text-white placeholder-white/70 text-lg focus:outline-none focus:border-white/60 focus:bg-white/40 transition-all"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="e-mail ="
              value={formData.email}
              onChange={handleChange}
              className="w-full px-6 py-4 rounded-2xl bg-white/30 backdrop-blur-sm border-2 border-white/40 text-white placeholder-white/70 text-lg focus:outline-none focus:border-white/60 focus:bg-white/40 transition-all"
              required
            />
          </div>

          {/* Message Field */}
          <div className="relative">
            <textarea
              name="message"
              placeholder='return { "'
              value={formData.message}
              onChange={handleChange}
              rows={6}
              className="w-full px-6 py-4 rounded-2xl bg-white/30 backdrop-blur-sm border-2 border-white/40 text-white placeholder-white/70 text-lg focus:outline-none focus:border-white/60 focus:bg-white/40 transition-all resize-none"
              required
            />
            <div className="absolute bottom-4 right-4 text-white/70 text-lg font-mono">
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
