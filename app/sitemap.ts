import { MetadataRoute } from 'next';
import { INDEXED_CITIES, SERVICES } from '@/lib/cities';
import { industryList } from '@/lib/industry-content';

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

  // Only the indexed cities. Noindexed pages don't belong in the sitemap.
  const cityPages: MetadataRoute.Sitemap = Array.from(INDEXED_CITIES).flatMap((city) =>
    SERVICES.map((service) => ({
      url: `${BASE}/contractor-software/${city}/${service}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
  );

  return [...core, ...features, ...solutions, ...cityPages];
}