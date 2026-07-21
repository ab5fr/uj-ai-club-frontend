import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Log In",
  description:
    "Sign in to your UJ AI Club account to access challenges, track progress, and join the leaderboard.",
  path: "/login",
  noIndex: true,
});

export default function LoginLayout({ children }) {
  return children;
}
