"use client";

import { useEffect, useState } from "react";
import { adminCertificatesApi } from "@/lib/api";
import { Input, FileInput, toCertificatePayload, handleErr } from "./shared";
export default function CertificatesAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    level: "",
    title: "",
    courseTitle: "",
    coverImage: null,
    firstName: "",
    secondName: "",
    courseraUrl: "",
    youtubeUrl: "",
    visible: true,
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const data = await adminCertificatesApi.list(true);
      setItems(data.items || data);
      setError("");
    } catch (err) {
      handleErr(err, setError);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = toCertificatePayload(form);
    try {
      if (editingId) {
        await adminCertificatesApi.update(editingId, payload);
      } else {
        await adminCertificatesApi.create(payload);
      }
      resetForm();
      await load();
    } catch (err) {
      handleErr(err, setError);
    }
  };

  const onEdit = (c) => {
    setEditingId(c.id);
    setForm({
      level: c.level || "",
      title: c.title || "",
      courseTitle: c.courseTitle || "",
      coverImage: null,
      firstName: c.firstName || "",
      secondName: c.secondName || "",
      courseraUrl: c.courseraUrl || "",
      youtubeUrl: c.youtubeUrl || "",
      visible: c.visible !== false && c.isHidden !== true,
    });
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this certificate?")) return;
    try {
      await adminCertificatesApi.remove(id);
      await load();
    } catch (err) {
      handleErr(err, setError);
    }
  };

  const onToggleVisibility = async (c) => {
    try {
      await adminCertificatesApi.setVisibility(
        c.id,
        !(c.visible ?? !c.isHidden),
      );
      await load();
    } catch (err) {
      handleErr(err, setError);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      level: "",
      title: "",
      courseTitle: "",
      coverImage: null,
      firstName: "",
      secondName: "",
      courseraUrl: "",
      youtubeUrl: "",
      visible: true,
    });
  };

  const filtered = items.filter((c) => {
    const q = search.toLowerCase();
    return (
      (c.title || "").toLowerCase().includes(q) ||
      (c.firstName || "").toLowerCase().includes(q) ||
      (c.secondName || "").toLowerCase().includes(q)
    );
  });

  return (
    <section>
      <h2 className="admin-section-title">Certificates</h2>
      {error && <div className="admin-alert admin-alert--error">{error}</div>}

      <form onSubmit={onSubmit} className="card admin-form">
        <div className="admin-form-grid">
          <Input
            label="Level"
            value={form.level}
            onChange={(v) => setForm({ ...form, level: v })}
            placeholder="e.g., 1"
            required
          />
          <Input
            label="Title"
            value={form.title}
            onChange={(v) => setForm({ ...form, title: v })}
            required
          />
          <Input
            label="Course Title"
            value={form.courseTitle}
            onChange={(v) => setForm({ ...form, courseTitle: v })}
            required
          />
          <FileInput
            label="Cover Image"
            onChange={(file) => setForm({ ...form, coverImage: file })}
          />
          <Input
            label="First Name"
            value={form.firstName}
            onChange={(v) => setForm({ ...form, firstName: v })}
            required
          />
          <Input
            label="Second Name"
            value={form.secondName}
            onChange={(v) => setForm({ ...form, secondName: v })}
            required
          />
          <Input
            label="Coursera URL"
            value={form.courseraUrl}
            onChange={(v) => setForm({ ...form, courseraUrl: v })}
          />
          <Input
            label="YouTube URL"
            value={form.youtubeUrl}
            onChange={(v) => setForm({ ...form, youtubeUrl: v })}
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
              <button type="button" onClick={resetForm} className="btn btn-outline">
                Cancel
              </button>
            )}
            <button type="submit" className="btn btn-primary">
              {editingId ? "Update Certificate" : "Add Certificate"}
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
        {filtered.map((c) => (
          <div key={c.id} className="card admin-item">
            <div className="admin-item__head">
              <div className="admin-item__title">{c.title}</div>
              <span
                className={`admin-badge ${
                  c.visible === false || c.isHidden
                    ? "admin-badge--hidden"
                    : "admin-badge--visible"
                }`}
              >
                {c.visible === false || c.isHidden ? "Hidden" : "Visible"}
              </span>
            </div>
            <div className="admin-item__meta">Level {c.level}</div>
            <div className="admin-item__meta admin-item__meta--sm">
              {c.courseTitle}
            </div>
            <div className="admin-item__meta">
              by {c.firstName} · by {c.secondName}
            </div>
            <div className="admin-item__actions">
              <button onClick={() => onEdit(c)} className="btn btn-primary btn-sm">
                Edit
              </button>
              <button
                onClick={() => onToggleVisibility(c)}
                className="btn btn-warning btn-sm"
              >
                {c.visible === false || c.isHidden ? "Show" : "Hide"}
              </button>
              <button onClick={() => onDelete(c.id)} className="btn btn-danger btn-sm">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}