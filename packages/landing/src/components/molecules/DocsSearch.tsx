'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { FC, KeyboardEvent } from 'react';
import { PiMagnifyingGlass } from 'react-icons/pi';
import { sectionLabel } from '@/lib/sections';

interface SearchEntry {
  slug: string;
  title: string;
  section: string;
  headings: string[];
  text: string;
}

interface Result {
  entry: SearchEntry;
  /** 0 = title, 1 = heading, 2 = body */
  rank: number;
  /** Heading that matched, if any */
  heading?: string;
  /** Snippet of body text around the match */
  snippet?: string;
}

// next/link-style basePath is not applied to fetch — mirror next.config.ts.
const INDEX_URL =
  process.env.NODE_ENV === 'production'
    ? '/$r/api/search-index'
    : '/api/search-index';

const MAX_RESULTS = 8;

const docHref = (slug: string): string =>
  slug ? `/docs/${slug}/` : '/docs/';

const search = (index: SearchEntry[], query: string): Result[] => {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  const results: Result[] = [];
  for (const entry of index) {
    const title = entry.title.toLowerCase();
    const headings = entry.headings.map((h) => h.toLowerCase());
    const text = entry.text.toLowerCase();
    if (!terms.every((t) => title.includes(t) || text.includes(t))) continue;

    let rank = 2;
    let heading: string | undefined;
    if (terms.every((t) => title.includes(t))) {
      rank = 0;
    } else {
      const hit = entry.headings.find((h) =>
        terms.every((t) => h.toLowerCase().includes(t))
      );
      if (hit) {
        rank = 1;
        heading = hit;
      }
    }

    let snippet: string | undefined;
    const pos = text.indexOf(terms[0]);
    if (pos >= 0) {
      const start = Math.max(0, pos - 40);
      const end = Math.min(entry.text.length, pos + terms[0].length + 80);
      snippet = `${start > 0 ? '…' : ''}${entry.text.slice(start, end)}${end < entry.text.length ? '…' : ''}`;
    }
    results.push({ entry, rank, heading, snippet });
  }
  return results
    .sort((a, b) => a.rank - b.rank || a.entry.title.localeCompare(b.entry.title))
    .slice(0, MAX_RESULTS);
};

const DocsSearch: FC = () => {
  const router = useRouter();
  const [index, setIndex] = useState<SearchEntry[] | null>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (index !== null) return;
    let cancelled = false;
    fetch(INDEX_URL)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: SearchEntry[]) => {
        if (!cancelled) setIndex(data);
      })
      .catch(() => {
        if (!cancelled) setIndex([]);
      });
    return () => {
      cancelled = true;
    };
  }, [index]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const results = index ? search(index, query) : [];
  const showPanel = open && query.trim().length > 0;

  const go = (href: string) => {
    setOpen(false);
    setQuery('');
    router.push(href);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setOpen(false);
      setActive(-1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, -1));
    } else if (e.key === 'Enter' && active >= 0 && results[active]) {
      e.preventDefault();
      go(docHref(results[active].entry.slug));
    }
  };

  return (
    <div ref={boxRef} className="relative mb-6">
      <PiMagnifyingGlass className="text-base-content/40 pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
      <input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Search docs…"
        aria-label="Search docs"
        className="border-base-content/10 bg-base-200/50 focus:border-primary/50 w-full rounded-xl border py-2.5 pr-4 pl-10 text-sm outline-none transition-colors"
      />
      {showPanel && (
        <div className="border-base-content/10 bg-base-100 absolute inset-x-0 top-full z-40 mt-2 max-h-96 overflow-y-auto rounded-xl border shadow-lg">
          {results.length === 0 ? (
            <p className="text-base-content/50 px-4 py-3 text-sm">
              No results for “{query}”
            </p>
          ) : (
            <ul>
              {results.map((r, i) => (
                <li key={r.entry.slug || 'index'}>
                  <Link
                    href={docHref(r.entry.slug)}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => {
                      setOpen(false);
                      setQuery('');
                    }}
                    className={`block px-4 py-2.5 no-underline ${i === active ? 'bg-base-200' : ''}`}>
                    <span className="flex items-baseline gap-2">
                      <span className="text-sm font-semibold">
                        {r.entry.title}
                      </span>
                      {r.entry.section && (
                        <span className="text-base-content/40 text-xs">
                          {sectionLabel(r.entry.section)}
                        </span>
                      )}
                    </span>
                    {r.heading && (
                      <span className="text-primary/80 mt-0.5 block text-xs">
                        {r.heading}
                      </span>
                    )}
                    {r.snippet && (
                      <span className="text-base-content/50 mt-0.5 block truncate text-xs">
                        {r.snippet}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

DocsSearch.displayName = 'DocsSearch';

export default DocsSearch;
