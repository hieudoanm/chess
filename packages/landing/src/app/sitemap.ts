import type { MetadataRoute } from 'next';
import { getDocPages } from '@/lib/docs';

export const dynamic = 'force-static';

const SITE_URL = 'https://hieudoanm.github.io/chess/';

const sitemap = (): MetadataRoute.Sitemap => {
  const docs = getDocPages().map((p) => ({
    url: p.slug ? `${SITE_URL}docs/${p.slug}/` : `${SITE_URL}docs/`,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));
  return [
    { url: `${SITE_URL}`, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}docs/`, changeFrequency: 'weekly', priority: 0.9 },
    ...docs.filter((d) => d.url !== `${SITE_URL}docs/`),
  ];
};

export default sitemap;
