"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { resourcesApi, ApiError, getImageUrl } from "@/lib/api";

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const data = await resourcesApi.getAll();
      setResources(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to load resources");
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = resources.filter(
    (resource) =>
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.provider.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <main className="min-h-screen bg-[var(--color-surface-2)] text-[var(--color-text)] pt-24">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Search Bar */}
        <div className="relative mb-16 mt-8">
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-xl py-4 px-6 text-lg placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-strong)]"
          />
          <div className="absolute right-6 top-1/2 -translate-y-1/2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 text-[var(--color-text-muted)]"
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

        {/* Resources Title */}
        <h1 className="text-6xl font-bold mb-16 flex items-center gap-4">
          Resources
        </h1>

        {/* Error Message */}
        {error && (
          <div className="bg-[color-mix(in_srgb,var(--color-danger)_25%,transparent)] border border-[var(--color-danger)] text-[var(--color-warning)] px-6 py-4 rounded-2xl mb-8">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="text-2xl text-[var(--color-text-muted)]">
              Loading resources...
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredResources.length === 0 && (
          <div className="text-center py-20">
            <div className="text-2xl text-[var(--color-text-muted)]">
              {searchQuery ? "No resources found" : "No resources available"}
            </div>
          </div>
        )}

        {/* Resources Grid */}
        {!loading && filteredResources.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredResources.map((resource) => (
              <div
                key={resource.id}
                onClick={() => router.push(`/resources/${resource.id}`)}
                className="bg-[var(--color-surface)] rounded-[3rem] overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-all group cursor-pointer"
              >
                {/* Card Image */}
                <div className="h-48 relative overflow-hidden">
                  <img
                    src={getImageUrl(resource.coverImage)}
                    alt={resource.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-[color-mix(in_srgb,var(--color-text)_90%,transparent)]">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] mb-4">
                    by {resource.provider}
                  </p>

                  {/* Instructor */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[var(--color-border)]">
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
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
