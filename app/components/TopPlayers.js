export default function TopPlayers({ topPlayers }) {
  const rankColors = {
    "1st": "border-yellow-500", // Gold
    "2nd": "border-gray-400", // Silver
    "3rd": "border-amber-700", // Bronze
  };

  // Desktop: 3 columns -> 2nd (left), 1st (center), 3rd (right)
  // Mobile: single column in natural order 1st, 2nd, 3rd
  const rankPositions = {
    "1st": "md:col-start-2",
    "2nd": "md:col-start-1",
    "3rd": "md:col-start-3",
  };

  const rankSizes = {
    "1st": "w-44 h-44 md:w-48 md:h-48",
    "2nd": "w-36 h-36 md:w-40 md:h-40",
    "3rd": "w-36 h-36 md:w-40 md:h-40",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 items-end gap-6 mb-12">
      {topPlayers.map((player, index) => {
        const rankNumber = index + 1; // Automatic rank based on position
        const rank = `${rankNumber}${
          rankNumber === 1 ? "st" : rankNumber === 2 ? "nd" : "rd"
        }`;
        const fullName = player.name || "";
        const spaceIdx = fullName.indexOf(" ");
        const firstLine =
          spaceIdx === -1 ? fullName : fullName.slice(0, spaceIdx);
        const secondLine = spaceIdx === -1 ? "" : fullName.slice(spaceIdx + 1);
        return (
          <div
            key={player.id || index}
            className={`flex flex-col items-center ${rankPositions[rank]}`}
          >
            <div className="relative">
              {/* Rank Badge */}
              <div
                className={`
                absolute -top-2 -left-2 z-10
                w-8 h-8 rounded-full bg-orange-500
                flex items-center justify-center
                text-white text-sm font-bold
              `}
              >
                {rank}
              </div>

              {/* Profile Picture with Colored Border */}
              <div
                className={`
                relative rounded-full overflow-hidden
                ${rankSizes[rank]} border-4 ${rankColors[rank]}
              `}
              >
                <img
                  src={player.image}
                  alt={`${player.name}'s profile`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Points Badge */}
              <div className="absolute bottom-0 right-0 bg-black/80 px-2 py-1 rounded-full text-white text-sm">
                {player.points}
              </div>
            </div>

            {/* Player Title (The Beast) - Only for 1st place, above name */}
            {rank === "1st" && (
              <p
                className="font-bold text-4xl mb-1 bg-gradient-to-r from-[#c13d21] to-[#dd4e00] text-transparent bg-clip-text"
                style={{ fontFamily: "DK Face Your Fears" }}
              >
                THE BEAST
              </p>
            )}

            {/* Player Name split across two lines at first space */}
            <h3 className="mt-2 text-white text-center font-light leading-tight">
              <span className="block">{firstLine}</span>
              {secondLine && <span className="block">{secondLine}</span>}
            </h3>
          </div>
        );
      })}
    </div>
  );
}
