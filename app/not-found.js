"use client";

import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#010617] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-white mb-4">404</h1>
        <h2 className="text-4xl font-semibold text-white mb-6">
          Page Not Found
        </h2>
        <p className="text-gray-400 text-xl mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-lg transition-all"
        >
          Go Home
        </button>
      </div>
    </main>
  );
}
