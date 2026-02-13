import { getImageUrl } from "@/lib/api";

export default function ProfileSection({ userProfile }) {
  const StatPair = ({ label, value, valueRed = false }) => (
    <div className="grid grid-cols-[1fr_auto] gap-2">
      <div className="bg-[#0d0e10] px-6 py-3 text-[var(--color-text)] text-3xl font-light">
        {label}
      </div>
      <div
        className={`bg-[#0d0e10] px-6 py-3 text-4xl font-semibold ${
          valueRed ? "text-[#ff0000]" : "text-[var(--color-text)]"
        }`}
      >
        {value}
      </div>
    </div>
  );

  if (!userProfile) {
    return (
      <div className="max-w-4xl mx-auto text-[var(--color-text)] text-center py-20">
        <p className="text-2xl text-[var(--color-text-muted)]">
          No profile data available
        </p>
      </div>
    );
  }

  const stats = userProfile.stats || {};

  return (
    <div className="max-w-4xl mx-auto text-[var(--color-text)] space-y-8">
      <div className="grid grid-cols-[auto_1fr_auto] gap-4 items-center">
        <div className="bg-[#0d0e10] px-7 py-5 text-[#ff0000] font-semibold text-5xl leading-none">
          #{userProfile.rank}
        </div>

        <div className="relative bg-[#0d0e10] py-5 pl-28 pr-8 min-h-[96px] flex items-center">
          {userProfile.image && (
            <img
              src={getImageUrl(userProfile.image)}
              alt={userProfile.name}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full object-cover border-2 border-white"
            />
          )}
          <div className="text-[var(--color-text)] text-4xl font-light leading-tight truncate">
            {userProfile.name}
          </div>
        </div>

        <div className="bg-[#0d0e10] px-8 py-5 text-[var(--color-text)] text-5xl font-light leading-none">
          {userProfile.points}
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatPair
            label="Best Ability"
            value={stats.bestSubject || "-"}
            valueRed
          />
          <StatPair
            label="Improveable"
            value={stats.improveable || "-"}
            valueRed
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
