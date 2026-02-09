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
      setError(""); // Clear any previous errors
    } catch (err) {
      console.warn("API error:", err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to load leaderboards");
      }
      setLeaderboards([]);
      setActiveIndex(0);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="w-full min-h-screen md:h-screen relative overflow-hidden flex items-center bg-transparent">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-7xl font-extrabold mb-12 text-[var(--color-text)] drop-shadow-lg">
            Leaderboards
          </h2>
          <div className="text-2xl text-[var(--color-text)]">Loading...</div>
        </div>
      </section>
    );
  }

  // Show error state if no data
  if (!loading && (error || leaderboards.length === 0)) {
    return (
      <section className="w-full min-h-screen md:h-screen relative overflow-hidden flex items-center bg-transparent">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-7xl font-extrabold mb-12 text-[var(--color-text)] drop-shadow-lg">
            Leaderboards
          </h2>
          <div className="text-2xl text-[color-mix(in_srgb,var(--color-text)_80%,transparent)]">
            {error || "No leaderboards available"}
          </div>
        </div>
      </section>
    );
  }

  // Show leaderboard content
  return (
    <section className="w-full min-h-screen md:h-screen relative overflow-hidden flex items-start pt-8 md:pt-0 md:items-center bg-[radial-gradient(ellipse_at_center,_var(--color-primary-strong)_0%,_var(--color-ink)_100%)]">
      <div className="container mx-auto px-4 text-center w-full relative z-10">
        <h2 className="text-5xl md:text-7xl font-extrabold mb-6 md:mb-12 text-[var(--color-text)] drop-shadow-lg pt-5">
          Leaderboards
        </h2>

        {/* Single Leaderboard - First One */}
        <div className="flex items-center justify-center w-full">
          <div className="w-full max-w-2xl">
            <div className="bg-[color-mix(in_srgb,var(--color-surface-2)_70%,transparent)] backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-[var(--color-border)] shadow-2xl">
              <h3 className="text-2xl md:text-3xl font-semibold mb-6 text-[var(--color-text)]">
                {leaderboards[0].title}
              </h3>

              {/* Single Column Layout - Top 3 Only */}
              <div>
                {/* Table Headers */}
                <div className="bg-[color-mix(in_srgb,var(--color-muted-surface-2)_60%,transparent)] rounded-lg p-3 mb-4">
                  <div className="grid grid-cols-[1fr_100px] font-light text-[var(--color-text)] text-sm uppercase tracking-wider">
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
                      className="grid grid-cols-[1fr_100px] items-center bg-[color-mix(in_srgb,var(--color-muted-surface-2)_50%,transparent)] p-4 rounded-lg hover:bg-[color-mix(in_srgb,var(--color-muted-surface-2)_70%,transparent)] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[color-mix(in_srgb,var(--color-text)_90%,transparent)] w-12 md:w-20">
                          #{entry.rank}
                        </span>
                        <span className="text-[var(--color-text)] truncate">
                          {entry.name}
                        </span>
                      </div>
                      <span className="text-right text-[var(--color-primary)]">
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
