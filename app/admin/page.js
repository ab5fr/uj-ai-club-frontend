"use client";

import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { getIdToken } from "@/lib/firebase";
import { checkAdminAction } from "@/app/actions/articles";
import { TabButton } from "./components/shared";
import ArticlesAdmin from "./components/ArticlesAdmin";
import ChallengesAdmin from "./components/ChallengesAdmin";
import SubmissionsAdmin from "./components/SubmissionsAdmin";
import ContactMessagesAdmin from "./components/ContactMessagesAdmin";

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <AdminContent />
    </ProtectedRoute>
  );
}

function AdminContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("articles");
  const [dbAdmin, setDbAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getIdToken();
        if (!token) return;
        const res = await checkAdminAction(token);
        if (!cancelled && res.ok) setDbAdmin(Boolean(res.isAdmin));
      } catch {
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const isAdmin = useMemo(() => {
    if (dbAdmin) return true;
    if (!user) return false;
    return user.role === "admin" || user.isAdmin === true;
  }, [user, dbAdmin]);

  if (!isAdmin) {
    return (
      <main className="page admin-page">
        <section className="section">
          <div className="container">
            <h1>Admin</h1>
            <div className="admin-alert admin-alert--warning">
              You must be an administrator to access this page.
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page admin-page">
      <div className="page-hero">
        <div className="container">
          <div className="page-hero__tag">Administration</div>
          <h1 className="anim-1">
            Admin <span className="text-gradient">Dashboard</span>
          </h1>
          <p className="anim-2">
            Manage articles, challenges with notebooks, submissions, and contact
            messages.
          </p>
        </div>
      </div>

      <section className="section admin-section">
        <div className="container">
          <div className="admin-tabs">
            <TabButton
              label="Articles"
              active={activeTab === "articles"}
              onClick={() => setActiveTab("articles")}
            />
            <TabButton
              label="Challenges"
              active={activeTab === "challenges"}
              onClick={() => setActiveTab("challenges")}
            />
            <TabButton
              label="Submissions"
              active={activeTab === "submissions"}
              onClick={() => setActiveTab("submissions")}
            />
            <TabButton
              label="Messages"
              active={activeTab === "messages"}
              onClick={() => setActiveTab("messages")}
            />
          </div>

          {activeTab === "articles" && <ArticlesAdmin />}
          {activeTab === "challenges" && <ChallengesAdmin />}
          {activeTab === "submissions" && <SubmissionsAdmin />}
          {activeTab === "messages" && <ContactMessagesAdmin />}
        </div>
      </section>
    </main>
  );
}
