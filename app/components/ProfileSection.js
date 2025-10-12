import { getImageUrl } from "@/lib/api";

export default function ProfileSection({ userProfile }) {
  const StatCard = ({ label, value, isHighlighted = false }) => (
    <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 flex justify-between items-center">
      <span className="text-white/80">{label}</span>
      <span
        className={`font-bold text-2xl ${
          isHighlighted ? "text-red-500" : "text-white"
        }`}
      >
        {value}
      </span>
    </div>
  );

  if (!userProfile) {
    return (
      <div className="max-w-4xl mx-auto text-white text-center py-20">
        <p className="text-2xl text-gray-400">No profile data available</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto text-white">
      {/* User Info */}
      <div className="flex items-center gap-6 bg-black/30 backdrop-blur-sm rounded-lg p-4 mb-8">
        <div className="text-red-500 font-bold text-2xl">
          #{userProfile.rank}
        </div>
        {userProfile.image && (
          <img
            src={getImageUrl(userProfile.image)}
            alt={userProfile.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-700"
          />
        )}
        <div className="flex-grow text-xl font-semibold">
          {userProfile.name}
        </div>
        <div className="text-2xl font-bold">{userProfile.points}</div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          label="Best subject"
          value={userProfile.stats.bestSubject}
          isHighlighted
        />
        <StatCard
          label="Improveable"
          value={userProfile.stats.improveable}
          isHighlighted
        />
        <StatCard
          label="Quickest hunter"
          value={userProfile.stats.quickestHunter}
        />
        <StatCard
          label="Challenges taken"
          value={userProfile.stats.challengesTaken}
        />
      </div>
    </div>
  );
}
