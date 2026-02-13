export default function LeaderboardTable({ players }) {
  return (
    <div className="w-full max-w-3xl mx-auto bg-[#08090a] p-4">
      {/* Header */}
      <div className="grid grid-cols-12 text-[var(--color-text-muted)] uppercase text-xs px-4 mb-3">
        <div className="col-span-2">Rank</div>
        <div className="col-span-7">Name</div>
        <div className="col-span-3 text-right">pts</div>
      </div>

      {/* Player Rows */}
      <div className="space-y-2">
        {players.map((player, index) => (
          <div
            key={player.id || index}
            className="grid grid-cols-12 items-center text-[var(--color-text)] p-3 bg-[#0d0e10]"
          >
            <div className="col-span-2 text-[var(--color-text-muted)] font-light">
              #{index + 4}
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
