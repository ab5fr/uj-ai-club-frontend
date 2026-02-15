"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ApiError, certificatesApi } from "@/lib/api";

function toYoutubeEmbedUrl(rawUrl) {
  const trimmed = (rawUrl || "").trim();
  if (!trimmed) return "";

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();

    if (host === "youtu.be" || host.endsWith(".youtu.be")) {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}` : trimmed;
    }

    if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      const path = parsed.pathname.replace(/^\/+|\/+$/g, "");

      if (path === "watch") {
        const id = parsed.searchParams.get("v");
        return id ? `https://www.youtube.com/embed/${id}` : trimmed;
      }

      if (path.startsWith("embed/")) {
        const id = path.slice("embed/".length);
        return id ? `https://www.youtube.com/embed/${id}` : trimmed;
      }

      if (path.startsWith("shorts/")) {
        const id = path.slice("shorts/".length);
        return id ? `https://www.youtube.com/embed/${id}` : trimmed;
      }
    }
  } catch {
    return trimmed;
  }

  return trimmed;
}

export default function CertificatePage({ params }) {
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchCertificate();
  }, [params.id]);

  const fetchCertificate = async () => {
    try {
      setLoading(true);
      const data = await certificatesApi.getById(params.id);
      setCertificate(data);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          setError("Certificate not found");
        } else {
          setError(err.message);
        }
      } else {
        setError("Failed to load certificate");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-(--color-surface) text-(--color-text) pt-24 flex items-center justify-center">
        <div className="text-2xl text-(--color-text-muted)">Loading...</div>
      </main>
    );
  }

  if (error || !certificate) {
    return (
      <main className="min-h-screen bg-(--color-surface) text-(--color-text) pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            {error || "Certificate not found"}
          </h1>
          <button
            onClick={() => router.push("/roadmap")}
            className="px-8 py-4 bg-(--color-primary) hover:bg-(--color-primary-strong) text-(--color-text) rounded-2xl font-semibold text-lg transition-all"
          >
            Back to Roadmap
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen text-(--color-text) pt-24">
      <div
        className="fixed inset-0 z-0 bg-no-repeat bg-(--color-surface-2)"
        style={{
          backgroundImage: "url('/project.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="relative z-10 container mx-auto px-4 max-w-7xl mt-12">
        <div className="flex justify-between items-start mb-8">
          <div className="max-w-2xl">
            <div className="relative inline-block mb-4 ml-8">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-(--color-neutral) rounded-2xl w-54 h-15"></div>
              <span
                className="relative text-(--color-primary) text-8xl leading-none"
                style={{ fontFamily: "'Freestyle Script', cursive" }}
              >
                Level {certificate.level}
              </span>
            </div>
            <h1 className="text-5xl font-bold mb-4">{certificate.title}</h1>
            <p className="text-(--color-text-muted) mb-2">
              by {certificate.firstName}
            </p>
          </div>

          <div className="hidden md:block bg-(--color-primary-glow-solid) rounded-3xl p-6 max-w-md mt-8">
            <p className="text-(--color-ink) text-xl font-medium mb-2">
              {certificate.quote?.text || ""}
            </p>
            <p className="text-[color-mix(in_srgb,var(--color-ink)_90%,transparent)] text-sm">
              — {certificate.quote?.author || ""}
            </p>
          </div>
        </div>

        <div className="relative mt-12 rounded-2xl bg-(--color-neutral) min-h-20 flex items-center px-8 pl-40 border border-(--color-border)">
          {certificate.courseraUrl ? (
            <a
              href={certificate.courseraUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute -top-2 -left-2 z-10 bg-(--color-neutral) backdrop-blur-sm p-7 rounded-br-3xl rounded-tl-3xl"
              aria-label="Open Coursera course"
            >
              <Image
                src="/coursera.png"
                alt="Coursera"
                width={60}
                height={60}
              />
            </a>
          ) : (
            <div className="absolute -top-2 -left-2 z-10 bg-(--color-neutral) backdrop-blur-sm p-7 rounded-br-3xl rounded-tl-3xl">
              <Image
                src="/coursera.png"
                alt="Coursera"
                width={60}
                height={60}
              />
            </div>
          )}

          <div className="py-5">
            <p className="text-5xl font-bold text-(--color-ink)">
              {certificate.courseTitle || certificate.title}
            </p>
            <p className="text-lg text-[color-mix(in_srgb,var(--color-ink)_70%,transparent)]">
              by {certificate.secondName}
            </p>
          </div>
        </div>

        <div className="relative mt-12 rounded-2xl bg-(--color-surface) mb-20">
          <div className="absolute -top-2 -left-2 z-10 bg-(--color-neutral) backdrop-blur-sm p-7 rounded-br-3xl rounded-tl-3xl">
            <Image
              src="/Youtube_logo.png"
              alt="YouTube"
              width={60}
              height={60}
            />
          </div>

          <iframe
            src={toYoutubeEmbedUrl(certificate.youtubeUrl) || "about:blank"}
            className="w-full h-100 bg-(--color-neutral) rounded-2xl"
            allowFullScreen
          />
        </div>
      </div>
    </main>
  );
}
