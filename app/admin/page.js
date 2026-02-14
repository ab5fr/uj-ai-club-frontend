"use client";

import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import {
  ApiError,
  adminChallengesApi,
  adminCertificatesApi,
  adminResourcesApi,
  adminNotebooksApi,
  adminSubmissionsApi,
} from "@/lib/api";

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <AdminContent />
    </ProtectedRoute>
  );
}

function AdminContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("resources");

  const isAdmin = useMemo(() => {
    if (!user) return false;
    // Support either role or isAdmin flags depending on backend
    console.log(user);
    return user.role === "admin" || user.isAdmin === true;
  }, [user]);

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-[var(--color-surface-2)] text-[var(--color-text)] pt-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-4xl font-bold mb-6">Admin</h1>
          <div className="bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] border border-[var(--color-warning)] text-[var(--color-warning)] px-6 py-4 rounded-2xl">
            You must be an administrator to access this page.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-surface-2)] text-[var(--color-text)] pt-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-1">
            <TabButton
              label="Resources"
              active={activeTab === "resources"}
              onClick={() => setActiveTab("resources")}
            />
            <TabButton
              label="Certificates"
              active={activeTab === "certificates"}
              onClick={() => setActiveTab("certificates")}
            />
            <TabButton
              label="Challenges"
              active={activeTab === "challenges"}
              onClick={() => setActiveTab("challenges")}
            />
            <TabButton
              label="Notebooks"
              active={activeTab === "notebooks"}
              onClick={() => setActiveTab("notebooks")}
            />
            <TabButton
              label="Submissions"
              active={activeTab === "submissions"}
              onClick={() => setActiveTab("submissions")}
            />
          </div>
        </div>

        {activeTab === "resources" && <ResourcesAdmin />}
        {activeTab === "certificates" && <CertificatesAdmin />}
        {activeTab === "challenges" && <ChallengesAdmin />}
        {activeTab === "notebooks" && <NotebooksAdmin />}
        {activeTab === "submissions" && <SubmissionsAdmin />}
      </div>
    </main>
  );
}

function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
        active
          ? "bg-[var(--color-primary)] text-[var(--color-text)]"
          : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
      }`}
    >
      {label}
    </button>
  );
}

function ResourcesAdmin() {
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
      <h2 className="text-2xl font-semibold mb-4">Resources</h2>
      {error && (
        <div className="bg-[color-mix(in_srgb,var(--color-danger)_25%,transparent)] border border-[var(--color-danger)] text-[var(--color-warning)] px-6 py-3 rounded-2xl mb-4">
          {error}
        </div>
      )}

      {/* Create / Edit form */}
      <form
        onSubmit={onSubmit}
        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className="mt-4 flex items-center justify-between">
          <label className="inline-flex items-center gap-2 text-[var(--color-text-muted)]">
            <input
              type="checkbox"
              checked={form.visible}
              onChange={(e) => setForm({ ...form, visible: e.target.checked })}
            />
            Visible
          </label>
          <div className="flex gap-3">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-xl bg-[var(--color-muted-strong)] hover:bg-[var(--color-muted-surface)]"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-strong)]"
            >
              {editingId ? "Update Resource" : "Add Resource"}
            </button>
          </div>
        </div>
      </form>

      <div className="flex items-center justify-between mb-4">
        <div className="text-[var(--color-text-muted)]">
          {loading ? "Loading..." : `${filtered.length} item(s)`}
        </div>
        <div className="w-72">
          <Input placeholder="Search..." value={search} onChange={setSearch} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((r) => (
          <div
            key={r.id}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-[color-mix(in_srgb,var(--color-text)_90%,transparent)] truncate">
                {r.title}
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  r.visible === false || r.isHidden
                    ? "bg-[var(--color-muted-strong)] text-[var(--color-text)]"
                    : "bg-[color-mix(in_srgb,var(--color-success)_30%,transparent)] text-[var(--color-success)]"
                }`}
              >
                {r.visible === false || r.isHidden ? "Hidden" : "Visible"}
              </span>
            </div>
            <div className="text-sm text-[var(--color-text-muted)] mb-3">
              by {r.provider}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(r)}
                className="px-3 py-2 rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_80%,transparent)] hover:bg-[var(--color-primary)] text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => onToggleVisibility(r)}
                className="px-3 py-2 rounded-xl bg-[color-mix(in_srgb,var(--color-warning)_80%,transparent)] hover:bg-[var(--color-warning)] text-sm"
              >
                {r.visible === false || r.isHidden ? "Show" : "Hide"}
              </button>
              <button
                onClick={() => onDelete(r.id)}
                className="px-3 py-2 rounded-xl bg-[color-mix(in_srgb,var(--color-danger)_80%,transparent)] hover:bg-[var(--color-danger)] text-sm"
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

function CertificatesAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    level: "",
    title: "",
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
      <h2 className="text-2xl font-semibold mb-4">Certificates</h2>
      {error && (
        <div className="bg-[color-mix(in_srgb,var(--color-danger)_25%,transparent)] border border-[var(--color-danger)] text-[var(--color-warning)] px-6 py-3 rounded-2xl mb-4">
          {error}
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className="mt-4 flex items-center justify-between">
          <label className="inline-flex items-center gap-2 text-[var(--color-text-muted)]">
            <input
              type="checkbox"
              checked={form.visible}
              onChange={(e) => setForm({ ...form, visible: e.target.checked })}
            />
            Visible
          </label>
          <div className="flex gap-3">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-xl bg-[var(--color-muted-strong)] hover:bg-[var(--color-muted-surface)]"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-strong)]"
            >
              {editingId ? "Update Certificate" : "Add Certificate"}
            </button>
          </div>
        </div>
      </form>

      <div className="flex items-center justify-between mb-4">
        <div className="text-[var(--color-text-muted)]">
          {loading ? "Loading..." : `${filtered.length} item(s)`}
        </div>
        <div className="w-72">
          <Input placeholder="Search..." value={search} onChange={setSearch} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-[color-mix(in_srgb,var(--color-text)_90%,transparent)] truncate">
                {c.title}
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  c.visible === false || c.isHidden
                    ? "bg-[var(--color-muted-strong)] text-[var(--color-text)]"
                    : "bg-[color-mix(in_srgb,var(--color-success)_30%,transparent)] text-[var(--color-success)]"
                }`}
              >
                {c.visible === false || c.isHidden ? "Hidden" : "Visible"}
              </span>
            </div>
            <div className="text-sm text-[var(--color-text-muted)] mb-1">
              Level {c.level}
            </div>
            <div className="text-sm text-[var(--color-text-muted)] mb-3">
              by {c.firstName} · by {c.secondName}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(c)}
                className="px-3 py-2 rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_80%,transparent)] hover:bg-[var(--color-primary)] text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => onToggleVisibility(c)}
                className="px-3 py-2 rounded-xl bg-[color-mix(in_srgb,var(--color-warning)_80%,transparent)] hover:bg-[var(--color-warning)] text-sm"
              >
                {c.visible === false || c.isHidden ? "Show" : "Hide"}
              </button>
              <button
                onClick={() => onDelete(c.id)}
                className="px-3 py-2 rounded-xl bg-[color-mix(in_srgb,var(--color-danger)_80%,transparent)] hover:bg-[var(--color-danger)] text-sm"
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

function ChallengesAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    week: "",
    challengeUrl: "",
    startDate: "",
    endDate: "",
    visible: true,
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const data = await adminChallengesApi.list(true);
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
    const payload = {
      title: form.title,
      description: form.description,
      week: form.week ? parseInt(form.week) : null,
      challengeUrl: form.challengeUrl || null,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      visible: form.visible,
    };
    try {
      if (editingId) {
        await adminChallengesApi.update(editingId, payload);
      } else {
        await adminChallengesApi.create(payload);
      }
      resetForm();
      await load();
    } catch (err) {
      handleErr(err, setError);
    }
  };

  const onEdit = (c) => {
    console.log("Editing challenge:", c); // Debug log
    setEditingId(c.id);

    // Helper function to format date for input[type="date"]
    const formatDateForInput = (dateString) => {
      if (!dateString) return "";
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "";
        // Format as YYYY-MM-DD
        const formatted = date.toISOString().split("T")[0];
        console.log("Formatted date:", dateString, "->", formatted); // Debug log
        return formatted;
      } catch (error) {
        console.error("Date formatting error:", error);
        return "";
      }
    };

    const formData = {
      title: c.title || "",
      description: c.description || "",
      week: c.week !== null && c.week !== undefined ? String(c.week) : "",
      challengeUrl: c.challengeUrl || "",
      startDate: formatDateForInput(c.startDate),
      endDate: formatDateForInput(c.endDate),
      visible: c.visible !== false && c.isHidden !== true,
    };

    console.log("Setting form data:", formData); // Debug log
    setForm(formData);
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this challenge?")) return;
    try {
      await adminChallengesApi.remove(id);
      await load();
    } catch (err) {
      handleErr(err, setError);
    }
  };

  const onToggleVisibility = async (c) => {
    try {
      await adminChallengesApi.setVisibility(c.id, !(c.visible ?? !c.isHidden));
      await load();
    } catch (err) {
      handleErr(err, setError);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      title: "",
      description: "",
      week: "",
      challengeUrl: "",
      startDate: "",
      endDate: "",
      visible: true,
    });
  };

  const filtered = items.filter((c) => {
    const q = search.toLowerCase();
    return (
      (c.title || "").toLowerCase().includes(q) ||
      (c.description || "").toLowerCase().includes(q)
    );
  });

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Challenges</h2>
      {error && (
        <div className="bg-[color-mix(in_srgb,var(--color-danger)_25%,transparent)] border border-[var(--color-danger)] text-[var(--color-warning)] px-6 py-3 rounded-2xl mb-4">
          {error}
        </div>
      )}

      {/* Create / Edit form */}
      <form
        onSubmit={onSubmit}
        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Title"
            value={form.title}
            onChange={(v) => setForm({ ...form, title: v })}
            required
          />
          <Input
            label="Week (Number)"
            type="number"
            value={form.week}
            onChange={(v) => setForm({ ...form, week: v })}
            placeholder="e.g., 5"
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(v) => setForm({ ...form, description: v })}
            className="md:col-span-2"
          />
          <Input
            label="Challenge URL"
            value={form.challengeUrl}
            onChange={(v) => setForm({ ...form, challengeUrl: v })}
            placeholder="e.g., https://github.com/uj-ai-club/challenge-5"
          />
          <Input
            label="Start Date"
            type="date"
            value={form.startDate}
            onChange={(v) => setForm({ ...form, startDate: v })}
          />
          <Input
            label="End Date"
            type="date"
            value={form.endDate}
            onChange={(v) => setForm({ ...form, endDate: v })}
          />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <label className="inline-flex items-center gap-2 text-[var(--color-text-muted)]">
            <input
              type="checkbox"
              checked={form.visible}
              onChange={(e) => setForm({ ...form, visible: e.target.checked })}
            />
            Visible
          </label>
          <div className="flex gap-3">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-xl bg-[var(--color-muted-strong)] hover:bg-[var(--color-muted-surface)]"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-strong)]"
            >
              {editingId ? "Update Challenge" : "Add Challenge"}
            </button>
          </div>
        </div>
      </form>

      <div className="flex items-center justify-between mb-4">
        <div className="text-[var(--color-text-muted)]">
          {loading ? "Loading..." : `${filtered.length} item(s)`}
        </div>
        <div className="w-72">
          <Input placeholder="Search..." value={search} onChange={setSearch} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-[color-mix(in_srgb,var(--color-text)_90%,transparent)] truncate">
                {c.title}
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  c.visible === false || c.isHidden
                    ? "bg-[var(--color-muted-strong)] text-[var(--color-text)]"
                    : "bg-[color-mix(in_srgb,var(--color-success)_30%,transparent)] text-[var(--color-success)]"
                }`}
              >
                {c.visible === false || c.isHidden ? "Hidden" : "Visible"}
              </span>
            </div>
            <div className="text-sm text-[var(--color-text-muted)] mb-3 line-clamp-2">
              {c.description}
            </div>
            <div className="text-xs text-[var(--color-text-muted)] mb-3">
              {c.startDate ? `Start: ${fmtDate(c.startDate)}` : ""}
              {c.endDate ? ` · End: ${fmtDate(c.endDate)}` : ""}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(c)}
                className="px-3 py-2 rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_80%,transparent)] hover:bg-[var(--color-primary)] text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => onToggleVisibility(c)}
                className="px-3 py-2 rounded-xl bg-[color-mix(in_srgb,var(--color-warning)_80%,transparent)] hover:bg-[var(--color-warning)] text-sm"
              >
                {c.visible === false || c.isHidden ? "Show" : "Hide"}
              </button>
              <button
                onClick={() => onDelete(c.id)}
                className="px-3 py-2 rounded-xl bg-[color-mix(in_srgb,var(--color-danger)_80%,transparent)] hover:bg-[var(--color-danger)] text-sm"
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

function Input({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder = "",
  className = "",
}) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="block text-sm text-[var(--color-text-muted)] mb-1">
          {label}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-xl py-3 px-4 text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-strong)]"
      />
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
  placeholder = "",
  className = "",
}) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="block text-sm text-[var(--color-text-muted)] mb-1">
          {label}
        </span>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-xl py-3 px-4 text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-strong)]"
      />
    </label>
  );
}

function FileInput({ label, onChange, className = "" }) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="block text-sm text-[var(--color-text-muted)] mb-1">
          {label}
        </span>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onChange(e.target.files[0] || null)}
        className="w-full bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-xl py-3 px-4 text-sm text-[var(--color-text-muted)] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[var(--color-primary)] file:text-[var(--color-text)] hover:file:bg-[var(--color-primary-strong)] focus:outline-none focus:border-[var(--color-border-strong)]"
      />
    </label>
  );
}

function toResourcePayload(form) {
  const payload = new FormData();
  payload.append("title", form.title);
  payload.append("provider", form.provider);
  payload.append("notionUrl", form.notionUrl || "");
  payload.append("instructorName", form.instructorName || "");
  payload.append("visible", form.visible);

  if (form.coverImage) {
    payload.append("coverImage", form.coverImage);
  }
  if (form.instructorImage) {
    payload.append("instructorImage", form.instructorImage);
  }

  return payload;
}

function toCertificatePayload(form) {
  const payload = new FormData();
  payload.append("level", form.level);
  payload.append("title", form.title);
  payload.append("firstName", form.firstName || "");
  payload.append("secondName", form.secondName || "");
  payload.append("courseraUrl", form.courseraUrl || "");
  payload.append("youtubeUrl", form.youtubeUrl || "");
  payload.append("visible", form.visible);

  if (form.coverImage) {
    payload.append("coverImage", form.coverImage);
  }

  return payload;
}

function fmtDate(s) {
  try {
    return new Date(s).toLocaleDateString();
  } catch {
    return s;
  }
}

function handleErr(err, setError) {
  if (err instanceof ApiError) {
    setError(err.data?.message || err.message);
  } else {
    setError("Something went wrong");
  }
}

// ===========================================
// Notebooks Admin Section
// ===========================================

function NotebooksAdmin() {
  const [notebooks, setNotebooks] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    challengeId: "",
    assignmentName: "",
    notebookFile: null,
    maxPoints: "100",
    cpuLimit: "0.5",
    memoryLimit: "512M",
    timeLimitMinutes: "60",
    networkDisabled: true,
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const [notebooksData, challengesData] = await Promise.all([
        adminNotebooksApi.list(),
        adminChallengesApi.list(true),
      ]);
      setNotebooks(notebooksData.items || notebooksData || []);
      setChallenges(challengesData.items || challengesData || []);
      setError("");
    } catch (err) {
      handleErr(err, setError);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        // Update notebook settings (not file)
        await adminNotebooksApi.update(editingId, {
          assignmentName: form.assignmentName,
          maxPoints: parseInt(form.maxPoints),
          cpuLimit: parseFloat(form.cpuLimit),
          memoryLimit: form.memoryLimit,
          timeLimitMinutes: parseInt(form.timeLimitMinutes),
          networkDisabled: form.networkDisabled,
        });
      } else {
        // Create new notebook with file upload
        const formData = new FormData();
        formData.append("challengeId", form.challengeId);
        formData.append("assignmentName", form.assignmentName);
        formData.append("maxPoints", form.maxPoints);
        formData.append("cpuLimit", form.cpuLimit);
        formData.append("memoryLimit", form.memoryLimit);
        formData.append("timeLimitMinutes", form.timeLimitMinutes);
        formData.append("networkDisabled", form.networkDisabled);
        if (form.notebookFile) {
          formData.append("notebook", form.notebookFile);
        }
        await adminNotebooksApi.create(formData);
      }
      resetForm();
      await load();
    } catch (err) {
      handleErr(err, setError);
    }
  };

  const onEdit = (nb) => {
    setEditingId(nb.id);
    setForm({
      challengeId: String(nb.challengeId),
      assignmentName: nb.assignmentName || "",
      notebookFile: null,
      maxPoints: String(nb.maxPoints || 100),
      cpuLimit: String(nb.cpuLimit || 0.5),
      memoryLimit: nb.memoryLimit || "512M",
      timeLimitMinutes: String(nb.timeLimitMinutes || 60),
      networkDisabled: nb.networkDisabled !== false,
    });
  };

  const onDelete = async (id) => {
    if (
      !confirm(
        "Delete this notebook? Students who have started will lose their progress.",
      )
    )
      return;
    try {
      await adminNotebooksApi.remove(id);
      await load();
    } catch (err) {
      handleErr(err, setError);
    }
  };

  // Open notebook in JupyterHub for editing grading cells
  const onEditInJupyterHub = async (notebookId) => {
    try {
      setError("");
      setSuccess("");
      const result = await adminNotebooksApi.getEditUrl(notebookId);
      if (result.success && result.jupyterhubUrl) {
        setSuccess(result.message);
        // Open JupyterHub in a new tab
        window.open(result.jupyterhubUrl, "_blank");
      } else {
        setError("Failed to get JupyterHub URL");
      }
    } catch (err) {
      handleErr(err, setError);
    }
  };

  // Sync notebook to nbgrader source directory
  const onSyncToNbgrader = async (notebookId) => {
    try {
      setError("");
      setSuccess("");
      const result = await adminNotebooksApi.syncToNbgrader(notebookId);
      if (result.success) {
        setSuccess(result.message);
      } else {
        setError(result.message || "Failed to sync notebook");
      }
    } catch (err) {
      handleErr(err, setError);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      challengeId: "",
      assignmentName: "",
      notebookFile: null,
      maxPoints: "100",
      cpuLimit: "0.5",
      memoryLimit: "512M",
      timeLimitMinutes: "60",
      networkDisabled: true,
    });
  };

  // Get challenge title by ID
  const getChallengeTitle = (challengeId) => {
    const challenge = challenges.find((c) => c.id === challengeId);
    return challenge ? challenge.title : `Challenge #${challengeId}`;
  };

  // Get challenges that don't have a notebook yet
  const availableChallenges = challenges.filter(
    (c) => !notebooks.some((nb) => nb.challengeId === c.id),
  );

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Challenge Notebooks</h2>
      <p className="text-[var(--color-text-muted)] mb-6">
        Upload Jupyter notebooks for challenges. Students will complete these
        notebooks and be auto-graded using nbgrader.
      </p>

      {/* Grading Setup Instructions */}
      <div className="bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] border border-[var(--color-primary)] text-[var(--color-primary-soft)] px-6 py-4 rounded-2xl mb-6">
        <h3 className="font-semibold mb-2">📝 Setting Up Grading Cells</h3>
        <p className="text-sm mb-2">
          For notebooks to be graded properly, you need to add special markers:
        </p>
        <ul className="text-sm list-disc list-inside space-y-1">
          <li>
            <code className="bg-[color-mix(in_srgb,var(--color-primary-strong)_50%,transparent)] px-1 rounded">
              ### BEGIN SOLUTION
            </code>{" "}
            and{" "}
            <code className="bg-[color-mix(in_srgb,var(--color-primary-strong)_50%,transparent)] px-1 rounded">
              ### END SOLUTION
            </code>{" "}
            - wrap the solution code
          </li>
          <li>
            <code className="bg-[color-mix(in_srgb,var(--color-primary-strong)_50%,transparent)] px-1 rounded">
              ### BEGIN HIDDEN TESTS
            </code>{" "}
            and{" "}
            <code className="bg-[color-mix(in_srgb,var(--color-primary-strong)_50%,transparent)] px-1 rounded">
              ### END HIDDEN TESTS
            </code>{" "}
            - wrap hidden test cases
          </li>
        </ul>
        <p className="text-sm mt-2">
          Click <strong>"Edit in JupyterHub"</strong> to add these markers, then{" "}
          <strong>"Sync to nbgrader"</strong> to apply changes.
        </p>
      </div>

      {error && (
        <div className="bg-[color-mix(in_srgb,var(--color-danger)_25%,transparent)] border border-[var(--color-danger)] text-[var(--color-warning)] px-6 py-3 rounded-2xl mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-[color-mix(in_srgb,var(--color-success)_25%,transparent)] border border-[var(--color-success)] text-[var(--color-success)] px-6 py-3 rounded-2xl mb-4">
          {success}
        </div>
      )}

      {/* Create / Edit form */}
      <form
        onSubmit={onSubmit}
        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 mb-8"
      >
        <h3 className="text-lg font-medium mb-4">
          {editingId ? "Edit Notebook Settings" : "Upload New Notebook"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Challenge Selection */}
          <label className="block">
            <span className="block text-sm text-[var(--color-text-muted)] mb-1">
              Challenge *
            </span>
            <select
              value={form.challengeId}
              onChange={(e) =>
                setForm({ ...form, challengeId: e.target.value })
              }
              disabled={editingId !== null}
              required
              className="w-full bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[var(--color-border-strong)] disabled:opacity-50"
            >
              <option value="">Select a challenge</option>
              {(editingId ? challenges : availableChallenges).map((c) => (
                <option key={c.id} value={c.id}>
                  Week {c.week || "?"} - {c.title}
                </option>
              ))}
            </select>
          </label>

          {/* Assignment Name */}
          <Input
            label="Assignment Name *"
            value={form.assignmentName}
            onChange={(v) => setForm({ ...form, assignmentName: v })}
            required
            placeholder="e.g., week5_challenge"
          />

          {/* Notebook File Upload (only for new) */}
          {!editingId && (
            <label className="block">
              <span className="block text-sm text-[var(--color-text-muted)] mb-1">
                Notebook File (.ipynb) *
              </span>
              <input
                type="file"
                accept=".ipynb"
                onChange={(e) =>
                  setForm({ ...form, notebookFile: e.target.files[0] || null })
                }
                required={!editingId}
                className="w-full bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-xl py-3 px-4 text-sm text-[var(--color-text-muted)] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[var(--color-accent)] file:text-[var(--color-text)] hover:file:bg-[var(--color-accent-strong)] focus:outline-none focus:border-[var(--color-border-strong)]"
              />
            </label>
          )}

          {/* Max Points */}
          <Input
            label="Max Points"
            type="number"
            value={form.maxPoints}
            onChange={(v) => setForm({ ...form, maxPoints: v })}
            placeholder="100"
          />

          {/* CPU Limit */}
          <Input
            label="CPU Limit (cores)"
            type="number"
            step="0.1"
            value={form.cpuLimit}
            onChange={(v) => setForm({ ...form, cpuLimit: v })}
            placeholder="0.5"
          />

          {/* Memory Limit */}
          <label className="block">
            <span className="block text-sm text-[var(--color-text-muted)] mb-1">
              Memory Limit
            </span>
            <select
              value={form.memoryLimit}
              onChange={(e) =>
                setForm({ ...form, memoryLimit: e.target.value })
              }
              className="w-full bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[var(--color-border-strong)]"
            >
              <option value="256M">256 MB</option>
              <option value="512M">512 MB</option>
              <option value="1G">1 GB</option>
              <option value="2G">2 GB</option>
            </select>
          </label>

          {/* Time Limit */}
          <Input
            label="Time Limit (minutes)"
            type="number"
            value={form.timeLimitMinutes}
            onChange={(v) => setForm({ ...form, timeLimitMinutes: v })}
            placeholder="60"
          />
        </div>

        {/* Network Disabled */}
        <div className="mt-4">
          <label className="inline-flex items-center gap-2 text-[var(--color-text-muted)]">
            <input
              type="checkbox"
              checked={form.networkDisabled}
              onChange={(e) =>
                setForm({ ...form, networkDisabled: e.target.checked })
              }
            />
            <span>Disable Network Access (recommended for security)</span>
          </label>
        </div>

        <div className="mt-4 flex items-center justify-end gap-3">
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-xl bg-[var(--color-muted-strong)] hover:bg-[var(--color-muted-surface)]"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-strong)]"
          >
            {editingId ? "Update Settings" : "Upload Notebook"}
          </button>
        </div>
      </form>

      {/* Notebooks List */}
      <div className="text-[var(--color-text-muted)] mb-4">
        {loading ? "Loading..." : `${notebooks.length} notebook(s)`}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notebooks.map((nb) => (
          <div
            key={nb.id}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-[color-mix(in_srgb,var(--color-text)_90%,transparent)] truncate">
                {getChallengeTitle(nb.challengeId)}
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-[color-mix(in_srgb,var(--color-accent)_30%,transparent)] text-[var(--color-accent-soft)]">
                {nb.maxPoints} pts
              </span>
            </div>
            <div className="text-sm text-[var(--color-text-muted)] mb-2">
              Assignment:{" "}
              <span className="text-[var(--color-text)]">
                {nb.assignmentName}
              </span>
            </div>
            <div className="text-xs text-[var(--color-text-muted)] mb-2">
              File: {nb.notebookFilename}
            </div>
            <div className="text-xs text-[var(--color-text-muted)] mb-3">
              CPU: {nb.cpuLimit} | RAM: {nb.memoryLimit} | Time:{" "}
              {nb.timeLimitMinutes}min
              {nb.networkDisabled && " | 🔒 No Network"}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onEditInJupyterHub(nb.id)}
                className="px-3 py-2 rounded-xl bg-[color-mix(in_srgb,var(--color-primary-strong)_80%,transparent)] hover:bg-[var(--color-primary-strong)] text-sm"
                title="Open in JupyterHub to edit grading cells"
              >
                📝 Edit in JupyterHub
              </button>
              <button
                onClick={() => onSyncToNbgrader(nb.id)}
                className="px-3 py-2 rounded-xl bg-[color-mix(in_srgb,var(--color-success)_80%,transparent)] hover:bg-[var(--color-success)] text-sm"
                title="Sync notebook to nbgrader for grading"
              >
                🔄 Sync to nbgrader
              </button>
              <button
                onClick={() => onEdit(nb)}
                className="px-3 py-2 rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_80%,transparent)] hover:bg-[var(--color-primary)] text-sm"
              >
                Settings
              </button>
              <button
                onClick={() => onDelete(nb.id)}
                className="px-3 py-2 rounded-xl bg-[color-mix(in_srgb,var(--color-danger)_80%,transparent)] hover:bg-[var(--color-danger)] text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {notebooks.length === 0 && !loading && (
        <div className="text-center text-[var(--color-text-muted)] py-8">
          No notebooks uploaded yet. Upload a notebook to enable auto-grading
          for challenges.
        </div>
      )}
    </section>
  );
}

// ===========================================
// Submissions Admin Section
// ===========================================

function SubmissionsAdmin() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all, graded, in_progress, not_started

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const data = await adminSubmissionsApi.list();
      setSubmissions(data.items || data || []);
      setError("");
    } catch (err) {
      handleErr(err, setError);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter((s) => {
    if (filter === "all") return true;
    return s.status === filter;
  });

  const statusColors = {
    not_started: "bg-[var(--color-muted-strong)]",
    in_progress: "bg-[var(--color-warning)]",
    submitted: "bg-[var(--color-primary)]",
    grading: "bg-[var(--color-primary-strong)]",
    graded: "bg-[var(--color-success)]",
    error: "bg-[var(--color-danger)]",
  };

  // Statistics
  const stats = {
    total: submissions.length,
    graded: submissions.filter((s) => s.status === "graded").length,
    inProgress: submissions.filter((s) => s.status === "in_progress").length,
    totalPoints: submissions
      .filter((s) => s.pointsCredited)
      .reduce((sum, s) => sum + s.pointsAwarded, 0),
  };

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Challenge Submissions</h2>
      <p className="text-[var(--color-text-muted)] mb-6">
        View and monitor student submissions for notebook challenges.
      </p>

      {error && (
        <div className="bg-[color-mix(in_srgb,var(--color-danger)_25%,transparent)] border border-[var(--color-danger)] text-[var(--color-warning)] px-6 py-3 rounded-2xl mb-4">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 text-center">
          <div className="text-3xl font-bold text-[var(--color-text)]">
            {stats.total}
          </div>
          <div className="text-sm text-[var(--color-text-muted)]">
            Total Submissions
          </div>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 text-center">
          <div className="text-3xl font-bold text-[var(--color-success)]">
            {stats.graded}
          </div>
          <div className="text-sm text-[var(--color-text-muted)]">Graded</div>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 text-center">
          <div className="text-3xl font-bold text-[var(--color-warning)]">
            {stats.inProgress}
          </div>
          <div className="text-sm text-[var(--color-text-muted)]">
            In Progress
          </div>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 text-center">
          <div className="text-3xl font-bold text-[var(--color-accent)]">
            {stats.totalPoints}
          </div>
          <div className="text-sm text-[var(--color-text-muted)]">
            Total Points Awarded
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4 mb-6">
        <span className="text-[var(--color-text-muted)]">Filter:</span>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-1 inline-flex">
          {["all", "graded", "in_progress", "submitted", "not_started"].map(
            (f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  filter === f
                    ? "bg-[var(--color-primary)] text-[var(--color-text)]"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                }`}
              >
                {f.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </button>
            ),
          )}
        </div>
        <button
          onClick={load}
          className="ml-auto px-4 py-2 rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_80%,transparent)] hover:bg-[var(--color-primary)] text-sm"
        >
          Refresh
        </button>
      </div>

      {/* Submissions Table */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[color-mix(in_srgb,var(--color-primary-strong)_20%,transparent)]">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-[var(--color-text-muted)]">
                  User
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[var(--color-text-muted)]">
                  Challenge
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[var(--color-text-muted)]">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[var(--color-text-muted)]">
                  Score
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[var(--color-text-muted)]">
                  Points
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[var(--color-text-muted)]">
                  Started
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[var(--color-text-muted)]">
                  Graded
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color-mix(in_srgb,var(--color-primary-strong)_20%,transparent)]">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-[var(--color-text-muted)]"
                  >
                    Loading...
                  </td>
                </tr>
              ) : filteredSubmissions.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-[var(--color-text-muted)]"
                  >
                    No submissions found
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-[color-mix(in_srgb,var(--color-primary-strong)_10%,transparent)]"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-[var(--color-text)]">
                        {s.userName}
                      </div>
                      <div className="text-xs text-[var(--color-text-muted)]">
                        {s.userEmail}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">
                      {s.challengeTitle}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          statusColors[s.status] ||
                          "bg-[var(--color-muted-strong)]"
                        }`}
                      >
                        {s.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">
                      {s.score !== null && s.maxScore !== null
                        ? `${s.score}/${s.maxScore}`
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          s.pointsCredited
                            ? "text-[var(--color-success)]"
                            : "text-[var(--color-text-muted)]"
                        }
                      >
                        {s.pointsAwarded} pts
                      </span>
                      {s.pointsCredited && (
                        <span className="ml-1 text-xs text-[var(--color-success)]">
                          ✓
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--color-text-muted)]">
                      {s.startedAt ? fmtDateTime(s.startedAt) : "-"}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--color-text-muted)]">
                      {s.gradedAt ? fmtDateTime(s.gradedAt) : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function fmtDateTime(s) {
  try {
    return new Date(s).toLocaleString();
  } catch {
    return s;
  }
}
