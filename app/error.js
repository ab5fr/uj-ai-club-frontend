"use client";

export default function ErrorBoundary({ error, reset }) {
  return (
    <main className="min-h-screen bg-[#010617] flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-6xl font-bold text-red-500 mb-4">Oops!</h1>
        <h2 className="text-3xl font-semibold text-white mb-6">
          Something went wrong
        </h2>
        <p className="text-gray-400 text-lg mb-8">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-lg transition-all"
          >
            Try Again
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-2xl font-semibold text-lg transition-all"
          >
            Go Home
          </button>
        </div>
      </div>
    </main>
  );
}
