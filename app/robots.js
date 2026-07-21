import { SITE_DOMAINS, SITE_URL } from "@/lib/site";

/** @type {import('next').MetadataRoute.Robots} */
export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin/",
        "/settings/",
        "/auth/",
        "/login",
        "/signup",
      ],
    },
    sitemap: [
      `${SITE_URL}/sitemap.xml`,
      ...SITE_DOMAINS.filter((domain) => domain !== SITE_URL).map(
        (domain) => `${domain}/sitemap.xml`,
      ),
    ],
    host: SITE_URL,
  };
}
