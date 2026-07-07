"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { adminSubmissionsApi } from "@/lib/api";

export default function AdminSubmissionViewerPage() {
  return (
    <ProtectedRoute>
      <AdminSubmissionViewer />
    </ProtectedRoute>
  );
}

function AdminSubmissionViewer() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const submissionId = params?.submissionId;

  const [notebook, setNotebook] = useState(null);
  const [filename, setFilename] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  const isAdmin = useMemo(() => {
    if (!user) return false;
    return user.role === "admin" || user.isAdmin === true;
  }, [user]);

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
    if (!submissionId) return;

    const loadNotebook = async () => {
      try {
        setLoading(true);
        setError("");
        const { blob, contentDisposition } =
          await adminSubmissionsApi.getFileBlob(submissionId, false);
        const fallbackName = `submission-${submissionId}.ipynb`;
        const detectedName = getFilenameFromDisposition(
          contentDisposition,
          fallbackName,
        );
        const text = await blob.text();
        const parsed = JSON.parse(text);

        if (!parsed || !Array.isArray(parsed.cells)) {
          throw new Error("Notebook file is invalid.");
        }

        setNotebook(parsed);
        setFilename(detectedName);
      } catch (err) {
        setError(err?.message || "Failed to load notebook.");
      } finally {
        setLoading(false);
      }
    };

    loadNotebook();
  }, [submissionId]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const { blob, contentDisposition } =
        await adminSubmissionsApi.getFileBlob(submissionId, true);

      const fallbackName = filename || `submission-${submissionId}.ipynb`;
      const resolvedName = getFilenameFromDisposition(
        contentDisposition,
        fallbackName,
      );
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = resolvedName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000);
    } catch (err) {
      setError(err?.message || "Failed to download notebook.");
    } finally {
      setDownloading(false);
    }
  };

  if (!isAdmin) {
    return (
      <main className="page admin-page">
        <section className="section">
          <div className="container">
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
      <section className="section admin-section">
        <div className="container">
          <div className="card admin-viewer-header">
            <div>
              <h1 className="admin-section-title" style={{ marginBottom: 0 }}>
                Submission Notebook
              </h1>
              <p className="admin-viewer-header__meta">
                {filename || `submission-${submissionId}.ipynb`}
              </p>
            </div>
            <div className="admin-viewer-header__actions">
              <button
                type="button"
                onClick={() => router.push("/admin")}
                className="btn btn-outline btn-sm"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading || loading}
                className="btn btn-warning btn-sm"
              >
                {downloading ? "Downloading..." : "Download"}
              </button>
            </div>
          </div>

          {error && <div className="admin-alert admin-alert--error">{error}</div>}

          {loading ? (
            <div className="card admin-empty">Loading notebook...</div>
          ) : (
            <div>
              {(notebook?.cells || []).map((cell, idx) => (
                <NotebookCellView key={idx} cell={cell} index={idx} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function NotebookCellView({ cell, index }) {
  const cellType = cell?.cell_type || "unknown";
  const source = normalizeCellText(cell?.source);

  return (
    <article className="card admin-notebook-cell">
      <div className="admin-notebook-cell__head">
        <span className="admin-notebook-cell__label">Cell {index + 1}</span>
        <span className="admin-badge admin-badge--status">{cellType}</span>
      </div>

      <div className="admin-notebook-cell__body">
        {cellType === "markdown" ? (
          <MarkdownBlock source={source} />
        ) : (
          <pre className="admin-code">
            <code>{source}</code>
          </pre>
        )}

        {Array.isArray(cell?.outputs) && cell.outputs.length > 0 && (
          <div style={{ marginTop: "1rem" }}>
            <div className="admin-notebook-cell__label" style={{ marginBottom: ".5rem" }}>
              Output
            </div>
            <div>
              {cell.outputs.map((output, i) => (
                <OutputBlock output={output} key={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

function MarkdownBlock({ source }) {
  const blocks = parseMarkdownBlocks(source);

  return (
    <div className="admin-markdown">
      {blocks.map((block, idx) => {
        if (block.type === "h1") {
          return <h1 key={idx}>{block.text}</h1>;
        }
        if (block.type === "h2") {
          return <h2 key={idx}>{block.text}</h2>;
        }
        if (block.type === "h3") {
          return <h3 key={idx}>{block.text}</h3>;
        }
        if (block.type === "li") {
          return <li key={idx}>{block.text}</li>;
        }
        if (block.type === "code") {
          return (
            <pre key={idx} className="admin-code">
              <code>{block.text}</code>
            </pre>
          );
        }
        return <p key={idx}>{block.text}</p>;
      })}
    </div>
  );
}

function OutputBlock({ output }) {
  const outputText = extractOutputText(output);
  if (!outputText) return null;

  return (
    <pre className="admin-code admin-code--muted">
      <code>{outputText}</code>
    </pre>
  );
}

function normalizeCellText(source) {
  if (Array.isArray(source)) return source.join("");
  if (typeof source === "string") return source;
  return "";
}

function extractOutputText(output) {
  if (!output) return "";

  if (output.output_type === "stream") {
    return normalizeCellText(output.text);
  }

  if (output.output_type === "error") {
    const traceback = Array.isArray(output.traceback)
      ? output.traceback.join("\n")
      : "";
    return traceback || `${output.ename || "Error"}: ${output.evalue || ""}`;
  }

  const textPlain = output?.data?.["text/plain"];
  return normalizeCellText(textPlain);
}

function parseMarkdownBlocks(source) {
  const lines = source.split(/\r?\n/);
  const blocks = [];
  let inFence = false;
  let fenceBuffer = [];

  for (const rawLine of lines) {
    const line = rawLine || "";
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      if (!inFence) {
        inFence = true;
        fenceBuffer = [];
      } else {
        inFence = false;
        blocks.push({ type: "code", text: fenceBuffer.join("\n") });
      }
      continue;
    }

    if (inFence) {
      fenceBuffer.push(line);
      continue;
    }

    if (!trimmed) continue;

    if (trimmed.startsWith("### ")) {
      blocks.push({ type: "h3", text: trimmed.slice(4) });
      continue;
    }
    if (trimmed.startsWith("## ")) {
      blocks.push({ type: "h2", text: trimmed.slice(3) });
      continue;
    }
    if (trimmed.startsWith("# ")) {
      blocks.push({ type: "h1", text: trimmed.slice(2) });
      continue;
    }
    if (trimmed.startsWith("- ")) {
      blocks.push({ type: "li", text: trimmed.slice(2) });
      continue;
    }

    blocks.push({ type: "p", text: trimmed });
  }

  if (inFence && fenceBuffer.length > 0) {
    blocks.push({ type: "code", text: fenceBuffer.join("\n") });
  }

  return blocks;
}
