"use client";

import { useState } from "react";
import { contactApi, ApiError } from "@/lib/api";

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    setLoading(true);

    try {
      await contactApi.send(formData.name, formData.email, formData.message);
      setStatus({
        type: "success",
        message: "Message sent successfully! We'll get back to you soon.",
      });
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      if (err instanceof ApiError) {
        setStatus({
          type: "error",
          message: err.message || "Failed to send message. Please try again.",
        });
      } else {
        setStatus({
          type: "error",
          message: "An unexpected error occurred. Please try again.",
        });
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
          {/* Status Message */}
          {status.message && (
            <div
              className={`px-6 py-4 rounded-2xl ${
                status.type === "success"
                  ? "bg-green-500/20 border border-green-500 text-green-200"
                  : "bg-red-500/20 border border-red-500 text-red-200"
              }`}
            >
              {status.message}
            </div>
          )}

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
              disabled={loading}
              className="px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-semibold text-lg transition-all shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
