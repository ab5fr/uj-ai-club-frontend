"use client";

import TopPlayers from "../../components/TopPlayers";
import LeaderboardTable from "../../components/LeaderboardTable";

export default function LeaderboardPage() {
  // Mock data - replace with actual data from your API
  const players = [
    {
      id: 1,
      name: "Abdulrahman Al ssaggaf",
      points: 320,
      image: "/path/to/player1.jpg", // Replace with actual image path
      rank: 1,
    },
    {
      id: 2,
      name: "Abdulrahman Al ssaggaf",
      points: 320,
      image: "/path/to/player2.jpg", // Replace with actual image path
      rank: 2,
    },
    {
      id: 3,
      name: "Abdulrahman Al ssaggaf",
      points: 320,
      image: "/path/to/player3.jpg", // Replace with actual image path
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
    <main className="min-h-screen bg-black pt-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-4">ARCADE</h1>
          <p className="text-white text-xl mb-2">everyone is tough</p>
          <p className="text-red-600 text-2xl font-bold">until they face</p>
          <p className="text-red-600 text-4xl font-bold">THE BEAST</p>
        </div>

        <div className="flex justify-center gap-16 text-white text-xl mb-12">
          <button className="font-bold">LEADERBOARD</button>
          <button className="opacity-50 hover:opacity-100 transition-opacity">
            CHALLENGES
          </button>
          <button className="opacity-50 hover:opacity-100 transition-opacity">
            PROFILE
          </button>
        </div>

        <TopPlayers topPlayers={players.slice(0, 3)} />
        <LeaderboardTable players={players.slice(3)} />
      </div>
    </main>
  );
}
