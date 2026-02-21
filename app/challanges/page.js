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

  const normalizeAllowedSubmissions = (value, fallback = 3) => {
    const n = Number(value);
    if (Number.isFinite(n) && n > 0) return n;
    return fallback;
  };

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
        const challengeData = await challengesApi.getAll();
        setChallenges(challengeData || []);

        const submissionPromises = (challengeData || []).map(
          async (challenge) => {
            try {
              const submission = await challengesApi.getSubmission(
                challenge.id,
              );
              return { challengeId: challenge.id, submission };
            } catch (err) {
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
    const popup = window.open("about:blank", "_blank");

    try {
      setStartingChallenge(challengeId);
      setError("");

      const result = await challengesApi.startChallenge(challengeId);

      if (result.success && result.jupyterhubUrl) {
        if (popup && !popup.closed) {
          popup.location.href = result.jupyterhubUrl;
        } else {
          window.open(result.jupyterhubUrl, "_blank");
        }

        setSubmissions((prev) => ({
          ...prev,
          [challengeId]: {
            id: result.submissionId,
            challengeId,
            attemptNumber: result.attemptNumber,
            allowedSubmissions: normalizeAllowedSubmissions(
              (result.attemptsUsed ?? 0) + (result.attemptsRemaining ?? 0),
              normalizeAllowedSubmissions(
                prev[challengeId]?.allowedSubmissions,
                3,
              ),
            ),
            attemptsUsed: result.attemptsUsed,
            attemptsRemaining: result.attemptsRemaining,
            status: "in_progress",
            score: null,
            maxScore: null,
            pointsAwarded: 0,
            startedAt: new Date().toISOString(),
          },
        }));
      }
    } catch (err) {
      if (popup && !popup.closed) {
        popup.close();
      }
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
        setSubmissions((prev) => ({
          ...prev,
          [challengeId]: {
            ...prev[challengeId],
            status: result.status || "grading_pending",
            attemptNumber:
              result.attemptNumber || prev[challengeId]?.attemptNumber || 1,
            attemptsUsed:
              result.attemptsUsed ?? prev[challengeId]?.attemptsUsed ?? 0,
            attemptsRemaining:
              result.attemptsRemaining ??
              prev[challengeId]?.attemptsRemaining ??
              0,
            allowedSubmissions: normalizeAllowedSubmissions(
              (result.attemptsUsed ?? prev[challengeId]?.attemptsUsed ?? 0) +
                (result.attemptsRemaining ??
                  prev[challengeId]?.attemptsRemaining ??
                  0),
              normalizeAllowedSubmissions(
                prev[challengeId]?.allowedSubmissions,
                3,
              ),
            ),
            submittedAt: new Date().toISOString(),
          },
        }));

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

    const interval = setInterval(pollSubmissions, 30000);
    return () => clearInterval(interval);
  }, [activeTab, challenges]);

  const leaderboardTop10 = leaderboardData.slice(0, 10);

  const featuredChallenge =
    challenges.find((challenge) => {
      const submission = submissions[challenge.id];
      return submission && submission.status === "in_progress";
    }) ||
    challenges.find((challenge) => {
      const submission = submissions[challenge.id];
      return (
        submission &&
        ["grading_pending", "submitted", "grading"].includes(submission.status)
      );
    }) ||
    challenges.find((challenge) => challenge.hasNotebook) ||
    challenges[0] ||
    null;

  const featuredSubmission = featuredChallenge
    ? submissions[featuredChallenge.id]
    : null;
  const featuredIsInProgress = featuredSubmission?.status === "in_progress";
  const featuredIsPending = [
    "grading_pending",
    "submitted",
    "grading",
  ].includes(featuredSubmission?.status);
  const featuredIsCompleted = featuredSubmission?.status === "graded";
  const featuredChallengeAllowedSubmissions = normalizeAllowedSubmissions(
    featuredChallenge?.allowedSubmissions,
    3,
  );
  const featuredAttemptsUsed = featuredSubmission?.attemptsUsed ?? 0;
  const featuredAttemptsRemaining =
    featuredSubmission?.attemptsRemaining ??
    featuredChallengeAllowedSubmissions ??
    0;
  const featuredAllowedSubmissions =
    normalizeAllowedSubmissions(
      featuredSubmission?.allowedSubmissions,
      featuredChallengeAllowedSubmissions,
    ) ?? 0;
  const featuredLimitReached =
    featuredSubmission &&
    featuredAttemptsRemaining <= 0 &&
    !featuredIsInProgress;
  const featuredHasNotebook = featuredChallenge?.hasNotebook;
  const featuredIsStarting =
    featuredChallenge && startingChallenge === featuredChallenge.id;
  const featuredIsSubmitting =
    featuredChallenge && submittingChallenge === featuredChallenge.id;

  const startButtonLabel = featuredChallenge
    ? featuredIsStarting
      ? "Starting..."
      : featuredIsCompleted
        ? "✓ Completed"
        : featuredIsPending
          ? "Grading Pending"
          : featuredLimitReached
            ? "No Attempts Left"
            : featuredIsInProgress
              ? "Continue"
              : "Start Hunting"
    : "Start Hunting";

  const submitDisabled =
    !featuredChallenge || !featuredIsInProgress || featuredIsSubmitting;
  const startButtonDisabled =
    !featuredChallenge ||
    !featuredHasNotebook ||
    featuredIsStarting ||
    featuredIsCompleted ||
    featuredIsPending ||
    featuredLimitReached;

  const startButtonClasses = startButtonDisabled
    ? "bg-[#1a1a1a] text-[var(--color-text-muted)] cursor-not-allowed opacity-50"
    : "bg-[#111111] text-[#ff0000] hover:bg-[#1a1a1a] hover:scale-[1.01] hover:text-[#ff3333]";
  const submitButtonClasses = submitDisabled
    ? "bg-[#1a1a1a] text-[var(--color-text-muted)] cursor-not-allowed opacity-50"
    : "bg-[#111111] text-[#00ff00] hover:bg-[#1a1a1a] hover:scale-[1.01] hover:text-[#33ff33]";

  return (
    <main
      className={`${fredoka.className} min-h-screen relative flex flex-col items-center pt-32 text-(--color-text) pb-20 bg-[url('/challenges-bg.jpg')] bg-cover bg-top bg-no-repeat md:bg-size-[120%] md:bg-top`}
    >
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
            style={{ fontFamily: "DK Face Your Fears" }}
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
        </div>

        {/* Navigation Buttons - Desktop */}
        <div className="hidden md:flex justify-center gap-1 mb-20">
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`relative overflow-hidden w-65 h-19 flex items-center justify-center text-xl font-light uppercase tracking-wider transition-all ${
              activeTab === "leaderboard" ? "text-white" : "text-(--color-text)"
            }`}
            style={{ clipPath: "polygon(0 0, 100% 0, 90% 100%, 0% 100%)" }}
          >
            <span
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
          >
            <span
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
          >
            <span
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
            <div className="w-full">
              {challenges.length > 0 && featuredChallenge ? (
                <div className="flex flex-col items-center gap-10 px-4">
                  <div className="text-center space-y-6">
                    <h2 className="text-[clamp(2rem,5vw,4rem)] font-bold text-(--color-text) leading-tight">
                      Week {featuredChallenge.week} - {featuredChallenge.title}
                    </h2>
                    <p className="text-lg md:text-xl leading-relaxed text-(--color-text-muted) max-w-4xl mx-auto">
                      {featuredChallenge.description || "Details coming soon."}
                    </p>
                  </div>
                  <div className="w-full max-w-xl flex flex-col gap-6 items-center">
                    <div className="w-full rounded-2xl bg-(--color-muted-surface-2) border border-(--color-border) px-5 py-4 text-sm text-(--color-text-muted)">
                      Attempts: {featuredAttemptsUsed}/
                      {featuredAllowedSubmissions}
                      {featuredSubmission?.attemptNumber
                        ? ` · Current attempt #${featuredSubmission.attemptNumber}`
                        : ""}
                      {featuredIsPending
                        ? " · Status: Grading pending"
                        : featuredIsCompleted
                          ? " · Status: Graded"
                          : ""}
                    </div>

                    <button
                      onClick={() =>
                        featuredChallenge &&
                        handleStartChallenge(featuredChallenge.id)
                      }
                      disabled={startButtonDisabled}
                      className={`relative w-full py-6 text-2xl font-black uppercase tracking-widest transition-transform duration-200 ${startButtonClasses}`}
                      style={{
                        clipPath: "polygon(2% 0, 100% 0, 98% 100%, 0% 100%)",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                      }}
                    >
                      {startButtonLabel}
                    </button>

                    {!featuredIsCompleted && (
                      <button
                        onClick={() =>
                          featuredChallenge &&
                          handleSubmitChallenge(featuredChallenge.id)
                        }
                        disabled={submitDisabled}
                        className={`relative w-full py-5 text-xl font-bold uppercase tracking-widest transition-transform duration-200 ${submitButtonClasses}`}
                        style={{
                          clipPath: "polygon(0 0, 98% 0, 100% 100%, 2% 100%)",
                          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                        }}
                      >
                        {featuredIsSubmitting ? "Submitting..." : "Submit"}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="backdrop-blur-sm rounded-3xl p-10">
                  <p className="text-2xl text-(--color-text-muted) text-center">
                    No challenges available
                  </p>
                </div>
              )}
            </div>
          ) : activeTab === "leaderboard" ? (
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
