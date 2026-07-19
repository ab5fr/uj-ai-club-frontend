"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Clock, Repeat, Star, Target } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ApiError, challengesApi } from "@/lib/api";

function safeText(value, fallback = "—") {
  return value === null || value === undefined || value === ""
    ? fallback
    : value;
}

function formatWindow(startDate, endDate) {
  if (!startDate || !endDate) return "No schedule available";
  const start = new Date(startDate);
  const end = new Date(endDate);
  const options = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString(undefined, options)} - ${end.toLocaleDateString(undefined, options)}`;
}

function formatTimeRemaining(expiresAt) {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "Time expired";
  const mins = Math.floor(diff / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return `${mins}:${String(secs).padStart(2, "0")} left`;
}

function statusLabel(status) {
  if (!status) return null;
  const labels = {
    in_progress: "In progress",
    grading_pending: "Pending grading",
    graded: "Graded",
    error: "Error",
  };
  return labels[status] || status.replace("_", " ");
}

function ChallengesContent() {
  const [challenges, setChallenges] = useState([]);
  const [status, setStatus] = useState("Loading challenges…");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [tick, setTick] = useState(0);
  const closedSessionsRef = useRef(new Set());

  const loadChallenges = useCallback(async () => {
    try {
      setLoading(true);
      const data = await challengesApi.getAll();
      const items = Array.isArray(data) ? data : [];
      setChallenges(items);
      setStatus(
        items.length
          ? `Showing ${items.length} challenges.`
          : "No challenges available right now.",
      );
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setStatus("Your session has expired.");
      } else {
        setStatus("Unable to load challenges.");
      }
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    void tick;

    for (const challenge of challenges) {
      if (challenge.submissionStatus !== "in_progress") continue;
      if (!challenge.sessionExpiresAt) continue;
      if (closedSessionsRef.current.has(challenge.id)) continue;

      const remaining =
        new Date(challenge.sessionExpiresAt).getTime() - Date.now();
      if (remaining > 0) continue;

      closedSessionsRef.current.add(challenge.id);

      challengesApi
        .closeSession(challenge.id)
        .then((result) => {
          setStatus(
            result.message ||
              "Time is up. Your notebook was saved and your Jupyter session was closed.",
          );
          return loadChallenges();
        })
        .catch((err) => {
          closedSessionsRef.current.delete(challenge.id);
          if (err instanceof ApiError && err.status === 400) {
            return;
          }
          setStatus(
            err instanceof ApiError
              ? err.message || "Unable to close notebook session."
              : "Unable to close notebook session.",
          );
        });
    }
  }, [challenges, tick, loadChallenges]);

  const openJupyter = async (challengeId) => {
    const popup = window.open("about:blank", "_blank");
    try {
      setActionId(challengeId);
      const result = await challengesApi.startChallenge(challengeId);
      if (result.success && result.jupyterhubUrl) {
        if (popup && !popup.closed) {
          popup.location.href = result.jupyterhubUrl;
        } else {
          window.open(result.jupyterhubUrl, "_blank");
        }
        setStatus("Notebook opened in a new tab.");
        await loadChallenges();
      } else if (popup && !popup.closed) {
        popup.close();
      }
    } catch (err) {
      if (popup && !popup.closed) popup.close();
      setStatus(
        err instanceof ApiError
          ? err.message || "Unable to open notebook."
          : "Unable to open notebook.",
      );
    } finally {
      setActionId(null);
    }
  };

  const handleSubmit = async (challengeId) => {
    if (
      !confirm(
        "Submit this attempt? Your Jupyter session will be closed and you won't be able to edit the notebook afterward.",
      )
    ) {
      return;
    }

    try {
      setActionId(challengeId);
      const result = await challengesApi.submitChallenge(challengeId);
      setStatus(
        (result.message || "Submission received.") +
          " Your Jupyter notebook server has been stopped — close the notebook tab if it is still open.",
      );
      await loadChallenges();
    } catch (err) {
      setStatus(
        err instanceof ApiError
          ? err.message || "Unable to submit."
          : "Unable to submit.",
      );
    } finally {
      setActionId(null);
    }
  };

  return (
    <main className="page">
      <div className="page-hero">
        <div
          style={{
            position: "absolute",
            top: -40,
            left: "50%",
            transform: "translateX(-50%)",
            width: 600,
            height: 300,
            background:
              "radial-gradient(ellipse, rgba(4, 112, 252, 0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div className="container">
          <div className="page-hero__tag">48 Challenges Ready</div>
          <h1 className="anim-1">
            Try Our <span className="text-gradient">Challenges</span>
          </h1>
          <p className="anim-2">
            Practice with real AI problems. Earn points, climb the leaderboard,
            and show what you can do.
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div
            id="challenges-status"
            style={{
              marginBottom: "2rem",
              fontSize: "0.9rem",
              color: "var(--text-muted)",
            }}
          >
            {status}
          </div>

          <div id="challenges-grid" className="challenges-grid">
            {!loading &&
              challenges.map((challenge) => {
                const windowLabel = formatWindow(
                  challenge.startDate,
                  challenge.endDate,
                );
                const notebookLabel = challenge.hasNotebook
                  ? "Notebook available"
                  : "Notebook unavailable";
                const isBusy = actionId === challenge.id;
                const timeLeft =
                  challenge.submissionStatus === "in_progress"
                    ? formatTimeRemaining(challenge.sessionExpiresAt)
                    : null;
                void tick;

                return (
                  <div key={challenge.id} className="card ch-card anim-1">
                    <div className="ch-top">
                      <div
                        className="ch-icon"
                        style={{ color: "var(--c-blue)" }}
                        aria-hidden="true"
                      >
                        <Target size={22} />
                      </div>
                      <span className="badge badge-intermediate">
                        Week {safeText(challenge.week)}
                      </span>
                    </div>
                    <div>
                      <h3 className="ch-title">{safeText(challenge.title)}</h3>
                      <p className="ch-desc">
                        {safeText(
                          challenge.description,
                          "Details coming soon.",
                        )}
                      </p>
                    </div>
                    <div className="ch-meta">
                      <span className="ch-meta-item">
                        <Star size={13} />
                        {safeText(challenge.maxPoints)} pts
                      </span>
                      <span className="ch-meta-item">
                        <Clock size={13} />
                        {safeText(challenge.timeLimitMinutes)} min
                      </span>
                      <span className="ch-meta-item">
                        <Repeat size={13} />
                        {safeText(challenge.attemptsRemaining ?? challenge.allowedSubmissions)}{" "}
                        left / {safeText(challenge.allowedSubmissions)}
                      </span>
                    </div>
                    {challenge.submissionStatus && (
                      <div
                        style={{
                          fontSize: ".8rem",
                          color: "var(--text-muted)",
                          marginTop: ".5rem",
                        }}
                      >
                        Status: {statusLabel(challenge.submissionStatus)}
                        {timeLeft ? ` · ${timeLeft}` : ""}
                      </div>
                    )}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "1rem",
                        gap: ".75rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontSize: ".75rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        {windowLabel} · {notebookLabel}
                      </span>
                      <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                        {challenge.canContinue && (
                          <button
                            type="button"
                            className="btn btn-outline"
                            disabled={!challenge.hasNotebook || isBusy}
                            onClick={() => openJupyter(challenge.id)}
                          >
                            {isBusy ? "Opening..." : "Continue"}
                          </button>
                        )}
                        {challenge.canStart && (
                          <button
                            type="button"
                            className="btn btn-outline"
                            disabled={!challenge.hasNotebook || isBusy}
                            onClick={() => openJupyter(challenge.id)}
                          >
                            {isBusy ? "Starting..." : "Start"}
                          </button>
                        )}
                        {challenge.canSubmit && (
                          <button
                            type="button"
                            className="btn btn-primary"
                            disabled={isBusy}
                            onClick={() => handleSubmit(challenge.id)}
                          >
                            {isBusy ? "Submitting..." : "Submit"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </section>
    </main>
  );
}

export default function ChallengesPage() {
  return (
    <ProtectedRoute>
      <ChallengesContent />
    </ProtectedRoute>
  );
}
