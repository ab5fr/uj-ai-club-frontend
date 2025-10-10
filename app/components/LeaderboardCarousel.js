"use client";

import { useState, useEffect } from "react";
import { leaderboardApi, ApiError } from "@/lib/api";

export default function LeaderboardCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [leaderboards, setLeaderboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      setLeaderboards(transformedData);
      if (transformedData.length > 0) {
        setActiveIndex(Math.floor(transformedData.length / 2)); // Start in the middle
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to load leaderboards");
      }
      // Fallback to empty array on error
      setLeaderboards([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section
        className="w-full h-screen relative overflow-hidden flex items-center"
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

  if (error || leaderboards.length === 0) {
    return (
      <section
        className="w-full h-screen relative overflow-hidden flex items-center"
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
          <div className="text-2xl text-white/80">
            {error || "No leaderboards available"}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="w-full h-screen relative overflow-hidden flex items-center"
      style={{
        backgroundImage: "url('/lbbg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="container mx-auto px-4 text-center w-full">
        <h2 className="text-7xl font-extrabold mb-12 text-white drop-shadow-lg">
          Leaderboards
        </h2>

        {/* Leaderboards Carousel Container */}
        <div className="relative flex items-center justify-center mb-12">
          <div className="flex items-center justify-center w-full max-w-7xl mx-auto relative h-[550px]">
            {leaderboards.map((board, index) => {
              const position = index - activeIndex;
              const isActive = index === activeIndex;
              const isVisible = Math.abs(position) <= 1;

              return (
                <div
                  key={board.id}
                  className={`absolute transition-all duration-500 ease-out ${
                    isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                  style={{
                    transform: `translateX(${position * 80}%) scale(${
                      isActive ? 1.1 : 0.85
                    })`,
                    zIndex: isActive ? 20 : 10,
                  }}
                >
                  <div
                    className={`bg-[#16214470] backdrop-blur-sm rounded-2xl p-8 border border-gray-700/80 shadow-2xl w-[50vw] transition-all duration-500 ${
                      !isActive && "brightness-50"
                    }`}
                  >
                    <h3 className="text-3xl font-semibold mb-6 text-white">
                      {board.title}
                    </h3>

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-2 gap-6">
                      {/* Left Column - Ranks 1-3 */}
                      <div>
                        {/* Left Table Headers */}
                        <div className="bg-gray-700/60 rounded-lg p-3 mb-4">
                          <div className="grid grid-cols-[1fr_100px] font-light text-white text-sm uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                              <span className="w-20">Rank</span>
                              <span>Name</span>
                            </div>
                            <span className="text-right">Points</span>
                          </div>
                        </div>
                        {/* Left Table Content */}
                        <div className="space-y-3 font-light">
                          {board.entries.slice(0, 3).map((entry) => (
                            <div
                              key={entry.rank}
                              className="grid grid-cols-[1fr_100px] items-center bg-gray-700/50 p-4 rounded-lg hover:bg-gray-700/70 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-white/90 w-20">
                                  #{entry.rank}
                                </span>
                                <span className="text-white">{entry.name}</span>
                              </div>
                              <span className="text-right text-[#0087d3]">
                                {entry.points}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right Column - Ranks 4-6 */}
                      <div>
                        {/* Right Table Headers */}
                        <div className="bg-gray-700/60 rounded-lg p-3 mb-4">
                          <div className="grid grid-cols-[1fr_100px] font-light text-white text-sm uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                              <span className="w-20">Rank</span>
                              <span>Name</span>
                            </div>
                            <span className="text-right">Points</span>
                          </div>
                        </div>
                        {/* Right Table Content */}
                        <div className="space-y-3 font-light">
                          {board.entries.slice(3, 6).map((entry) => (
                            <div
                              key={entry.rank}
                              className="grid grid-cols-[1fr_100px] items-center bg-gray-700/50 p-4 rounded-lg hover:bg-gray-700/70 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-white/90 w-20">
                                  #{entry.rank}
                                </span>
                                <span className="text-white">{entry.name}</span>
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
              );
            })}
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center items-center gap-4">
          {leaderboards.map((board, index) => (
            <button
              key={board.id}
              onClick={() => setActiveIndex(index)}
              className={`w-6 h-6 rounded-md transition-all duration-300 ${
                index === activeIndex
                  ? "bg-blue-300 scale-125"
                  : "bg-blue-600 hover:bg-blue-600/60"
              }`}
              aria-label={`View ${board.title}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
