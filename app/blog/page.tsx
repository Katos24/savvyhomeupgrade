import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';
import Nav from '@/components/marketing/Nav';
import Footer from '@/components/marketing/Footer';
import { fontVars } from '@/components/marketing/marketingTheme';
import { Eyebrow } from '@/components/marketing/marketingUI';
import { getAllPosts, BLOG_CATEGORIES } from '@/lib/blog-posts';

export const metadata: Metadata = {
  title: 'Blog | Lead2Project | Tips for Home Service Contractors',
  description:
    'Practical advice for contractors and home service pros: getting more leads, sending better quotes, collecting deposits and getting paid.',
  openGraph: {
    title: 'Lead2Project Blog | Grow Your Contracting Business',
    description: 'Practical advice for contractors and home service pros.',
    type: 'website',
    url: 'https://lead2project.com/blog',
  },
  alternates: { canonical: 'https://lead2project.com/blog' },
};

const D = 'font-[family-name:var(--font-display)]';

const categoryLabel = (cat: string) => (BLOG_CATEGORIES.find((c) => c.value === cat) || BLOG_CATEGORIES[0]).label;

function Meta({ category, readTime }: { category: string; readTime: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`rounded bg-[#00828A]/10 px-2 py-0.5 ${D} text-[11px] font-bold uppercase tracking-wider text-[#00828A]`}>
        {categoryLabel(category)}
      </span>
      <span className="flex items-center gap-1 text-xs font-semibold text-slate-500">
        <Clock className="h-3 w-3" /> {readTime} min read
      </span>
    </div>
  );
}

export default function BlogPage() {
  const posts = getAllPosts();
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div className={`${fontVars} font-[family-name:var(--font-body)] min-h-screen antialiased overflow-x-hidden bg-white text-[#1C1F23]`}>
      <Nav />

      {/* ── Hero ── */}
      <section
        className="bg-[#F4EFE6] pt-28 sm:pt-36 pb-14 sm:pb-20 px-4 sm:px-6 lg:px-8"
        style={{
          backgroundImage:
            'linear-gradient(rgba(28,31,35,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(28,31,35,0.06) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <Eyebrow>The Lead2Project blog</Eyebrow>
          <h1 className={`mt-4 ${D} text-5xl sm:text-6xl font-extrabold uppercase leading-[0.9] tracking-tight`}>
            Run a tighter business.
          </h1>
          <p className="mt-5 text-base sm:text-lg text-[#3a3f45] leading-relaxed">
            Practical advice for contractors who want more jobs, faster payments and less chaos.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        {/* ── Featured ── */}
        {featured && (
          <Link href={`/blog/${featured.slug}`} className="group block mb-10">
            <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-shadow group-hover:shadow-lg">
              <div className="h-1.5 bg-[#00828A]" />
              <div className="p-6 sm:p-10">
                <Meta category={featured.category} readTime={featured.readTime} />
                <h2 className={`mt-4 ${D} text-3xl sm:text-4xl font-extrabold uppercase leading-[0.95] tracking-tight group-hover:text-[#00828A] transition-colors`}>
                  {featured.title}
                </h2>
                <p className="mt-3 max-w-2xl text-base sm:text-lg text-[#3a3f45] leading-relaxed">{featured.excerpt}</p>
                <span className={`mt-5 inline-flex items-center gap-2 ${D} text-sm font-bold uppercase tracking-wider text-[#00828A]`}>
                  Read the article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </article>
          </Link>
        )}

        {/* ── Grid ── */}
        <div className="grid sm:grid-cols-2 gap-5">
          {rest.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
              <article className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-shadow group-hover:shadow-md">
                <Meta category={post.category} readTime={post.readTime} />
                <h3 className={`mt-3 ${D} text-2xl font-bold uppercase leading-tight group-hover:text-[#00828A] transition-colors`}>
                  {post.title}
                </h3>
                <p className="mt-2 flex-1 text-[15px] text-[#3a3f45] leading-relaxed">{post.excerpt}</p>
                <span className={`mt-4 inline-flex items-center gap-1.5 ${D} text-sm font-bold uppercase tracking-wider text-[#00828A]`}>
                  Read <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </article>
            </Link>
          ))}
        </div>
      </div>

      {/* ── CTA ── */}
      <section className="bg-[#00828A] text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className={`${D} text-4xl sm:text-5xl font-extrabold uppercase tracking-tight leading-[0.92]`}>
            Ready to stop losing jobs?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-white/85">
            Start free with a booking link and job board. Paid plans come with a 14-day free trial.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className={`w-full sm:w-auto rounded-md bg-white text-[#00828A] hover:bg-slate-50 px-8 py-3 shadow-sm transition-colors ${D} text-base font-bold uppercase tracking-wider text-center`}
            >
              Start free
            </Link>
            <Link
              href="/book-demo"
              className={`w-full sm:w-auto rounded-md border border-white/40 text-white hover:bg-white/10 px-6 py-3 transition-colors ${D} text-base font-bold uppercase tracking-wider text-center`}
            >
              Book a demo
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}