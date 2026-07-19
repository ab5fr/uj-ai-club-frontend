import Link from "next/link";
import { listVisibleArticles } from "@/lib/articles/queries";
import { createPageMetadata } from "@/lib/metadata";
import { formatBackendDate } from "@/lib/formatDate";

export const metadata = createPageMetadata({
  title: "Blog",
  description:
    "Articles and notes from the University of Jordan AI Club — tutorials, event recaps, and club updates.",
  path: "/blog",
});

export const revalidate = 60;

export default async function BlogPage() {
  let articles = [];
  let error = "";

  try {
    articles = await listVisibleArticles();
  } catch (err) {
    error = err.message || "Failed to load articles";
  }

  return (
    <main className="page">
      <div className="page-hero">
        <div className="container">
          <div className="page-hero__tag">Blog</div>
          <h1 className="anim-1">
            Club <span className="text-gradient">Articles</span>
          </h1>
          <p className="anim-2">
            Tutorials, announcements, and write-ups from the AI Club.
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {error && (
            <div className="admin-alert admin-alert--error">{error}</div>
          )}

          {!error && articles.length === 0 && (
            <p className="text-muted">No articles published yet.</p>
          )}

          <div className="blog-grid">
            {articles.map((article) => (
              <article key={article.id} className="blog-card">
                {article.coverImage && (
                  <Link href={`/blog/${article.slug}`} className="blog-card__media">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={article.coverImage}
                      alt=""
                      className="blog-card__image"
                    />
                  </Link>
                )}
                <div className="blog-card__body">
                  <time className="blog-card__date" dateTime={article.createdAt}>
                    {formatBackendDate(article.createdAt)}
                  </time>
                  <h2 className="blog-card__title">
                    <Link href={`/blog/${article.slug}`}>{article.title}</Link>
                  </h2>
                  {article.excerpt && (
                    <p className="blog-card__excerpt">{article.excerpt}</p>
                  )}
                  <Link href={`/blog/${article.slug}`} className="blog-card__link">
                    Read article →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
