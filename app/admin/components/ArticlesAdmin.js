"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getIdToken } from "@/lib/firebase";
import {
  adminCreateArticleAction,
  adminDeleteArticleAction,
  adminListArticlesAction,
  adminSetArticleVisibilityAction,
  adminUpdateArticleAction,
} from "@/app/actions/articles";
import { Input, Textarea, FileInput } from "./shared";

async function fileToDataUrl(file) {
  if (!file) return null;
  if (file.size > 1_500_000) {
    throw new Error("Cover image must be under 1.5MB");
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read cover image"));
    reader.readAsDataURL(file);
  });
}

async function requireToken() {
  const token = await getIdToken();
  if (!token) throw new Error("You must be signed in");
  return token;
}

export default function ArticlesAdmin() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    body: "",
    coverImage: null,
    visible: true,
  });

  useEffect(() => {
    if (user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const load = async () => {
    try {
      setLoading(true);
      const token = await requireToken();
      const res = await adminListArticlesAction(token);
      if (!res.ok) throw new Error(res.error);
      setItems(res.items || []);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load articles");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      const token = await requireToken();
      const coverImageDataUrl = await fileToDataUrl(form.coverImage);
      const payload = {
        title: form.title,
        slug: form.slug,
        excerpt: form.excerpt,
        body: form.body,
        visible: form.visible,
        coverImageDataUrl,
      };

      const res = editingId
        ? await adminUpdateArticleAction(token, editingId, payload)
        : await adminCreateArticleAction(token, payload);

      if (!res.ok) throw new Error(res.error);
      resetForm();
      await load();
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (article) => {
    setEditingId(article.id);
    setForm({
      title: article.title || "",
      slug: article.slug || "",
      excerpt: article.excerpt || "",
      body: article.body || "",
      coverImage: null,
      visible: article.visible !== false,
    });
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this article?")) return;
    try {
      const token = await requireToken();
      const res = await adminDeleteArticleAction(token, id);
      if (!res.ok) throw new Error(res.error);
      await load();
    } catch (err) {
      setError(err.message || "Failed to delete");
    }
  };

  const onToggleVisibility = async (article) => {
    try {
      const token = await requireToken();
      const res = await adminSetArticleVisibilityAction(
        token,
        article.id,
        !(article.visible ?? true),
      );
      if (!res.ok) throw new Error(res.error);
      await load();
    } catch (err) {
      setError(err.message || "Failed to update visibility");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      title: "",
      slug: "",
      excerpt: "",
      body: "",
      coverImage: null,
      visible: true,
    });
  };

  const filtered = items.filter((a) => {
    const q = search.toLowerCase();
    return (
      (a.title || "").toLowerCase().includes(q) ||
      (a.slug || "").toLowerCase().includes(q) ||
      (a.excerpt || "").toLowerCase().includes(q)
    );
  });

  return (
    <section>
      <h2 className="admin-section-title">Articles</h2>
      {error && <div className="admin-alert admin-alert--error">{error}</div>}

      <form onSubmit={onSubmit} className="card admin-form">
        <div className="admin-form-grid">
          <Input
            label="Title"
            value={form.title}
            onChange={(v) => setForm({ ...form, title: v })}
            required
          />
          <Input
            label="Slug (optional)"
            value={form.slug}
            onChange={(v) => setForm({ ...form, slug: v })}
            placeholder="auto-from-title"
          />
          <FileInput
            label="Cover Image"
            onChange={(file) => setForm({ ...form, coverImage: file })}
          />
          <Input
            label="Excerpt"
            value={form.excerpt}
            onChange={(v) => setForm({ ...form, excerpt: v })}
            placeholder="Short summary shown on the blog list"
          />
        </div>
        <Textarea
          label="Body (Markdown)"
          value={form.body}
          onChange={(v) => setForm({ ...form, body: v })}
          placeholder={"# Heading\n\nWrite your article in **Markdown**…"}
          className="admin-article-body"
          rows={16}
        />
        <div className="admin-form-footer">
          <label className="admin-check">
            <input
              type="checkbox"
              checked={form.visible}
              onChange={(e) => setForm({ ...form, visible: e.target.checked })}
            />
            Visible
          </label>
          <div className="admin-form-actions">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="btn btn-outline"
              >
                Cancel
              </button>
            )}
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving
                ? "Saving…"
                : editingId
                  ? "Update Article"
                  : "Publish Article"}
            </button>
          </div>
        </div>
      </form>

      <div className="admin-toolbar">
        <div className="admin-toolbar-meta">
          {loading ? "Loading..." : `${filtered.length} article(s)`}
        </div>
        <div className="admin-search">
          <Input placeholder="Search..." value={search} onChange={setSearch} />
        </div>
      </div>

      <div className="admin-card-grid">
        {filtered.map((article) => (
          <div key={article.id} className="card admin-item">
            <div className="admin-item__head">
              <div className="admin-item__title">{article.title}</div>
              <span
                className={`admin-badge ${
                  article.visible === false
                    ? "admin-badge--hidden"
                    : "admin-badge--visible"
                }`}
              >
                {article.visible === false ? "Hidden" : "Visible"}
              </span>
            </div>
            <div className="admin-item__meta">/{article.slug}</div>
            <div className="admin-item__actions">
              <a
                href={`/blog/${article.slug}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline btn-sm"
              >
                View
              </a>
              <button
                onClick={() => onEdit(article)}
                className="btn btn-primary btn-sm"
              >
                Edit
              </button>
              <button
                onClick={() => onToggleVisibility(article)}
                className="btn btn-warning btn-sm"
              >
                {article.visible === false ? "Show" : "Hide"}
              </button>
              <button
                onClick={() => onDelete(article.id)}
                className="btn btn-danger btn-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
