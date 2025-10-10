"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import TopPlayers from "../components/TopPlayers";
import LeaderboardTable from "../components/LeaderboardTable";
import ProfileSection from "../components/ProfileSection";
import { challengesApi, userApi, ApiError } from "@/lib/api";
import { Fredoka } from "next/font/google";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

function CompetitionsContent() {
  const [activeTab, setActiveTab] = useState("leaderboard");
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      if (activeTab === "leaderboard") {
        const data = await challengesApi.getLeaderboard();
        setLeaderboardData(data);
      } else if (activeTab === "challenges") {
        const data = await challengesApi.getCurrent();
        setCurrentChallenge(data);
      } else if (activeTab === "profile") {
        const data = await userApi.getProfile();
        setUserProfile(data);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to load data");
      }
    } finally {
      setLoading(false);
    }
  };

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
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-6 py-4 rounded-2xl mb-8 max-w-4xl mx-auto">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-20">
              <div className="text-2xl text-white">Loading...</div>
            </div>
          ) : activeTab === "challenges" ? (
            // Challenge Section
            <div className="max-w-4xl mx-auto backdrop-blur-sm rounded-3xl p-10">
              {currentChallenge ? (
                <>
                  <h2 className="text-3xl font-lite mb-2 text-white text-center">
                    <span className="font-bold">
                      Week {currentChallenge.week}
                    </span>{" "}
                    - {currentChallenge.title}
                  </h2>
                  <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                    {currentChallenge.description}
                  </p>

                  <div className="flex justify-center">
                    <a
                      href={currentChallenge.challengeUrl}
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
                </>
              ) : (
                <p className="text-2xl text-gray-400 text-center">
                  No active challenge
                </p>
              )}
            </div>
          ) : activeTab === "leaderboard" ? (
            // Leaderboard Section
            <div className="container mx-auto max-w-4xl">
              {leaderboardData.length > 0 ? (
                <>
                  <TopPlayers topPlayers={leaderboardData.slice(0, 3)} />
                  <LeaderboardTable players={leaderboardData.slice(3)} />
                </>
              ) : (
                <p className="text-2xl text-gray-400 text-center">
                  No leaderboard data available
                </p>
              )}
            </div>
          ) : (
            // Profile Section
            <ProfileSection userProfile={userProfile} />
          )}
        </div>
      </div>
    </main>
  );
}

export default function CompetitionsPage() {
  return (
    <ProtectedRoute>
      <CompetitionsContent />
    </ProtectedRoute>
  );
}
