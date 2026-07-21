import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Sign Up",
  description:
    "Create your UJ AI Club account and start learning AI with challenges and a supportive community.",
  path: "/signup",
  noIndex: true,
});

export default function SignupLayout({ children }) {
  return children;
}
