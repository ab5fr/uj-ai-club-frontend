"use client";

import { useState } from "react";
import TopPlayers from "../components/TopPlayers";
import LeaderboardTable from "../components/LeaderboardTable";
import ProfileSection from "../components/ProfileSection";

export default function CompetitionsPage() {
  const [activeTab, setActiveTab] = useState("challenges"); // 'leaderboard' | 'challenges' | 'profile'

  // Mock data - replace with actual data from your API when ready
  const players = [
    {
      id: 1,
      name: "Abdulrahman Al ssaggaf",
      points: 320,
      image: "/cat-violin.webp",
      rank: 1,
    },
    {
      id: 2,
      name: "Abdulrahman Al ssaggaf",
      points: 320,
      image: "/scary-face.webp",
      rank: 2,
    },
    {
      id: 3,
      name: "Abdulrahman Al ssaggaf",
      points: 320,
      image: "/reaper.webp",
      rank: 3,
    },
    // Rest of the leaderboard
    ...Array(7)
      .fill(null)
      .map((_, index) => ({
        id: index + 4,
        name: "Abdulrahman Al ssaggaf",
        points: 320,
        rank: 4,
      })),
  ];

  return (
    <main
      className="relative flex flex-col items-center pt-32 text-white pb-20"
      style={{
        backgroundImage: "url('/challenges-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        {/* Header Text */}
        <div className="text-center mb-16">
          <h1 className="text-7xl font-bold mb-4">ARCADE</h1>
          <p className="text-2xl mb-2 text-gray-300">
            everyone is tough until they face
          </p>
          <p
            className="text-[10rem] bg-gradient-to-r from-[#c13d21] to-[#dd4e00] text-transparent bg-clip-text"
            style={{
              fontFamily: "DK Face Your Fears II",
            }}
          >
            THE BEA
            <span
              style={{
                fontFamily: "DK Face Your Fears II",
                fontWeight: "bold",
              }}
            >
              s
            </span>
            T
          </p>
        </div>{" "}
        {/* Navigation Buttons */}
        <div className="flex justify-center gap-8 mb-20">
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`px-8 py-3 rounded-xl text-lg font-semibold transition-colors border ${
              activeTab === "leaderboard"
                ? "bg-white/15 border-white/30"
                : "bg-white/5 hover:bg-white/10 border-white/10"
            }`}
            aria-pressed={activeTab === "leaderboard"}
          >
            Leaderboard
          </button>
          <button
            onClick={() => setActiveTab("challenges")}
            className={`px-8 py-3 rounded-xl text-lg font-semibold transition-colors border ${
              activeTab === "challenges"
                ? "bg-white/15 border-white/30"
                : "bg-white/5 hover:bg-white/10 border-white/10"
            }`}
            aria-pressed={activeTab === "challenges"}
          >
            Challenges
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-8 py-3 rounded-xl text-lg font-semibold transition-colors border ${
              activeTab === "profile"
                ? "bg-white/15 border-white/30"
                : "bg-white/5 hover:bg-white/10 border-white/10"
            }`}
            aria-pressed={activeTab === "profile"}
          >
            Profile
          </button>
        </div>
        {/* Content Section */}
        <div className="w-full">
          {activeTab === "challenges" && (
            // Challenge Section
            <div className="max-w-4xl mx-auto backdrop-blur-sm rounded-3xl p-10 border border-white/10 bg-black/30">
              <h2 className="text-3xl font-bold mb-2 text-white">
                Week 1 - The Wumpus World
              </h2>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                Enter the mysterious Wumpus World, a classic AI challenge that
                tests your ability to navigate through uncertainty. Your task is
                to guide an agent through a treacherous cave, avoiding deadly
                pits and the fearsome Wumpus, while searching for gold. Using
                logical reasoning and probability, can you create an AI that
                survives and conquers this dangerous realm?
              </p>

              <div className="flex justify-center">
                <a
                  href="https://example.com/challenge/wumpus-world"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-10 py-4 bg-gradient-to-r bg-white/5 hover:bg-white/10 rounded-2xl text-xl font-bold transition-opacity shadow-lg"
                >
                  Start Hunting
                </a>
              </div>
            </div>
          )}
          {activeTab === "leaderboard" && (
            // Leaderboard Section
            <div className="container mx-auto max-w-4xl">
              <TopPlayers topPlayers={players.slice(0, 3)} />
              <LeaderboardTable players={players.slice(3)} />
            </div>
          )}
          {activeTab === "profile" && (
            // Profile Section
            <ProfileSection />
          )}
        </div>
      </div>
    </main>
  );
}
