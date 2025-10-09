"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const resources = [
  {
    id: 1,
    title: "Introduction to Machine Learning",
    provider: "DeepLearning.AI",
    instructor: {
      name: "Abdullah Albadri",
      image: "/instructor-abdullah.jpg", // You'll need to add this image
    },
    coverImage: "/Notes.jpg", // Using the image from your design folder
  },
  {
    id: 2,
    title: "Advanced Machine Learning",
    provider: "DeepLearning.AI",
    instructor: {
      name: "Abdullah Albadri",
      image: "/instructor-abdullah.jpg",
    },
    coverImage: "/Notes.jpg",
  },
  {
    id: 3,
    title: "Face Recognition",
    provider: "agelgey Adam Gelgey",
    instructor: {
      name: "Abdullah Albadri",
      image: "/instructor-abdullah.jpg",
    },
    coverImage: "/project.jpg",
  },
  {
    id: 4,
    title: "Linear Algebra for Machine Learning",
    provider: "DeepLearning.AI",
    instructor: {
      name: "Abdullah Albadri",
      image: "/instructor-abdullah.jpg",
    },
    coverImage: "/Notes.jpg",
  },
];

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const filteredResources = resources.filter(
    (resource) =>
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.provider.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#010617] text-white pt-24">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Search Bar */}
        <div className="relative mb-16">
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a1225] border-2 border-blue-900/30 rounded-xl py-4 px-6 text-lg placeholder:text-gray-500 focus:outline-none focus:border-blue-700/50"
          />
          <div className="absolute right-6 top-1/2 -translate-y-1/2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 text-gray-500"
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

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredResources.map((resource) => (
            <div
              key={resource.id}
              onClick={() => router.push(`/resources/${resource.id}`)}
              className="bg-[#0a1225] rounded-[3rem] overflow-hidden border border-blue-900/20 hover:border-blue-700/50 transition-all group cursor-pointer"
            >
              {/* Card Image */}
              <div className="h-48 relative overflow-hidden">
                <img
                  src={resource.coverImage}
                  alt={resource.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              {/* Card Content */}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-white/90">
                  {resource.title}
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  by {resource.provider}
                </p>

                {/* Instructor */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-900/50">
                    <img
                      src={resource.instructor.image}
                      alt={resource.instructor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm text-gray-300">
                    {resource.instructor.name}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
