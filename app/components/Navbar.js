"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon } from "@heroicons/react/24/solid";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
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
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center px-8 py-4 w-full text-white bg-[#121522]">
      {/* Left cluster: Logo + Links */}
      <div className="flex items-center gap-10">
        <Link href="/" className="shrink-0">
          <Image src="/logo.png" alt="Logo" width={70} height={70} />
        </Link>
        <div className="flex gap-6 lg:gap-8 text-sm tracking-wide">
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
            href="/ai-types"
            className="font-medium hover:text-blue-400 transition-colors"
          >
            AI Types
          </Link>
          {/* <Link
            href="/the-club"
            className="font-medium hover:text-blue-400 transition-colors"
          >
            The Club
          </Link> */}
        </div>
      </div>
      {/* Auth Buttons pushed to right */}
      <div className="flex gap-3 ml-auto items-center">
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
    </nav>
  );
}
