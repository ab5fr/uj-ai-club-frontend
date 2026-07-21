import { listVisibleArticles } from "@/lib/articles/queries";
import { SITE_URL } from "@/lib/site";

/** @type {import('next').MetadataRoute.Sitemap} */
export default async function sitemap() {
  const now = new Date();

  const staticRoutes = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/roadmap", priority: 0.9, changeFrequency: "monthly" },
    { path: "/blog", priority: 0.9, changeFrequency: "weekly" },
    { path: "/challanges", priority: 0.8, changeFrequency: "weekly" },
  ];

  const articles = await listVisibleArticles().catch(() => []);

  const staticEntries = staticRoutes.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  const articleEntries = (Array.isArray(articles) ? articles : []).map(
    (article) => ({
      url: `${SITE_URL}/blog/${article.slug}`,
      lastModified: article.updatedAt ? new Date(article.updatedAt) : now,
      changeFrequency: "weekly",
      priority: 0.8,
    }),
  );

  return [...staticEntries, ...articleEntries];
}
