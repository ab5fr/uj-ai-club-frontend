export default function LeaderboardTable({ players }) {
  return (
    <div className="w-full max-w-3xl mx-auto bg-[#08090a] rounded-lg p-4">
      {/* Header */}
      <div className="grid grid-cols-12 text-gray-400 uppercase text-xs px-4 mb-3">
        <div className="col-span-2">Rank</div>
        <div className="col-span-7">Name</div>
        <div className="col-span-3 text-right">pts</div>
      </div>

      {/* Player Rows */}
      <div className="space-y-2">
        {players.map((player) => (
          <div
            key={player.id}
            className="grid grid-cols-12 items-center text-white p-3 bg-[#0d0e10] rounded-md"
          >
            <div className="col-span-2 text-gray-400 font-light">
              #{player.rank}
            </div>
            <div className="col-span-7 font-light">{player.name}</div>
            <div className="col-span-3 text-right font-light">
              {player.points}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
