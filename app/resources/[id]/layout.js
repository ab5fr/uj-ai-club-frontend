import { createPageMetadata } from "@/lib/metadata";
import {
  fetchResource,
  getAbsoluteImageUrl,
} from "@/lib/server-api";

export async function generateMetadata({ params }) {
  const { id } = await params;

  try {
    const resource = await fetchResource(id);
    const description =
      resource.description ||
      `Study notes and materials for ${resource.title} by ${resource.provider}.`;

    return createPageMetadata({
      title: resource.title,
      description: description.slice(0, 160),
      path: `/resources/${id}`,
      ogImage: getAbsoluteImageUrl(resource.coverImage) || undefined,
      type: "article",
    });
  } catch {
    return createPageMetadata({
      title: "Resource",
      description: "AI learning resource from the UJ AI Club.",
      path: `/resources/${id}`,
      noIndex: true,
    });
  }
}

export default function ResourceDetailLayout({ children }) {
  return children;
}
