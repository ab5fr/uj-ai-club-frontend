import { fetchCertificates, fetchResources } from "@/lib/server-api";
import { SITE_URL } from "@/lib/site";

/** @type {import('next').MetadataRoute.Sitemap} */
export default async function sitemap() {
  const now = new Date();

  const staticRoutes = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/roadmap", priority: 0.9, changeFrequency: "monthly" },
    { path: "/resources", priority: 0.9, changeFrequency: "weekly" },
    { path: "/challanges", priority: 0.8, changeFrequency: "weekly" },
  ];

  const [resources, certificates] = await Promise.all([
    fetchResources(),
    fetchCertificates(),
  ]);

  const staticEntries = staticRoutes.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  const resourceEntries = (Array.isArray(resources) ? resources : []).map(
    (resource) => ({
      url: `${SITE_URL}/resources/${resource.id}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    }),
  );

  const certificateEntries = (Array.isArray(certificates) ? certificates : []).map(
    (certificate) => ({
      url: `${SITE_URL}/certificates/${certificate.id}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    }),
  );

  return [...staticEntries, ...resourceEntries, ...certificateEntries];
}
