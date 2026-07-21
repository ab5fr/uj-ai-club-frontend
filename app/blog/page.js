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
      <div className="page-hero blog-hero">
        <div className="container">
          <h1 className="anim-1">
            <span className="text-gradient">Blog</span>
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
              <Link
                key={article.id}
                href={`/blog/${article.slug}`}
                className="blog-card"
              >
                <div className="blog-card__media">
                  {article.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={article.coverImage}
                      alt=""
                      className="blog-card__image"
                    />
                  ) : (
                    <div
                      className="blog-card__placeholder"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div className="blog-card__body">
                  <time
                    className="blog-card__date"
                    dateTime={article.createdAt}
                  >
                    {formatBackendDate(article.createdAt)}
                  </time>
                  <h2 className="blog-card__title">{article.title}</h2>
                  {article.excerpt && (
                    <p className="blog-card__excerpt">{article.excerpt}</p>
                  )}
                  <span className="blog-card__link">Read article →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
