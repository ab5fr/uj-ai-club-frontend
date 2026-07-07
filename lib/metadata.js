import {
  DEFAULT_OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  SOCIAL,
} from "./site";

const NO_INDEX = { index: false, follow: false };

/**
 * Build Next.js Metadata for a route.
 * @param {object} options
 * @param {string} [options.title] - Page title without site suffix
 * @param {string} [options.description]
 * @param {string} options.path - Canonical path (e.g. "/roadmap")
 * @param {boolean} [options.noIndex]
 * @param {string} [options.ogImage] - Absolute or root-relative image URL
 * @param {"website"|"article"} [options.type]
 */
export function createPageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path,
  noIndex = false,
  ogImage = DEFAULT_OG_IMAGE,
  type = "website",
}) {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — ${SITE_TAGLINE}`;
  const canonical = path ? `${SITE_URL}${path}` : SITE_URL;
  const imageUrl = ogImage?.startsWith("http") ? ogImage : `${SITE_URL}${ogImage}`;

  return {
    title: title || `${SITE_NAME} — ${SITE_TAGLINE}`,
    description,
    alternates: {
      canonical: path || "/",
    },
    ...(noIndex ? { robots: NO_INDEX } : {}),
    openGraph: {
      title: pageTitle,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: "en_US",
      type,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [imageUrl],
      ...(SOCIAL.twitter ? { site: SOCIAL.twitter } : {}),
    },
  };
}

export function rootMetadata() {
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${SITE_NAME} — ${SITE_TAGLINE}`,
      template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    icons: {
      icon: [{ url: "/mainlogo.png", type: "image/png" }],
      apple: [{ url: "/mainlogo.png", type: "image/png" }],
    },
    manifest: "/site.webmanifest",
    alternates: {
      canonical: "/",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    keywords: [
      "UJ AI Club",
      "University of Jordan",
      "artificial intelligence",
      "machine learning",
      "AI challenges",
      "student club",
      "Jordan",
    ],
    category: "education",
    openGraph: {
      title: `${SITE_NAME} — ${SITE_TAGLINE}`,
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      siteName: SITE_NAME,
      locale: "en_US",
      type: "website",
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${SITE_NAME} — ${SITE_TAGLINE}`,
      description: SITE_DESCRIPTION,
      images: [DEFAULT_OG_IMAGE],
      ...(SOCIAL.twitter ? { site: SOCIAL.twitter, creator: SOCIAL.twitter } : {}),
    },
  };
}
