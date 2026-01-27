"use client";

export default function ErrorBoundary({ error, reset }) {
  return (
    <main className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-6xl font-bold text-[var(--color-danger)] mb-4">
          Oops!
        </h1>
        <h2 className="text-3xl font-semibold text-[var(--color-text)] mb-6">
          Something went wrong
        </h2>
        <p className="text-[var(--color-text-muted)] text-lg mb-8">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-8 py-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-strong)] text-[var(--color-text)] rounded-2xl font-semibold text-lg transition-all"
          >
            Try Again
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-8 py-4 bg-[var(--color-muted-surface-2)] hover:bg-[var(--color-muted-surface)] text-[var(--color-text)] rounded-2xl font-semibold text-lg transition-all"
          >
            Go Home
          </button>
        </div>
      </div>
    </main>
  );
}
