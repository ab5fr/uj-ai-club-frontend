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

function fail(message) {
  return { ok: false, error: message };
}

function ok(data) {
  return { ok: true, ...data };
}

function revalidateBlog(slug) {
  revalidatePath("/blog");
  if (slug) revalidatePath(`/blog/${slug}`);
  revalidatePath("/sitemap.xml");
}

/** Works without the Rust API — checks Neon users.role directly. */
export async function checkAdminAction(idToken) {
  try {
    const claims = await verifyFirebaseIdToken(idToken);
    const sql = getSql();
    const rows = await sql`
      SELECT role FROM users WHERE firebase_uid = ${claims.uid} LIMIT 1
    `;
    return ok({ isAdmin: rows[0]?.role === "admin" });
  } catch (err) {
    return fail(err.message || "Not authorized");
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
    if (!title) return fail("Title is required");
    if (!body) return fail("Body is required");

    let slug = slugify(payload.slug || title);
    if (await slugExists(slug)) {
      return fail(`An article with slug '${slug}' already exists`);
    }

    if (payload.coverImageDataUrl) {
      if (typeof payload.coverImageDataUrl !== "string") {
        return fail("Invalid cover image");
      }
      if (payload.coverImageDataUrl.length > MAX_COVER_BYTES * 1.4) {
        return fail("Cover image is too large (max ~1.5MB)");
      }
      if (!payload.coverImageDataUrl.startsWith("data:image/")) {
        return fail("Cover image must be an image file");
      }
    }

    const item = await createArticle({
      title,
      slug,
      excerpt: String(payload.excerpt || "").trim() || null,
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
    if (!title) return fail("Title is required");
    if (!body) return fail("Body is required");

    const slug = slugify(payload.slug || title);
    if (await slugExists(slug, id)) {
      return fail(`An article with slug '${slug}' already exists`);
    }

    let coverImage = existing.coverImage;
    if (payload.clearCover) {
      coverImage = null;
    } else if (payload.coverImageDataUrl) {
      if (!payload.coverImageDataUrl.startsWith("data:image/")) {
        return fail("Cover image must be an image file");
      }
      if (payload.coverImageDataUrl.length > MAX_COVER_BYTES * 1.4) {
        return fail("Cover image is too large (max ~1.5MB)");
      }
      coverImage = payload.coverImageDataUrl;
    }

    const item = await updateArticle(id, {
      title,
      slug,
      excerpt: String(payload.excerpt || "").trim() || null,
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
