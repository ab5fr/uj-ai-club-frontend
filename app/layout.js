import { Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import AppShell from "./components/uoj/AppShell";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/JsonLd";
import { rootMetadata } from "@/lib/metadata";

const barlow = Barlow({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-barlow",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-barlow-condensed",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata = rootMetadata();

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${barlow.variable} ${barlowCondensed.variable}`}
    >
      <body>
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
