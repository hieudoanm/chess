import { getDocPages } from '@/lib/docs';

export const dynamic = 'force-static';

export function GET() {
  const index = getDocPages().map(({ slug, title, section, toc, text }) => ({
    slug,
    title,
    section,
    headings: toc.map((h) => h.text),
    text,
  }));
  return Response.json(index);
}
