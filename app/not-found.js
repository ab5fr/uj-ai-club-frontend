"use client";

import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-[var(--color-text)] mb-4">
          404
        </h1>
        <h2 className="text-4xl font-semibold text-[var(--color-text)] mb-6">
          Page Not Found
        </h2>
        <p className="text-[var(--color-text-muted)] text-xl mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-8 py-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-strong)] text-[var(--color-text)] rounded-2xl font-semibold text-lg transition-all"
        >
          Go Home
        </button>
      </div>
    </main>
  );
}
