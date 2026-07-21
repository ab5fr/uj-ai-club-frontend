"use client";

import { signInWithPopup, signInWithRedirect } from "firebase/auth";
import { getFirebaseAuth, getGoogleProvider } from "@/lib/firebase";

const POPUP_FALLBACK_CODES = new Set([
  "auth/popup-blocked",
  "auth/cancelled-popup-request",
  "auth/operation-not-supported-in-this-environment",
]);

export async function signInWithGoogle() {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error(
      "Firebase is not configured. Restart the dev server after setting .env.local.",
    );
  }

  const provider = getGoogleProvider();

  try {
    await signInWithPopup(auth, provider);
    return { redirected: false };
  } catch (error) {
    if (POPUP_FALLBACK_CODES.has(error?.code)) {
      await signInWithRedirect(auth, provider);
      return { redirected: true };
    }
    throw error;
  }
}
