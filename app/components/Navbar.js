"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon } from "@heroicons/react/24/solid";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isChallenges = pathname?.startsWith("/challanges");
  const { user, isAuthenticated, logout } = useAuth();

  if (isChallenges) {
    // Minimal nav for challenges page: only a home icon linking to '/'
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center px-6 py-4 w-full bg-transparent text-white">
        <Link href="/" aria-label="Home" className="inline-flex items-center">
          <HomeIcon className="h-7 w-7 text-white hover:opacity-80 transition-opacity" />
        </Link>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-2 md:px-8 py-4 max-w-full text-white bg-[#121522] overflow-x-hidden">
      {/* Left cluster: Logo + Links */}
      <div className="flex items-center gap-2 md:gap-10 flex-shrink-0">
        <Link href="/" className="shrink-0">
          <Image
            src="/logo.png"
            alt="Logo"
            width={40}
            height={40}
            className="md:w-[70px] md:h-[70px]"
          />
        </Link>
        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-6 lg:gap-8 text-sm tracking-wide">
          <Link
            href="/"
            className="font-medium hover:text-blue-400 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/challanges"
            className="font-medium hover:text-blue-400 transition-colors"
          >
            Challanges
          </Link>
          <Link
            href="/resources"
            className="font-medium hover:text-blue-400 transition-colors"
          >
            Resources
          </Link>
          {/* <Link
            href="/learning-plans"
            className="font-medium hover:text-blue-400 transition-colors"
          >
            Learning Plans
          </Link> */}
          <Link
            href="/ai-specializations"
            className="font-medium hover:text-blue-400 transition-colors"
          >
            AI Specializations
          </Link>
          {/* <Link
            href="/the-club"
            className="font-medium hover:text-blue-400 transition-colors"
          >
            The Club
          </Link> */}
        </div>
      </div>

      {/* Desktop Auth Buttons */}
      <div className="hidden md:flex gap-3 ml-auto items-center">
        {isAuthenticated() ? (
          <>
            <span className="text-sm text-gray-300">
              Welcome, {user?.fullName || user?.email}
            </span>
            <button
              onClick={logout}
              className="px-6 py-2.5 rounded-full bg-red-500/90 text-white hover:bg-red-400 focus:ring-2 focus:ring-red-300/50 focus:outline-none transition-colors shadow shadow-red-700/30 font-medium"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login">
              <button className="px-6 py-2.5 rounded-full bg-blue-500/90 text-white hover:bg-blue-400 focus:ring-2 focus:ring-blue-300/50 focus:outline-none transition-colors shadow shadow-blue-700/30 font-medium">
                Login
              </button>
            </Link>
            <Link href="/signup">
              <button className="px-6 py-2.5 rounded-full font-medium bg-gray-200/90 text-gray-900 hover:bg-gray-100 focus:ring-2 focus:ring-gray-300/60 focus:outline-none transition-colors shadow">
                Sign Up
              </button>
            </Link>
          </>
        )}
      </div>

      {/* Mobile Hamburger Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden flex flex-col gap-1.5 p-2 flex-shrink-0"
        aria-label="Toggle menu"
      >
        <span className="w-5 h-0.5 bg-white transition-all"></span>
        <span className="w-5 h-0.5 bg-white transition-all"></span>
        <span className="w-5 h-0.5 bg-white transition-all"></span>
      </button>

      {/* Mobile Side Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-[#0a1225] transform transition-transform duration-300 ease-in-out z-50 ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        } md:hidden`}
      >
        {/* Close Button */}
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="absolute top-4 right-4 text-white text-2xl"
          aria-label="Close menu"
        >
          ×
        </button>

        {/* Mobile Navigation Links */}
        <div className="flex flex-col gap-6 p-8 mt-12">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="font-medium hover:text-blue-400 transition-colors text-lg"
          >
            Home
          </Link>
          <Link
            href="/challanges"
            onClick={() => setMobileMenuOpen(false)}
            className="font-medium hover:text-blue-400 transition-colors text-lg"
          >
            Challanges
          </Link>
          <Link
            href="/resources"
            onClick={() => setMobileMenuOpen(false)}
            className="font-medium hover:text-blue-400 transition-colors text-lg"
          >
            Resources
          </Link>
          <Link
            href="/ai-specializations"
            onClick={() => setMobileMenuOpen(false)}
            className="font-medium hover:text-blue-400 transition-colors text-lg"
          >
            AI Specializations
          </Link>

          {/* Mobile Auth Buttons */}
          <div className="flex flex-col gap-3 mt-6">
            {isAuthenticated() ? (
              <>
                <span className="text-sm text-gray-300 mb-2">
                  Welcome, {user?.fullName || user?.email}
                </span>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-6 py-2.5 rounded-full bg-red-500/90 text-white hover:bg-red-400 transition-colors font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full px-6 py-2.5 rounded-full bg-blue-500/90 text-white hover:bg-blue-400 transition-colors font-medium">
                    Login
                  </button>
                </Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full px-6 py-2.5 rounded-full font-medium bg-gray-200/90 text-gray-900 hover:bg-gray-100 transition-colors">
                    Sign Up
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        ></div>
      )}
    </nav>
  );
}
