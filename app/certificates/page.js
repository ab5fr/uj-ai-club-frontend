"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, certificatesApi, getImageUrl } from "@/lib/api";

export default function CertificatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const data = await certificatesApi.getAll();
      setCertificates(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to load certificates");
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredCertificates = certificates.filter(
    (certificate) =>
      certificate.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      certificate.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      certificate.secondName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <main className="min-h-screen bg-(--color-surface-2) text-(--color-text) pt-24">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="relative mb-16 mt-8">
          <input
            type="text"
            placeholder="Search certificates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-(--color-surface) border-2 border-(--color-border) rounded-xl py-4 px-6 text-lg placeholder:text-(--color-text-muted) focus:outline-none focus:border-(--color-border-strong)"
          />
          <div className="absolute right-6 top-1/2 -translate-y-1/2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 text-(--color-text-muted)"
            >
              <path d="M8.25 10.875a2.625 2.625 0 115.25 0 2.625 2.625 0 01-5.25 0z" />
              <path
                fillRule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.125 4.5a4.125 4.125 0 102.338 7.524l2.007 2.006a.75.75 0 101.06-1.06l-2.006-2.007a4.125 4.125 0 00-3.399-6.463z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-6xl font-bold mb-16">Certificates</h1>

        {error && (
          <div className="bg-[color-mix(in_srgb,var(--color-danger)_25%,transparent)] border border-[var(--color-danger)] text-[var(--color-warning)] px-6 py-4 rounded-2xl mb-8">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-20">
            <div className="text-2xl text-(--color-text-muted)">
              Loading certificates...
            </div>
          </div>
        )}

        {!loading && !error && filteredCertificates.length === 0 && (
          <div className="text-center py-20">
            <div className="text-2xl text-(--color-text-muted)">
              {searchQuery
                ? "No certificates found"
                : "No certificates available"}
            </div>
          </div>
        )}

        {!loading && filteredCertificates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCertificates.map((certificate) => (
              <div
                key={certificate.id}
                onClick={() => router.push(`/certificates/${certificate.id}`)}
                className="bg-(--color-surface) rounded-[3rem] overflow-hidden border border-(--color-border) hover:border-(--color-border-strong) transition-all group cursor-pointer"
              >
                <div className="h-48 relative overflow-hidden">
                  <img
                    src={getImageUrl(certificate.coverImage)}
                    alt={certificate.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                <div className="p-6">
                  <p className="text-sm text-(--color-primary) mb-2">
                    Level {certificate.level}
                  </p>
                  <h3 className="text-xl font-semibold mb-3 text-[color-mix(in_srgb,var(--color-text)_90%,transparent)]">
                    {certificate.title}
                  </h3>
                  <p className="text-sm text-(--color-text-muted)">
                    by {certificate.firstName}
                  </p>
                  <p className="text-sm text-(--color-text-muted)">
                    by {certificate.secondName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
