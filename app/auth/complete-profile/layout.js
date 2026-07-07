import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Complete Profile",
  description: "Finish setting up your UJ AI Club member profile.",
  path: "/auth/complete-profile",
  noIndex: true,
});

export default function CompleteProfileLayout({ children }) {
  return children;
}
