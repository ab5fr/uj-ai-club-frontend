"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import {
  ApiError,
  adminChallengesApi,
  adminCertificatesApi,
  adminResourcesApi,
  adminNotebooksApi,
  adminSubmissionsApi,
  adminContactMessagesApi,
} from "@/lib/api";
import {
  formatBackendDate,
  formatBackendDateTime,
} from "@/lib/formatDate";

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
    return user.role === "admin" || user.isAdmin === true;
  }, [user]);

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
            Manage resources, challenges, notebooks, submissions, and contact
            messages.
          </p>
        </div>
      </div>

      <section className="section admin-section">
        <div className="container">
          <div className="admin-tabs">
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
            <TabButton
              label="Messages"
              active={activeTab === "messages"}
              onClick={() => setActiveTab("messages")}
            />
          </div>

          {activeTab === "resources" && <ResourcesAdmin />}
          {activeTab === "certificates" && <CertificatesAdmin />}
          {activeTab === "challenges" && <ChallengesAdmin />}
          {activeTab === "notebooks" && <NotebooksAdmin />}
          {activeTab === "submissions" && <SubmissionsAdmin />}
          {activeTab === "messages" && <ContactMessagesAdmin />}
        </div>
      </section>
    </main>
  );
}

function TabButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`admin-tab${active ? " active" : ""}`}
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
              <button type="button" onClick={resetForm} className="btn btn-outline">
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
              <button onClick={() => onEdit(r)} className="btn btn-primary btn-sm">
                Edit
              </button>
              <button
                onClick={() => onToggleVisibility(r)}
                className="btn btn-warning btn-sm"
              >
                {r.visible === false || r.isHidden ? "Show" : "Hide"}
              </button>
              <button onClick={() => onDelete(r.id)} className="btn btn-danger btn-sm">
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
    allowedSubmissions: "3",
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
      allowedSubmissions: form.allowedSubmissions
        ? parseInt(form.allowedSubmissions)
        : 3,
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
    setEditingId(c.id);

    // Helper function to format date for input[type="date"]
    const formatDateForInput = (dateString) => {
      if (!dateString) return "";
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "";
        // Format as YYYY-MM-DD
        return date.toISOString().split("T")[0];
      } catch (error) {
        console.error("Date formatting error:", error);
        return "";
      }
    };

    const formData = {
      title: c.title || "",
      description: c.description || "",
      week: c.week !== null && c.week !== undefined ? String(c.week) : "",
      allowedSubmissions:
        c.allowedSubmissions !== null && c.allowedSubmissions !== undefined
          ? String(c.allowedSubmissions)
          : "3",
      challengeUrl: c.challengeUrl || "",
      startDate: formatDateForInput(c.startDate),
      endDate: formatDateForInput(c.endDate),
      visible: c.visible !== false && c.isHidden !== true,
    };

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
      allowedSubmissions: "3",
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
      <h2 className="admin-section-title">Challenges</h2>
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
            label="Week (Number)"
            type="number"
            value={form.week}
            onChange={(v) => setForm({ ...form, week: v })}
            placeholder="e.g., 5"
          />
          <Input
            label="Allowed Submissions"
            type="number"
            value={form.allowedSubmissions}
            onChange={(v) => setForm({ ...form, allowedSubmissions: v })}
            placeholder="e.g., 3"
            required
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(v) => setForm({ ...form, description: v })}
            className="form-group--full"
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
              {editingId ? "Update Challenge" : "Add Challenge"}
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
            <div className="admin-item__meta">{c.description}</div>
            <div className="admin-item__meta admin-item__meta--sm">
              Allowed submissions: {c.allowedSubmissions ?? 3}
            </div>
            <div className="admin-item__meta admin-item__meta--sm">
              {c.startDate ? `Start: ${fmtDate(c.startDate)}` : ""}
              {c.endDate ? ` · End: ${fmtDate(c.endDate)}` : ""}
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
    <div className={`form-group ${className}`}>
      {label && <label className="form-label">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="form-input"
      />
    </div>
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
    <div className={`form-group ${className}`}>
      {label && <label className="form-label">{label}</label>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="form-textarea"
      />
    </div>
  );
}

function FileInput({ label, onChange, className = "", accept = "image/*" }) {
  return (
    <div className={`form-group ${className}`}>
      {label && <label className="form-label">{label}</label>}
      <input
        type="file"
        accept={accept}
        onChange={(e) => onChange(e.target.files[0] || null)}
        className="form-input"
      />
    </div>
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
  payload.append("courseTitle", form.courseTitle || "");
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

function fmtDate(value) {
  return formatBackendDate(value);
}

function fmtDateTime(value) {
  return formatBackendDateTime(value);
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
      <h2 className="admin-section-title">Challenge Notebooks</h2>
      <p className="admin-section-desc">
        Upload Jupyter notebooks for challenges. Students will complete these
        notebooks and be auto-graded using nbgrader.
      </p>

      <div className="admin-alert admin-alert--info">
        <h3 className="admin-form-title">Setting Up Grading Cells</h3>
        <p className="admin-section-desc" style={{ marginBottom: ".75rem" }}>
          For notebooks to be graded properly, you need to add special markers:
        </p>
        <ul className="admin-markdown">
          <li>
            <code>### BEGIN SOLUTION</code> and <code>### END SOLUTION</code> —
            wrap the solution code
          </li>
          <li>
            <code>### BEGIN HIDDEN TESTS</code> and{" "}
            <code>### END HIDDEN TESTS</code> — wrap hidden test cases
          </li>
        </ul>
        <p className="admin-section-desc" style={{ marginBottom: 0, marginTop: ".75rem" }}>
          Click <strong>Edit in JupyterHub</strong> to add these markers, then{" "}
          <strong>Sync to nbgrader</strong> to apply changes.
        </p>
      </div>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}
      {success && <div className="admin-alert admin-alert--success">{success}</div>}

      <form onSubmit={onSubmit} className="card admin-form">
        <h3 className="admin-form-title">
          {editingId ? "Edit Notebook Settings" : "Upload New Notebook"}
        </h3>

        <div className="admin-form-grid">
          <div className="form-group">
            <label className="form-label">Challenge *</label>
            <select
              value={form.challengeId}
              onChange={(e) =>
                setForm({ ...form, challengeId: e.target.value })
              }
              disabled={editingId !== null}
              required
              className="form-select"
            >
              <option value="">Select a challenge</option>
              {(editingId ? challenges : availableChallenges).map((c) => (
                <option key={c.id} value={c.id}>
                  Week {c.week || "?"} - {c.title}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Assignment Name *"
            value={form.assignmentName}
            onChange={(v) => setForm({ ...form, assignmentName: v })}
            required
            placeholder="e.g., week5_challenge"
          />

          {!editingId && (
            <FileInput
              label="Notebook File (.ipynb) *"
              accept=".ipynb"
              onChange={(file) => setForm({ ...form, notebookFile: file })}
            />
          )}

          <Input
            label="Max Points"
            type="number"
            value={form.maxPoints}
            onChange={(v) => setForm({ ...form, maxPoints: v })}
            placeholder="100"
          />

          <Input
            label="CPU Limit (cores)"
            type="number"
            step="0.1"
            value={form.cpuLimit}
            onChange={(v) => setForm({ ...form, cpuLimit: v })}
            placeholder="0.5"
          />

          <div className="form-group">
            <label className="form-label">Memory Limit</label>
            <select
              value={form.memoryLimit}
              onChange={(e) =>
                setForm({ ...form, memoryLimit: e.target.value })
              }
              className="form-select"
            >
              <option value="256M">256 MB</option>
              <option value="512M">512 MB</option>
              <option value="1G">1 GB</option>
              <option value="2G">2 GB</option>
            </select>
          </div>

          <Input
            label="Time Limit (minutes)"
            type="number"
            value={form.timeLimitMinutes}
            onChange={(v) => setForm({ ...form, timeLimitMinutes: v })}
            placeholder="60"
          />
        </div>

        <div style={{ marginTop: "1rem" }}>
          <label className="admin-check">
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

        <div className="admin-form-footer" style={{ justifyContent: "flex-end" }}>
          <div className="admin-form-actions">
            {editingId && (
              <button type="button" onClick={resetForm} className="btn btn-outline">
                Cancel
              </button>
            )}
            <button type="submit" className="btn btn-orange">
              {editingId ? "Update Settings" : "Upload Notebook"}
            </button>
          </div>
        </div>
      </form>

      <div className="admin-toolbar-meta" style={{ marginBottom: "1rem" }}>
        {loading ? "Loading..." : `${notebooks.length} notebook(s)`}
      </div>

      <div className="admin-card-grid">
        {notebooks.map((nb) => (
          <div key={nb.id} className="card admin-item">
            <div className="admin-item__head">
              <div className="admin-item__title">
                {getChallengeTitle(nb.challengeId)}
              </div>
              <span className="admin-badge admin-badge--points">
                {nb.maxPoints} pts
              </span>
            </div>
            <div className="admin-item__meta">
              Assignment: <span style={{ color: "var(--c-light)" }}>{nb.assignmentName}</span>
            </div>
            <div className="admin-item__meta admin-item__meta--sm">
              File: {nb.notebookFilename}
            </div>
            <div className="admin-item__meta admin-item__meta--sm">
              CPU: {nb.cpuLimit} | RAM: {nb.memoryLimit} | Time:{" "}
              {nb.timeLimitMinutes}min
              {nb.networkDisabled && " | No Network"}
            </div>
            <div className="admin-item__actions">
              <button
                onClick={() => onEditInJupyterHub(nb.id)}
                className="btn btn-primary btn-sm"
                title="Open in JupyterHub to edit grading cells"
              >
                Edit in JupyterHub
              </button>
              <button
                onClick={() => onSyncToNbgrader(nb.id)}
                className="btn btn-success btn-sm"
                title="Sync notebook to nbgrader for grading"
              >
                Sync to nbgrader
              </button>
              <button onClick={() => onEdit(nb)} className="btn btn-outline btn-sm">
                Settings
              </button>
              <button onClick={() => onDelete(nb.id)} className="btn btn-danger btn-sm">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {notebooks.length === 0 && !loading && (
        <div className="admin-empty">
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
  const router = useRouter();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [scoreInputs, setScoreInputs] = useState({});
  const [gradingSubmissionId, setGradingSubmissionId] = useState(null);
  const [accessingSubmissionId, setAccessingSubmissionId] = useState(null);

  const getFilenameFromDisposition = (contentDisposition, fallback) => {
    if (!contentDisposition) return fallback;

    const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match?.[1]) {
      try {
        return decodeURIComponent(utf8Match[1]);
      } catch {
        return utf8Match[1];
      }
    }

    const quotedMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
    if (quotedMatch?.[1]) return quotedMatch[1];

    return fallback;
  };

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

  const handleGrade = async (submissionId) => {
    const raw = scoreInputs[submissionId];
    const score = raw === undefined || raw === "" ? NaN : Number(raw);

    if (Number.isNaN(score) || score < 0 || score > 100) {
      setError("Score must be a number between 0 and 100.");
      return;
    }

    try {
      setGradingSubmissionId(submissionId);
      setError("");
      await adminSubmissionsApi.grade(submissionId, score);
      await load();
    } catch (err) {
      handleErr(err, setError);
    } finally {
      setGradingSubmissionId(null);
    }
  };

  const handleDownloadSubmission = async (submissionId) => {
    try {
      setAccessingSubmissionId(submissionId);
      setError("");
      const { blob, contentDisposition } =
        await adminSubmissionsApi.getFileBlob(submissionId, true);

      const objectUrl = URL.createObjectURL(blob);
      const fallbackName = `submission-${submissionId}.ipynb`;
      const filename = getFilenameFromDisposition(
        contentDisposition,
        fallbackName,
      );

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000);
    } catch (err) {
      handleErr(err, setError);
    } finally {
      setAccessingSubmissionId(null);
    }
  };

  const statusBadgeClass = (status) => {
    if (status === "graded") return "admin-badge--done";
    if (status === "in_progress") return "admin-badge--progress";
    if (status === "error") return "admin-badge--error";
    if (["submitted", "grading", "grading_pending"].includes(status)) {
      return "admin-badge--status";
    }
    return "admin-badge--hidden";
  };

  // Statistics
  const stats = {
    total: submissions.length,
    graded: submissions.filter((s) => s.status === "graded").length,
    inProgress: submissions.filter((s) => s.status === "in_progress").length,
    pending: submissions.filter((s) =>
      ["grading_pending", "submitted", "grading"].includes(s.status),
    ).length,
    totalPoints: submissions
      .filter((s) => s.pointsCredited)
      .reduce((sum, s) => sum + s.pointsAwarded, 0),
  };

  return (
    <section>
      <h2 className="admin-section-title">Challenge Submissions</h2>
      <p className="admin-section-desc">
        View and monitor student submissions for notebook challenges.
      </p>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}

      <div className="admin-stat-grid">
        <div className="card admin-stat">
          <div className="admin-stat__value">{stats.total}</div>
          <div className="admin-stat__label">Total Submissions</div>
        </div>
        <div className="card admin-stat">
          <div className="admin-stat__value admin-stat__value--success">
            {stats.graded}
          </div>
          <div className="admin-stat__label">Graded</div>
        </div>
        <div className="card admin-stat">
          <div className="admin-stat__value admin-stat__value--warning">
            {stats.inProgress}
          </div>
          <div className="admin-stat__label">In Progress</div>
        </div>
        <div className="card admin-stat">
          <div className="admin-stat__value admin-stat__value--primary">
            {stats.pending}
          </div>
          <div className="admin-stat__label">Pending</div>
        </div>
        <div className="card admin-stat">
          <div className="admin-stat__value admin-stat__value--accent">
            {stats.totalPoints}
          </div>
          <div className="admin-stat__label">Total Points Awarded</div>
        </div>
      </div>

      <div className="admin-filter">
        <span className="admin-filter__label">Filter:</span>
        <div className="admin-filter__group">
          {[
            "all",
            "grading_pending",
            "graded",
            "in_progress",
            "not_started",
          ].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`admin-filter__btn${filter === f ? " active" : ""}`}
            >
              {f.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={load}
          className="btn btn-primary btn-sm"
          style={{ marginLeft: "auto" }}
        >
          Refresh
        </button>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Challenge</th>
                <th>Attempt</th>
                <th>Status</th>
                <th>Score</th>
                <th>Points</th>
                <th>Started</th>
                <th>Graded</th>
                <th>Submission</th>
                <th>Manual Grade</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="admin-table__empty">
                    Loading...
                  </td>
                </tr>
              ) : filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="admin-table__empty">
                    No submissions found
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className="admin-table__primary">{s.userName}</div>
                      <div className="admin-table__sub">{s.userEmail}</div>
                    </td>
                    <td>{s.challengeTitle}</td>
                    <td>
                      {s.attemptNumber}/{s.allowedSubmissions}
                    </td>
                    <td>
                      <span className={`admin-badge ${statusBadgeClass(s.status)}`}>
                        {s.status.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      {s.score !== null && s.maxScore !== null
                        ? `${s.score}/${s.maxScore}`
                        : "-"}
                    </td>
                    <td>
                      <span
                        className={
                          s.pointsCredited ? "admin-points--credited" : ""
                        }
                      >
                        {s.pointsAwarded} pts
                      </span>
                      {s.pointsCredited && (
                        <span className="admin-points--credited"> ✓</span>
                      )}
                    </td>
                    <td>{s.startedAt ? fmtDateTime(s.startedAt) : "-"}</td>
                    <td>{s.gradedAt ? fmtDateTime(s.gradedAt) : "-"}</td>
                    <td>
                      <div className="admin-table__actions">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/admin/submissions/${s.id}`)
                          }
                          disabled={accessingSubmissionId === s.id}
                          className="btn btn-primary btn-sm"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadSubmission(s.id)}
                          disabled={accessingSubmissionId === s.id}
                          className="btn btn-warning btn-sm"
                        >
                          Download
                        </button>
                      </div>
                    </td>
                    <td>
                      {[
                        "grading_pending",
                        "submitted",
                        "grading",
                        "graded",
                      ].includes(s.status) ? (
                        <div className="admin-table__grade">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={scoreInputs[s.id] ?? ""}
                            onChange={(e) =>
                              setScoreInputs((prev) => ({
                                ...prev,
                                [s.id]: e.target.value,
                              }))
                            }
                            placeholder="0-100"
                            className="form-input admin-table__grade-input"
                          />
                          <button
                            type="button"
                            onClick={() => handleGrade(s.id)}
                            disabled={gradingSubmissionId === s.id}
                            className="btn btn-success btn-sm"
                          >
                            {gradingSubmissionId === s.id
                              ? "Saving..."
                              : "Set Grade"}
                          </button>
                        </div>
                      ) : (
                        <span className="admin-table__sub">-</span>
                      )}
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


function ContactMessagesAdmin() {
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
