import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Admin",
  description: "UJ AI Club administration dashboard.",
  path: "/admin",
  noIndex: true,
});

export default function AdminLayout({ children }) {
  return children;
}
