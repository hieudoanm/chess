import { marked } from 'marked';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const DOCS_DIR = path.join(process.cwd(), 'docs');
const REPO_BLOB = 'https://github.com/hieudoanm/chess/blob/master';
// Must match basePath in next.config.ts (GitHub Pages project site).
// Used in raw HTML hrefs, so basePath is not applied automatically.
const BASE_PATH = process.env.NODE_ENV === 'production' ? '/chess' : '';

export interface DocHeading {
  /** Anchor id added by addHeadingIds */
  id: string;
  /** Heading text with HTML tags stripped */
  text: string;
  /** Heading level 1–6 */
  level: number;
}

export interface DocPage {
  /** URL slug, e.g. "concepts/architecture"; "" for docs/README.md */
  slug: string;
  /** Display title from the first `# ` heading */
  title: string;
  /** Top-level section: getting-started | concepts | api-reference | guides | "" */
  section: string;
  /** Rendered HTML */
  html: string;
  /** h2+ headings for the "On this page" TOC */
  toc: DocHeading[];
  /** Plain text (tags stripped) for full-text search */
  text: string;
}

const walk = (dir: string, prefix: string, out: string[]): void => {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, prefix ? `${prefix}/${entry}` : entry, out);
    } else if (entry.endsWith('.md')) {
      out.push(prefix ? `${prefix}/${entry}` : entry);
    }
  }
};

const slugFor = (file: string): string => {
  return file === 'README.md' ? '' : file.replace(/\.md$/, '');
};

const titleFor = (markdown: string, file: string): string => {
  const m = markdown.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : file;
};

/** Resolve a relative `.md` href against the current doc's directory. */
const resolveHref = (href: string, fromSlug: string): string => {
  const [filePart, anchor] = href.split('#');
  const fromDir = fromSlug ? fromSlug.split('/').slice(0, -1) : [];
  const targetParts = filePart.split('/');
  const stack = [...fromDir];
  let escaped = false;
  for (const part of targetParts) {
    if (part === '..') {
      if (stack.length === 0) escaped = true;
      else stack.pop();
    } else if (part !== '.' && part !== '') {
      stack.push(part);
    }
  }
  const suffix = anchor ? `#${anchor}` : '';
  if (escaped) {
    // Link escapes the docs tree (e.g. ../../README.md) — point at the repo.
    const repoPath = targetParts
      .filter((p) => p !== '..' && p !== '.' && p !== '')
      .join('/')
      .replace(/\.md$/, '');
    return `${REPO_BLOB}/${repoPath}${suffix}`;
  }
  const resolved = stack.join('/').replace(/\.md$/, '');
  const prefix = resolved
    ? `${BASE_PATH}/docs/${resolved}/`
    : `${BASE_PATH}/docs/`;
  return `${prefix}${suffix}`;
};

const rewriteLinks = (html: string, fromSlug: string): string => {
  return html.replace(/href="([^"]*?\.md(?:#[^"]*)?)"/g, (_m, href: string) => {
    return `href="${resolveHref(href, fromSlug)}"`;
  });
};

/** GitHub-style heading slug: lowercase, spaces→dashes, drop punctuation. */
const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .trim()
    .replace(/[\s_]+/g, '-');
};

/** Add id attributes to h1–h6 so `#anchor` links resolve. */
const addHeadingIds = (html: string): string => {
  const used = new Map<string, number>();
  return html.replace(
    /<h([1-6])>([\s\S]*?)<\/h\1>/g,
    (match, level: string, inner: string) => {
      let id = slugify(inner);
      const n = used.get(id) ?? 0;
      used.set(id, n + 1);
      if (n > 0) id = `${id}-${n}`;
      return `<h${level} id="${id}">${inner}</h${level}>`;
    }
  );
};

/** Generated SVG diagrams can't take utilities — frame them via class injection. */
const SVG_CLASS =
  'my-4 max-w-full rounded-2xl border border-gray-200 bg-gray-50 p-4';

const frameSvgs = (html: string): string => {
  return html.replace(/<svg\b([^>]*)>/g, (match, attrs: string) => {
    const cls = attrs.match(/class="([^"]*)"/);
    if (cls) {
      return match.replace(
        `class="${cls[1]}"`,
        `class="${SVG_CLASS} ${cls[1]}"`
      );
    }
    return `<svg class="${SVG_CLASS}"${attrs}>`;
  });
};

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&nbsp;': ' ',
};

/** HTML → plain text for the search index. */
const toPlainText = (html: string): string => {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:amp|lt|gt|quot|#39|nbsp);/g, (e) => ENTITIES[e] ?? e)
    .replace(/\s+/g, ' ')
    .trim();
};

/** Pull h2+ headings (with their ids) out of rendered HTML for the TOC. */
const extractToc = (html: string): DocHeading[] => {
  const toc: DocHeading[] = [];
  for (const m of html.matchAll(/<h([1-6]) id="([^"]*)">([\s\S]*?)<\/h\1>/g)) {
    const level = Number(m[1]);
    if (level < 2) continue;
    toc.push({
      level,
      id: m[2],
      text: m[3].replace(/<[^>]+>/g, ''),
    });
  }
  return toc;
};

export const getDocPages = (): DocPage[] => {
  const files: string[] = [];
  walk(DOCS_DIR, '', files);
  files.sort();
  return files.map((file) => {
    const slug = slugFor(file);
    const markdown = readFileSync(path.join(DOCS_DIR, file), 'utf8');
    const raw = marked.parse(markdown, { async: false }) as string;
    const section = slug.split('/')[0] ?? '';
    const html = frameSvgs(addHeadingIds(rewriteLinks(raw, slug)));
    return {
      slug,
      title: titleFor(markdown, file),
      section,
      html,
      toc: extractToc(html),
      text: toPlainText(html),
    };
  });
};

export { DOC_SECTIONS, sectionLabel } from './sections';
