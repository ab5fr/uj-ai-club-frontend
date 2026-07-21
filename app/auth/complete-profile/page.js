"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import {
  EmailAuthProvider,
  linkWithCredential,
  updateProfile,
} from "firebase/auth";
import { useAuth } from "@/contexts/AuthContext";
import { getFirebaseAuth } from "@/lib/firebase";
import { authApi, ApiError } from "@/lib/api";
import { UNIVERSITIES, MAJOR_GROUPS } from "@/lib/profileOptions";
import PasswordInput from "@/app/components/PasswordInput";

export default function CompleteProfilePage() {
  const [formData, setFormData] = useState({
    fullName: "",
    university: "",
    major: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, refreshSession, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;

    const auth = getFirebaseAuth();
    const firebaseName = auth?.currentUser?.displayName || "";
    const defaultName = user.fullName || firebaseName;

    setFormData((prev) => ({
      ...prev,
      fullName: prev.fullName || defaultName,
    }));
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const auth = getFirebaseAuth();
      const firebaseUser = auth?.currentUser;
      if (!firebaseUser?.email) {
        setError("You must be signed in to complete your profile.");
        return;
      }

      const credential = EmailAuthProvider.credential(
        firebaseUser.email,
        formData.password,
      );

      const fullName = formData.fullName.trim();

      try {
        await linkWithCredential(firebaseUser, credential);
      } catch (linkErr) {
        const alreadyLinkedCodes = [
          "auth/provider-already-linked",
          "auth/email-already-in-use",
          "auth/credential-already-in-use",
        ];
        if (!alreadyLinkedCodes.includes(linkErr.code)) {
          throw linkErr;
        }
      }

      await updateProfile(firebaseUser, { displayName: fullName });
      await authApi.completeProfile(
        fullName,
        formData.university,
        formData.major,
      );
      await refreshSession();
      router.push("/challanges");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.message || "Failed to complete profile. Please try again.",
        );
      } else if (err?.code === "auth/weak-password") {
        setError("Password is too weak. Use at least 6 characters.");
      } else if (err?.code === "auth/requires-recent-login") {
        setError("Please sign in again and retry completing your profile.");
      } else {
        setError(
          err?.message || "An unexpected error occurred. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (authLoading || !user) {
    return (
      <main className="auth-page">
        <div
          className="auth-card auth-card--wide"
          style={{ textAlign: "center" }}
        >
          <p className="auth-sub" style={{ marginBottom: 0 }}>
            Loading...
          </p>
        </div>
      </main>
    );
  }

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
        <div className="auth-card auth-card--wide">
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

          <h2 className="auth-title">Complete Your Profile</h2>
          <p className="auth-sub">
            Welcome{formData.fullName ? `, ${formData.fullName}` : ""}! Finish
            setting up your account to start learning.
          </p>

          {error && <div className="form-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="fullName">
                Full Name
              </label>
              <p className="form-hint">
                Prefilled from Google — update it if you&apos;d like a different
                display name.
              </p>
              <input
                id="fullName"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Your full name"
                className="form-input"
                required
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Create Password
              </label>
              <p className="form-hint">
                Set a password so you can also log in with email and password.
              </p>
              <PasswordInput
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                className="form-input"
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className="form-input"
                required
                minLength={6}
              />
            </div>

            <div className="form-divider">
              <p className="form-hint">
                Tell us where you study so we can tailor the club experience.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="university">
                University
              </label>
              <select
                id="university"
                name="university"
                value={formData.university}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="" disabled>
                  Select your university
                </option>
                {UNIVERSITIES.map((uni) => (
                  <option key={uni} value={uni}>
                    {uni}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="major">
                Major / Field of Study
              </label>
              <select
                id="major"
                name="major"
                value={formData.major}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="" disabled>
                  Select your major
                </option>
                {MAJOR_GROUPS.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.options.map((major) => (
                      <option key={major} value={major}>
                        {major}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg btn-block"
              disabled={loading}
            >
              {loading ? "Completing Profile..." : "Complete Profile"}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
