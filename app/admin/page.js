"use client";

import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError, adminChallengesApi, adminResourcesApi } from "@/lib/api";

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
      <main className="min-h-screen bg-[#121522] text-white pt-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-4xl font-bold mb-6">Admin</h1>
          <div className="bg-yellow-500/10 border border-yellow-600 text-yellow-200 px-6 py-4 rounded-2xl">
            You must be an administrator to access this page.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#121522] text-white pt-24">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <div className="bg-[#0a1225] border border-blue-900/30 rounded-2xl p-1">
            <TabButton
              label="Resources"
              active={activeTab === "resources"}
              onClick={() => setActiveTab("resources")}
            />
            <TabButton
              label="Challenges"
              active={activeTab === "challenges"}
              onClick={() => setActiveTab("challenges")}
            />
          </div>
        </div>

        {activeTab === "resources" ? <ResourcesAdmin /> : <ChallengesAdmin />}
      </div>
    </main>
  );
}

function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
        active ? "bg-blue-600 text-white" : "text-gray-300 hover:text-white"
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
        <div className="bg-red-500/20 border border-red-500 text-red-200 px-6 py-3 rounded-2xl mb-4">
          {error}
        </div>
      )}

      {/* Create / Edit form */}
      <form
        onSubmit={onSubmit}
        className="bg-[#0a1225] border border-blue-900/30 rounded-2xl p-6 mb-8"
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
          <label className="inline-flex items-center gap-2 text-gray-300">
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
                className="px-4 py-2 rounded-xl bg-gray-600 hover:bg-gray-500"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700"
            >
              {editingId ? "Update Resource" : "Add Resource"}
            </button>
          </div>
        </div>
      </form>

      <div className="flex items-center justify-between mb-4">
        <div className="text-gray-400">
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
            className="bg-[#0a1225] border border-blue-900/30 rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-white/90 truncate">
                {r.title}
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  r.visible === false || r.isHidden
                    ? "bg-gray-600 text-gray-200"
                    : "bg-green-600/30 text-green-300"
                }`}
              >
                {r.visible === false || r.isHidden ? "Hidden" : "Visible"}
              </span>
            </div>
            <div className="text-sm text-gray-400 mb-3">by {r.provider}</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(r)}
                className="px-3 py-2 rounded-xl bg-blue-600/80 hover:bg-blue-600 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => onToggleVisibility(r)}
                className="px-3 py-2 rounded-xl bg-yellow-600/80 hover:bg-yellow-600 text-sm"
              >
                {r.visible === false || r.isHidden ? "Show" : "Hide"}
              </button>
              <button
                onClick={() => onDelete(r.id)}
                className="px-3 py-2 rounded-xl bg-red-600/80 hover:bg-red-600 text-sm"
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
    setForm({
      title: c.title || "",
      description: c.description || "",
      startDate: c.startDate ? c.startDate.substring(0, 10) : "",
      endDate: c.endDate ? c.endDate.substring(0, 10) : "",
      visible: c.visible !== false && c.isHidden !== true,
    });
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
        <div className="bg-red-500/20 border border-red-500 text-red-200 px-6 py-3 rounded-2xl mb-4">
          {error}
        </div>
      )}

      {/* Create / Edit form */}
      <form
        onSubmit={onSubmit}
        className="bg-[#0a1225] border border-blue-900/30 rounded-2xl p-6 mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Title"
            value={form.title}
            onChange={(v) => setForm({ ...form, title: v })}
            required
          />
          <Input
            label="Start Date"
            type="date"
            value={form.startDate}
            onChange={(v) => setForm({ ...form, startDate: v })}
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(v) => setForm({ ...form, description: v })}
            className="md:col-span-2"
          />
          <Input
            label="End Date"
            type="date"
            value={form.endDate}
            onChange={(v) => setForm({ ...form, endDate: v })}
          />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <label className="inline-flex items-center gap-2 text-gray-300">
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
                className="px-4 py-2 rounded-xl bg-gray-600 hover:bg-gray-500"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700"
            >
              {editingId ? "Update Challenge" : "Add Challenge"}
            </button>
          </div>
        </div>
      </form>

      <div className="flex items-center justify-between mb-4">
        <div className="text-gray-400">
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
            className="bg-[#0a1225] border border-blue-900/30 rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-white/90 truncate">
                {c.title}
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  c.visible === false || c.isHidden
                    ? "bg-gray-600 text-gray-200"
                    : "bg-green-600/30 text-green-300"
                }`}
              >
                {c.visible === false || c.isHidden ? "Hidden" : "Visible"}
              </span>
            </div>
            <div className="text-sm text-gray-400 mb-3 line-clamp-2">
              {c.description}
            </div>
            <div className="text-xs text-gray-500 mb-3">
              {c.startDate ? `Start: ${fmtDate(c.startDate)}` : ""}
              {c.endDate ? ` · End: ${fmtDate(c.endDate)}` : ""}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(c)}
                className="px-3 py-2 rounded-xl bg-blue-600/80 hover:bg-blue-600 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => onToggleVisibility(c)}
                className="px-3 py-2 rounded-xl bg-yellow-600/80 hover:bg-yellow-600 text-sm"
              >
                {c.visible === false || c.isHidden ? "Show" : "Hide"}
              </button>
              <button
                onClick={() => onDelete(c.id)}
                className="px-3 py-2 rounded-xl bg-red-600/80 hover:bg-red-600 text-sm"
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
        <span className="block text-sm text-gray-400 mb-1">{label}</span>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full bg-[#0a1225] border-2 border-blue-900/30 rounded-xl py-3 px-4 text-sm placeholder:text-gray-500 focus:outline-none focus:border-blue-700/50"
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
        <span className="block text-sm text-gray-400 mb-1">{label}</span>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full bg-[#0a1225] border-2 border-blue-900/30 rounded-xl py-3 px-4 text-sm placeholder:text-gray-500 focus:outline-none focus:border-blue-700/50"
      />
    </label>
  );
}

function FileInput({ label, onChange, className = "" }) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="block text-sm text-gray-400 mb-1">{label}</span>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onChange(e.target.files[0] || null)}
        className="w-full bg-[#0a1225] border-2 border-blue-900/30 rounded-xl py-3 px-4 text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 focus:outline-none focus:border-blue-700/50"
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
