"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import ProtectedRoute from "@/components/ProtectedRoute";
import TopPlayers from "../components/TopPlayers";
import LeaderboardTable from "../components/LeaderboardTable";
import ProfileSection from "../components/ProfileSection";
import { challengesApi, userApi, ApiError } from "@/lib/api";
import { Fredoka } from "next/font/google";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// Status badge component for challenge submission status
function StatusBadge({ status, score, maxScore, pointsAwarded }) {
  const statusConfig = {
    not_started: {
      label: "Not Started",
      color: "bg-[var(--color-muted-strong)]",
    },
    in_progress: { label: "In Progress", color: "bg-[var(--color-warning)]" },
    submitted: { label: "Submitted", color: "bg-[var(--color-primary)]" },
    grading: { label: "Grading...", color: "bg-[var(--color-primary-strong)]" },
    graded: {
      label: `Graded: ${pointsAwarded} pts`,
      color: "bg-[var(--color-success)]",
    },
    error: { label: "Error", color: "bg-[var(--color-danger)]" },
  };

  const config = statusConfig[status] || statusConfig.not_started;

  return (
    <div className="flex items-center gap-2">
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
      >
        {config.label}
      </span>
      {status === "graded" && score !== null && maxScore !== null && (
        <span className="text-(--color-text-muted) text-sm">
          ({score}/{maxScore})
        </span>
      )}
    </div>
  );
}

// Challenge Card component
function ChallengeCard({
  challenge,
  submission,
  onStartChallenge,
  onSubmitChallenge,
  isStarting,
  isSubmitting,
}) {
  const isActive =
    challenge.startDate && challenge.endDate
      ? new Date() >= new Date(challenge.startDate) &&
        new Date() <= new Date(challenge.endDate)
      : true;

  const isCompleted = submission?.status === "graded";
  const isInProgress = submission?.status === "in_progress";

  const handleStart = () => {
    if (!isCompleted && challenge.hasNotebook) {
      onStartChallenge(challenge.id);
    }
  };

  return (
    <div className="bg-(--color-muted-surface-2) rounded-2xl p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-(--color-text)">
            Week {challenge.week} - {challenge.title}
          </h3>
          <p className="text-(--color-text-muted) mt-2">
            {challenge.description}
          </p>
        </div>
        {challenge.hasNotebook && (
          <div className="text-right">
            <span className="text-(--color-accent) font-bold text-lg">
              {challenge.maxPoints} pts
            </span>
            {challenge.timeLimitMinutes && (
              <p className="text-(--color-text-muted) text-sm">
                {challenge.timeLimitMinutes} min
              </p>
            )}
          </div>
        )}
      </div>

      {/* Date range */}
      {(challenge.startDate || challenge.endDate) && (
        <div className="text-(--color-text-muted) text-sm mb-4">
          {challenge.startDate && (
            <span>
              Starts: {new Date(challenge.startDate).toLocaleDateString()}
            </span>
          )}
          {challenge.startDate && challenge.endDate && <span> | </span>}
          {challenge.endDate && (
            <span>
              Ends: {new Date(challenge.endDate).toLocaleDateString()}
            </span>
          )}
        </div>
      )}

      {/* Status and action */}
      <div className="flex justify-between items-center">
        {submission && (
          <StatusBadge
            status={submission.status}
            score={submission.score}
            maxScore={submission.maxScore}
            pointsAwarded={submission.pointsAwarded}
          />
        )}
        {!submission && <div />}

        {challenge.hasNotebook ? (
          <div className="flex gap-2">
            {/* Submit button - only show when in progress or submitted */}
            {isInProgress && (
              <button
                onClick={() => onSubmitChallenge(challenge.id)}
                disabled={isSubmitting}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${
                  isSubmitting
                    ? "bg-(--color-muted-strong) cursor-wait"
                    : "bg-(--color-success) hover:bg-[color-mix(in_srgb,var(--color-success)_80%,var(--color-ink))]"
                }`}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            )}

            {/* Start/Continue button */}
            <button
              onClick={handleStart}
              disabled={!isActive || isCompleted || isStarting}
              className={`px-8 py-3 rounded-xl font-bold transition-all ${
                isCompleted
                  ? "bg-(--color-success) cursor-not-allowed"
                  : !isActive
                    ? "bg-(--color-muted-strong) cursor-not-allowed"
                    : isStarting
                      ? "bg-(--color-muted-strong) cursor-wait"
                      : "bg-linear-to-r from-(--color-accent) to-(--color-accent-strong) hover:opacity-90"
              }`}
            >
              {isStarting
                ? "Starting..."
                : isCompleted
                  ? "✓ Completed"
                  : isInProgress
                    ? "Continue Challenge"
                    : "Start Challenge"}
            </button>
          </div>
        ) : (
          <span className="text-(--color-text-muted) italic">
            No notebook available
          </span>
        )}
      </div>
    </div>
  );
}

function CompetitionsContent() {
  const [activeTab, setActiveTab] = useState("leaderboard");
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startingChallenge, setStartingChallenge] = useState(null);
  const [submittingChallenge, setSubmittingChallenge] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      if (activeTab === "leaderboard") {
        const data = await challengesApi.getLeaderboard();
        setLeaderboardData(data || []);
      } else if (activeTab === "challenges") {
        // Fetch all challenges with notebook info
        const challengeData = await challengesApi.getAll();
        setChallenges(challengeData || []);

        // Fetch submissions for each challenge
        const submissionPromises = (challengeData || []).map(
          async (challenge) => {
            try {
              const submission = await challengesApi.getSubmission(
                challenge.id,
              );
              return { challengeId: challenge.id, submission };
            } catch (err) {
              // No submission yet is fine
              return { challengeId: challenge.id, submission: null };
            }
          },
        );

        const submissionResults = await Promise.all(submissionPromises);
        const submissionsMap = {};
        submissionResults.forEach(({ challengeId, submission }) => {
          if (submission) {
            submissionsMap[challengeId] = submission;
          }
        });
        setSubmissions(submissionsMap);
      } else if (activeTab === "profile") {
        const data = await userApi.getProfile();
        setUserProfile(data || null);
      }
    } catch (err) {
      console.warn("API error:", err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to load data");
      }
      // Clear data on error
      if (activeTab === "leaderboard") {
        setLeaderboardData([]);
      } else if (activeTab === "challenges") {
        setChallenges([]);
        setSubmissions({});
      } else if (activeTab === "profile") {
        setUserProfile(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartChallenge = async (challengeId) => {
    try {
      setStartingChallenge(challengeId);
      setError("");

      const result = await challengesApi.startChallenge(challengeId);

      if (result.success && result.jupyterhubUrl) {
        // Open JupyterHub in a new tab with SSO token
        window.open(result.jupyterhubUrl, "_blank");

        // Update local submission state
        setSubmissions((prev) => ({
          ...prev,
          [challengeId]: {
            id: result.submissionId,
            challengeId,
            status: "in_progress",
            score: null,
            maxScore: null,
            pointsAwarded: 0,
            startedAt: new Date().toISOString(),
          },
        }));
      }
    } catch (err) {
      console.error("Failed to start challenge:", err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to start challenge. Please try again.");
      }
    } finally {
      setStartingChallenge(null);
    }
  };

  const handleSubmitChallenge = async (challengeId) => {
    try {
      setSubmittingChallenge(challengeId);
      setError("");

      const result = await challengesApi.submitChallenge(challengeId);

      if (result.success) {
        // Update local submission state
        setSubmissions((prev) => ({
          ...prev,
          [challengeId]: {
            ...prev[challengeId],
            status: result.status || "submitted",
          },
        }));

        // Show success message
        alert(result.message || "Challenge submitted successfully!");
      }
    } catch (err) {
      console.error("Failed to submit challenge:", err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to submit challenge. Please try again.");
      }
    } finally {
      setSubmittingChallenge(null);
    }
  };

  // Poll for submission updates when on challenges tab
  useEffect(() => {
    if (activeTab !== "challenges" || challenges.length === 0) return;

    const pollSubmissions = async () => {
      const submissionPromises = challenges.map(async (challenge) => {
        try {
          const submission = await challengesApi.getSubmission(challenge.id);
          return { challengeId: challenge.id, submission };
        } catch (err) {
          return { challengeId: challenge.id, submission: null };
        }
      });

      const submissionResults = await Promise.all(submissionPromises);
      const submissionsMap = {};
      submissionResults.forEach(({ challengeId, submission }) => {
        if (submission) {
          submissionsMap[challengeId] = submission;
        }
      });
      setSubmissions(submissionsMap);
    };

    // Poll every 30 seconds
    const interval = setInterval(pollSubmissions, 30000);
    return () => clearInterval(interval);
  }, [activeTab, challenges]);

  const leaderboardTop10 = leaderboardData.slice(0, 10);

  return (
    <main
      className={`${fredoka.className} min-h-screen relative flex flex-col items-center pt-32 text-(--color-text) pb-20`}
      style={{
        backgroundImage: "url('/challenges-bg.jpg')",
        backgroundSize: "120%",
        backgroundPosition: "top center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        {/* Header Text */}
        <div className="text-center mb-16">
          <h1 className="text-8xl font-bold mb-4">ARCADE</h1>
          <p className="text-5xl mb-2 text-(--color-text-muted)">
            everyone is tough
            <br /> until they face
          </p>
          <p
            className="text-[5rem] bg-linear-to-r from-[#dd4e00] to-[#ff0000] text-transparent bg-clip-text"
            style={{
              fontFamily: "DK Face Your Fears",
            }}
          >
            THE BEA
            <span
              style={{
                fontFamily: "DK Face Your Fears",
                fontWeight: "bold",
              }}
            >
              s
            </span>
            T
          </p>
        </div>{" "}
        {/* Navigation Buttons - Desktop */}
        <div className="hidden md:flex justify-center gap-1 mb-20">
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`relative overflow-hidden w-65 h-19 flex items-center justify-center text-xl font-light uppercase tracking-wider transition-all ${
              activeTab === "leaderboard" ? "text-white" : "text-(--color-text)"
            }`}
            style={{ clipPath: "polygon(0 0, 100% 0, 90% 100%, 0% 100%)" }}
            aria-pressed={activeTab === "leaderboard"}
          >
            <span
              aria-hidden="true"
              className={`absolute inset-0 bg-cover bg-center transition-all ${
                activeTab === "leaderboard"
                  ? "brightness-50 saturate-75"
                  : "brightness-100 hover:brightness-110"
              }`}
              style={{
                backgroundImage: "url('/leader-board-board.png')",
                backgroundSize: "100% 100%",
              }}
            />
            <span className="relative z-10">Leaderboard</span>
          </button>
          <button
            onClick={() => setActiveTab("challenges")}
            className={`relative overflow-hidden w-65 h-19 flex items-center justify-center text-xl font-light uppercase tracking-wider transition-all ${
              activeTab === "challenges" ? "text-white" : "text-(--color-text)"
            }`}
            style={{ clipPath: "polygon(10% 0, 100% 0, 90% 100%, 0% 100%)" }}
            aria-pressed={activeTab === "challenges"}
          >
            <span
              aria-hidden="true"
              className={`absolute inset-0 bg-cover bg-center transition-all ${
                activeTab === "challenges"
                  ? "brightness-50 saturate-75"
                  : "brightness-100 hover:brightness-110"
              }`}
              style={{
                backgroundImage: "url('/chlngeeeees-board.png')",
                backgroundSize: "100% 100%",
              }}
            />
            <span className="relative z-10">Challenges</span>
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`relative overflow-hidden w-65 h-19 flex items-center justify-center text-xl font-light uppercase tracking-wider transition-all ${
              activeTab === "profile" ? "text-white" : "text-(--color-text)"
            }`}
            style={{ clipPath: "polygon(10% 0, 100% 0, 100% 100%, 0% 100%)" }}
            aria-pressed={activeTab === "profile"}
          >
            <span
              aria-hidden="true"
              className={`absolute inset-0 bg-cover bg-center transition-all ${
                activeTab === "profile"
                  ? "brightness-50 saturate-75"
                  : "brightness-100 hover:brightness-110"
              }`}
              style={{
                backgroundImage: "url('/prfiiiiiiiiiiiil-board.png')",
                backgroundSize: "100% 100%",
              }}
            />
            <span className="relative z-10">Profile</span>
          </button>
        </div>
        {/* Navigation Carousel - Mobile */}
        <div className="md:hidden mb-12">
          <div className="flex items-center justify-center gap-4 px-4">
            {/* Left Tab */}
            <button
              onClick={() => {
                const tabs = ["leaderboard", "challenges", "profile"];
                const currentIndex = tabs.indexOf(activeTab);
                const prevIndex =
                  currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
                setActiveTab(tabs[prevIndex]);
              }}
              className="shrink-0 w-20 h-20 rounded-3xl bg-(--color-muted-surface-2) hover:bg-(--color-muted-surface) transition-all flex items-center justify-center"
            >
              <Image
                src={
                  activeTab === "leaderboard"
                    ? "/profile.png"
                    : activeTab === "challenges"
                      ? "/leadrbrd-icon.png"
                      : "/hunt.png"
                }
                alt={
                  activeTab === "leaderboard"
                    ? "Profile"
                    : activeTab === "challenges"
                      ? "Leaderboard"
                      : "Challenges"
                }
                width={32}
                height={32}
                className="object-contain"
              />
            </button>

            {/* Center Active Tab */}
            <div className="flex-1 max-w-xs h-24 rounded-3xl bg-(--color-muted-surface) flex items-center justify-center px-6">
              <span className="text-(--color-text) text-lg font-semibold uppercase tracking-wider">
                {activeTab === "leaderboard"
                  ? "Leaderboard"
                  : activeTab === "challenges"
                    ? "Challenges"
                    : "Profile"}
              </span>
            </div>

            {/* Right Tab */}
            <button
              onClick={() => {
                const tabs = ["leaderboard", "challenges", "profile"];
                const currentIndex = tabs.indexOf(activeTab);
                const nextIndex =
                  currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
                setActiveTab(tabs[nextIndex]);
              }}
              className="shrink-0 w-20 h-20 rounded-3xl bg-(--color-muted-surface-2) hover:bg-(--color-muted-surface) transition-all flex items-center justify-center"
            >
              <Image
                src={
                  activeTab === "leaderboard"
                    ? "/hunt.png"
                    : activeTab === "challenges"
                      ? "/profile.png"
                      : "/leadrbrd-icon.png"
                }
                alt={
                  activeTab === "leaderboard"
                    ? "Challenges"
                    : activeTab === "challenges"
                      ? "Profile"
                      : "Leaderboard"
                }
                width={32}
                height={32}
                className="object-contain"
              />
            </button>
          </div>
        </div>
        {/* Content Section */}
        <div className="w-full">
          {error && (
            <div className="bg-[color-mix(in_srgb,var(--color-danger)_25%,transparent)] border border-(--color-danger) text-(--color-warning) px-6 py-4 rounded-2xl mb-8 max-w-4xl mx-auto">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-20">
              <div className="text-2xl text-(--color-text)">Loading...</div>
            </div>
          ) : activeTab === "challenges" ? (
            // Challenge Section - Updated
            <div className="max-w-4xl mx-auto">
              {challenges.length > 0 ? (
                challenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    submission={submissions[challenge.id]}
                    onStartChallenge={handleStartChallenge}
                    onSubmitChallenge={handleSubmitChallenge}
                    isStarting={startingChallenge === challenge.id}
                    isSubmitting={submittingChallenge === challenge.id}
                  />
                ))
              ) : (
                <div className="backdrop-blur-sm rounded-3xl p-10">
                  <p className="text-2xl text-(--color-text-muted) text-center">
                    No challenges available
                  </p>
                </div>
              )}
            </div>
          ) : activeTab === "leaderboard" ? (
            // Leaderboard Section
            <div className="container mx-auto max-w-3xl px-2">
              {leaderboardTop10.length > 0 ? (
                <>
                  <TopPlayers topPlayers={leaderboardTop10.slice(0, 3)} />
                  <div className="p-3 bg-[#08090a]">
                    <LeaderboardTable players={leaderboardTop10.slice(3)} />
                  </div>
                </>
              ) : (
                <p className="text-2xl text-(--color-text-muted) text-center">
                  No leaderboard data available
                </p>
              )}
            </div>
          ) : (
            // Profile Section
            <ProfileSection userProfile={userProfile} />
          )}
        </div>
      </div>
    </main>
  );
}

export default function CompetitionsPage() {
  return (
    <ProtectedRoute>
      <CompetitionsContent />
    </ProtectedRoute>
  );
}
