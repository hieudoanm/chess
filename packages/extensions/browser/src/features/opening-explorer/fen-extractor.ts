import { FEN_CANDIDATES } from '../../content/dom/selectors';

const FEN_PARTS = /^[rnbqkpRNBQKP1-8/]+ [wb] [KQkq-]+ [a-h1-8-]+ \d+ \d+$/;
const FEN_PARTIAL = /^[rnbqkpRNBQKP1-8/]+ [wb]/;

export const isFen = (value: string): boolean => {
  const trimmed = value.trim();
  return FEN_PARTS.test(trimmed) || FEN_PARTIAL.test(trimmed);
};

export const normalizeFen = (value: string): string => {
  const trimmed = value.trim().replace(/\s+/g, ' ');
  const parts = trimmed.split(' ');
  if (parts.length >= 4) {
    return parts.slice(0, 6).join(' ');
  }
  return trimmed;
};

const readFenAttribute = (value: string | null): string | undefined => {
  if (!value) return undefined;
  const candidate = value.includes(';') ? value.split(';')[0] : value;
  const trimmed = candidate.trim();
  return isFen(trimmed) ? normalizeFen(trimmed) : undefined;
};

export const extractFen = (doc: Document = document): string | undefined => {
  for (const selector of FEN_CANDIDATES) {
    for (const node of doc.querySelectorAll(selector)) {
      const attribute =
        node.getAttribute('data-fen') ?? node.getAttribute('data-position');
      const fromAttribute = readFenAttribute(attribute);
      if (fromAttribute) return fromAttribute;
      const text = node.textContent?.trim() ?? '';
      if (text && isFen(text)) return normalizeFen(text);
    }
  }
  return undefined;
};
