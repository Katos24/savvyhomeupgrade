import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug, getAllPosts, getRelatedPosts, BLOG_CATEGORIES } from '@/lib/blog-posts';
import { Clock, ArrowLeft, ChevronRight, Calendar } from 'lucide-react';

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
    title: `${post.title} — Lead2Project`,
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
    alternates: {
      canonical: `https://lead2project.com/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const related = getRelatedPosts(slug, 2);
  const cat = BLOG_CATEGORIES.find(c => c.value === post.category) || BLOG_CATEGORIES[0];

  const publishDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      '@type': 'Organization',
      name: 'Lead2Project',
      url: 'https://lead2project.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Lead2Project',
      url: 'https://lead2project.com',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://lead2project.com/blog/${post.slug}`,
    },
    keywords: post.keywords.join(', '),
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Nav */}
      <header className="border-b border-white/[0.06] sticky top-0 z-50 bg-[#080C14]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center p-1">
              <img src="/Lead2ProjectLogo.webp" alt="Lead2Project" className="w-full h-full object-contain" />
            </div>
            <span className="text-lg font-black tracking-tighter text-white">Lead2Project</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/blog" className="text-xs font-bold text-slate-400 hover:text-white transition uppercase tracking-widest hidden sm:block">
              Blog
            </Link>
            <Link href="/demo" className="text-xs font-bold text-slate-400 hover:text-white transition uppercase tracking-widest hidden sm:block">
              Demo
            </Link>
            <Link href="/signup" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest rounded-lg transition">
              Start Free Trial
            </Link>
          </nav>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* Back link */}
        <div className="pt-8 sm:pt-12">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-400 transition uppercase tracking-widest"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All Articles
          </Link>
        </div>

        {/* Article Header */}
        <div className="pt-8 sm:pt-12 pb-10 sm:pb-14 border-b border-white/[0.06]">
          <div className="flex items-center gap-3 mb-6">
            <span
              className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full"
              style={{
                background: `${cat.color}15`,
                color: cat.color,
                border: `1px solid ${cat.color}30`,
              }}
            >
              {cat.label}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tighter leading-[1.1] mb-6">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5 font-bold">
              <Calendar className="w-3.5 h-3.5" />
              {publishDate}
            </span>
            <span className="flex items-center gap-1.5 font-bold">
              <Clock className="w-3.5 h-3.5" />
              {post.readTime} min read
            </span>
          </div>
        </div>

        {/* Article Body */}
        <article
          className="py-10 sm:py-14 prose-custom"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* CTA Banner */}
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/[0.05] p-8 sm:p-10 mb-16">
          <h3 className="text-xl sm:text-2xl font-black tracking-tight mb-3">
            Stop losing leads. Start closing more jobs.
          </h3>
          <p className="text-slate-400 font-medium mb-6">
            Lead2Project gives you a booking page, quote builder, and job tracker — everything you need to run your business from your phone.
          </p>
          <div className="flex items-center gap-3">
            <Link
              href="/demo"
              className="px-5 py-3 rounded-xl border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition"
            >
              Try the Demo
            </Link>
            <Link
              href="/signup"
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm transition"
            >
              Start Free Trial →
            </Link>
          </div>
        </div>

        {/* Related Posts */}
        {related.length > 0 && (
          <div className="border-t border-white/[0.06] pt-12 pb-24">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 mb-8">
              Keep Reading
            </h3>
            <div className="grid sm:grid-cols-2 gap-6">
              {related.map((rp) => {
                const rpCat = BLOG_CATEGORIES.find(c => c.value === rp.category) || BLOG_CATEGORIES[0];
                return (
                  <Link
                    key={rp.slug}
                    href={`/blog/${rp.slug}`}
                    className="group rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.15] transition-all p-6"
                  >
                    <span
                      className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full inline-block mb-3"
                      style={{
                        background: `${rpCat.color}15`,
                        color: rpCat.color,
                        border: `1px solid ${rpCat.color}30`,
                      }}
                    >
                      {rpCat.label}
                    </span>
                    <h4 className="text-base font-black tracking-tight leading-tight mb-2 group-hover:text-blue-400 transition-colors">
                      {rp.title}
                    </h4>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">
                      {rp.excerpt}
                    </p>
                    <div className="flex items-center gap-1 text-blue-400 text-xs font-black uppercase tracking-widest mt-4">
                      Read <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}