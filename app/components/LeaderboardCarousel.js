"use client";

import { useState } from "react";

const leaderboards = [
  {
    id: 0,
    title: "Top Contributors",
    entries: [
      { rank: 1, name: "Alex", points: "1,450" },
      { rank: 2, name: "Samira", points: "1,230" },
      { rank: 3, name: "Omar", points: "980" },
      { rank: 4, name: "Layla", points: "875" },
      { rank: 5, name: "Mohammed", points: "820" },
      { rank: 6, name: "Sara", points: "750" },
    ],
  },
  {
    id: 1,
    title: "Veterans",
    entries: [
      { rank: 1, name: "Fatima", points: "210" },
      { rank: 2, name: "David", points: "195" },
      { rank: 3, name: "Yasmine", points: "180" },
      { rank: 4, name: "Hassan", points: "165" },
      { rank: 5, name: "Nora", points: "150" },
      { rank: 6, name: "Khalid", points: "140" },
    ],
  },
  {
    id: 2,
    title: "Project MVPs",
    entries: [
      { rank: 1, name: "Team Phoenix", points: "8,900" },
      { rank: 2, name: "AI Avengers", points: "8,250" },
      { rank: 3, name: "Neural Ninjas", points: "7,600" },
      { rank: 4, name: "Code Warriors", points: "7,200" },
      { rank: 5, name: "Data Dynamos", points: "6,850" },
      { rank: 6, name: "Tech Titans", points: "6,500" },
    ],
  },
];

export default function LeaderboardCarousel() {
  const [activeIndex, setActiveIndex] = useState(1);

  return (
    <section
      className="w-full h-screen relative overflow-hidden flex items-center"
      style={{
        backgroundImage:
          "linear-gradient(rgba(10,10,10,0.8), rgba(10,10,10,0.9)), url('/lbbg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="container mx-auto px-4 text-center w-full">
        <h2 className="text-5xl font-bold mb-12 text-white drop-shadow-lg">
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
                    className={`bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/80 shadow-2xl w-[650px] transition-all duration-500 ${
                      !isActive && "brightness-50"
                    }`}
                  >
                    <h3 className="text-3xl font-semibold mb-6 text-blue-400">
                      {board.title}
                    </h3>

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-2 gap-6">
                      {/* Left Column - Ranks 1-3 */}
                      <div>
                        {/* Left Table Headers */}
                        <div className="bg-gray-700/60 rounded-lg p-3 mb-4">
                          <div className="grid grid-cols-[60px_1fr_100px] font-bold text-white text-sm uppercase tracking-wider">
                            <span>Rank</span>
                            <span>Name</span>
                            <span className="text-right">Points</span>
                          </div>
                        </div>
                        {/* Left Table Content */}
                        <div className="space-y-3">
                          {board.entries.slice(0, 3).map((entry) => (
                            <div
                              key={entry.rank}
                              className="grid grid-cols-[60px_1fr_100px] items-center bg-gray-700/50 p-4 rounded-lg hover:bg-gray-700/70 transition-colors"
                            >
                              <span className="text-white/90 font-medium">
                                #{entry.rank}
                              </span>
                              <span className="text-white font-medium">
                                {entry.name}
                              </span>
                              <span className="text-right font-semibold text-green-400">
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
                          <div className="grid grid-cols-[60px_1fr_100px] font-bold text-white text-sm uppercase tracking-wider">
                            <span>Rank</span>
                            <span>Name</span>
                            <span className="text-right">Points</span>
                          </div>
                        </div>
                        {/* Right Table Content */}
                        <div className="space-y-3">
                          {board.entries.slice(3, 6).map((entry) => (
                            <div
                              key={entry.rank}
                              className="grid grid-cols-[60px_1fr_100px] items-center bg-gray-700/50 p-4 rounded-lg hover:bg-gray-700/70 transition-colors"
                            >
                              <span className="text-white/90 font-medium">
                                #{entry.rank}
                              </span>
                              <span className="text-white font-medium">
                                {entry.name}
                              </span>
                              <span className="text-right font-semibold text-green-400">
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
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? "bg-white scale-125"
                  : "bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`View ${board.title}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
