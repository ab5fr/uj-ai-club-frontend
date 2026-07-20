"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { adminSubmissionsApi } from "@/lib/api";
import { fmtDateTime, handleErr } from "./shared";

export default function SubmissionsAdmin() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [scoreInputs, setScoreInputs] = useState({});
  const [gradingSubmissionId, setGradingSubmissionId] = useState(null);
  const [accessingSubmissionId, setAccessingSubmissionId] = useState(null);
  const [grantInputs, setGrantInputs] = useState({});
  const [openChallenges, setOpenChallenges] = useState({});
  const [openStudents, setOpenStudents] = useState({});

  const getFilenameFromDisposition = (contentDisposition, fallback) => {
    if (!contentDisposition) return fallback;

    const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match?.[1]) {
      try {
        return decodeURIComponent(utf8Match[1]);
      } catch {
        return utf8Match[1];
      }
    }

    const quotedMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
    if (quotedMatch?.[1]) return quotedMatch[1];

    return fallback;
  };

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const data = await adminSubmissionsApi.list();
      setSubmissions(data.items || data || []);
      setError("");
    } catch (err) {
      handleErr(err, setError);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter((s) => {
    if (filter === "all") return true;
    return s.status === filter;
  });

  const grouped = useMemo(() => {
    const byChallenge = new Map();

    for (const s of filteredSubmissions) {
      if (!byChallenge.has(s.challengeId)) {
        byChallenge.set(s.challengeId, {
          challengeId: s.challengeId,
          challengeTitle: s.challengeTitle,
          students: new Map(),
        });
      }
      const challenge = byChallenge.get(s.challengeId);
      if (!challenge.students.has(s.userId)) {
        challenge.students.set(s.userId, {
          userId: s.userId,
          userName: s.userName,
          userEmail: s.userEmail,
          attempts: [],
        });
      }
      challenge.students.get(s.userId).attempts.push(s);
    }

    return Array.from(byChallenge.values())
      .map((challenge) => {
        const students = Array.from(challenge.students.values()).map((student) => {
          const attempts = [...student.attempts].sort(
            (a, b) => (b.attemptNumber || 0) - (a.attemptNumber || 0),
          );
          const graded = attempts.filter((a) => a.status === "graded");
          const bestPoints = graded.reduce(
            (max, a) => Math.max(max, a.pointsAwarded || 0),
            0,
          );
          const bestScore = graded.reduce(
            (max, a) => Math.max(max, a.score ?? -1),
            -1,
          );
          return {
            ...student,
            attempts,
            bestPoints,
            bestScore: bestScore < 0 ? null : bestScore,
            attemptCount: attempts.length,
          };
        });
        students.sort((a, b) => a.userName.localeCompare(b.userName));
        return {
          challengeId: challenge.challengeId,
          challengeTitle: challenge.challengeTitle,
          students,
          submissionCount: students.reduce((n, s) => n + s.attemptCount, 0),
        };
      })
      .sort((a, b) => a.challengeTitle.localeCompare(b.challengeTitle));
  }, [filteredSubmissions]);

  const toggleChallenge = (challengeId) => {
    setOpenChallenges((prev) => ({
      ...prev,
      [challengeId]: !prev[challengeId],
    }));
  };

  const toggleStudent = (challengeId, userId) => {
    const key = `${challengeId}:${userId}`;
    setOpenStudents((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleGrade = async (submissionId) => {
    const raw = scoreInputs[submissionId];
    const score = raw === undefined || raw === "" ? NaN : Number(raw);

    if (Number.isNaN(score) || score < 0 || score > 100) {
      setError("Score must be a number between 0 and 100.");
      return;
    }

    try {
      setGradingSubmissionId(submissionId);
      setError("");
      await adminSubmissionsApi.grade(submissionId, score);
      await load();
    } catch (err) {
      handleErr(err, setError);
    } finally {
      setGradingSubmissionId(null);
    }
  };

  const handleDelete = async (submissionId) => {
    if (!confirm("Delete this submission attempt? This frees an attempt slot.")) {
      return;
    }
    try {
      setError("");
      await adminSubmissionsApi.remove(submissionId);
      await load();
    } catch (err) {
      handleErr(err, setError);
    }
  };

  const handleGrantAttempts = async (studentKey, submissionId) => {
    const raw = grantInputs[studentKey];
    const extraAttempts = raw === undefined || raw === "" ? NaN : Number(raw);
    if (Number.isNaN(extraAttempts) || extraAttempts < 1) {
      setError("Enter a positive number of extra attempts.");
      return;
    }
    try {
      setError("");
      await adminSubmissionsApi.grantAttempts(submissionId, extraAttempts);
      setGrantInputs((prev) => ({ ...prev, [studentKey]: "" }));
      await load();
    } catch (err) {
      handleErr(err, setError);
    }
  };

  const handleDownloadSubmission = async (submissionId) => {
    try {
      setAccessingSubmissionId(submissionId);
      setError("");
      const { blob, contentDisposition } =
        await adminSubmissionsApi.getFileBlob(submissionId, true);

      const objectUrl = URL.createObjectURL(blob);
      const fallbackName = `submission-${submissionId}.ipynb`;
      const filename = getFilenameFromDisposition(
        contentDisposition,
        fallbackName,
      );

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000);
    } catch (err) {
      handleErr(err, setError);
    } finally {
      setAccessingSubmissionId(null);
    }
  };

  const statusBadgeClass = (status) => {
    if (status === "graded") return "admin-badge--done";
    if (status === "in_progress") return "admin-badge--progress";
    if (status === "error") return "admin-badge--error";
    if (["submitted", "grading", "grading_pending"].includes(status)) {
      return "admin-badge--status";
    }
    return "admin-badge--hidden";
  };

  const renderAttemptRow = (s) => (
    <tr key={s.id} className="admin-submissions__attempt-row">
      <td>
        Attempt {s.attemptNumber}/{s.allowedSubmissions}
      </td>
      <td>
        <span className={`admin-badge ${statusBadgeClass(s.status)}`}>
          {s.status.replace("_", " ")}
        </span>
      </td>
      <td>
        {s.score !== null ? `${Math.round(s.score * 10) / 10}%` : "-"}
      </td>
      <td>
        <span className={s.pointsCredited ? "admin-points--credited" : ""}>
          {s.pointsAwarded} pts
        </span>
        {s.pointsCredited && (
          <span className="admin-points--credited" title="Highest score credited">
            {" "}
            ✓ best
          </span>
        )}
      </td>
      <td>{s.startedAt ? fmtDateTime(s.startedAt) : "-"}</td>
      <td>{s.gradedAt ? fmtDateTime(s.gradedAt) : "-"}</td>
      <td>
        <div className="admin-table__actions">
          <button
            type="button"
            onClick={() => router.push(`/admin/submissions/${s.id}`)}
            disabled={accessingSubmissionId === s.id}
            className="btn btn-primary btn-sm"
          >
            View
          </button>
          <button
            type="button"
            onClick={() => handleDownloadSubmission(s.id)}
            disabled={accessingSubmissionId === s.id}
            className="btn btn-warning btn-sm"
          >
            Download
          </button>
        </div>
      </td>
      <td>
        {["grading_pending", "submitted", "grading", "graded"].includes(
          s.status,
        ) ? (
          <div className="admin-table__grade">
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={scoreInputs[s.id] ?? ""}
              onChange={(e) =>
                setScoreInputs((prev) => ({
                  ...prev,
                  [s.id]: e.target.value,
                }))
              }
              placeholder="0-100"
              className="form-input admin-table__grade-input"
            />
            <button
              type="button"
              onClick={() => handleGrade(s.id)}
              disabled={gradingSubmissionId === s.id}
              className="btn btn-success btn-sm"
            >
              {gradingSubmissionId === s.id ? "Saving..." : "Set Grade"}
            </button>
          </div>
        ) : (
          <span className="admin-table__sub">-</span>
        )}
      </td>
      <td>
        <button
          type="button"
          onClick={() => handleDelete(s.id)}
          className="btn btn-danger btn-sm"
        >
          Delete
        </button>
      </td>
    </tr>
  );

  // Statistics — total points = sum of best credited attempt per user/challenge
  const stats = {
    total: submissions.length,
    graded: submissions.filter((s) => s.status === "graded").length,
    inProgress: submissions.filter((s) => s.status === "in_progress").length,
    pending: submissions.filter((s) =>
      ["grading_pending", "submitted", "grading"].includes(s.status),
    ).length,
    totalPoints: submissions
      .filter((s) => s.pointsCredited)
      .reduce((sum, s) => sum + s.pointsAwarded, 0),
  };

  return (
    <section>
      <h2 className="admin-section-title">Challenge Submissions</h2>
      <p className="admin-section-desc">
        Grouped by challenge, then student. Only each student&apos;s highest
        score per challenge counts toward their points.
      </p>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}

      <div className="admin-stat-grid">
        <div className="card admin-stat">
          <div className="admin-stat__value">{stats.total}</div>
          <div className="admin-stat__label">Total Submissions</div>
        </div>
        <div className="card admin-stat">
          <div className="admin-stat__value admin-stat__value--success">
            {stats.graded}
          </div>
          <div className="admin-stat__label">Graded</div>
        </div>
        <div className="card admin-stat">
          <div className="admin-stat__value admin-stat__value--warning">
            {stats.inProgress}
          </div>
          <div className="admin-stat__label">In Progress</div>
        </div>
        <div className="card admin-stat">
          <div className="admin-stat__value admin-stat__value--primary">
            {stats.pending}
          </div>
          <div className="admin-stat__label">Pending</div>
        </div>
        <div className="card admin-stat">
          <div className="admin-stat__value admin-stat__value--accent">
            {stats.totalPoints}
          </div>
          <div className="admin-stat__label">Points Credited (best)</div>
        </div>
      </div>

      <div className="admin-filter">
        <span className="admin-filter__label">Filter:</span>
        <div className="admin-filter__group">
          {[
            "all",
            "grading_pending",
            "graded",
            "in_progress",
            "not_started",
          ].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`admin-filter__btn${filter === f ? " active" : ""}`}
            >
              {f.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={load}
          className="btn btn-primary btn-sm"
          style={{ marginLeft: "auto" }}
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="admin-empty">Loading...</div>
      ) : grouped.length === 0 ? (
        <div className="admin-empty">No submissions found</div>
      ) : (
        <div className="admin-submissions-groups">
          {grouped.map((challenge) => {
            const challengeOpen = !!openChallenges[challenge.challengeId];
            return (
              <div
                key={challenge.challengeId}
                className="card admin-submissions-group"
              >
                <button
                  type="button"
                  className="admin-submissions-group__head"
                  onClick={() => toggleChallenge(challenge.challengeId)}
                  aria-expanded={challengeOpen}
                >
                  <span className="admin-submissions-group__chevron">
                    {challengeOpen ? "▾" : "▸"}
                  </span>
                  <span className="admin-submissions-group__title">
                    {challenge.challengeTitle}
                  </span>
                  <span className="admin-submissions-group__meta">
                    {challenge.students.length} student
                    {challenge.students.length === 1 ? "" : "s"} ·{" "}
                    {challenge.submissionCount} attempt
                    {challenge.submissionCount === 1 ? "" : "s"}
                  </span>
                </button>

                {challengeOpen && (
                  <div className="admin-submissions-group__body">
                    {challenge.students.map((student) => {
                      const studentKey = `${challenge.challengeId}:${student.userId}`;
                      const studentOpen = !!openStudents[studentKey];
                      const grantSubmissionId = student.attempts[0]?.id;
                      return (
                        <div
                          key={student.userId}
                          className="admin-submissions-student"
                        >
                          <div className="admin-submissions-student__bar">
                            <button
                              type="button"
                              className="admin-submissions-student__head"
                              onClick={() =>
                                toggleStudent(
                                  challenge.challengeId,
                                  student.userId,
                                )
                              }
                              aria-expanded={studentOpen}
                            >
                              <span className="admin-submissions-group__chevron">
                                {studentOpen ? "▾" : "▸"}
                              </span>
                              <span>
                                <span className="admin-table__primary">
                                  {student.userName}
                                </span>
                                <span className="admin-table__sub">
                                  {" "}
                                  {student.userEmail}
                                </span>
                              </span>
                              <span className="admin-submissions-group__meta">
                                {student.attemptCount} attempt
                                {student.attemptCount === 1 ? "" : "s"}
                                {student.bestScore !== null
                                  ? ` · best ${Math.round(student.bestScore * 10) / 10}% (${student.bestPoints} pts)`
                                  : ""}
                              </span>
                            </button>
                            {grantSubmissionId && (
                              <div
                                className="admin-submissions-student__grant"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="number"
                                  min="1"
                                  value={grantInputs[studentKey] ?? ""}
                                  onChange={(e) =>
                                    setGrantInputs((prev) => ({
                                      ...prev,
                                      [studentKey]: e.target.value,
                                    }))
                                  }
                                  placeholder="+N"
                                  className="form-input admin-table__grade-input"
                                  aria-label={`Extra attempts for ${student.userName}`}
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleGrantAttempts(
                                      studentKey,
                                      grantSubmissionId,
                                    )
                                  }
                                  className="btn btn-outline btn-sm"
                                >
                                  Grant attempts
                                </button>
                              </div>
                            )}
                          </div>

                          {studentOpen && (
                            <div className="admin-table-wrap admin-submissions-student__table">
                              <div className="admin-table-scroll">
                                <table className="admin-table">
                                  <thead>
                                    <tr>
                                      <th>Attempt</th>
                                      <th>Status</th>
                                      <th>Score (%)</th>
                                      <th>Points</th>
                                      <th>Started</th>
                                      <th>Graded</th>
                                      <th>Submission</th>
                                      <th>Manual Grade</th>
                                      <th>Delete</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {student.attempts.map(renderAttemptRow)}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
