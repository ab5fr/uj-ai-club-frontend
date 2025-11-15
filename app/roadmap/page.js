"use client";

import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";

export default function RoadmapPage() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef(null);

  const roadmapSteps = [
    {
      title: "Introduction to AI",
      description:
        "Learn the basics of Artificial Intelligence and its applications in modern technology.",
      position: "right",
    },
    {
      title: "Machine Learning Fundamentals",
      description:
        "Understand core ML concepts, algorithms, and how machines learn from data.",
      position: "left",
    },
    {
      title: "Deep Learning",
      description:
        "Dive into neural networks, CNNs, RNNs, and advanced architectures.",
      position: "right",
    },
    {
      title: "Natural Language Processing",
      description: "Explore how AI understands and generates human language.",
      position: "left",
    },
    {
      title: "Computer Vision",
      description: "Learn how AI interprets and processes visual information.",
      position: "right",
    },
    {
      title: "Reinforcement Learning",
      description:
        "Master training agents to make decisions through rewards and penalties.",
      position: "left",
    },
    {
      title: "Generative AI & LLMs",
      description: "Explore large language models and generative AI systems.",
      position: "right",
    },
    {
      title: "AI in Production",
      description:
        "Deploy and manage AI models at scale in real-world applications.",
      position: "left",
    },
    {
      title: "AI Security & Safety",
      description:
        "Understand adversarial attacks, robustness, and AI safety practices.",
      position: "right",
    },
    {
      title: "Advanced AI & Future",
      description:
        "Explore cutting-edge research, AGI concepts, and the future of AI.",
      position: "left",
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const scrollTop = window.scrollY;
        const docHeight =
          containerRef.current.offsetHeight - window.innerHeight;
        const progress = Math.min(scrollTop / docHeight, 1);
        setScrollProgress(progress);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getSubmarinePosition = (index, total) => {
    // Calculate position along curved path
    const pathProgress = scrollProgress * (total - 1);

    // Find which segment the submarine is currently on
    const currentSegment = Math.floor(pathProgress);

    // Make submarine visible only on the current segment
    if (currentSegment !== index) {
      return { x: 0, y: 0, rotation: 0, visible: false };
    }

    const localProgress = pathProgress - currentSegment;
    const currentStep = roadmapSteps[index];
    const nextStep = roadmapSteps[index + 1];

    const startX = currentStep.position === "left" ? 300 : 900;
    const endX = nextStep ? (nextStep.position === "left" ? 300 : 900) : startX;
    const startY = index * 500 + 50;
    const endY = (index + 1) * 500 + 50;

    // Calculate position on very smooth cubic bezier curve matching the path
    const verticalDistance = endY - startY;
    const horizontalDistance = endX - startX;

    // Use same control points as the path for perfect alignment
    const controlX1 = startX;
    const controlY1 = startY + verticalDistance * 0.5;
    const controlX2 = endX;
    const controlY2 = startY + verticalDistance * 0.5;

    const t = localProgress;
    const invT = 1 - t;

    // Cubic bezier formula: B(t) = (1-t)³P0 + 3(1-t)²tP1 + 3(1-t)t²P2 + t³P3
    const x =
      invT * invT * invT * startX +
      3 * invT * invT * t * controlX1 +
      3 * invT * t * t * controlX2 +
      t * t * t * endX;

    const y =
      invT * invT * invT * startY +
      3 * invT * invT * t * controlY1 +
      3 * invT * t * t * controlY2 +
      t * t * t * endY;

    // Calculate rotation based on tangent of curve
    const dx =
      3 * invT * invT * (controlX1 - startX) +
      6 * invT * t * (controlX2 - controlX1) +
      3 * t * t * (endX - controlX2);

    const dy =
      3 * invT * invT * (controlY1 - startY) +
      6 * invT * t * (controlY2 - controlY1) +
      3 * t * t * (endY - controlY2);

    // Calculate rotation to face movement direction
    const rotation = Math.atan2(dy, dx) * (180 / Math.PI);

    return { x, y, rotation, visible: true };
  };

  const getCircleProgress = (index) => {
    const totalSteps = roadmapSteps.length;
    const scrollPerStep = 1 / totalSteps;
    return scrollProgress >= index * scrollPerStep;
  };

  return (
    <div className="min-h-screen relative">
      {/* Ocean Background Image */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-top bg-no-repeat z-0"
        style={{
          backgroundImage: "url('/ocean.jpg')",
          minHeight: "100%",
        }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      <div className="relative z-10">
        <Navbar />{" "}
        <div className="relative pt-24 pb-32" ref={containerRef}>
          {/* Header */}
          <div className="text-center mb-20 px-4">
            <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent pt-20">
              AI Learning Roadmap
            </h1>
            <p className="text-xl text-cyan-300">
              Navigate your journey through the depths of AI knowledge
            </p>
          </div>

          {/* Roadmap Container */}
          <div
            className="relative max-w-6xl mx-auto px-4"
            style={{ minHeight: `${roadmapSteps.length * 500}px` }}
          >
            {/* Curved Path with SVG */}
            <svg
              className="absolute left-0 top-0 w-full h-full pointer-events-none"
              style={{ minHeight: `${roadmapSteps.length * 500}px` }}
              viewBox={`0 0 1200 ${roadmapSteps.length * 500}`}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient
                  id="pathGradient"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              {/* Draw ONE continuous curved path through all circles */}
              <path
                d={(() => {
                  let pathData = "";

                  roadmapSteps.forEach((step, index) => {
                    const x = step.position === "left" ? 300 : 900;
                    const y = index * 500 + 50;

                    if (index === 0) {
                      // Start at first circle
                      pathData += `M ${x} ${y}`;
                    } else {
                      // Create smooth curve to next circle
                      const prevStep = roadmapSteps[index - 1];
                      const prevX = prevStep.position === "left" ? 300 : 900;
                      const prevY = (index - 1) * 500 + 50;

                      const verticalDistance = y - prevY;
                      const horizontalDistance = x - prevX;

                      // Control points for very smooth S-curve
                      // Place control points much further apart vertically for gradual curves
                      const cp1x = prevX;
                      const cp1y = prevY + verticalDistance * 0.5;
                      const cp2x = x;
                      const cp2y = prevY + verticalDistance * 0.5;

                      pathData += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`;
                    }
                  });

                  return pathData;
                })()}
                fill="none"
                stroke="url(#pathGradient)"
                strokeWidth="4"
                strokeDasharray="15,10"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="1"
              />{" "}
              {/* Draw circles on the path */}
              {roadmapSteps.map((step, index) => {
                const circleX = step.position === "left" ? 300 : 900;
                const circleY = index * 500 + 50;
                const isActive = getCircleProgress(index);

                return (
                  <circle
                    key={`circle-${index}`}
                    cx={circleX}
                    cy={circleY}
                    r="32"
                    fill={isActive ? "#06b6d4" : "#164e63"}
                    stroke={isActive ? "#22d3ee" : "#155e75"}
                    strokeWidth="4"
                    opacity={isActive ? "1" : "0.5"}
                    className="transition-all duration-700"
                  />
                );
              })}
              {/* Draw circle numbers */}
              {roadmapSteps.map((step, index) => {
                const circleX = step.position === "left" ? 300 : 900;
                const circleY = index * 500 + 50;
                const isActive = getCircleProgress(index);

                return (
                  <text
                    key={`text-${index}`}
                    x={circleX}
                    y={circleY + 8}
                    textAnchor="middle"
                    fill="white"
                    fontSize="24"
                    fontWeight="bold"
                    opacity={isActive ? "1" : "0.5"}
                    className="transition-all duration-700"
                  >
                    {index + 1}
                  </text>
                );
              })}
            </svg>

            {/* Roadmap Steps */}
            {roadmapSteps.map((step, index) => {
              const isLeft = step.position === "left";
              const isActive = getCircleProgress(index);

              return (
                <div
                  key={index}
                  className="relative"
                  style={{
                    height: "500px",
                  }}
                >
                  {/* Card - positioned on opposite side of circle */}
                  <div
                    className="absolute top-0 z-10"
                    style={{
                      left: isLeft ? "50%" : "0%",
                      width: "45%",
                    }}
                  >
                    <div className="bg-gradient-to-br from-cyan-900/80 to-blue-900/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-cyan-500/30">
                      <h3 className="text-2xl font-bold text-cyan-300 mb-3">
                        {step.title}
                      </h3>
                      <p className="text-gray-300 leading-relaxed">
                        {step.description}
                      </p>

                      {/* Decorative Corner */}
                      <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-cyan-400/30 rounded-tr-2xl"></div>
                      <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-cyan-400/30 rounded-bl-2xl"></div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Submarine - render separately to follow the path */}
            {roadmapSteps.map((step, index) => {
              const submarinePos = getSubmarinePosition(
                index,
                roadmapSteps.length
              );
              if (!submarinePos.visible) return null;

              // Determine if submarine should be flipped based on rotation
              // When rotation is between 90 and 270 degrees, the submarine is moving leftward
              let adjustedRotation = submarinePos.rotation;
              const facingLeft =
                adjustedRotation > 90 || adjustedRotation < -90;

              // If facing left, flip the submarine and adjust rotation
              if (facingLeft) {
                adjustedRotation =
                  adjustedRotation > 0
                    ? adjustedRotation - 180
                    : adjustedRotation + 180;
              }

              return (
                <div
                  key={`submarine-${index}`}
                  className="absolute z-30 pointer-events-none"
                  style={{
                    left: `${(submarinePos.x / 1200) * 100}%`,
                    top: `${
                      (submarinePos.y / (roadmapSteps.length * 500)) * 100
                    }%`,
                    transform: `translate(-50%, -50%) rotate(${adjustedRotation}deg) ${
                      facingLeft ? "scaleX(-1)" : ""
                    }`,
                    transition: "transform 0.15s ease-out",
                  }}
                >
                  <div className="relative">
                    {/* Submarine Body */}
                    <svg
                      width="120"
                      height="60"
                      viewBox="0 0 120 60"
                      className="drop-shadow-2xl"
                      style={{ transform: "scaleX(-1)" }}
                    >
                      {/* Main Hull */}
                      <ellipse
                        cx="60"
                        cy="35"
                        rx="50"
                        ry="20"
                        fill="#fbbf24"
                        stroke="#f59e0b"
                        strokeWidth="2"
                      />

                      {/* Conning Tower */}
                      <rect
                        x="45"
                        y="15"
                        width="30"
                        height="20"
                        rx="5"
                        fill="#fbbf24"
                        stroke="#f59e0b"
                        strokeWidth="2"
                      />

                      {/* Periscope */}
                      <line
                        x1="60"
                        y1="15"
                        x2="60"
                        y2="5"
                        stroke="#f59e0b"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      <circle cx="60" cy="5" r="3" fill="#ef4444" />

                      {/* Windows */}
                      <circle
                        cx="40"
                        cy="30"
                        r="6"
                        fill="#60a5fa"
                        stroke="#1e40af"
                        strokeWidth="2"
                      />
                      <circle
                        cx="60"
                        cy="30"
                        r="6"
                        fill="#60a5fa"
                        stroke="#1e40af"
                        strokeWidth="2"
                      />
                      <circle
                        cx="80"
                        cy="30"
                        r="6"
                        fill="#60a5fa"
                        stroke="#1e40af"
                        strokeWidth="2"
                      />

                      {/* Propeller */}
                      <g transform="translate(110, 35)">
                        <circle
                          r="8"
                          fill="#94a3b8"
                          stroke="#64748b"
                          strokeWidth="2"
                        />
                        <line
                          x1="-6"
                          y1="0"
                          x2="6"
                          y2="0"
                          stroke="#475569"
                          strokeWidth="2"
                        />
                        <line
                          x1="0"
                          y1="-6"
                          x2="0"
                          y2="6"
                          stroke="#475569"
                          strokeWidth="2"
                        />
                      </g>

                      {/* Front Detail */}
                      <circle
                        cx="15"
                        cy="35"
                        r="8"
                        fill="#f59e0b"
                        stroke="#d97706"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Scroll Progress Indicator */}
          <div className="fixed bottom-8 right-8 z-50">
            <div className="relative w-16 h-16">
              <svg className="transform -rotate-90 w-16 h-16">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#1e40af"
                  strokeWidth="4"
                  fill="none"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#22d3ee"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${
                    2 * Math.PI * 28 * (1 - scrollProgress)
                  }`}
                  className="transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-cyan-400 text-xs font-bold">
                  {Math.round(scrollProgress * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
