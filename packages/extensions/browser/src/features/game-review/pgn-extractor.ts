const PGN_START = /^\[Event\s/m;
const FEN_IN_PGN = /\[FEN\s+"([^"]+)"\]/;
const EVENT_HEADER = /\[Event\s+"([^"]+)"\]/;

const isPgnText = (text: string): boolean => PGN_START.test(text);

const findPgnInDom = (doc: Document): string | undefined => {
  for (const node of doc.querySelectorAll('script:not([src])')) {
    const text = node.textContent?.trim() ?? '';
    if (text.length > 40 && isPgnText(text)) return text;
  }
  const textarea = doc.querySelector<HTMLTextAreaElement>('textarea');
  const value = textarea?.value ?? textarea?.textContent ?? '';
  const trimmed = value.trim();
  if (trimmed.length > 40 && isPgnText(trimmed)) return trimmed;
  return undefined;
};

const extractFromJsonLd = (doc: Document): string | undefined => {
  for (const node of doc.querySelectorAll(
    'script[type="application/ld+json"]'
  )) {
    const raw = node.textContent?.trim() ?? '';
    if (!raw) continue;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (typeof parsed !== 'object' || parsed === null) continue;
      const record = parsed as Record<string, unknown>;
      const candidates: unknown[] = [record.pgn, record.game];
      for (const candidate of candidates) {
        if (typeof candidate === 'string' && isPgnText(candidate)) {
          return candidate;
        }
        if (typeof candidate === 'object' && candidate !== null) {
          const nested = (candidate as Record<string, unknown>).pgn;
          if (typeof nested === 'string' && isPgnText(nested)) return nested;
        }
      }
    } catch {
      continue;
    }
  }
  return undefined;
};

export const extractPgn = (doc: Document = document): string | undefined => {
  const fromJsonLd = extractFromJsonLd(doc);
  if (fromJsonLd) return fromJsonLd;
  return findPgnInDom(doc);
};

export const extractGameMetadata = (
  pgn: string
): { event?: string; date?: string; result?: string; fen?: string } => {
  const fen = FEN_IN_PGN.exec(pgn)?.[1];
  const event = EVENT_HEADER.exec(pgn)?.[1];
  const date = /\[Date\s+"([^"]+)"\]/.exec(pgn)?.[1];
  const result = /\[Result\s+"([^"]+)"\]/.exec(pgn)?.[1];
  return { fen, event, date, result };
};
