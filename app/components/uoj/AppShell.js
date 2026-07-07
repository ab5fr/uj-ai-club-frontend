"use client";

import { usePathname } from "next/navigation";
import UojNavbar from "./UojNavbar";
import UojFooter from "./UojFooter";

const BARE_LAYOUT_PREFIXES = ["/login", "/signup", "/auth/"];
const NO_FOOTER_PREFIXES = ["/admin"];

export default function AppShell({ children }) {
  const pathname = usePathname();
  const bareLayout = BARE_LAYOUT_PREFIXES.some((prefix) =>
    pathname?.startsWith(prefix),
  );
  const hideFooter =
    bareLayout ||
    NO_FOOTER_PREFIXES.some((prefix) => pathname?.startsWith(prefix));

  if (bareLayout) {
    return children;
  }

  return (
    <>
      <UojNavbar />
      {children}
      {!hideFooter && (
        <UojFooter contactHref={pathname === "/" ? "#contact" : "/#contact"} />
      )}
    </>
  );
}
