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
      "https://rune-exhaust-ad3.notion.site/ebd/27692c82e84e80529007da7b46e0cd50",
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
    <main
      className="min-h-screen text-white pt-24 bg-no-repeat bg-[#0a1225]"
      style={{
        backgroundImage: "url('/project.jpg')",
        backgroundSize: "150%",
        backgroundPosition: "center 70%",
      }}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Content Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold mb-4">{resource.title}</h1>
            <p className="text-gray-400 mb-3">by {resource.provider}</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden">
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

          {/* Quote Box */}
          <div className="bg-[#7CD0F9] rounded-3xl p-6 max-w-md">
            <p className="text-white text-xl font-medium mb-2">
              {resource.quote.text}
            </p>
            <p className="text-white/90 text-sm">— {resource.quote.author}</p>
          </div>
        </div>

        {/* Notion Section */}
        <div className="relative mt-12 rounded-2xl bg-[#0a1225]">
          {/* Notion Logo */}
          <button
            onClick={openNotion}
            className="absolute top-[-0.5rem] left-[-0.5rem] z-10 bg-white backdrop-blur-sm p-7 rounded-br-3xl rounded-tl-3xl transition-colors cursor-pointer"
          >
            <img src="/notion.svg" alt="Open in Notion" className="w-15 h-15" />
          </button>

          {/* Notion Embed */}
          <iframe
            src={resource.notionUrl}
            className="w-full h-[400px] bg-white rounded-2xl"
            allowFullScreen
          />
        </div>
      </div>
    </main>
  );
}
