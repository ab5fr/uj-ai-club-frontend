import { ensureArticlesSchema, getSql, mapArticleRow } from "./db";

export async function listVisibleArticles() {
  await ensureArticlesSchema();
  const sql = getSql();
  const rows = await sql`
    SELECT id, title, slug, excerpt, cover_image, visible, created_at, updated_at
    FROM articles
    WHERE visible = true
    ORDER BY created_at DESC
  `;
  return rows.map((row) => mapArticleRow({ ...row, body: "" }));
}

export async function getVisibleArticleBySlug(slug) {
  await ensureArticlesSchema();
  const sql = getSql();
  const rows = await sql`
    SELECT id, title, slug, excerpt, body, cover_image, visible, created_at, updated_at
    FROM articles
    WHERE slug = ${slug} AND visible = true
    LIMIT 1
  `;
  return mapArticleRow(rows[0]);
}

export async function listArticlesForAdmin({ includeHidden = true } = {}) {
  await ensureArticlesSchema();
  const sql = getSql();
  const rows = includeHidden
    ? await sql`
        SELECT id, title, slug, excerpt, body, cover_image, visible, created_at, updated_at
        FROM articles
        ORDER BY created_at DESC
      `
    : await sql`
        SELECT id, title, slug, excerpt, body, cover_image, visible, created_at, updated_at
        FROM articles
        WHERE visible = true
        ORDER BY created_at DESC
      `;
  return rows.map(mapArticleRow);
}

export async function getArticleById(id) {
  await ensureArticlesSchema();
  const sql = getSql();
  const rows = await sql`
    SELECT id, title, slug, excerpt, body, cover_image, visible, created_at, updated_at
    FROM articles
    WHERE id = ${id}
    LIMIT 1
  `;
  return mapArticleRow(rows[0]);
}

export async function createArticle({
  title,
  slug,
  excerpt,
  body,
  coverImage,
  visible,
}) {
  await ensureArticlesSchema();
  const sql = getSql();
  const rows = await sql`
    INSERT INTO articles (title, slug, excerpt, body, cover_image, visible, created_at, updated_at)
    VALUES (
      ${title},
      ${slug},
      ${excerpt || null},
      ${body},
      ${coverImage || null},
      ${visible ?? true},
      NOW(),
      NOW()
    )
    RETURNING id, title, slug, excerpt, body, cover_image, visible, created_at, updated_at
  `;
  return mapArticleRow(rows[0]);
}

export async function updateArticle(
  id,
  { title, slug, excerpt, body, coverImage, visible },
) {
  await ensureArticlesSchema();
  const sql = getSql();
  const rows = await sql`
    UPDATE articles
    SET
      title = ${title},
      slug = ${slug},
      excerpt = ${excerpt || null},
      body = ${body},
      cover_image = ${coverImage || null},
      visible = ${visible ?? true},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, title, slug, excerpt, body, cover_image, visible, created_at, updated_at
  `;
  return mapArticleRow(rows[0]);
}

export async function deleteArticle(id) {
  await ensureArticlesSchema();
  const sql = getSql();
  const rows = await sql`
    DELETE FROM articles WHERE id = ${id} RETURNING id
  `;
  return rows.length > 0;
}

export async function setArticleVisibility(id, visible) {
  await ensureArticlesSchema();
  const sql = getSql();
  const rows = await sql`
    UPDATE articles
    SET visible = ${visible}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, title, slug, excerpt, body, cover_image, visible, created_at, updated_at
  `;
  return mapArticleRow(rows[0]);
}

export async function slugExists(slug, excludeId = null) {
  await ensureArticlesSchema();
  const sql = getSql();
  const rows =
    excludeId == null
      ? await sql`SELECT id FROM articles WHERE slug = ${slug} LIMIT 1`
      : await sql`
          SELECT id FROM articles
          WHERE slug = ${slug} AND id <> ${excludeId}
          LIMIT 1
        `;
  return rows.length > 0;
}
