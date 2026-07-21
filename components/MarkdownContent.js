import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

function safeUrlTransform(url) {
  if (!url) return "";
  const trimmed = String(url).trim();
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:")
  ) {
    return "";
  }
  return trimmed;
}

export default function MarkdownContent({ content, className = "" }) {
  return (
    <div className={`blog-markdown ${className}`.trim()}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        urlTransform={safeUrlTransform}
      >
        {content || ""}
      </ReactMarkdown>
    </div>
  );
}
