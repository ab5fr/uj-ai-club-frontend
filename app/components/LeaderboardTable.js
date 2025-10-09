export default function LeaderboardTable({ players }) {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="grid grid-cols-12 text-white mb-4 px-8">
        <div className="col-span-2 text-left">Rank</div>
        <div className="col-span-7">Name</div>
        <div className="col-span-3 text-right">pts</div>
      </div>

      <div className="space-y-2">
        {players.map((player, index) => (
          <div
            key={player.id}
            className="grid grid-cols-12 text-white px-8 py-2"
          >
            <div className="col-span-2 text-left font-mono">#{player.rank}</div>
            <div className="col-span-7">{player.name}</div>
            <div className="col-span-3 text-right">{player.points}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
