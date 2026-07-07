"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart2,
  Clock,
  Cpu,
  Mail,
  MapPin,
  Users,
  Zap,
} from "lucide-react";
import HeroNetworkSvg from "./components/uoj/HeroNetworkSvg";
import {
  ApiError,
  certificatesApi,
  contactApi,
  leaderboardApi,
  resourcesApi,
} from "@/lib/api";

function initialsForName(name) {
  if (!name) return "AI";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() || "").join("") || "AI";
}

export default function Home() {
  const [stats, setStats] = useState({
    resources: "—",
    certificates: "—",
    leaderboards: "—",
    topMembers: "—",
  });
  const [leaderboardEntries, setLeaderboardEntries] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [contactStatus, setContactStatus] = useState("");
  const [contactLoading, setContactLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [resources, certificates, leaderboards] = await Promise.all([
          resourcesApi.getAll().catch(() => []),
          certificatesApi.getAll().catch(() => []),
          leaderboardApi.getAll().catch(() => []),
        ]);

        const entries = leaderboards[0]?.entries || [];

        setStats({
          resources: resources.length,
          certificates: certificates.length,
          leaderboards: leaderboards.length,
          topMembers: entries.length,
        });
        setLeaderboardEntries(entries.slice(0, 10));
      } catch {
        setLeaderboardEntries([]);
      } finally {
        setLeaderboardLoading(false);
      }
    };

    load();
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactLoading(true);
    setContactStatus("Sending message...");

    try {
      const result = await contactApi.send(
        contactForm.name.trim(),
        contactForm.email.trim(),
        contactForm.message.trim(),
      );
      setContactStatus(result?.message || "Message sent successfully.");
      setContactForm({ name: "", email: "", message: "" });
    } catch (err) {
      if (err instanceof ApiError) {
        setContactStatus(err.message || "Unable to send message.");
      } else {
        setContactStatus("Unable to send message.");
      }
    } finally {
      setContactLoading(false);
    }
  };

  return (
    <main className="page">
      <section className="hero">
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "-80px",
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: "rgba(4,112,252,.06)",
            filter: "blur(90px)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "5%",
            right: "5%",
            width: 340,
            height: 340,
            borderRadius: "50%",
            background: "rgba(18,187,254,.05)",
            filter: "blur(75px)",
            pointerEvents: "none",
            animation: "glowPulse 5s ease-in-out infinite",
          }}
        />

        <div className="container hero__grid">
          <div className="hero__content">
            <div className="hero__eyebrow anim-1">Artificial Intelligence Club</div>
            <h1 className="anim-2">
              Build the
              <br />
              <em>Future</em> with AI
            </h1>
            <p className="hero__sub anim-3">
              Learn AI step by step with hands-on challenges, clear learning
              paths, and a helpful community.
            </p>
            <div className="hero__actions anim-4">
              <Link href="/signup" className="btn btn-orange btn-lg">
                Get Started
              </Link>
              <Link href="/challanges" className="btn btn-outline btn-lg">
                See Challenges
              </Link>
            </div>
          </div>

          <div
            className="anim-5"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
            }}
          >
            <HeroNetworkSvg />
            <div
              style={{
                position: "absolute",
                top: "12%",
                right: 0,
                padding: ".4rem .9rem",
                background: "rgba(4,112,252,.12)",
                border: "1px solid rgba(4,112,252,.3)",
                borderRadius: 20,
                fontFamily: "var(--ff-display)",
                fontSize: ".7rem",
                fontWeight: 700,
                letterSpacing: ".12em",
                textTransform: "uppercase",
                color: "var(--c-cyan)",
              }}
            >
              Neural Network
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="stat-bar">
          <div className="stat-item">
            <div className="stat-num">{stats.resources}</div>
            <div className="stat-label">Resources</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">{stats.certificates}</div>
            <div className="stat-label">Certificates</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">{stats.leaderboards}</div>
            <div className="stat-label">Leaderboards</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">{stats.topMembers}</div>
            <div className="stat-label">Top Members</div>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="grid-2" style={{ gap: "5rem", alignItems: "center" }}>
            <div>
              <div className="section-eyebrow">Who We Are</div>
              <h2 className="mb-3">
                Growing the Next <b>AI Leaders</b>
              </h2>
              <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
                The AI Club is a student-led group focused on learning AI,
                machine learning, and deep learning. We offer clear learning
                paths, hands-on challenges, and a friendly space to help you go
                from beginner to expert.
              </p>
              <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
                Whether you&apos;re just starting with Python or already
                building advanced models, our roadmap and challenges fit your
                level and keep you moving forward.
              </p>
              <Link href="/roadmap" className="btn btn-primary">
                See Roadmap →
              </Link>
            </div>

            <div className="grid-2" style={{ gap: "1rem" }}>
              <div className="card" style={{ textAlign: "center" }}>
                <div className="feature-icon">
                  <Cpu size={28} />
                </div>
                <h4 style={{ marginBottom: ".4rem" }}>Clear Paths</h4>
                <p style={{ fontSize: ".82rem", color: "var(--text-muted)" }}>
                  Step-by-step guides from basics to advanced AI skills.
                </p>
              </div>
              <div className="card" style={{ textAlign: "center" }}>
                <div className="feature-icon">
                  <Zap size={28} />
                </div>
                <h4 style={{ marginBottom: ".4rem" }}>Live Challenges</h4>
                <p style={{ fontSize: ".82rem", color: "var(--text-muted)" }}>
                  Solve real AI problems, earn points, and climb the ranks.
                </p>
              </div>
              <div className="card" style={{ textAlign: "center" }}>
                <div className="feature-icon">
                  <BarChart2 size={28} />
                </div>
                <h4 style={{ marginBottom: ".4rem" }}>Track Progress</h4>
                <p style={{ fontSize: ".82rem", color: "var(--text-muted)" }}>
                  See how far you&apos;ve come with simple progress charts.
                </p>
              </div>
              <div className="card" style={{ textAlign: "center" }}>
                <div className="feature-icon">
                  <Users size={28} />
                </div>
                <h4 style={{ marginBottom: ".4rem" }}>Community</h4>
                <p style={{ fontSize: ".82rem", color: "var(--text-muted)" }}>
                  Connect with other students who love AI.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="section-header">
            <div className="section-eyebrow">Hall of Fame</div>
            <h2 className="section-title">
              Top <b>Members</b>
            </h2>
            <p className="section-sub">
              Rankings reset every month. Earn points by finishing challenges.
            </p>
            <div className="section-rule" />
          </div>

          <div className="leaderboard-wrap">
            <table className="leaderboard">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>Rank</th>
                  <th>Member</th>
                  <th style={{ textAlign: "right" }}>Points</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardLoading ? (
                  <tr>
                    <td
                      colSpan={3}
                      style={{ textAlign: "center", color: "var(--text-muted)" }}
                    >
                      Loading leaderboard…
                    </td>
                  </tr>
                ) : leaderboardEntries.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      style={{ textAlign: "center", color: "var(--text-muted)" }}
                    >
                      No leaderboard data yet.
                    </td>
                  </tr>
                ) : (
                  leaderboardEntries.map((entry, index) => {
                    const rankClass =
                      index === 0
                        ? "rank-1"
                        : index === 1
                          ? "rank-2"
                          : index === 2
                            ? "rank-3"
                            : "rank-n";
                    return (
                      <tr key={`${entry.name}-${index}`}>
                        <td>
                          <span className={`rank-badge ${rankClass}`}>
                            {index + 1}
                          </span>
                        </td>
                        <td>
                          <div className="lb-name">
                            <div
                              className="lb-avatar"
                              style={{
                                background:
                                  "linear-gradient(135deg,#0470fc,#12bbfe)",
                              }}
                            >
                              {initialsForName(entry.name)}
                            </div>
                            {entry.name}
                          </div>
                        </td>
                        <td className="lb-pts" style={{ textAlign: "right" }}>
                          {entry.points}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <Link href="/challanges" className="btn btn-outline">
              See All Challenges →
            </Link>
          </div>
        </div>
      </section>

      <section className="section" id="contact">
        <div className="container">
          <div className="section-header">
            <div className="section-eyebrow">Get In Touch</div>
            <h2 className="section-title">
              Contact <b>Us</b>
            </h2>
            <p className="section-sub">
              Have a question or want to work together? We&apos;d love to hear
              from you.
            </p>
            <div className="section-rule" />
          </div>

          <div className="grid-2" style={{ gap: "4rem", alignItems: "start" }}>
            <div>
              <h3 style={{ marginBottom: "1.5rem" }}>Let&apos;s Work Together</h3>
              <p
                style={{
                  color: "var(--text-muted)",
                  marginBottom: "2.5rem",
                  lineHeight: 1.8,
                }}
              >
                Whether you&apos;re a student who wants to join, a teacher, or a
                company — reach out and let&apos;s talk about AI.
              </p>

              <div className="info-list">
                <div className="info-box">
                  <div className="contact-icon">
                    <Mail size={22} />
                  </div>
                  <div>
                    <div className="info-box__label">Email</div>
                    <div className="info-box__value info-box__value--cyan">
                      contact@uj-aiclub.com
                    </div>
                  </div>
                </div>
                <div className="info-box">
                  <div className="contact-icon">
                    <MapPin size={22} />
                  </div>
                  <div>
                    <div className="info-box__label">Location</div>
                    <div className="info-box__value">
                      University of Jeddah, Saudi Arabia
                    </div>
                  </div>
                </div>
                <div className="info-box">
                  <div className="contact-icon">
                    <Clock size={22} />
                  </div>
                  <div>
                    <div className="info-box__label">Meetings</div>
                    <div className="info-box__value">
                      Sunday &amp; Wednesday, 4:00 PM
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <form onSubmit={handleContactSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="c-name">
                      Full Name
                    </label>
                    <input
                      className="form-input"
                      type="text"
                      id="c-name"
                      placeholder="Your full name"
                      value={contactForm.name}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="c-email">
                      Email Address
                    </label>
                    <input
                      className="form-input"
                      type="email"
                      id="c-email"
                      placeholder="you@example.com"
                      value={contactForm.email}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, email: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="c-msg">
                    Message
                  </label>
                  <textarea
                    className="form-textarea"
                    id="c-msg"
                    placeholder="Write your message here…"
                    value={contactForm.message}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, message: e.target.value })
                    }
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-orange btn-lg btn-block"
                  style={{ marginTop: ".5rem" }}
                  disabled={contactLoading}
                >
                  {contactLoading ? "Sending..." : "Send Message"}
                </button>
                {contactStatus && (
                  <div
                    style={{
                      marginTop: ".75rem",
                      fontSize: ".8rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    {contactStatus}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
