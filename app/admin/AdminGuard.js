"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { getIdToken } from "@/lib/firebase";
import { checkAdminAction } from "@/app/actions/articles";

/**
 * Server actions need a Firebase ID token from the client, so this guard
 * verifies admin via checkAdminAction before rendering any /admin UI.
 * Backend AdminUser extractors remain the source of truth for API mutations.
 */
export default function AdminGuard({ children }) {
  const { user } = useAuth();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getIdToken();
        if (!token) {
          if (!cancelled) {
            setIsAdmin(false);
            setChecking(false);
          }
          return;
        }
        const res = await checkAdminAction(token);
        if (!cancelled) {
          setIsAdmin(Boolean(res.ok && res.isAdmin));
          setChecking(false);
        }
      } catch {
        if (!cancelled) {
          setIsAdmin(false);
          setChecking(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <ProtectedRoute>
      {checking ? (
        <main className="page admin-page">
          <section className="section">
            <div className="container">
              <div className="card admin-empty">Checking admin access...</div>
            </div>
          </section>
        </main>
      ) : !isAdmin ? (
        <main className="page admin-page">
          <section className="section">
            <div className="container">
              <div className="admin-alert admin-alert--warning">
                You must be an administrator to access this page.
              </div>
            </div>
          </section>
        </main>
      ) : (
        children
      )}
    </ProtectedRoute>
  );
}
