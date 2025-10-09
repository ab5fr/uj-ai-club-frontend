"use client";

import { useState } from "react";
import TopPlayers from "../components/TopPlayers";
import LeaderboardTable from "../components/LeaderboardTable";
import ProfileSection from "../components/ProfileSection";
import { Fredoka } from "next/font/google";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function CompetitionsPage() {
  const [activeTab, setActiveTab] = useState("leaderboard"); // 'leaderboard' | 'challenges' | 'profile'

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
      className={`${fredoka.className} min-h-screen relative flex flex-col items-center pt-32 text-white pb-20`}
      style={{
        backgroundImage: "url('/challenges-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "top center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        {/* Header Text */}
        <div className="text-center mb-16">
          <h1 className="text-8xl font-bold mb-4">ARCADE</h1>
          <p className="text-5xl mb-2 text-gray-300">
            everyone is tough
            <br /> until they face
          </p>
          <p
            className="text-[5rem] bg-gradient-to-r from-[#c13d21] to-[#dd4e00] text-transparent bg-clip-text"
            style={{
              fontFamily: "DK Face Your Fears",
            }}
          >
            THE BEA
            <span
              style={{
                fontFamily: "DK Face Your Fears",
                fontWeight: "bold",
              }}
            >
              s
            </span>
            T
          </p>
        </div>{" "}
        {/* Navigation Buttons */}
        <div className="flex justify-center gap-1 mb-20">
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`py-3 px-10 text-white font-light uppercase tracking-wider transition-colors ${
              activeTab === "leaderboard"
                ? "bg-[#08090a]"
                : "bg-[#191919] hover:bg-[#1a1a1a]"
            }`}
            style={{ clipPath: "polygon(0 0, 100% 0, 90% 100%, 0% 100%)" }}
            aria-pressed={activeTab === "leaderboard"}
          >
            Leaderboard
          </button>
          <button
            onClick={() => setActiveTab("challenges")}
            className={`py-3 px-10 text-white font-light uppercase tracking-wider transition-colors ${
              activeTab === "challenges"
                ? "bg-[#08090a]"
                : "bg-[#191919] hover:bg-[#1a1a1a]"
            }`}
            style={{ clipPath: "polygon(10% 0, 100% 0, 90% 100%, 0% 100%)" }}
            aria-pressed={activeTab === "challenges"}
          >
            Challenges
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`py-3 px-10 text-white font-light uppercase tracking-wider transition-colors ${
              activeTab === "profile"
                ? "bg-[#08090a]"
                : "bg-[#191919] hover:bg-[#1a1a1a]"
            }`}
            style={{ clipPath: "polygon(10% 0, 100% 0, 100% 100%, 0% 100%)" }}
            aria-pressed={activeTab === "profile"}
          >
            Profile
          </button>
        </div>
        {/* Content Section */}
        <div className="w-full">
          {activeTab === "challenges" && (
            // Challenge Section
            <div className="max-w-4xl mx-auto backdrop-blur-sm rounded-3xl p-10">
              <h2 className="text-3xl font-lite mb-2 text-white text-center">
                <span className="font-bold">Week 1</span> - The Wumpus World
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
                  className="px-10 py-4 bg-[#191919] hover:bg-[#1a1a1a] rounded-2xl text-xl font-bold transition-opacity shadow-lg"
                  style={{
                    clipPath: "polygon(10% 0, 100% 0, 90% 100%, 0% 100%)",
                  }}
                >
                  <span className="bg-gradient-to-r from-[#c13d21] to-[#dd4e00] text-transparent bg-clip-text">
                    Start Hunting
                  </span>
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
