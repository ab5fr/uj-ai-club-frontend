import { getImageUrl } from "@/lib/api";

export default function ProfileSection({ userProfile }) {
  const StatPair = ({ label, value, valueRed = false, compact = false }) => (
    <div
      className={`grid gap-2 ${
        compact
          ? "grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]"
          : "grid-cols-[minmax(0,1fr)_auto]"
      }`}
    >
      <div
        className={`bg-[#0d0e10] py-3 text-(--color-text) font-light ${
          compact
            ? "px-4 md:px-5 text-base md:text-xl"
            : "px-4 md:px-6 text-xl md:text-3xl"
        }`}
      >
        {label}
      </div>
      <div
        className={`bg-[#0d0e10] px-6 py-3 font-semibold ${
          compact ? "text-2xl md:text-3xl" : "text-3xl md:text-4xl"
        } ${valueRed ? "text-[#ff0000]" : "text-(--color-text)"}`}
      >
        {value}
      </div>
    </div>
  );

  if (!userProfile) {
    return (
      <div className="max-w-4xl mx-auto text-(--color-text) text-center py-20">
        <p className="text-2xl text-(--color-text-muted)">
          No profile data available
        </p>
      </div>
    );
  }

  const stats = userProfile.stats || {};

  return (
    <div className="max-w-4xl mx-auto w-full px-4 md:px-0 text-(--color-text) space-y-8 overflow-x-hidden">
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-4 items-stretch md:items-center">
        <div className="bg-[#0d0e10] px-5 md:px-7 py-4 md:py-5 text-[#ff0000] font-semibold text-3xl md:text-5xl leading-none text-center md:text-left">
          #{userProfile.rank}
        </div>

        <div className="relative bg-[#0d0e10] py-4 md:py-5 pl-20 md:pl-28 pr-4 md:pr-8 min-h-20 md:min-h-24 flex items-center min-w-0">
          {userProfile.image && (
            <img
              src={getImageUrl(userProfile.image)}
              alt={userProfile.name}
              className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-14 h-14 md:w-20 md:h-20 rounded-full object-cover"
            />
          )}
          <div className="text-(--color-text) text-2xl md:text-4xl font-light leading-tight truncate w-full">
            {userProfile.name}
          </div>
        </div>

        <div className="bg-[#0d0e10] px-5 md:px-8 py-4 md:py-5 text-(--color-text) text-3xl md:text-5xl font-light leading-none text-center md:text-left">
          {userProfile.points}
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatPair
            label="Best Ability"
            value={stats.bestSubject || "-"}
            valueRed
            compact
          />
          <StatPair
            label="Improveable"
            value={stats.improveable || "-"}
            valueRed
            compact
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatPair
            label="Fastest hunter"
            value={stats.quickestHunter ?? "-"}
            valueRed
          />
          <StatPair
            label="Challenges taken"
            value={stats.challengesTaken ?? "-"}
            valueRed
          />
        </div>
      </div>
    </div>
  );
}
