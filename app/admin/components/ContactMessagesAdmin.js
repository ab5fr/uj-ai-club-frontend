"use client";

import { useEffect, useState } from "react";
import { adminContactMessagesApi } from "@/lib/api";
import { fmtDateTime, handleErr } from "./shared";
export default function ContactMessagesAdmin() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const data = await adminContactMessagesApi.list();
      setMessages(data.items || data || []);
      setError("");
    } catch (err) {
      handleErr(err, setError);
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = messages.filter((message) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      message.name?.toLowerCase().includes(q) ||
      message.email?.toLowerCase().includes(q) ||
      message.message?.toLowerCase().includes(q)
    );
  });

  return (
    <section>
      <div className="admin-toolbar">
        <div>
          <h2 className="admin-section-title">Contact Messages</h2>
          <p className="admin-section-desc" style={{ marginBottom: 0 }}>
            Messages submitted from the homepage contact form.
          </p>
        </div>
        <button type="button" onClick={load} className="btn btn-outline btn-sm">
          Refresh
        </button>
      </div>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}

      <div className="admin-search" style={{ marginBottom: "1.25rem" }}>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or message..."
          className="form-input"
        />
      </div>

      {loading ? (
        <p className="admin-toolbar-meta">Loading messages...</p>
      ) : filteredMessages.length === 0 ? (
        <div className="card admin-empty">
          {search.trim()
            ? "No messages match your search."
            : "No messages yet."}
        </div>
      ) : (
        <div className="admin-message-list">
          {filteredMessages.map((message) => (
            <article key={message.id} className="card admin-message">
              <div className="admin-message__head">
                <div>
                  <h3 className="admin-message__name">{message.name}</h3>
                  <a
                    href={`mailto:${message.email}`}
                    className="admin-message__email"
                  >
                    {message.email}
                  </a>
                </div>
                <time className="admin-message__time">
                  {fmtDateTime(message.createdAt)}
                </time>
              </div>
              <p className="admin-message__body">{message.message}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}