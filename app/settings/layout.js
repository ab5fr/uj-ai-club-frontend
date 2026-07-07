import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Settings",
  description: "Manage your UJ AI Club profile and account settings.",
  path: "/settings",
  noIndex: true,
});

export default function SettingsLayout({ children }) {
  return children;
}
