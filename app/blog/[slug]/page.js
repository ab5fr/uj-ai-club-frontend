import Link from "next/link";
import { notFound } from "next/navigation";
import MarkdownContent from "@/components/MarkdownContent";
import { getVisibleArticleBySlug } from "@/lib/articles/queries";
import { createPageMetadata } from "@/lib/metadata";
import { formatBackendDate } from "@/lib/formatDate";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const article = await getVisibleArticleBySlug(slug);
    if (!article) {
      return createPageMetadata({
        title: "Article not found",
        path: `/blog/${slug}`,
        noIndex: true,
      });
    }

    return createPageMetadata({
      title: article.title,
      description: article.excerpt || `Read ${article.title} on the UJ AI Club blog.`,
      path: `/blog/${article.slug}`,
      ogImage: article.coverImage?.startsWith("http")
        ? article.coverImage
        : undefined,
      type: "article",
    });
  } catch {
    return createPageMetadata({
      title: "Blog",
      path: `/blog/${slug}`,
    });
  }
}

export default async function BlogArticlePage({ params }) {
  const { slug } = await params;
  let article = null;

  try {
    article = await getVisibleArticleBySlug(slug);
  } catch {
    notFound();
  }

  if (!article) notFound();

  return (
    <main className="page">
      <article className="blog-article">
        <div className="page-hero blog-article__hero">
          <div className="container">
            <Link href="/blog" className="blog-article__back">
              ← All articles
            </Link>
            <div className="page-hero__tag">Article</div>
            <h1 className="anim-1">{article.title}</h1>
            <p className="anim-2 blog-article__meta">
              <time dateTime={article.createdAt}>
                {formatBackendDate(article.createdAt)}
              </time>
              {article.excerpt ? ` · ${article.excerpt}` : null}
            </p>
          </div>
        </div>

        {article.coverImage && (
          <div className="container blog-article__cover-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.coverImage}
              alt=""
              className="blog-article__cover"
            />
          </div>
        )}

        <section className="section">
          <div className="container blog-article__content">
            <MarkdownContent content={article.body} />
          </div>
        </section>
      </article>
    </main>
  );
}
