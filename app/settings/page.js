"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { userApi, ApiError, getImageUrl } from "@/lib/api";

function SettingsContent() {
  const { user, login } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [previewImage, setPreviewImage] = useState(
    user?.image ? getImageUrl(user.image) : null,
  );
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Update profile image if changed
      let imageUrl = user?.image;
      if (imageFile) {
        const uploadResult = await userApi.uploadAvatar(imageFile);
        imageUrl = uploadResult.imageUrl;
      }

      // Update profile info
      const updatedUser = await userApi.updateProfile({
        fullName: profileForm.fullName,
        image: imageUrl,
      });

      // Update local auth state
      login(updatedUser, localStorage.getItem("token"));
      setSuccess("Profile updated successfully!");
      setImageFile(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.data?.message || err.message);
      } else {
        setError("Failed to update profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      await userApi.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
      );
      setSuccess("Password changed successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.data?.message || err.message);
      } else {
        setError("Failed to change password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--color-surface-2)] text-[var(--color-text)] pt-32 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Settings</h1>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-xl bg-[var(--color-muted-surface-2)] hover:bg-[var(--color-muted-surface)] transition-colors"
          >
            Back
          </button>
        </div>

        {error && (
          <div className="bg-[color-mix(in_srgb,var(--color-danger)_25%,transparent)] border border-[var(--color-danger)] text-[var(--color-warning)] px-6 py-4 rounded-2xl mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-[color-mix(in_srgb,var(--color-success)_25%,transparent)] border border-[var(--color-success)] text-[var(--color-success)] px-6 py-4 rounded-2xl mb-6">
            {success}
          </div>
        )}

        {/* Profile Settings */}
        <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 md:p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Profile Information</h2>

          <form onSubmit={handleProfileUpdate}>
            {/* Profile Picture */}
            <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-[var(--color-text)] font-semibold text-3xl overflow-hidden">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>
                      {(user?.fullName || user?.email || "U")[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-strong)] flex items-center justify-center transition-colors"
                  aria-label="Upload photo"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                    />
                  </svg>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
              <div className="text-center md:text-left">
                <p className="text-[var(--color-text-muted)] text-sm mb-2">
                  Upload a new profile picture
                </p>
                <p className="text-[var(--color-text-muted)] text-xs">
                  JPG, PNG or GIF. Max size 5MB
                </p>
              </div>
            </div>

            {/* Name and Email Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm text-[var(--color-text-muted)] mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileForm.fullName}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, fullName: e.target.value })
                  }
                  className="w-full bg-[var(--color-surface-2)] border-2 border-[var(--color-border)] rounded-xl py-3 px-4 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-border-strong)]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--color-text-muted)] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full bg-[var(--color-surface-2)] border-2 border-[var(--color-border)] rounded-xl py-3 px-4 text-[color-mix(in_srgb,var(--color-text)_70%,transparent)] cursor-not-allowed"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-strong)] text-[var(--color-text)] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </form>
        </section>

        {/* Password Change */}
        <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-semibold mb-6">Change Password</h2>

          <form onSubmit={handlePasswordChange}>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-[var(--color-text-muted)] mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full bg-[var(--color-surface-2)] border-2 border-[var(--color-border)] rounded-xl py-3 px-4 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-border-strong)]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--color-text-muted)] mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full bg-[var(--color-surface-2)] border-2 border-[var(--color-border)] rounded-xl py-3 px-4 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-border-strong)]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--color-text-muted)] mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full bg-[var(--color-surface-2)] border-2 border-[var(--color-border)] rounded-xl py-3 px-4 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-border-strong)]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-strong)] text-[var(--color-text)] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Changing..." : "Change Password"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}
