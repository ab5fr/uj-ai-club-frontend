import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "AI Challenges",
  description:
    "Practice real AI problems with weekly hands-on challenges. Earn points, climb the leaderboard, and build portfolio-ready skills.",
  path: "/challanges",
});

export default function ChallengesLayout({ children }) {
  return children;
}
