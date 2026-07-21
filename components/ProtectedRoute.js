"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, needsProfileCompletion } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    if (needsProfileCompletion && pathname !== "/auth/complete-profile") {
      router.push("/auth/complete-profile");
    }
  }, [isAuthenticated, loading, needsProfileCompletion, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return null;
  }

  if (needsProfileCompletion && pathname !== "/auth/complete-profile") {
    return null;
  }

  return children;
}
