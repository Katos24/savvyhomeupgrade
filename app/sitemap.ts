import { MetadataRoute } from 'next';
import { INDEXED_CITIES, INDEXED_SERVICES } from '@/lib/cities';
import { industryList } from '@/lib/industry-content';
import { getAllPosts } from '@/lib/blog-posts';

const BASE = 'https://lead2project.com';

const FEATURES = ['operations', 'lead-capture', 'quoting', 'payments', 'scheduling', 'outbox'];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const core: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/pricing`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/signup`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/book-demo`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const features: MetadataRoute.Sitemap = FEATURES.map((f) => ({
    url: `${BASE}/features/${f}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const solutions: MetadataRoute.Sitemap = industryList.map((i) => ({
    url: `${BASE}/solutions/${i.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const blog: MetadataRoute.Sitemap = [
    { url: `${BASE}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    ...getAllPosts().map((post) => ({
      url: `${BASE}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt || post.publishedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];

  // Only the indexed cities. Noindexed pages don't belong in the sitemap.
  const cityPages: MetadataRoute.Sitemap = Array.from(INDEXED_CITIES).flatMap((city) =>
    Array.from(INDEXED_SERVICES).map((service) => ({
      url: `${BASE}/contractor-software/${city}/${service}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
  );

  return [...core, ...features, ...solutions, ...blog, ...cityPages];
}