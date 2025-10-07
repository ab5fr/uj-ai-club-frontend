"use client";

import { useState, useEffect } from "react";

// This data would typically come from an API or database
const resourcesData = {
  1: {
    title: "Advanced Learning Algorithms",
    provider: "DeepLearning.AI",
    instructor: {
      name: "Abdullah Albadri",
      image: "/instructor-abdullah.jpg",
    },
    notionUrl:
      "https://foggy-fuchsia-671.notion.site/ebd/279744d75f5e8081a034dd8e3e5c8fe6",
    quote: {
      text: "The day is what you make it! So why not make it a great one?",
      author: "Steve Schulte",
    },
  },
  // Add more resources as needed
};

export default function ResourcePage({ params }) {
  const resource = resourcesData[params.id];

  if (!resource) {
    return <div>Resource not found</div>;
  }

  const openNotion = () => {
    window.open(resource.notionUrl, "_blank");
  };

  return (
    <main className="min-h-screen bg-[#010617] text-white pt-24">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Content Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold mb-4">{resource.title}</h1>
            <div className="flex items-center gap-3">
              <p className="text-gray-400">by {resource.provider}</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-blue-900/50">
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

          {/* Quote Box */}
          <div className="bg-[#7CD0F9] rounded-3xl p-6 max-w-md">
            <p className="text-[#010617] text-xl font-medium mb-2">
              {resource.quote.text}
            </p>
            <p className="text-[#010617]/80 text-sm">
              — {resource.quote.author}
            </p>
          </div>
        </div>

        {/* Notion Section */}
        <div className="relative mt-12 rounded-2xl overflow-hidden bg-[#0a1225] border border-blue-900/20">
          {/* Notion Logo */}
          <button
            onClick={openNotion}
            className="absolute top-4 left-4 z-10 bg-white/10 backdrop-blur-sm p-2 rounded-lg hover:bg-white/20 transition-colors"
          >
            <img src="/file.svg" alt="Open in Notion" className="w-6 h-6" />
          </button>

          {/* Notion Embed */}
          <iframe
            src={resource.notionUrl}
            className="w-full h-[800px] bg-white"
            frameBorder="0"
            allowFullScreen
          />
        </div>
      </div>
    </main>
  );
}
