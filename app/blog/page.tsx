import { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts, BLOG_CATEGORIES } from '@/lib/blog-posts';
import { Clock, ArrowRight, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog — Lead2Project | Tips for Home Service Contractors',
  description: 'Practical advice for contractors, landscapers, and home service pros. Learn how to get more leads, send better quotes, and grow your business.',
  openGraph: {
    title: 'Lead2Project Blog — Grow Your Contracting Business',
    description: 'Practical advice for contractors, landscapers, and home service pros.',
    type: 'website',
    url: 'https://lead2project.com/blog',
  },
  alternates: {
    canonical: 'https://lead2project.com/blog',
  },
};

export default function BlogPage() {
  const posts = getAllPosts();
  const featured = posts[0];
  const rest = posts.slice(1);

  const getCategoryConfig = (cat: string) =>
    BLOG_CATEGORIES.find(c => c.value === cat) || BLOG_CATEGORIES[0];

  return (
    <div className="min-h-screen bg-[#080C14] text-white">

      {/* Nav */}
      <header className="border-b border-white/[0.06] sticky top-0 z-50 bg-[#080C14]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center p-1">
              <img src="/Lead2ProjectLogo.png" alt="Lead2Project" className="w-full h-full object-contain" />
            </div>
            <span className="text-lg font-black tracking-tighter text-white">Lead2Project</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/pricing" className="text-xs font-bold text-slate-400 hover:text-white transition uppercase tracking-widest hidden sm:block">
              Pricing
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Hero */}
        <div className="py-16 sm:py-24 text-center">
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-400 mb-4 block">
            The Lead2Project Blog
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter leading-none mb-6">
            Grow your contracting<br />
            <span className="text-slate-500">business.</span>
          </h1>
          <p className="text-slate-400 text-lg font-medium max-w-xl mx-auto">
            Practical advice for contractors who want more leads, faster payments, and less chaos.
          </p>
        </div>

        {/* Featured Post */}
        {featured && (
          <Link
            href={`/blog/${featured.slug}`}
            className="block mb-16 group"
          >
            <article className="rounded-3xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.15] transition-all duration-300 overflow-hidden p-8 sm:p-12">
              <div className="flex items-center gap-3 mb-6">
                <span
                  className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full"
                  style={{
                    background: `${getCategoryConfig(featured.category).color}15`,
                    color: getCategoryConfig(featured.category).color,
                    border: `1px solid ${getCategoryConfig(featured.category).color}30`,
                  }}
                >
                  {getCategoryConfig(featured.category).label}
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  {featured.readTime} min read
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight mb-4 group-hover:text-blue-400 transition-colors">
                {featured.title}
              </h2>
              <p className="text-slate-400 text-base sm:text-lg font-medium mb-6 max-w-2xl">
                {featured.excerpt}
              </p>
              <div className="flex items-center gap-2 text-blue-400 text-sm font-black uppercase tracking-widest">
                Read Article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </article>
          </Link>
        )}

        {/* Post Grid */}
        <div className="grid sm:grid-cols-2 gap-6 mb-24">
          {rest.map((post) => {
            const cat = getCategoryConfig(post.category);
            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group"
              >
                <article className="h-full rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.15] transition-all duration-300 p-6 sm:p-8 flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                      style={{
                        background: `${cat.color}15`,
                        color: cat.color,
                        border: `1px solid ${cat.color}30`,
                      }}
                    >
                      {cat.label}
                    </span>
                    <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime} min
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black tracking-tight leading-tight mb-3 group-hover:text-blue-400 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed flex-1">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-1.5 text-blue-400 text-xs font-black uppercase tracking-widest mt-6">
                    Read <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </article>
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center pb-24">
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-12 sm:p-16">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tighter mb-4">
              Ready to stop losing leads?
            </h2>
            <p className="text-slate-400 text-lg font-medium mb-8 max-w-lg mx-auto">
              Try Lead2Project free for 14 days. No website needed — just a booking link, a dashboard, and more customers.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/demo"
                className="px-6 py-3.5 rounded-xl border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition"
              >
                Try the Demo
              </Link>
              <Link
                href="/signup"
                className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm shadow-lg shadow-blue-600/20 transition"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}