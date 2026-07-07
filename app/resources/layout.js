import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Learning Resources",
  description:
    "Curated AI and machine learning courses, notes, and study materials from top providers. Find the right resource for your level.",
  path: "/resources",
});

export default function ResourcesLayout({ children }) {
  return children;
}
