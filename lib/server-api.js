/**
 * Server-side API helpers for SEO (sitemap, generateMetadata).
 * Public endpoints only — no auth required.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "https://api.uj-aiclub.com";

async function publicFetch(endpoint) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`API ${response.status}: ${endpoint}`);
  }

  return response.json();
}

export async function fetchResources() {
  try {
    return await publicFetch("/resources");
  } catch {
    return [];
  }
}

export async function fetchResource(id) {
  return publicFetch(`/resources/${id}`);
}

export async function fetchCertificates() {
  try {
    return await publicFetch("/certificates");
  } catch {
    return [];
  }
}

export async function fetchCertificate(id) {
  return publicFetch(`/certificates/${id}`);
}

export function getAbsoluteImageUrl(imagePath) {
  if (!imagePath) return null;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${API_BASE_URL}${cleanPath}`;
}
