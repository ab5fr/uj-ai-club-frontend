"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { HomeIcon } from "@heroicons/react/24/solid";
import { useAuth } from "@/contexts/AuthContext";
import { getImageUrl } from "@/lib/api";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const dropdownRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();
  const isChallenges = pathname?.startsWith("/challanges");
  const isRoadmap = pathname === "/roadmap";
  const logoSrc = isRoadmap ? "/orange logo.png" : "/new logo.png";
  const { user, isAuthenticated, logout } = useAuth();
  const navItems = [
    { href: "/", label: "Home" },
    { href: "/challanges", label: "Challanges" },
    { href: "/certificates", label: "Certificates" },
    { href: "/roadmap", label: "Roadmap" },
  ];

  // Check if user is admin
  const isAdmin = () => {
    if (!user) return false;
    return user.role === "admin" || user.isAdmin === true;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle scroll to hide/show navbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        // Scrolling down and past 50px
        setIsVisible(false);
      } else {
        // Scrolling up or near top
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  if (isChallenges) {
    // Minimal nav for challenges page: only a home icon linking to '/'
    return (
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-center px-12 py-6 w-full bg-transparent text-(--color-text) transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <Link href="/" aria-label="Home" className="inline-flex items-center">
          <HomeIcon className="h-10 w-10 text-(--color-text) hover:opacity-80 transition-opacity" />
        </Link>
      </nav>
    );
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-2 md:px-8 py-1 max-w-full ${isRoadmap ? "text-[var(--color-accent)]" : "text-(--color-text)"} bg-transparent overflow-visible transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
      style={
        isRoadmap ? { textShadow: "0 0 12px var(--color-accent)" } : undefined
      }
    >
      {/* Left cluster: Logo + Links */}
      <div className="flex items-center gap-2 md:gap-10 shrink-0">
        <Link href="/" className="shrink-0">
          <Image
            src={logoSrc}
            alt="Logo"
            width={500}
            height={500}
            sizes="(max-width: 768px) 100px, 200px"
            className="w-24 h-24 md:w-40 md:h-40 object-contain"
          />
        </Link>
        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-6 lg:gap-8 text-sm tracking-wide">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-medium hover:text-(--color-primary) transition-colors"
            >
              {item.label}
            </Link>
          ))}
          {/* <Link
            href="/notebook-demo"
            className="font-medium hover:text-[var(--color-primary)] transition-colors"
          >
            Notebook
          </Link> */}
          {/* <Link
            href="/learning-plans"
            className="font-medium hover:text-[var(--color-primary)] transition-colors"
          >
            Learning Plans
          </Link> */}
          {/* <Link
            href="/roadmap"
            className="font-medium hover:text-[var(--color-primary)] transition-colors"
          >
            AI Specializations
          </Link> */}
          {/* Admin Link - only show for admins */}
          {isAuthenticated() && isAdmin() && (
            <Link
              href="/admin"
              className="font-medium text-[var(--color-warning)] hover:text-[var(--color-accent-soft)] transition-colors"
            >
              Admin
            </Link>
          )}
          {/* <Link
            href="/the-club"
            className="font-medium hover:text-[var(--color-primary)] transition-colors"
          >
            The Club
          </Link> */}
        </div>
      </div>

      {/* Desktop Auth Buttons */}
      <div className="hidden md:flex gap-3 ml-auto items-center">
        {isAuthenticated() ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--color-text-muted)]">
              Welcome, {user?.fullName || user?.email}
            </span>
            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-[var(--color-text)] font-semibold hover:bg-[var(--color-primary-strong)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-soft)]"
                aria-label="Profile menu"
              >
                {user?.image ? (
                  <img
                    src={getImageUrl(user.image)}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-lg">
                    {(user?.fullName || user?.email || "U")[0].toUpperCase()}
                  </span>
                )}
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 2 w-48 bg-[var(--color-surface)] rounded-2xl shadow-lg border border-[var(--color-border)] overflow-hidden z-50">
                  <Link
                    href="/settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="block px-4 py-3 text-[var(--color-text)] hover:bg-[color-mix(in_srgb,var(--color-primary-strong)_20%,transparent)] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>Settings</span>
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-3 text-[var(--color-text)] hover:bg-[color-mix(in_srgb,var(--color-danger)_20%,transparent)] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                        />
                      </svg>
                      <span>Logout</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <Link href="/login">
              <button className="px-6 py-2.5 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_90%,transparent)] text-[var(--color-text)] hover:bg-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary-soft)_50%,transparent)] focus:outline-none transition-colors shadow shadow-[color-mix(in_srgb,var(--color-primary-strong)_30%,transparent)] font-medium">
                Login
              </button>
            </Link>
            <Link href="/signup">
              <button className="px-6 py-2.5 rounded-full font-medium bg-[color-mix(in_srgb,var(--color-neutral)_90%,transparent)] text-[var(--color-ink)] hover:bg-[var(--color-neutral)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-neutral)_60%,transparent)] focus:outline-none transition-colors shadow">
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
        <span
          className={`w-5 h-0.5 transition-all ${isRoadmap ? "bg-[var(--color-accent)]" : "bg-[var(--color-text)]"}`}
        ></span>
        <span
          className={`w-5 h-0.5 transition-all ${isRoadmap ? "bg-[var(--color-accent)]" : "bg-[var(--color-text)]"}`}
        ></span>
        <span
          className={`w-5 h-0.5 transition-all ${isRoadmap ? "bg-[var(--color-accent)]" : "bg-[var(--color-text)]"}`}
        ></span>
      </button>

      {/* Mobile Side Menu */}
      <div
        className={`fixed top-0 right-0 h-screen min-h-screen w-64 bg-[var(--color-ink)] shadow-[0_20px_40px_rgba(0,0,0,0.45)] transform transition-transform duration-300 ease-in-out z-50 ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        } md:hidden`}
      >
        {/* Close Button */}
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="absolute top-4 right-4 text-[var(--color-text)] text-2xl"
          aria-label="Close menu"
        >
          ×
        </button>

        {/* Mobile Navigation Links */}
        <div className="flex flex-col gap-6 p-8 mt-12">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="font-medium hover:text-[var(--color-primary)] transition-colors text-lg"
            >
              {item.label}
            </Link>
          ))}

          {/* Admin Link - only show for admins */}
          {isAuthenticated() && isAdmin() && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="font-medium text-[var(--color-warning)] hover:text-[var(--color-accent-soft)] transition-colors text-lg"
            >
              Admin
            </Link>
          )}

          {/* Mobile Auth Buttons */}
          <div className="flex flex-col gap-3 mt-6">
            {isAuthenticated() ? (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-[var(--color-text)] font-semibold">
                    {user?.image ? (
                      <img
                        src={getImageUrl(user.image)}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-lg">
                        {(user?.fullName ||
                          user?.email ||
                          "U")[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-[var(--color-text-muted)]">
                    {user?.fullName || user?.email}
                  </span>
                </div>
                <Link
                  href="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-6 py-2.5 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_90%,transparent)] text-[var(--color-text)] hover:bg-[var(--color-primary)] transition-colors font-medium text-center"
                >
                  Settings
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-6 py-2.5 rounded-full bg-[color-mix(in_srgb,var(--color-danger)_90%,transparent)] text-[var(--color-text)] hover:bg-[var(--color-danger)] transition-colors font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full px-6 py-2.5 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_90%,transparent)] text-[var(--color-text)] hover:bg-[var(--color-primary)] transition-colors font-medium">
                    Login
                  </button>
                </Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full px-6 py-2.5 rounded-full font-medium bg-[color-mix(in_srgb,var(--color-neutral)_90%,transparent)] text-[var(--color-ink)] hover:bg-[var(--color-neutral)] transition-colors">
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
          className="fixed inset-0 bg-[color-mix(in_srgb,var(--color-surface)_60%,transparent)] z-40 md:hidden"
        ></div>
      )}
    </nav>
  );
}
