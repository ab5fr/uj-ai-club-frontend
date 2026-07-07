import "./uoj-styles.css";
import { AuthProvider } from "@/contexts/AuthContext";
import AppShell from "./components/uoj/AppShell";

export const metadata = {
  title: "AI Club — Learn AI Together",
  description:
    "Join the AI Club. Try AI challenges, track your progress, and see how you rank.",
  icons: {
    icon: "/mainlogo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr">
      <body>
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
