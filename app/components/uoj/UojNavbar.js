"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

function navClass(pathname, href) {
  if (href === "/") {
    return pathname === "/" ? "active" : "";
  }
  return pathname?.startsWith(href) ? "active" : "";
}

export default function UojNavbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const authed = isAuthenticated();
  const isAdmin = authed && (user?.role === "admin" || user?.isAdmin === true);

  return (
    <nav className="nav">
      <div className="container">
        <div className="nav__inner">
          <Link href="/" className="logo" aria-label="AI Club Home">
            <img src="/mainlogo.png" className="logo__mark" alt="AI Club" />
            <div className="logo__text">
              Artificial Intelligence
              <small>Club</small>
            </div>
          </Link>

          <ul className="nav__links">
            <li>
              <Link href="/" className={navClass(pathname, "/")}>
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/challanges"
                className={navClass(pathname, "/challanges")}
              >
                Challenges
              </Link>
            </li>
            <li>
              <Link href="/blog" className={navClass(pathname, "/blog")}>
                Blog
              </Link>
            </li>
            <li>
              <Link href="/roadmap" className={navClass(pathname, "/roadmap")}>
                Roadmap
              </Link>
            </li>
            {isAdmin && (
              <li>
                <Link href="/admin" className={navClass(pathname, "/admin")}>
                  Admin
                </Link>
              </li>
            )}
          </ul>

          <div className="nav__actions">
            {authed ? (
              <>
                <span
                  style={{
                    fontSize: ".78rem",
                    color: "var(--text-muted)",
                    marginRight: ".5rem",
                  }}
                >
                  {user?.fullName || user?.email}
                </span>
                <button
                  type="button"
                  className="btn btn-orange logout-btn"
                  onClick={() => logout()}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-outline">
                  Sign In
                </Link>
                <Link href="/signup" className="btn btn-orange">
                  Join Now
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
