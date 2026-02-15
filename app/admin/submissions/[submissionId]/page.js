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
      <main className="min-h-screen bg-[var(--color-surface-2)] text-[var(--color-text)] pt-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)] border border-[var(--color-warning)] text-[var(--color-warning)] px-6 py-4 rounded-2xl">
            You must be an administrator to access this page.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-surface-2)] text-[var(--color-text)] pt-24 pb-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Submission Notebook</h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              {filename || `submission-${submissionId}.ipynb`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/admin")}
              className="px-4 py-2 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm hover:bg-[color-mix(in_srgb,var(--color-surface-2)_60%,var(--color-primary))]"
            >
              Back
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading || loading}
              className="px-4 py-2 rounded-xl bg-[color-mix(in_srgb,var(--color-warning)_80%,transparent)] text-sm hover:bg-[var(--color-warning)] disabled:opacity-60"
            >
              {downloading ? "Downloading..." : "Download"}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-[color-mix(in_srgb,var(--color-danger)_15%,transparent)] border border-[var(--color-danger)] text-[var(--color-warning)] px-6 py-3 rounded-2xl mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl px-6 py-10 text-center text-[var(--color-text-muted)]">
            Loading notebook...
          </div>
        ) : (
          <div className="space-y-5">
            {(notebook?.cells || []).map((cell, idx) => (
              <NotebookCellView key={idx} cell={cell} index={idx} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function NotebookCellView({ cell, index }) {
  const cellType = cell?.cell_type || "unknown";
  const source = normalizeCellText(cell?.source);

  return (
    <article className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
      <div className="px-4 py-2.5 border-b border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-primary-strong)_10%,transparent)] flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
          Cell {index + 1}
        </span>
        <span className="px-2 py-1 rounded-full text-[11px] bg-[color-mix(in_srgb,var(--color-primary)_30%,transparent)] text-[var(--color-text)]">
          {cellType}
        </span>
      </div>

      <div className="p-4">
        {cellType === "markdown" ? (
          <MarkdownBlock source={source} />
        ) : (
          <pre className="text-sm leading-6 p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] overflow-x-auto text-[var(--color-text)]">
            <code>{source}</code>
          </pre>
        )}

        {Array.isArray(cell?.outputs) && cell.outputs.length > 0 && (
          <div className="mt-4">
            <div className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
              Output
            </div>
            <div className="space-y-2">
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
    <div className="space-y-3 text-[var(--color-text)]">
      {blocks.map((block, idx) => {
        if (block.type === "h1") {
          return (
            <h1 key={idx} className="text-2xl font-bold">
              {block.text}
            </h1>
          );
        }
        if (block.type === "h2") {
          return (
            <h2 key={idx} className="text-xl font-semibold">
              {block.text}
            </h2>
          );
        }
        if (block.type === "h3") {
          return (
            <h3 key={idx} className="text-lg font-semibold">
              {block.text}
            </h3>
          );
        }
        if (block.type === "li") {
          return (
            <div key={idx} className="flex items-start gap-2 text-sm leading-6">
              <span className="text-[var(--color-primary)] mt-1">•</span>
              <span>{block.text}</span>
            </div>
          );
        }
        if (block.type === "code") {
          return (
            <pre
              key={idx}
              className="text-sm leading-6 p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] overflow-x-auto"
            >
              <code>{block.text}</code>
            </pre>
          );
        }
        return (
          <p key={idx} className="text-sm leading-7 text-[var(--color-text)]">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}

function OutputBlock({ output }) {
  const outputText = extractOutputText(output);
  if (!outputText) return null;

  return (
    <pre className="text-xs leading-6 p-3 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] overflow-x-auto text-[var(--color-text-muted)]">
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
