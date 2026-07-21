"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, verifyFirebaseIdToken } from "@/lib/articles/auth";
import { getSql } from "@/lib/articles/db";
import {
  createArticle,
  deleteArticle,
  getArticleById,
  listArticlesForAdmin,
  setArticleVisibility,
  slugExists,
  updateArticle,
} from "@/lib/articles/queries";
import { slugify } from "@/lib/articles/slug";

const MAX_COVER_BYTES = 1_500_000;
const MAX_BODY_CHARS = 100_000;
const MAX_EXCERPT_CHARS = 500;
const ALLOWED_COVER_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function fail(message) {
  return { ok: false, error: message };
}

function ok(data) {
  return { ok: true, ...data };
}

function validateCoverImageDataUrl(dataUrl) {
  if (typeof dataUrl !== "string") {
    return "Invalid cover image";
  }
  if (dataUrl.length > MAX_COVER_BYTES * 1.4) {
    return "Cover image is too large (max ~1.5MB)";
  }
  const match = /^data:(image\/[a-z0-9.+-]+);base64,/i.exec(dataUrl);
  if (!match) {
    return "Cover image must be a base64 data URL";
  }
  const mime = match[1].toLowerCase();
  if (!ALLOWED_COVER_MIMES.has(mime)) {
    return "Cover image must be JPEG, PNG, or WebP";
  }
  return null;
}

function revalidateBlog(slug) {
  revalidatePath("/blog");
  if (slug) revalidatePath(`/blog/${slug}`);
  revalidatePath("/sitemap.xml");
}

export async function checkAdminAction(idToken) {
  try {
    const claims = await verifyFirebaseIdToken(idToken);
    const sql = getSql();
    const rows = await sql`
      SELECT role FROM users WHERE firebase_uid = ${claims.uid} LIMIT 1
    `;
    return ok({ isAdmin: rows[0]?.role === "admin" });
  } catch {
    return fail("Not authorized");
  }
}

export async function adminListArticlesAction(idToken) {
  try {
    await requireAdmin(idToken);
    const items = await listArticlesForAdmin({ includeHidden: true });
    return ok({ items });
  } catch (err) {
    return fail(err.message || "Failed to load articles");
  }
}

export async function adminCreateArticleAction(idToken, payload) {
  try {
    await requireAdmin(idToken);

    const title = String(payload.title || "").trim();
    const body = String(payload.body || "").trim();
    const excerpt = String(payload.excerpt || "").trim();
    if (!title) return fail("Title is required");
    if (!body) return fail("Body is required");
    if (body.length > MAX_BODY_CHARS) {
      return fail(`Body must be at most ${MAX_BODY_CHARS} characters`);
    }
    if (excerpt.length > MAX_EXCERPT_CHARS) {
      return fail(`Excerpt must be at most ${MAX_EXCERPT_CHARS} characters`);
    }

    let slug = slugify(payload.slug || title);
    if (await slugExists(slug)) {
      return fail(`An article with slug '${slug}' already exists`);
    }

    if (payload.coverImageDataUrl) {
      const coverError = validateCoverImageDataUrl(payload.coverImageDataUrl);
      if (coverError) return fail(coverError);
    }

    const item = await createArticle({
      title,
      slug,
      excerpt: excerpt || null,
      body,
      coverImage: payload.coverImageDataUrl || null,
      visible: payload.visible !== false,
    });

    revalidateBlog(item.slug);
    return ok({ item });
  } catch (err) {
    return fail(err.message || "Failed to create article");
  }
}

export async function adminUpdateArticleAction(idToken, id, payload) {
  try {
    await requireAdmin(idToken);

    const existing = await getArticleById(id);
    if (!existing) return fail("Article not found");

    const title = String(payload.title || "").trim();
    const body = String(payload.body || "").trim();
    const excerpt = String(payload.excerpt || "").trim();
    if (!title) return fail("Title is required");
    if (!body) return fail("Body is required");
    if (body.length > MAX_BODY_CHARS) {
      return fail(`Body must be at most ${MAX_BODY_CHARS} characters`);
    }
    if (excerpt.length > MAX_EXCERPT_CHARS) {
      return fail(`Excerpt must be at most ${MAX_EXCERPT_CHARS} characters`);
    }

    const slug = slugify(payload.slug || title);
    if (await slugExists(slug, id)) {
      return fail(`An article with slug '${slug}' already exists`);
    }

    let coverImage = existing.coverImage;
    if (payload.clearCover) {
      coverImage = null;
    } else if (payload.coverImageDataUrl) {
      const coverError = validateCoverImageDataUrl(payload.coverImageDataUrl);
      if (coverError) return fail(coverError);
      coverImage = payload.coverImageDataUrl;
    }

    const item = await updateArticle(id, {
      title,
      slug,
      excerpt: excerpt || null,
      body,
      coverImage,
      visible: payload.visible !== false,
    });

    revalidateBlog(existing.slug);
    revalidateBlog(item.slug);
    return ok({ item });
  } catch (err) {
    return fail(err.message || "Failed to update article");
  }
}

export async function adminDeleteArticleAction(idToken, id) {
  try {
    await requireAdmin(idToken);
    const existing = await getArticleById(id);
    if (!existing) return fail("Article not found");
    await deleteArticle(id);
    revalidateBlog(existing.slug);
    return ok({ success: true });
  } catch (err) {
    return fail(err.message || "Failed to delete article");
  }
}

export async function adminSetArticleVisibilityAction(idToken, id, visible) {
  try {
    await requireAdmin(idToken);
    const item = await setArticleVisibility(id, Boolean(visible));
    if (!item) return fail("Article not found");
    revalidateBlog(item.slug);
    return ok({ item });
  } catch (err) {
    return fail(err.message || "Failed to update visibility");
  }
}
