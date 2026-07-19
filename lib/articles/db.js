import { neon } from "@neondatabase/serverless";

let schemaReady = false;

export function getSql() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not set. Add it as a server-only env var (never NEXT_PUBLIC_).",
    );
  }
  return neon(databaseUrl);
}

export async function ensureArticlesSchema() {
  if (schemaReady) return;
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS articles (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      excerpt TEXT,
      body TEXT NOT NULL,
      cover_image TEXT,
      visible BOOLEAN NOT NULL DEFAULT true,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_articles_visible ON articles(visible)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC)`;
  schemaReady = true;
}

export function mapArticleRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt ?? null,
    body: row.body,
    coverImage: row.cover_image ?? null,
    visible: row.visible,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
