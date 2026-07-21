"use client";

import { useEffect, useState } from "react";
import { adminResourcesApi } from "@/lib/api";
import { Input, FileInput, toResourcePayload, handleErr } from "./shared";

export default function ResourcesAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    provider: "",
    coverImage: null,
    notionUrl: "",
    instructorName: "",
    instructorImage: null,
    visible: true,
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const data = await adminResourcesApi.list(true);
      setItems(data.items || data); // accept either {items:[]} or []
      setError("");
    } catch (err) {
      handleErr(err, setError);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = toResourcePayload(form);
    try {
      if (editingId) {
        await adminResourcesApi.update(editingId, payload);
      } else {
        await adminResourcesApi.create(payload);
      }
      resetForm();
      await load();
    } catch (err) {
      handleErr(err, setError);
    }
  };

  const onEdit = (r) => {
    setEditingId(r.id);
    setForm({
      title: r.title || "",
      provider: r.provider || "",
      coverImage: null, // Reset file input
      notionUrl: r.notionUrl || "",
      instructorName: r.instructor?.name || "",
      instructorImage: null, // Reset file input
      visible: r.visible !== false && r.isHidden !== true,
    });
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this resource?")) return;
    try {
      await adminResourcesApi.remove(id);
      await load();
    } catch (err) {
      handleErr(err, setError);
    }
  };

  const onToggleVisibility = async (r) => {
    try {
      await adminResourcesApi.setVisibility(r.id, !(r.visible ?? !r.isHidden));
      await load();
    } catch (err) {
      handleErr(err, setError);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      title: "",
      provider: "",
      coverImage: null,
      notionUrl: "",
      instructorName: "",
      instructorImage: null,
      visible: true,
    });
  };

  const filtered = items.filter((r) => {
    const q = search.toLowerCase();
    return (
      (r.title || "").toLowerCase().includes(q) ||
      (r.provider || "").toLowerCase().includes(q)
    );
  });

  return (
    <section>
      <h2 className="admin-section-title">Resources</h2>
      {error && <div className="admin-alert admin-alert--error">{error}</div>}

      {/* Create / Edit form */}
      <form onSubmit={onSubmit} className="card admin-form">
        <div className="admin-form-grid">
          <Input
            label="Title"
            value={form.title}
            onChange={(v) => setForm({ ...form, title: v })}
            required
          />
          <Input
            label="Provider"
            value={form.provider}
            onChange={(v) => setForm({ ...form, provider: v })}
            required
          />
          <FileInput
            label="Cover Image"
            onChange={(file) => setForm({ ...form, coverImage: file })}
          />
          <Input
            label="Notion URL"
            value={form.notionUrl}
            onChange={(v) => setForm({ ...form, notionUrl: v })}
          />
          <Input
            label="Instructor Name"
            value={form.instructorName}
            onChange={(v) => setForm({ ...form, instructorName: v })}
          />
          <FileInput
            label="Instructor Image"
            onChange={(file) => setForm({ ...form, instructorImage: file })}
          />
        </div>
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
            <button type="submit" className="btn btn-primary">
              {editingId ? "Update Resource" : "Add Resource"}
            </button>
          </div>
        </div>
      </form>

      <div className="admin-toolbar">
        <div className="admin-toolbar-meta">
          {loading ? "Loading..." : `${filtered.length} item(s)`}
        </div>
        <div className="admin-search">
          <Input placeholder="Search..." value={search} onChange={setSearch} />
        </div>
      </div>

      <div className="admin-card-grid">
        {filtered.map((r) => (
          <div key={r.id} className="card admin-item">
            <div className="admin-item__head">
              <div className="admin-item__title">{r.title}</div>
              <span
                className={`admin-badge ${
                  r.visible === false || r.isHidden
                    ? "admin-badge--hidden"
                    : "admin-badge--visible"
                }`}
              >
                {r.visible === false || r.isHidden ? "Hidden" : "Visible"}
              </span>
            </div>
            <div className="admin-item__meta">by {r.provider}</div>
            <div className="admin-item__actions">
              <button
                onClick={() => onEdit(r)}
                className="btn btn-primary btn-sm"
              >
                Edit
              </button>
              <button
                onClick={() => onToggleVisibility(r)}
                className="btn btn-warning btn-sm"
              >
                {r.visible === false || r.isHidden ? "Show" : "Hide"}
              </button>
              <button
                onClick={() => onDelete(r.id)}
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
