"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "@/contexts/AuthContext";
import { getFirebaseAuth } from "@/lib/firebase";
import { signInWithGoogle } from "@/lib/googleSignIn";
import GoogleIcon from "@/app/components/uoj/GoogleIcon";

function getFirebaseAuthErrorMessage(error) {
  switch (error?.code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
    case "auth/invalid-email":
      return "Invalid email or password";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/popup-closed-by-user":
      return "Sign-in was cancelled.";
    case "auth/popup-blocked":
    case "auth/operation-not-supported-in-this-environment":
      return "Pop-up blocked. Redirecting to Google sign-in...";
    case "auth/network-request-failed":
      return "Network error. Please check your connection.";
    default:
      return error?.message || "Login failed. Please try again.";
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, needsProfileCompletion, authError, loading: authLoading } =
    useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      if (needsProfileCompletion) {
        router.push("/auth/complete-profile");
      } else {
        router.push("/challanges");
      }
    }
  }, [user, needsProfileCompletion, authLoading, router]);

  const handleGoogleLogin = async () => {
    try {
      setStatus("");
      setLoading(true);
      const result = await signInWithGoogle();
      if (result.redirected) return;
    } catch (err) {
      setStatus(getFirebaseAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Signing in...");
    setLoading(true);

    try {
      const auth = getFirebaseAuth();
      if (!auth) {
        setStatus(
          "Firebase is not configured. Restart the dev server after setting .env.local.",
        );
        return;
      }

      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      setStatus(getFirebaseAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="auth-bg-1" />
      <div className="auth-bg-2" />
      <div className="auth-bg-3" />

      <Link href="/" className="auth-back">
        <ChevronLeft size={16} />
        Back to Home
      </Link>

      <main className="auth-page">
        <div className="auth-card">
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
                style={{ width: 48, height: 48 }}
                alt="AI Club"
              />
              <div className="logo__text" style={{ fontSize: "1.05rem" }}>
                Artificial Intelligence<small>Club</small>
              </div>
            </Link>
          </div>

          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-sub">
            Sign in to see your challenges and track your progress.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                Email Address
              </label>
              <input
                className="form-input"
                type="email"
                id="login-email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-pw">
                Password
              </label>
              <input
                className="form-input"
                type="password"
                id="login-pw"
                placeholder="Enter your password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg btn-block"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            {(status || authError) && (
              <div
                id="login-status"
                style={{
                  marginTop: ".75rem",
                  fontSize: ".8rem",
                  color: "var(--text-muted)",
                }}
              >
                {status || authError}
              </div>
            )}

            <div className="auth-divider">or continue with</div>

            <div style={{ display: "flex", flexDirection: "column", gap: ".7rem" }}>
              <button
                type="button"
                className="btn btn-outline btn-block social-btn"
                id="google-login"
                style={{ fontSize: ".83rem" }}
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <GoogleIcon />
                Continue with Google
              </button>
              <button
                type="button"
                className="btn btn-outline btn-block social-btn"
                id="github-login"
                style={{ fontSize: ".83rem" }}
                onClick={() => setStatus("GitHub login is not available yet.")}
                disabled={loading}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="var(--c-light)"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
                Continue with GitHub
              </button>
            </div>
          </form>

          <p className="auth-switch">
            Don&apos;t have an account? <Link href="/signup">Make one for free →</Link>
          </p>
        </div>
      </main>
    </>
  );
}
