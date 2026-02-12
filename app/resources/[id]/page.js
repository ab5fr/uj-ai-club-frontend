"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { resourcesApi, ApiError, getImageUrl } from "@/lib/api";

export default function ResourcePage({ params }) {
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchResource();
  }, [params.id]);

  const fetchResource = async () => {
    try {
      setLoading(true);
      const data = await resourcesApi.getById(params.id);
      setResource(data);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          setError("Resource not found");
        } else {
          setError(err.message);
        }
      } else {
        setError("Failed to load resource");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--color-surface)] text-[var(--color-text)] pt-24 flex items-center justify-center">
        <div className="text-2xl text-[var(--color-text-muted)]">
          Loading...
        </div>
      </main>
    );
  }

  if (error || !resource) {
    return (
      <main className="min-h-screen bg-[var(--color-surface)] text-[var(--color-text)] pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            {error || "Resource not found"}
          </h1>
          <button
            onClick={() => router.push("/resources")}
            className="px-8 py-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-strong)] text-[var(--color-text)] rounded-2xl font-semibold text-lg transition-all"
          >
            Back to Resources
          </button>
        </div>
      </main>
    );
  }

  const openNotion = () => {
    window.open(resource.notionUrl, "_blank");
  };

  return (
    <main
      className="min-h-screen text-[var(--color-text)] pt-24 bg-no-repeat bg-[var(--color-surface-2)]"
      style={{
        backgroundImage: "url('/project.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Content Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="max-w-2xl">
            {/* Notes Label */}
            <div className="relative inline-block mb-4 ml-8">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--color-neutral)] rounded-2xl w-50 h-15"></div>
              <span
                className="relative text-[var(--color-primary)] text-9xl leading-none"
                style={{ fontFamily: "'Freestyle Script', cursive" }}
              >
                Notes
              </span>
            </div>
            <h1 className="text-5xl font-bold mb-4">{resource.title}</h1>
            <p className="text-[var(--color-text-muted)] mb-3">
              by {resource.provider}
            </p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <img
                  src={getImageUrl(resource.instructor.image)}
                  alt={resource.instructor.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm text-[var(--color-text-muted)]">
                {resource.instructor.name}
              </span>
            </div>
          </div>

          {/* Quote Box */}
          <div className="hidden md:block bg-[var(--color-primary-glow-solid)] rounded-3xl p-6 max-w-md mt-8">
            <p className="text-[var(--color-ink)] text-xl font-medium mb-2">
              {resource.quote.text}
            </p>
            <p className="text-[color-mix(in_srgb,var(--color-ink)_90%,transparent)] text-sm">
              — {resource.quote.author}
            </p>
          </div>
        </div>

        {/* Notion Section */}
        <div className="relative mt-12 rounded-2xl bg-[var(--color-surface)]">
          {/* Notion Logo */}
          <button
            onClick={openNotion}
            className="absolute top-[-0.5rem] left-[-0.5rem] z-10 bg-[var(--color-neutral)] backdrop-blur-sm p-7 rounded-br-3xl rounded-tl-3xl transition-colors cursor-pointer"
          >
            <img src="/notion.svg" alt="Open in Notion" className="w-15 h-15" />
          </button>

          {/* Notion Embed */}
          <iframe
            src={resource.notionUrl}
            className="w-full h-[400px] bg-[var(--color-neutral)] rounded-2xl"
            allowFullScreen
          />
        </div>
      </div>
    </main>
  );
}
