"use client";

import { useState, useEffect } from "react";
import { leaderboardApi, ApiError } from "@/lib/api";

export default function LeaderboardCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [leaderboards, setLeaderboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Demo leaderboard data
  const demoLeaderboards = [
    {
      id: 1,
      title: "AI Challenge Leaderboard",
      entries: [
        { rank: 1, name: "Alex Chen", points: 2850 },
        { rank: 2, name: "Sarah Johnson", points: 2720 },
        { rank: 3, name: "Mike Rodriguez", points: 2680 },
        { rank: 4, name: "Emma Davis", points: 2540 },
        { rank: 5, name: "James Wilson", points: 2410 },
      ],
    },
  ];

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    try {
      setLoading(true);
      const data = await leaderboardApi.getAll();
      // Transform API data to match component format
      const transformedData = data.map((board, index) => ({
        id: board.id || index,
        title: board.title,
        entries: board.entries.map((entry, entryIndex) => ({
          rank: entryIndex + 1, // Generate rank from index
          name: entry.name,
          points: entry.points,
        })),
      }));

      // Use demo data if API returns empty or invalid data
      const finalData =
        transformedData.length > 0 ? transformedData : demoLeaderboards;

      setLeaderboards(finalData);
      if (finalData.length > 0) {
        setActiveIndex(Math.floor(finalData.length / 2)); // Start in the middle
      }
      setError(""); // Clear any previous errors
    } catch (err) {
      console.warn("API failed, using demo data:", err.message);
      // Use demo data on API failure
      setLeaderboards(demoLeaderboards);
      setActiveIndex(0); // Start at first item
      setError(""); // Don't show error, use demo data instead
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section
        className="w-full min-h-screen md:h-screen relative overflow-hidden flex items-center"
        style={{
          backgroundImage: "url('/lbbg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-7xl font-extrabold mb-12 text-white drop-shadow-lg">
            Leaderboards
          </h2>
          <div className="text-2xl text-white">Loading...</div>
        </div>
      </section>
    );
  }

  // Always show leaderboard content (API data or demo data)
  return (
    <section
      className="w-full min-h-screen md:h-screen relative overflow-hidden flex items-start pt-8 md:pt-0 md:items-center"
      style={{
        backgroundImage: "url('/lbbg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="container mx-auto px-4 text-center w-full">
        <h2 className="text-5xl md:text-7xl font-extrabold mb-6 md:mb-12 text-white drop-shadow-lg pt-5">
          Leaderboards
        </h2>

        {/* Single Leaderboard - First One */}
        <div className="flex items-center justify-center w-full">
          <div className="w-full max-w-2xl">
            <div className="bg-[#16214470] backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-700/80 shadow-2xl">
              <h3 className="text-2xl md:text-3xl font-semibold mb-6 text-white">
                {leaderboards[0].title}
              </h3>

              {/* Single Column Layout - Top 3 Only */}
              <div>
                {/* Table Headers */}
                <div className="bg-gray-700/60 rounded-lg p-3 mb-4">
                  <div className="grid grid-cols-[1fr_100px] font-light text-white text-sm uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <span className="w-12 md:w-20">Rank</span>
                      <span>Name</span>
                    </div>
                    <span className="text-right">Points</span>
                  </div>
                </div>
                {/* Table Content - Top 3 */}
                <div className="space-y-3 font-light">
                  {leaderboards[0].entries.slice(0, 3).map((entry) => (
                    <div
                      key={entry.rank}
                      className="grid grid-cols-[1fr_100px] items-center bg-gray-700/50 p-4 rounded-lg hover:bg-gray-700/70 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-white/90 w-12 md:w-20">
                          #{entry.rank}
                        </span>
                        <span className="text-white truncate">
                          {entry.name}
                        </span>
                      </div>
                      <span className="text-right text-[#0087d3]">
                        {entry.points}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
