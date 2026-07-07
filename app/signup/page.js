"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { signInWithGoogle } from "@/lib/googleSignIn";
import GoogleIcon from "@/app/components/uoj/GoogleIcon";

function getFirebaseAuthErrorMessage(error) {
  switch (error?.code) {
    case "auth/popup-closed-by-user":
      return "Sign-in was cancelled.";
    case "auth/popup-blocked":
    case "auth/operation-not-supported-in-this-environment":
      return "Pop-up blocked. Redirecting to Google sign-in...";
    case "auth/network-request-failed":
      return "Network error. Please check your connection.";
    default:
      return error?.message || "Sign up failed. Please try again.";
  }
}

export default function SignupPage() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, needsProfileCompletion, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      if (needsProfileCompletion) {
        router.push("/auth/complete-profile");
      } else {
        router.push("/challanges");
      }
    }
  }, [user, needsProfileCompletion, authLoading, router]);

  const handleGoogleSignup = async () => {
    try {
      setStatus("Opening Google sign-in...");
      setLoading(true);
      const result = await signInWithGoogle();
      if (result.redirected) return;
    } catch (err) {
      setStatus(getFirebaseAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="auth-bg-signup-1" />
      <div className="auth-bg-signup-2" />
      <div className="auth-bg-3" />

      <Link href="/" className="auth-back">
        <ChevronLeft size={16} />
        Back to Home
      </Link>

      <main className="auth-page" style={{ padding: "5rem 2rem" }}>
        <div className="auth-card" style={{ maxWidth: 520 }}>
          <div className="auth-logo">
            <Link
              href="/"
              className="logo"
              style={{ justifyContent: "center" }}
              aria-label="AI Club Home"
            >
              <img
                src="/mainlogo.png"
                className="logo__mark"
                style={{ width: 44, height: 44 }}
                alt="AI Club"
              />
              <div className="logo__text" style={{ fontSize: "1.05rem" }}>
                Artificial Intelligence<small>Club</small>
              </div>
            </Link>
          </div>

          <h2 className="auth-title">Join the Club</h2>
          <p className="auth-sub">Make a free account and start learning AI.</p>

          <div className="benefits">
            <div className="benefit-item">
              <CheckCircle2 size={14} />
              Try 48 AI challenges at every skill level
            </div>
            <div className="benefit-item">
              <CheckCircle2 size={14} />
              See your progress with simple charts
            </div>
            <div className="benefit-item">
              <CheckCircle2 size={14} />
              Compete on the monthly leaderboard
            </div>
            <div className="benefit-item">
              <CheckCircle2 size={14} />
              Get a learning plan made for you
            </div>
          </div>

          <button
            type="button"
            className="btn btn-outline btn-block social-btn"
            id="google-signup"
            style={{ fontSize: ".83rem" }}
            onClick={handleGoogleSignup}
            disabled={loading}
          >
            <GoogleIcon />
            {loading ? "Connecting..." : "Continue with Google"}
          </button>

          {status && (
            <div
              id="signup-status"
              style={{
                marginTop: ".75rem",
                fontSize: ".8rem",
                color: "var(--text-muted)",
              }}
            >
              {status}
            </div>
          )}

          <p className="auth-switch">
            Already have an account? <Link href="/login">Sign in →</Link>
          </p>
        </div>
      </main>
    </>
  );
}
