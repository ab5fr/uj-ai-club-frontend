export default function ProfileSection() {
  // Mock data - replace with actual data from your API
  const userProfile = {
    rank: 1,
    name: "Abdulrahman Al ssaggaf",
    points: 320,
    image: "/cat-violin.webp",
    bestSubject: "Data Analysis",
    improveable: "Linear Algebra",
    quickestHunter: 0,
    challengesTaken: 30,
  };

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

  return (
    <div className="max-w-4xl mx-auto text-white">
      {/* User Info */}
      <div className="flex items-center gap-6 bg-black/30 backdrop-blur-sm rounded-lg p-4 mb-8">
        <div className="text-red-500 font-bold text-2xl">
          #{userProfile.rank}
        </div>
        <img
          src={userProfile.image}
          alt={userProfile.name}
          className="w-16 h-16 rounded-full object-cover border-2 border-gray-700"
        />
        <div className="flex-grow text-xl font-semibold">
          {userProfile.name}
        </div>
        <div className="text-2xl font-bold">{userProfile.points}</div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          label="Best subject"
          value={userProfile.bestSubject}
          isHighlighted
        />
        <StatCard
          label="Improveable"
          value={userProfile.improveable}
          isHighlighted
        />
        <StatCard label="Quickest hunter" value={userProfile.quickestHunter} />
        <StatCard
          label="Challenges taken"
          value={userProfile.challengesTaken}
        />
      </div>
    </div>
  );
}
