import { getImageUrl } from "@/lib/api";

export default function TopPlayers({ topPlayers }) {
  const rankColors = {
    "1st": "border-[var(--color-accent)]",
    "2nd": "border-[#c0c0c0]",
    "3rd": "border-[#cd7f32]",
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

  const rankElevations = {
    "1st": "mt-0",
    "2nd": "-mt-40 md:-mt-40",
    "3rd": "-mt-40 md:-mt-40",
  };

  const rankBorderWidths = {
    "1st": "border-[6px]",
    "2nd": "border-[6px]",
    "3rd": "border-[6px]",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 items-end gap-1 md:gap-2 mb-12">
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
            className={`flex flex-col items-center ${rankPositions[rank]} ${rankElevations[rank]}`}
          >
            <div className="relative">
              {/* Rank Badge */}
              <div
                className={`
                absolute top-1 left-1 z-10
                w-8 h-8 rounded-full bg-(--color-accent)
                flex items-center justify-center
                text-(--color-text) text-sm font-bold
                translate-x-1/4 translate-y-1/4
              `}
              >
                {rank}
              </div>

              {/* Profile Picture with Colored Border */}
              <div
                className={`
                relative rounded-full overflow-hidden
                ${rankSizes[rank]} ${rankBorderWidths[rank]} ${rankColors[rank]}
              `}
              >
                <img
                  src={getImageUrl(player.image)}
                  alt={`${player.name}'s profile`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Points Badge */}
              <div className="absolute bottom-0 right-0 -translate-x-1/4 -translate-y-1/4 bg-[color-mix(in_srgb,var(--color-ink)_80%,transparent)] px-2 py-1 rounded-full text-(--color-text) text-sm">
                {player.points}
              </div>
            </div>

            {/* Player Title (The Beast) - Only for 1st place, above name */}
            {rank === "1st" && (
              <p
                className="font-bold text-4xl mb-1 bg-linear-to-r from-[#dd4e00] to-[#ff0000] text-transparent bg-clip-text"
                style={{ fontFamily: "DK Face Your Fears" }}
              >
                THE BEAST
              </p>
            )}

            {/* Player Name split across two lines at first space */}
            <h3 className="mt-2 text-(--color-text) text-center font-light leading-tight">
              <span className="block">{firstLine}</span>
              {secondLine && <span className="block">{secondLine}</span>}
            </h3>
          </div>
        );
      })}
    </div>
  );
}
