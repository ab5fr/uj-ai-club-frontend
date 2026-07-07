"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function isConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId,
  );
}

function getFirebaseApp() {
  if (!isConfigured()) {
    return null;
  }

  try {
    return getApps().length ? getApp() : initializeApp(firebaseConfig);
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    return null;
  }
}

/** Lazy client-only auth instance (avoids SSR null auth). */
export function getFirebaseAuth() {
  if (typeof window === "undefined") {
    return null;
  }

  const app = getFirebaseApp();
  if (!app) {
    return null;
  }

  try {
    return getAuth(app);
  } catch (error) {
    console.error("Firebase auth initialization failed:", error);
    return null;
  }
}

export function getGoogleProvider() {
  return new GoogleAuthProvider();
}

export async function getIdToken() {
  const auth = getFirebaseAuth();
  if (!auth?.currentUser) return null;
  return auth.currentUser.getIdToken();
}
