import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock, ArrowLeft, ArrowRight, Calendar } from 'lucide-react';
import Nav from '@/components/marketing/Nav';
import Footer from '@/components/marketing/Footer';
import { fontVars } from '@/components/marketing/marketingTheme';
import { getPostBySlug, getAllPosts, getRelatedPosts, BLOG_CATEGORIES } from '@/lib/blog-posts';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: 'Not Found' };

  return {
    title: `${post.title} | Lead2Project`,
    description: post.description,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.publishedAt,
      url: `https://lead2project.com/blog/${post.slug}`,
      siteName: 'Lead2Project',
    },
    alternates: { canonical: `https://lead2project.com/blog/${post.slug}` },
  };
}

const D = 'font-[family-name:var(--font-display)]';

// Styles for the post HTML (post.content). Scoped to the article so the
// rest of the page isn't affected.
const ARTICLE =
  'text-[17px] leading-[1.75] text-[#2b3036] ' +
  '[&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:font-[family-name:var(--font-display)] [&_h2]:text-3xl [&_h2]:font-extrabold [&_h2]:uppercase [&_h2]:leading-[1] [&_h2]:tracking-tight [&_h2]:text-[#1C1F23] ' +
  '[&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:font-[family-name:var(--font-display)] [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:uppercase [&_h3]:leading-tight [&_h3]:text-[#1C1F23] ' +
  '[&_p]:my-5 [&_strong]:font-bold [&_strong]:text-[#1C1F23] ' +
  '[&_a]:font-semibold [&_a]:text-[#00828A] [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-[#006e75] ' +
  '[&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-2 [&_li]:pl-1 [&_li::marker]:text-[#00828A] ' +
  '[&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-[#00828A] [&_blockquote]:bg-[#F4EFE6] [&_blockquote]:px-5 [&_blockquote]:py-3 [&_blockquote]:italic ' +
  '[&_hr]:my-10 [&_hr]:border-slate-200 ' +
  '[&_table]:my-6 [&_table]:w-full [&_table]:text-[15px] [&_th]:border-b-2 [&_th]:border-[#1C1F23] [&_th]:py-2 [&_th]:text-left [&_td]:border-b [&_td]:border-slate-200 [&_td]:py-2';

const categoryLabel = (cat: string) => (BLOG_CATEGORIES.find((c) => c.value === cat) || BLOG_CATEGORIES[0]).label;

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const related = getRelatedPosts(slug, 2);

  const publishDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: { '@type': 'Organization', name: 'Lead2Project', url: 'https://lead2project.com' },
    publisher: { '@type': 'Organization', name: 'Lead2Project', url: 'https://lead2project.com' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://lead2project.com/blog/${post.slug}` },
    keywords: post.keywords.join(', '),
  };

  return (
    <div className={`${fontVars} font-[family-name:var(--font-body)] min-h-screen antialiased overflow-x-hidden bg-white text-[#1C1F23]`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />

      {/* ── Header ── */}
      <header className="bg-[#F4EFE6] pt-28 sm:pt-36 pb-10 sm:pb-14 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/blog"
            className={`inline-flex items-center gap-2 ${D} text-sm font-bold uppercase tracking-wider text-slate-500 hover:text-[#00828A] transition-colors`}
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All articles
          </Link>
          <div className="mt-6">
            <span className={`rounded bg-[#00828A]/10 px-2 py-0.5 ${D} text-[11px] font-bold uppercase tracking-wider text-[#00828A]`}>
              {categoryLabel(post.category)}
            </span>
          </div>
          <h1 className={`mt-4 ${D} text-4xl sm:text-5xl font-extrabold uppercase leading-[0.95] tracking-tight`}>{post.title}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> {publishDate}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> {post.readTime} min read
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* ── Body ── */}
        <article className={`py-10 sm:py-14 ${ARTICLE}`} dangerouslySetInnerHTML={{ __html: post.content }} />

        {/* ── CTA ── */}
        <div className="mb-16 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="h-1.5 bg-[#00828A]" />
          <div className="p-6 sm:p-8">
            <h3 className={`${D} text-2xl sm:text-3xl font-extrabold uppercase leading-tight`}>
              Take the request. Take the deposit. Get paid.
            </h3>
            <p className="mt-3 text-[15px] text-[#3a3f45] leading-relaxed">
              Lead2Project gives you a booking link, a job board, quotes, and deposit and balance invoices your customers pay
              by card. Start free. Paid plans come with a 14-day free trial.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                href="/signup"
                className={`inline-flex items-center justify-center gap-2 rounded-md bg-[#00828A] hover:bg-[#006e75] text-white px-6 py-3 shadow-sm transition-colors ${D} text-base font-bold uppercase tracking-wider`}
              >
                Start free
              </Link>
              <Link
                href="/book-demo"
                className={`inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-6 py-3 hover:bg-slate-50 transition-colors ${D} text-base font-bold uppercase tracking-wider`}
              >
                Book a demo
              </Link>
            </div>
          </div>
        </div>

        {/* ── Related ── */}
        {related.length > 0 && (
          <div className="border-t border-slate-200 pt-12 pb-20">
            <p className={`${D} text-sm font-bold uppercase tracking-[0.14em] text-slate-500`}>Keep reading</p>
            <div className="mt-6 grid sm:grid-cols-2 gap-5">
              {related.map((rp) => (
                <Link
                  key={rp.slug}
                  href={`/blog/${rp.slug}`}
                  className="group rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <span className={`rounded bg-[#00828A]/10 px-2 py-0.5 ${D} text-[11px] font-bold uppercase tracking-wider text-[#00828A]`}>
                    {categoryLabel(rp.category)}
                  </span>
                  <h4 className={`mt-3 ${D} text-xl font-bold uppercase leading-tight group-hover:text-[#00828A] transition-colors`}>
                    {rp.title}
                  </h4>
                  <p className="mt-2 text-sm text-[#3a3f45] leading-relaxed">{rp.excerpt}</p>
                  <span className={`mt-4 inline-flex items-center gap-1 ${D} text-sm font-bold uppercase tracking-wider text-[#00828A]`}>
                    Read <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}