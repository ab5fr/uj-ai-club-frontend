"use client";

import { useState, useEffect } from "react";
import LeaderboardCarousel from "./components/LeaderboardCarousel";
import ContactSection from "./components/ContactSection";
import Link from "next/link";

export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calculate scroll progress (0 to 1) based on page height
  const maxScroll =
    typeof window !== "undefined"
      ? document.body.scrollHeight - window.innerHeight
      : 3000;
  const scrollProgress = Math.min(scrollY / maxScroll, 1);

  return (
    <main className="flex flex-col w-full relative">
      {/* Shared Animated Gradient Blobs - Fixed position, moves with scroll */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden mix-blend-hard-light">
        <div
          className="absolute w-[750px] h-[750px] rounded-full blur-[180px] transition-transform duration-100 mix-blend-color-dodge"
          style={{
            background:
              "linear-gradient(135deg, var(--color-primary-strong) 0%, var(--color-accent-soft) 100%)",
            opacity: 0.9,
            top: `${-10 + scrollProgress * 80}%`,
            right: `${-5 + scrollProgress * 30}%`,
            transform: `scale(${1 + scrollProgress * 0.3})`,
          }}
        />
        <div
          className="absolute w-[700px] h-[700px] rounded-full blur-[170px] transition-transform duration-100 mix-blend-color-dodge"
          style={{
            background:
              "linear-gradient(225deg, var(--color-primary) 0%, var(--color-ink) 100%)",
            opacity: 0.85,
            top: `${20 + scrollProgress * 60}%`,
            left: `${-15 + scrollProgress * 20}%`,
            transform: `scale(${1 + scrollProgress * 0.25})`,
          }}
        />
        <div
          className="absolute w-[650px] h-[650px] rounded-full blur-[160px] transition-transform duration-100 mix-blend-color-dodge"
          style={{
            background:
              "linear-gradient(45deg, var(--color-primary-soft) 0%, var(--color-primary-strong) 100%)",
            opacity: 0.8,
            bottom: `${-20 + scrollProgress * 50}%`,
            right: `${10 + scrollProgress * 25}%`,
            transform: `scale(${1 + scrollProgress * 0.35})`,
          }}
        />
      </div>

      {/* First screen - 75vh on mobile, original height on desktop */}
      <div className="relative h-[75vh] md:h-screen z-10">
        {/* Hero Background */}
        <div
          className="absolute inset-x-0 top-0 h-full md:h-[calc(100%-15.5rem)]"
          style={{
            backgroundImage: "url('/bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        {/* Hero Section */}
        <section className="absolute inset-x-0 top-0 pt-28 px-4 md:pl-24 md:pr-8 h-full md:h-[calc(100%-15.5rem)]">
          <div className="relative h-full w-full">
            {/* Text Block */}
            <div className="flex flex-col max-w-5xl md:pr-[22rem] h-full justify-start pt-12 md:pt-24">
              <h1 className="text-5xl sm:text-5xl md:text-7xl lg:text-8xl mb-4 leading-tight tracking-tight font-extrabold md:whitespace-nowrap">
                Choose Your Path
              </h1>
              <p className="text-3xl md:text-lg lg:text-3xl mt-4 md:mt-6 font-light text-[color-mix(in_srgb,var(--color-text)_95%,transparent)] leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)] max-w-4xl">
                Learn the difference between AI types we will help you whatever
                you choose
              </p>
            </div>
            {/* Call To Action Button on the right */}
            <Link
              href="/ai-specializations"
              className="hidden md:block font-extrabold absolute top-1/2 -translate-y-1/2 right-4 md:right-10 lg:right-16 xl:right-24 2xl:right-32 bg-[var(--color-primary)] text-[var(--color-text)] px-12 py-5 rounded-full text-2xl hover:bg-[var(--color-primary-strong)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary-soft)_50%,transparent)] focus:outline-none transition shadow-xl shadow-[color-mix(in_srgb,var(--color-primary-strong)_30%,transparent)] tracking-wide"
            >
              Click Here
            </Link>
          </div>
        </section>
        {/* Large Curly Brace */}
        <div
          className="hidden md:block absolute left-24 z-10 text-[12rem] leading-none"
          style={{
            top: "calc(100% - 23rem)", // Position to overlap panorama
            color: "var(--color-primary)",
          }}
        >
          {"}"}
        </div>

        {/* Panorama Banner with blue line */}
        <div className="hidden md:block absolute bottom-0 left-0 right-0">
          <div
            className="w-full h-[15rem] relative overflow-hidden"
            style={{
              backgroundImage:
                "linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.6)), url('/panorama.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            {/* Optional: caption or overlay content can go here */}
          </div>
          <div className="w-full h-2 bg-[var(--color-primary)]" />
        </div>

        {/* Blue line for mobile (no panorama) */}
        <div className="md:hidden absolute bottom-0 left-0 right-0 z-20">
          <div className="w-full h-2 bg-[var(--color-primary)]" />
        </div>
      </div>
      {/* Leaderboard Section */}
      <LeaderboardCarousel />
      {/* Contact Section */}
      <ContactSection />
    </main>
  );
}
