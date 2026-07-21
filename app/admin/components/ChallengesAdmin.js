"use client";

import { useEffect, useState } from "react";
import { adminChallengesApi, adminNotebooksApi } from "@/lib/api";
import { Input, Textarea, FileInput, handleErr } from "./shared";

const emptyNotebookForm = {
  notebookFile: null,
  maxPoints: "100",
  cpuLimit: "0.5",
  memoryLimit: "512M",
  timeLimitMinutes: "60",
  networkDisabled: true,
  autoGradeEnabled: false,
};

export default function ChallengesAdmin() {
  const [items, setItems] = useState([]);
  const [notebooksByChallenge, setNotebooksByChallenge] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingNotebookId, setEditingNotebookId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    week: "",
    allowedSubmissions: "3",
    startDate: "",
    endDate: "",
    visible: true,
    ...emptyNotebookForm,
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const [challengesData, notebooksData] = await Promise.all([
        adminChallengesApi.list(true),
        adminNotebooksApi.list(),
      ]);
      const challenges = challengesData.items || challengesData;
      const notebooks = notebooksData.items || notebooksData || [];
      const map = {};
      for (const nb of notebooks) {
        map[nb.challengeId] = nb;
      }
      setItems(challenges);
      setNotebooksByChallenge(map);
      setError("");
    } catch (err) {
      handleErr(err, setError);
    } finally {
      setLoading(false);
    }
  };

  const appendNotebookFormData = (formData) => {
    formData.append("maxPoints", form.maxPoints);
    formData.append("cpuLimit", form.cpuLimit);
    formData.append("memoryLimit", form.memoryLimit);
    formData.append("timeLimitMinutes", form.timeLimitMinutes);
    formData.append("networkDisabled", form.networkDisabled);
    formData.append("autoGradeEnabled", form.autoGradeEnabled);
    formData.append("notebook", form.notebookFile);
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
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      visible: form.visible,
    };

    try {
      setError("");
      setSuccess("");

      if (editingId) {
        await adminChallengesApi.update(editingId, payload);
        if (editingNotebookId) {
          await adminNotebooksApi.update(editingNotebookId, {
            maxPoints: parseInt(form.maxPoints),
            cpuLimit: parseFloat(form.cpuLimit),
            memoryLimit: form.memoryLimit,
            timeLimitMinutes: parseInt(form.timeLimitMinutes),
            networkDisabled: form.networkDisabled,
            autoGradeEnabled: form.autoGradeEnabled,
          });
        } else if (form.notebookFile) {
          const formData = new FormData();
          formData.append("challengeId", String(editingId));
          appendNotebookFormData(formData);
          await adminNotebooksApi.create(formData);
        }
        setSuccess("Challenge updated.");
      } else {
        if (!form.notebookFile) {
          setError("Please upload a notebook (.ipynb) file.");
          return;
        }
        const created = await adminChallengesApi.create(payload);
        const challengeId = created.item?.id || created.id;
        if (challengeId) {
          const formData = new FormData();
          formData.append("challengeId", String(challengeId));
          appendNotebookFormData(formData);
          await adminNotebooksApi.create(formData);
        }
        setSuccess("Challenge created.");
      }
      resetForm();
      await load();
    } catch (err) {
      handleErr(err, setError);
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  const onEdit = (c) => {
    const nb = notebooksByChallenge[c.id];
    setEditingId(c.id);
    setEditingNotebookId(nb?.id || null);
    setForm({
      title: c.title || "",
      description: c.description || "",
      week: c.week !== null && c.week !== undefined ? String(c.week) : "",
      allowedSubmissions:
        c.allowedSubmissions !== null && c.allowedSubmissions !== undefined
          ? String(c.allowedSubmissions)
          : "3",
      startDate: formatDateForInput(c.startDate),
      endDate: formatDateForInput(c.endDate),
      visible: c.visible !== false && c.isHidden !== true,
      notebookFile: null,
      maxPoints: String(nb?.maxPoints ?? 100),
      cpuLimit: String(nb?.cpuLimit ?? 0.5),
      memoryLimit: nb?.memoryLimit || "512M",
      timeLimitMinutes: String(nb?.timeLimitMinutes ?? 60),
      networkDisabled: nb?.networkDisabled !== false,
      autoGradeEnabled: nb?.autoGradeEnabled === true,
    });
  };

  const onDelete = async (id) => {
    if (
      !confirm(
        "Delete this challenge? This will also delete its notebook, submissions, and grading data.",
      )
    )
      return;
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
    setEditingNotebookId(null);
    setForm({
      title: "",
      description: "",
      week: "",
      allowedSubmissions: "3",
      startDate: "",
      endDate: "",
      visible: true,
      ...emptyNotebookForm,
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
      <h2 className="admin-section-title">Challenges & Notebooks</h2>
      <p className="admin-section-desc">
        Create challenges with notebooks in one place. Upload the .ipynb,
        configure limits, and enable auto-grading when ready. The assignment
        name is taken from the notebook filename automatically.
      </p>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}
      {success && (
        <div className="admin-alert admin-alert--success">{success}</div>
      )}

      <form onSubmit={onSubmit} className="card admin-form">
        <h3 className="admin-form-title">
          {editingId ? "Edit Challenge" : "New Challenge"}
        </h3>
        <div className="admin-form-grid">
          <Input
            label="Title"
            value={form.title}
            onChange={(v) => setForm({ ...form, title: v })}
            required
          />
          <Input
            label="Week"
            type="number"
            value={form.week}
            onChange={(v) => setForm({ ...form, week: v })}
          />
          <Input
            label="Allowed Submissions"
            type="number"
            value={form.allowedSubmissions}
            onChange={(v) => setForm({ ...form, allowedSubmissions: v })}
            required
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(v) => setForm({ ...form, description: v })}
            className="form-group--full"
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

        <h3 className="admin-form-title" style={{ marginTop: "1.5rem" }}>
          Notebook
        </h3>
        <div className="admin-form-grid">
          {!editingNotebookId && (
            <FileInput
              label="Notebook (.ipynb)"
              accept=".ipynb"
              onChange={(file) => setForm({ ...form, notebookFile: file })}
              required={!editingId}
            />
          )}
          <Input
            label="Max Points"
            type="number"
            value={form.maxPoints}
            onChange={(v) => setForm({ ...form, maxPoints: v })}
          />
          <Input
            label="CPU Limit"
            type="number"
            step="0.1"
            value={form.cpuLimit}
            onChange={(v) => setForm({ ...form, cpuLimit: v })}
          />
          <Input
            label="Time Limit (minutes)"
            type="number"
            value={form.timeLimitMinutes}
            onChange={(v) => setForm({ ...form, timeLimitMinutes: v })}
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
        </div>

        <div
          style={{
            marginTop: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: ".5rem",
          }}
        >
          <label className="admin-check">
            <input
              type="checkbox"
              checked={form.networkDisabled}
              onChange={(e) =>
                setForm({ ...form, networkDisabled: e.target.checked })
              }
            />
            Disable network access in student containers
          </label>
          <label className="admin-check">
            <input
              type="checkbox"
              checked={form.autoGradeEnabled}
              onChange={(e) =>
                setForm({ ...form, autoGradeEnabled: e.target.checked })
              }
            />
            Enable auto grade (admins can still override manually)
          </label>
          <label className="admin-check">
            <input
              type="checkbox"
              checked={form.visible}
              onChange={(e) => setForm({ ...form, visible: e.target.checked })}
            />
            Visible to students
          </label>
        </div>

        <div className="admin-form-footer">
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
              {editingId ? "Save Challenge" : "Create Challenge"}
            </button>
          </div>
        </div>
      </form>

      <div className="admin-toolbar">
        <div className="admin-toolbar-meta">
          {loading ? "Loading..." : `${filtered.length} challenge(s)`}
        </div>
        <div className="admin-search">
          <Input placeholder="Search..." value={search} onChange={setSearch} />
        </div>
      </div>

      <div className="admin-card-grid">
        {filtered.map((c) => {
          const nb = notebooksByChallenge[c.id];
          return (
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
                Submissions allowed: {c.allowedSubmissions ?? 3}
                {nb
                  ? ` · ${nb.maxPoints} pts · ${nb.timeLimitMinutes} min`
                  : " · No notebook"}
              </div>
              {nb && (
                <div className="admin-item__meta admin-item__meta--sm">
                  {nb.assignmentName} · Auto-grade:{" "}
                  {nb.autoGradeEnabled ? "On" : "Off"}
                </div>
              )}
              <div className="admin-item__actions">
                <button
                  onClick={() => onEdit(c)}
                  className="btn btn-primary btn-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => onToggleVisibility(c)}
                  className="btn btn-warning btn-sm"
                >
                  {c.visible === false || c.isHidden ? "Show" : "Hide"}
                </button>
                <button
                  onClick={() => onDelete(c.id)}
                  className="btn btn-danger btn-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
