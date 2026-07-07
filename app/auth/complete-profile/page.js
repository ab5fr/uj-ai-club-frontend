"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

const textInputClassName =
  "w-full px-4 py-3 rounded-xl bg-[color-mix(in_srgb,var(--color-surface-2)_80%,transparent)] backdrop-blur-sm border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all";

const inputClassName =
  "w-full px-4 py-3 pr-11 rounded-xl bg-[color-mix(in_srgb,var(--color-surface-2)_80%,transparent)] backdrop-blur-sm border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all";

const selectClassName =
  "profile-select w-full appearance-none px-4 py-3 pr-11 rounded-xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

function SelectChevron() {
  return (
    <svg
      className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-muted)]"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
        clipRule="evenodd"
      />
    </svg>
  );
}

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
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <main
      className="min-h-screen relative flex items-center justify-center pt-24"
      style={{
        backgroundImage: "url('/lbbg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-4xl font-bold text-[var(--color-text)] mb-4 text-center">
          Complete Your Profile
        </h1>
        <p className="text-[var(--color-text-muted)] mb-8 text-center">
          Welcome{formData.fullName ? `, ${formData.fullName}` : ""}! Please
          complete your profile to continue.
        </p>

        <div className="bg-[color-mix(in_srgb,var(--color-surface)_60%,transparent)] backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-[var(--color-border)]">
          {error && (
            <div className="bg-[color-mix(in_srgb,var(--color-danger)_25%,transparent)] border border-[var(--color-danger)] text-[var(--color-warning)] px-6 py-4 rounded-2xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="fullName"
                className="block text-[var(--color-text-muted)] text-sm font-medium mb-2"
              >
                Full Name <span className="text-[var(--color-danger)]">*</span>
              </label>
              <p className="text-[var(--color-text-muted)] text-xs mb-2">
                Prefilled from Google — update it if you&apos;d like a different
                display name
              </p>
              <input
                id="fullName"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Your full name"
                className={textInputClassName}
                required
                autoComplete="name"
              />
            </div>

            <div>
              <label className="block text-[var(--color-text-muted)] text-sm font-medium mb-2">
                Create Password <span className="text-[var(--color-danger)]">*</span>
              </label>
              <p className="text-[var(--color-text-muted)] text-xs mb-2">
                Set a password so you can also log in with email and password
              </p>
              <PasswordInput
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                className={inputClassName}
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-[var(--color-text-muted)] text-sm font-medium mb-2">
                Confirm Password{" "}
                <span className="text-[var(--color-danger)]">*</span>
              </label>
              <PasswordInput
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className={inputClassName}
                required
                minLength={6}
              />
            </div>

            <div className="border-t border-[var(--color-border)] pt-2">
              <p className="text-[var(--color-text-muted)] text-xs mb-4">
                Tell us where you study so we can tailor the club experience.
              </p>
            </div>

            <div>
              <label
                htmlFor="university"
                className="block text-[var(--color-text-muted)] text-sm font-medium mb-2"
              >
                University <span className="text-[var(--color-danger)]">*</span>
              </label>
              <div className="relative">
                <select
                  id="university"
                  name="university"
                  value={formData.university}
                  onChange={handleChange}
                  className={selectClassName}
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
                <SelectChevron />
              </div>
            </div>

            <div>
              <label
                htmlFor="major"
                className="block text-[var(--color-text-muted)] text-sm font-medium mb-2"
              >
                Major / Field of Study{" "}
                <span className="text-[var(--color-danger)]">*</span>
              </label>
              <div className="relative">
                <select
                  id="major"
                  name="major"
                  value={formData.major}
                  onChange={handleChange}
                  className={selectClassName}
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
                <SelectChevron />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-strong)] text-[var(--color-text)] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Completing Profile..." : "Complete Profile"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
