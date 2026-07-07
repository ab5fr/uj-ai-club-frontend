"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getRedirectResult, onIdTokenChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { getFirebaseAuth } from "@/lib/firebase";
import { authApi } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const syncSession = useCallback(async (firebaseUser) => {
    if (!firebaseUser) {
      setUser(null);
      setNeedsProfileCompletion(false);
      return;
    }

    const session = await authApi.session();
    setUser(session.user);
    setNeedsProfileCompletion(session.needsProfileCompletion ?? false);
    setAuthError("");
  }, []);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setAuthError(
        "Firebase is not configured. Restart the dev server after setting .env.local.",
      );
      setLoading(false);
      return undefined;
    }

    let active = true;

    const initAuth = async () => {
      try {
        await getRedirectResult(auth);
      } catch (error) {
        if (!active) return;
        console.error("Google redirect sign-in failed:", error);
        setAuthError(error?.message || "Google sign-in failed.");
      }
    };

    initAuth();

    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (!active) return;

      try {
        await syncSession(firebaseUser);
      } catch (error) {
        console.error("Failed to sync session with backend:", error);
        setAuthError(
          error?.message ||
            "Could not connect to the server. Check that the backend is running.",
        );
        try {
          await signOut(auth);
        } catch {
          // ignore sign-out errors
        }
        setUser(null);
        setNeedsProfileCompletion(false);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [syncSession]);

  const logout = async () => {
    const auth = getFirebaseAuth();
    if (auth) {
      try {
        await signOut(auth);
      } catch {
        // ignore sign-out errors
      }
    }
    setUser(null);
    setNeedsProfileCompletion(false);
    setAuthError("");
    router.push("/login");
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const refreshSession = async () => {
    const auth = getFirebaseAuth();
    if (auth?.currentUser) {
      await syncSession(auth.currentUser);
    }
  };

  const isAuthenticated = () => {
    const auth = getFirebaseAuth();
    return !!auth?.currentUser && !!user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        needsProfileCompletion,
        authError,
        loading,
        logout,
        updateUser,
        refreshSession,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
