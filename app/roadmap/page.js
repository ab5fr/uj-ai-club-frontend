"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { SparklesIcon } from "@heroicons/react/24/solid";

export default function RoadmapPage() {
  const canvasRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Initialize Three.js submarine
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    // Scene setup
    scene.background = null;
    camera.position.z = 5;

    // Create 3D Submarine
    const submarineGroup = new THREE.Group();

    // Main hull (capsule)
    const hullGeometry = new THREE.CapsuleGeometry(0.5, 3, 4, 8);
    const hullMaterial = new THREE.MeshPhongMaterial({ color: 0x1a1a2e });
    const hull = new THREE.Mesh(hullGeometry, hullMaterial);
    hull.rotation.z = Math.PI / 2;
    submarineGroup.add(hull);

    // Conning tower
    const towerGeometry = new THREE.BoxGeometry(0.4, 0.6, 0.3);
    const towerMaterial = new THREE.MeshPhongMaterial({ color: 0x2d3561 });
    const tower = new THREE.Mesh(towerGeometry, towerMaterial);
    tower.position.set(0, 0.3, 0.2);
    submarineGroup.add(tower);

    // Periscope
    const periscopeGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.5);
    const periscopeMaterial = new THREE.MeshPhongMaterial({ color: 0x4a5584 });
    const periscope = new THREE.Mesh(periscopeGeometry, periscopeMaterial);
    periscope.position.set(0, 0.7, 0.15);
    submarineGroup.add(periscope);

    // Propeller (back)
    const propellerGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.1, 3);
    const propellerMaterial = new THREE.MeshPhongMaterial({ color: 0x34495e });
    const propeller = new THREE.Mesh(propellerGeometry, propellerMaterial);
    propeller.position.set(-1.5, 0, 0);
    propeller.rotation.z = Math.PI / 2;
    submarineGroup.add(propeller);

    // Fins (top and bottom)
    const finGeometry = new THREE.BoxGeometry(0.3, 0.6, 0.15);
    const finMaterial = new THREE.MeshPhongMaterial({ color: 0x34495e });

    const topFin = new THREE.Mesh(finGeometry, finMaterial);
    topFin.position.set(0, 0.5, 0);
    submarineGroup.add(topFin);

    const bottomFin = new THREE.Mesh(finGeometry, finMaterial);
    bottomFin.position.set(0, -0.5, 0);
    submarineGroup.add(bottomFin);

    // Side fins
    const sideFin = new THREE.BoxGeometry(0.15, 0.4, 0.2);
    const sideMaterial = new THREE.MeshPhongMaterial({ color: 0x2d3561 });

    const leftFin = new THREE.Mesh(sideFin, sideMaterial);
    leftFin.position.set(-0.3, 0, 0.5);
    submarineGroup.add(leftFin);

    const rightFin = new THREE.Mesh(sideFin, sideMaterial);
    rightFin.position.set(-0.3, 0, -0.5);
    submarineGroup.add(rightFin);

    // Window lights
    const windowGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const windowMaterial = new THREE.MeshPhongMaterial({
      color: 0x00d4ff,
      emissive: 0x0099ff,
    });

    for (let i = 0; i < 3; i++) {
      const window = new THREE.Mesh(windowGeometry, windowMaterial);
      window.position.set(0.5 - i * 0.5, 0.1, 0.5);
      submarineGroup.add(window);
    }

    scene.add(submarineGroup);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00d4ff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x00d4ff, 0.5, 100);
    pointLight.position.set(-3, 0, 3);
    scene.add(pointLight);

    // Handle scroll
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(scrollPercent);

      // Move submarine with scroll (vertical movement)
      submarineGroup.position.y = (scrollPercent / 100) * 8 - 4;
      submarineGroup.rotation.x = (scrollPercent / 100) * Math.PI * 0.5;

      // Submarine faces direction it's moving (rotates along X axis to face down as scrolling)
      // Rotate to face the scroll direction
      submarineGroup.rotation.z = Math.sin(scrollPercent / 20) * 0.3;

      // Point submarine in direction of movement (tilted up slightly, then down)
      const movementRotation = (scrollPercent / 100) * Math.PI * 2;
      submarineGroup.rotation.x = (scrollPercent / 100) * Math.PI * 0.3;

      // Propeller rotation
      propeller.rotation.y += 0.1;
    };

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Gentle floating animation
      submarineGroup.rotation.z += Math.sin(Date.now() * 0.0001) * 0.01;

      renderer.render(scene, camera);
    };

    animate();

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const roadmapItems = [
    {
      title: "Foundation",
      phase: "Q1 2025",
      description: "Establish club governance and leadership structure",
      details: [
        "Community guidelines",
        "Leadership team formation",
        "Onboarding program launch",
      ],
      status: "completed",
      icon: "🎯",
      color: "from-emerald-400 to-teal-500",
    },
    {
      title: "Learning Path",
      phase: "Q2 2025",
      description: "Core AI/ML knowledge building with weekly workshops",
      details: [
        "Python fundamentals series",
        "Machine learning algorithms",
        "Data science fundamentals",
      ],
      status: "in-progress",
      icon: "📚",
      color: "from-blue-400 to-cyan-500",
    },
    {
      title: "Advanced Topics",
      phase: "Q3 2025",
      description: "Specialized AI domains and deep learning",
      details: [
        "Deep neural networks",
        "NLP and Computer Vision",
        "Reinforcement learning",
      ],
      status: "upcoming",
      icon: "🧠",
      color: "from-purple-400 to-indigo-500",
    },
    {
      title: "Research",
      phase: "Q4 2025",
      description: "Advanced research projects and innovation",
      details: [
        "Research groups formation",
        "Paper publications",
        "Hackathons and competitions",
      ],
      status: "upcoming",
      icon: "🔬",
      color: "from-pink-400 to-rose-500",
    },
    {
      title: "Community Impact",
      phase: "Q1 2026",
      description: "Building mentorship and industry partnerships",
      details: [
        "Mentorship program launch",
        "Educational content library",
        "Industry collaborations",
      ],
      status: "upcoming",
      icon: "🚀",
      color: "from-orange-400 to-red-500",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/20 border-emerald-400";
      case "in-progress":
        return "bg-blue-500/20 border-blue-400";
      case "upcoming":
        return "bg-gray-500/20 border-gray-400";
      default:
        return "bg-gray-500/20";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "✓ Completed";
      case "in-progress":
        return "◆ In Progress";
      case "upcoming":
        return "○ Upcoming";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 relative overflow-hidden">
      {/* Ocean Depth Overlay - Changes with scroll */}
      <div 
        className="fixed inset-0 pointer-events-none z-[1] transition-opacity duration-300"
        style={{
          background: `linear-gradient(to bottom, 
            rgba(0, 35, 75, ${scrollProgress * 0.003}), 
            rgba(0, 20, 50, ${scrollProgress * 0.005}), 
            rgba(0, 10, 30, ${scrollProgress * 0.008}))`,
        }}
      ></div>

      {/* Floating Bubbles */}
      <div className="fixed inset-0 pointer-events-none z-[2] overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-cyan-300/20 border border-cyan-400/30"
            style={{
              width: Math.random() * 40 + 15 + 'px',
              height: Math.random() * 40 + 15 + 'px',
              left: Math.random() * 100 + '%',
              bottom: '-50px',
              animation: `bubbleFloat ${Math.random() * 8 + 6}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
              boxShadow: '0 0 15px rgba(34, 211, 238, 0.3)',
            }}
          />
        ))}
        <style jsx>{`
          @keyframes bubbleFloat {
            0% {
              transform: translateY(0) translateX(0) scale(0.8);
              opacity: 0;
            }
            10% {
              opacity: 0.6;
            }
            50% {
              transform: translateY(-50vh) translateX(${Math.random() * 100 - 50}px) scale(1);
            }
            90% {
              opacity: 0.4;
            }
            100% {
              transform: translateY(-100vh) translateX(${Math.random() * 150 - 75}px) scale(0.6);
              opacity: 0;
            }
          }
        `}</style>
      </div>

      {/* Light Rays from Surface */}
      <div 
        className="fixed inset-0 pointer-events-none z-[1] opacity-20"
        style={{
          background: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 80px,
            rgba(100, 200, 255, 0.1) 80px,
            rgba(100, 200, 255, 0.1) 85px
          )`,
          transform: `translateY(${-scrollProgress * 2}px) rotate(-10deg) scale(2)`,
          transition: 'transform 0.3s ease-out',
        }}
      ></div>

      {/* Depth Particles */}
      <div className="fixed inset-0 pointer-events-none z-[2]">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/40 rounded-full"
            style={{
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animation: `particleDrift ${Math.random() * 15 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
        <style jsx>{`
          @keyframes particleDrift {
            0% {
              transform: translateY(0) translateX(0);
              opacity: 0;
            }
            20% {
              opacity: 0.6;
            }
            80% {
              opacity: 0.3;
            }
            100% {
              transform: translateY(100vh) translateX(${Math.random() * 100 - 50}px);
              opacity: 0;
            }
          }
        `}</style>
      </div>

      {/* Swimming Fish */}
      <div className="fixed inset-0 pointer-events-none z-[3] overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute text-2xl md:text-3xl transition-transform"
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: i % 2 === 0 ? '-50px' : 'calc(100% + 50px)',
              animation: `swimFish${i % 2 === 0 ? 'Right' : 'Left'} ${Math.random() * 20 + 15}s linear infinite`,
              animationDelay: `${Math.random() * 10}s`,
              transform: i % 2 === 0 ? 'scaleX(1)' : 'scaleX(-1)',
            }}
          >
            🐟
          </div>
        ))}
        <style jsx>{`
          @keyframes swimFishRight {
            0% {
              transform: translateX(0) translateY(0);
              opacity: 0;
            }
            10% {
              opacity: 0.7;
            }
            90% {
              opacity: 0.5;
            }
            100% {
              transform: translateX(calc(100vw + 100px)) translateY(${Math.random() * 200 - 100}px);
              opacity: 0;
            }
          }
          @keyframes swimFishLeft {
            0% {
              transform: translateX(0) translateY(0) scaleX(-1);
              opacity: 0;
            }
            10% {
              opacity: 0.7;
            }
            90% {
              opacity: 0.5;
            }
            100% {
              transform: translateX(calc(-100vw - 100px)) translateY(${Math.random() * 200 - 100}px) scaleX(-1);
              opacity: 0;
            }
          }
        `}</style>
      </div>

      {/* Depth Indicator - Shows how deep you've scrolled */}
      <div className="fixed top-24 right-8 z-[20] hidden md:block">
        <div className="bg-slate-900/80 border border-cyan-400/30 rounded-2xl p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="text-cyan-400 text-2xl">🌊</div>
            <div>
              <p className="text-xs text-cyan-300 font-semibold">DEPTH</p>
              <p className="text-lg font-bold text-white">
                {Math.floor(scrollProgress)}m
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Canvas - Fixed */}
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-screen z-[5] pointer-events-none"
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="h-screen flex items-center justify-center px-4 pt-20 relative">
          {/* Surface waves decoration */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none"></div>
          
          <div className="max-w-2xl text-center relative">
            <div className="inline-block mb-4">
              <div className="flex items-center gap-2 bg-blue-500/20 border border-cyan-400/30 rounded-full px-5 py-2 backdrop-blur-md">
                <span className="text-2xl">🌊</span>
                <span className="text-sm font-medium text-cyan-300">
                  Dive Into Our Journey
                </span>
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-2xl">
              AI Club Roadmap
            </h1>
            <p className="text-lg text-cyan-100 max-w-2xl mx-auto drop-shadow-lg mb-8">
              Dive deep into our strategic roadmap and explore the depths of artificial intelligence
            </p>
            <div className="flex items-center justify-center gap-2 text-cyan-300 animate-bounce">
              <span className="text-2xl">⚓</span>
              <p className="text-sm drop-shadow-lg">
                Scroll down to descend
              </p>
              <span className="text-2xl">⚓</span>
            </div>
          </div>
        </div>

        {/* Vertical Timeline */}
        <div className="max-w-4xl mx-auto px-4 pb-20">
          {/* Roadmap Items */}
          <div className="space-y-12">
            {roadmapItems.map((item, index) => (
              <div
                key={index}
                className={`relative transition-all duration-500`}
              >
                {/* Content Card with alternating line position */}
                <div
                  className={`flex items-center ${
                    index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                  } gap-0`}
                >
                  {/* Left/Right Content */}
                  <div
                    className={`w-1/2 ${index % 2 === 0 ? "pr-12" : "pl-12"}`}
                  >
                    <div
                      className={`bg-gradient-to-br ${item.color} rounded-2xl p-6 shadow-2xl border border-white/20 backdrop-blur-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300`}
                    >
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-4xl">{item.icon}</span>
                        <div>
                          <h3 className="text-2xl font-bold text-white">
                            {item.title}
                          </h3>
                          <p className="text-white/80 text-sm">{item.phase}</p>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-white/95 mb-4">{item.description}</p>

                      {/* Details */}
                      <div className="space-y-2 bg-black/20 rounded-lg p-3 mb-4 border border-white/10">
                        {item.details.map((detail, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-white/90 text-sm"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-white/60"></div>
                            {detail}
                          </div>
                        ))}
                      </div>

                      {/* Status */}
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white border ${getStatusColor(
                          item.status
                        )}`}
                      >
                        {getStatusText(item.status)}
                      </span>
                    </div>
                  </div>

                  {/* Timeline Line and Node */}
                  <div className="relative w-0 flex justify-center">
                    {/* Connecting line */}
                    <div
                      className={`absolute top-1/2 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 w-12 transform -translate-y-1/2 ${
                        index % 2 === 0 ? "right-full mr-1" : "left-full ml-1"
                      }`}
                    ></div>

                    {/* Center Circle Node */}
                    <div className="relative">
                      <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full shadow-lg shadow-blue-500/50 border-4 border-slate-900 z-10 relative"></div>
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full blur-lg opacity-50 -z-0 animate-pulse"></div>
                    </div>
                  </div>

                  {/* Placeholder for alignment */}
                  <div
                    className={`w-1/2 ${index % 2 === 0 ? "pl-12" : "pr-12"}`}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Final Message */}
          <div className="mt-24 text-center relative">
            {/* Ocean floor decoration */}
            <div className="absolute -bottom-20 left-0 right-0 h-40 bg-gradient-to-t from-slate-950/50 to-transparent pointer-events-none"></div>
            
            <div className="max-w-2xl mx-auto bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl p-8 border border-cyan-400/30 backdrop-blur-md shadow-2xl relative">
              {/* Treasure chest emoji */}
              <div className="text-5xl mb-4">🏆</div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Surface with New Skills?
              </h2>
              <p className="text-cyan-100 mb-6">
                Join the AI Club and be part of this extraordinary deep dive into artificial intelligence
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <button className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105">
                  🌊 Dive In
                </button>
                <button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105">
                  📚 Explore More
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Progress - Bottom Right */}
      <div className="fixed bottom-8 right-8 z-40 bg-slate-900/90 border border-cyan-400/30 rounded-full p-4 backdrop-blur-md shadow-lg shadow-cyan-500/20">
        <div className="relative w-16 h-16">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="rgba(34, 211, 238, 0.2)"
              strokeWidth="2"
              fill="none"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="url(#progressGradient)"
              strokeWidth="2"
              fill="none"
              strokeDasharray={`${(scrollProgress / 100) * 176} 176`}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
            <defs>
              <linearGradient
                id="progressGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#0ea5e9" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-cyan-300">
              {Math.floor(scrollProgress)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
