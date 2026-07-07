"use client";

import { useEffect, useState } from "react";
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

function ChallengesContent() {
  const [challenges, setChallenges] = useState([]);
  const [status, setStatus] = useState("Loading challenges…");
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState(null);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
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
  };

  const handleStart = async (challengeId, hasNotebook) => {
    if (!hasNotebook) return;

    const popup = window.open("about:blank", "_blank");

    try {
      setStartingId(challengeId);
      setStatus("Starting challenge...");

      const result = await challengesApi.startChallenge(challengeId);

      if (result.success && result.jupyterhubUrl) {
        if (popup && !popup.closed) {
          popup.location.href = result.jupyterhubUrl;
        } else {
          window.open(result.jupyterhubUrl, "_blank");
        }
        setStatus("Challenge started. Your notebook is opening in a new tab.");
      } else {
        if (popup && !popup.closed) popup.close();
        setStatus("Challenge started.");
      }
    } catch (err) {
      if (popup && !popup.closed) popup.close();
      if (err instanceof ApiError) {
        setStatus(err.message || "Unable to start challenge.");
      } else {
        setStatus("Unable to start challenge.");
      }
    } finally {
      setStartingId(null);
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
                const isStarting = startingId === challenge.id;

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
                        {safeText(challenge.allowedSubmissions)} submissions
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "1rem",
                        gap: ".75rem",
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
                      <button
                        type="button"
                        className="btn btn-outline"
                        disabled={!challenge.hasNotebook || isStarting}
                        onClick={() =>
                          handleStart(challenge.id, challenge.hasNotebook)
                        }
                      >
                        {isStarting ? "Starting..." : "Start"}
                      </button>
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
