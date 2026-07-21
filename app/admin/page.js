"use client";

import { useState } from "react";
import { TabButton } from "./components/shared";
import ArticlesAdmin from "./components/ArticlesAdmin";
import ChallengesAdmin from "./components/ChallengesAdmin";
import SubmissionsAdmin from "./components/SubmissionsAdmin";
import ContactMessagesAdmin from "./components/ContactMessagesAdmin";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("articles");

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
